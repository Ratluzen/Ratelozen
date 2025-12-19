
import React, { useState, useEffect } from 'react';
import { View, Product, Category, AppTerms, Banner, UserProfile, Announcement, CartItem, Currency, Order, InventoryCode, Transaction } from './types';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import BottomNav from './components/BottomNav';
import TopHeader from './components/TopHeader';
import CheckoutModal from '../components/CheckoutModal';
import ProductDetailsModal from '../components/ProductDetailsModal';
import InvoiceModal from '../components/InvoiceModal';
import LoginModal from '../components/LoginModal';
import { ShoppingBag, ShoppingCart, Trash2, ArrowLeft, CheckCircle, Clock, X, CheckSquare, AlertTriangle, Receipt, Copy, ChevronDown, ChevronUp, ShieldAlert, Lock, Flag, Tags, User, CreditCard } from 'lucide-react';
import { INITIAL_CURRENCIES, INITIAL_TERMS, INITIAL_BANNERS, PRODUCTS as MOCK_PRODUCTS, CATEGORIES as MOCK_CATEGORIES } from './constants';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { authService, productService, orderService, contentService, userService, inventoryService, paymentService, walletService } from './services/api';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  const [isSecurityBlocked, setIsSecurityBlocked] = useState(false);
  const [securityMessage, setSecurityMessage] = useState('');
  
  // --- Global App State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [terms, setTerms] = useState<AppTerms>(INITIAL_TERMS); 
  const [banners, setBanners] = useState<Banner[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>(INITIAL_CURRENCIES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryCode[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]); 
  const [rateAppLink, setRateAppLink] = useState<string>(''); 
  
  // --- Cart State ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pendingCartItem, setPendingCartItem] = useState<CartItem | null>(null);
  const [activeCheckoutItem, setActiveCheckoutItem] = useState<CartItem | null>(null);
  const [isBulkCheckout, setIsBulkCheckout] = useState(false); 

  // --- Product Modal State ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- Invoice Modal State ---
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null); 
  const [showLoginModal, setShowLoginModal] = useState(false);

  // --- Admin Auth State ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('ratelozn_admin_auth') === 'true';
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // --- LOAD INITIAL DATA ---
  useEffect(() => {
    fetchInitialData();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
          try {
              const res = await authService.getProfile();
              // Transform backend user to frontend UserProfile
              const userData: UserProfile = {
                  id: res.data._id,
                  name: res.data.name,
                  email: res.data.email,
                  phone: res.data.phone || '',
                  balance: res.data.balance,
                  joinedDate: '',
                  status: 'active'
              };
              setCurrentUser(userData);
              // Fetch user-specific data
              fetchUserOrders();
          } catch (error) {
              console.error("Auth check failed", error);
              localStorage.removeItem('token');
              setCurrentUser(null);
          }
      }
  };

  const fetchInitialData = async () => {
      try {
          // Fetch Content
          const [prodsRes, catsRes, bansRes, annsRes] = await Promise.all([
              productService.getAll(),
              contentService.getCategories(),
              contentService.getBanners(),
              contentService.getAnnouncements()
          ]);

          // Transform Products (parse JSON strings if needed)
          const parsedProducts = prodsRes.data.map((p: any) => ({
             ...p,
             regions: typeof p.regions === 'string' ? JSON.parse(p.regions) : p.regions,
             denominations: typeof p.denominations === 'string' ? JSON.parse(p.denominations) : p.denominations,
             apiConfig: typeof p.apiConfig === 'string' ? JSON.parse(p.apiConfig) : p.apiConfig,
             customInput: typeof p.customInput === 'string' ? JSON.parse(p.customInput) : p.customInput,
          }));

          setProducts(parsedProducts);
          
          // Map backend categories to frontend structure (if needed)
          const mappedCats = catsRes.data.map((c: any) => ({
             ...c,
             // Map icon string name back to component if needed, or update frontend to handle string icons
             // For now we assume the frontend might need adjustment or we map manually, 
             // but let's keep MOCK_CATEGORIES as fallback/mix for icons
             icon: MOCK_CATEGORIES.find(mc => mc.name === c.name)?.icon || ShoppingBag
          }));
          setCategories(mappedCats);

          setBanners(bansRes.data.length > 0 ? bansRes.data : INITIAL_BANNERS);
          setAnnouncements(annsRes.data);

      } catch (error) {
          console.error("Failed to fetch initial data", error);
          // Fallback to empty arrays
          setProducts([]);
          setCategories([]);
      }
  };

  const fetchUserOrders = async () => {
      try {
          const res = await orderService.getMyOrders();
          const mappedOrders = res.data.map((o: any) => ({
             ...o,
             date: new Date(o.createdAt).toLocaleString('en-US')
          }));
          setOrders(prev => {
              // Merge with existing admin loaded orders if any, or just set
              // For simplicity, just set for now, but in a real app manage stores better
              return mappedOrders;
          });
      } catch (e) { console.error(e); }
  };

  // --- Security Check Effect ---
  useEffect(() => {
    const checkSecurity = async () => {
      if (Capacitor.getPlatform() === 'android') {
        try {
          const uriResult = await Filesystem.getUri({ directory: Directory.Data, path: '' });
          const path = uriResult.uri;
          const suspiciousIndicators = ['999', 'parallel', 'virtual', 'dual', 'clone', 'lbe', 'exposed', 'space'];
          const isStandardUser = path.includes('/user/0/') || path.includes('/data/data/com.ratelozn.services');
          const hasSuspiciousKeywords = suspiciousIndicators.some(keyword => path.toLowerCase().includes(keyword));

          if (hasSuspiciousKeywords || (!isStandardUser && !path.includes('localhost'))) {
             setIsSecurityBlocked(true);
             setSecurityMessage('تم اكتشاف تشغيل التطبيق في بيئة غير آمنة (ناسخ تطبيقات أو مساحة مزدوجة).');
          }
        } catch (error) { console.error("Security Check Failed:", error); }
      }
    };
    checkSecurity();
  }, []);

  const balanceUSD = currentUser ? currentUser.balance : 0.00;

  // --- Login Logic ---
  const handleLogin = async (data: { name?: string; email?: string; phone?: string; password?: string; isRegister: boolean }) => {
    try {
        let res;
        if (data.isRegister) {
            res = await authService.register({
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password
            });
            alert('تم إنشاء الحساب بنجاح! مرحباً بك.');
        } else {
            res = await authService.login({
                email: data.email,
                password: data.password
            });
        }
        
        // Save Token
        localStorage.setItem('token', res.data.token);
        
        // Set User
        const user = res.data;
        setCurrentUser({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            balance: user.balance,
            joinedDate: '',
            status: 'active'
        });
        
        setShowLoginModal(false);
        if (pendingCartItem) {
            setCartItems(prev => [...prev, pendingCartItem]);
            setPendingCartItem(null);
            alert('تمت إضافة المنتج إلى السلة');
        }
        fetchUserOrders(); // Load their orders

    } catch (error: any) {
        alert(error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول');
    }
  };

  const handleSetView = (view: View) => {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(5);
    if (!currentUser && [View.WALLET, View.ORDERS, View.PROFILE, View.CART].includes(view)) {
        setShowLoginModal(true);
        return;
    }
    // Refresh data when entering certain views
    if (view === View.WALLET && currentUser) {
        // Fetch transactions would go here
    }
    if (view === View.ADMIN && isAdminLoggedIn) {
        // Load admin data
        loadAdminData();
    }
    setCurrentView(view);
  };

  const loadAdminData = async () => {
      try {
          const [usersRes, ordersRes, invRes] = await Promise.all([
              userService.getAll(),
              orderService.getAll(),
              inventoryService.getAll()
          ]);
          setUsers(usersRes.data.map((u:any) => ({
              id: u.id, name: u.name, email: u.email, phone: u.phone, balance: u.balance, status: u.status, joinedDate: new Date(u.createdAt).toLocaleDateString(), ip: u.ip
          })));
          setOrders(ordersRes.data.map((o:any) => ({
              ...o, date: new Date(o.createdAt).toLocaleString('en-US')
          })));
          setInventory(invRes.data);
      } catch (e) { console.error("Admin Load Error", e); }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const formatPrice = (amountInUSD: number): string => {
    const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
    const convertedAmount = amountInUSD * currency.rate;
    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${currency.symbol} ${formatter.format(convertedAmount)}`;
  };

  const handleAdminLogin = () => {
      if (adminPasswordInput === '693693') {
          setIsAdminLoggedIn(true);
          localStorage.setItem('ratelozn_admin_auth', 'true');
          setAdminLoginError('');
          setAdminPasswordInput('');
          loadAdminData(); // Load data on login
      } else {
          setAdminLoginError('رمز الدخول غير صحيح');
      }
  };

  const handleAdminLogout = () => {
      setIsAdminLoggedIn(false);
      localStorage.removeItem('ratelozn_admin_auth');
      setCurrentView(View.HOME);
  };

  const handleUserLogout = () => {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setCartItems([]);
      setPendingCartItem(null);
      setOrders([]);
      setCurrentView(View.HOME);
  };
  
  const handleUpdateProfile = (updatedUser: UserProfile) => {
      // Optimistic update
      setCurrentUser(updatedUser);
      // In a real app, call API update endpoint
  };

  // --- Purchase Logic ---
  const handlePurchase = async (
      itemName: string, 
      price: number, 
      fulfillmentType: 'manual' | 'api' = 'manual',
      regionName?: string,
      quantityLabel?: string,
      category?: string,
      productId?: string, 
      regionId?: string, 
      denominationId?: string,
      customInputValue?: string,
      customInputLabel?: string,
      paymentMethod: 'wallet' | 'card' = 'wallet'
  ) => {
      if (!currentUser) {
          setShowLoginModal(true);
          return;
      }

      if (paymentMethod === 'card') {
          // Process Card Payment First
          try {
              const payRes = await paymentService.charge({
                  amount: price,
                  cardLast4: '4242', // Mocked from UI
                  cardHolder: currentUser.name
              });
              
              if (payRes.data.success) {
                 // If success, user balance was likely topped up or order paid directly.
                 // For this flow, we assume topup then wallet deduct, or direct order.
                 // Let's assume we proceed to Create Order now.
              }
          } catch (e) {
              alert('فشلت عملية الدفع عبر البطاقة');
              return;
          }
      }

      try {
          const res = await orderService.create({
              productId,
              productName: itemName,
              productCategory: category,
              price,
              regionId,
              regionName,
              denominationId,
              quantityLabel,
              customInputValue,
              customInputLabel
          });

          // Refresh User Balance
          checkAuthStatus();
          // Add to local orders list
          const newOrder = { ...res.data, date: new Date(res.data.createdAt).toLocaleString('en-US') };
          setOrders(prev => [newOrder, ...prev]);

      } catch (error: any) {
          alert(error.response?.data?.message || 'فشلت عملية الشراء');
      }
  };

  const handleAddBalance = (amount: number) => {
      // In real app, this opens payment gateway.
      // We will simulate it via API for now.
      alert("يرجى استخدام خيار الدفع عبر البطاقة في المحفظة.");
  };

  // --- Cart Logic ---
  const addToCart = (item: CartItem): boolean => {
    if (!currentUser) {
        setPendingCartItem(item);
        setShowLoginModal(true);
        return false;
    }
    setCartItems(prev => [...prev, item]);
    setPendingCartItem(null);
    return true;
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleBuyItem = (item: CartItem) => {
      if (!currentUser) { setShowLoginModal(true); return; }
      setActiveCheckoutItem(item);
  };

  const handleBuyAll = () => {
      if (!currentUser) { setShowLoginModal(true); return; }
      if (cartItems.length === 0) return;
      setIsBulkCheckout(true);
  };

  const handleCheckoutSuccess = async (method: 'wallet' | 'card') => {
      if (isBulkCheckout) {
          // Process sequentially
          for (const item of cartItems) {
               await handlePurchase(
                  item.name, item.price, item.apiConfig?.type || 'manual', item.selectedRegion?.name,
                  item.selectedDenomination?.label, item.category, item.productId, item.selectedRegion?.id,
                  item.selectedDenomination?.id, item.customInputValue, item.customInputLabel, method
              );
          }
          alert('تم شراء العناصر بنجاح!');
          setCartItems([]);
          setIsBulkCheckout(false);
      } else if (activeCheckoutItem) {
          await handlePurchase(
              activeCheckoutItem.name, activeCheckoutItem.price, activeCheckoutItem.apiConfig?.type || 'manual',
              activeCheckoutItem.selectedRegion?.name, activeCheckoutItem.selectedDenomination?.label,
              activeCheckoutItem.category, activeCheckoutItem.productId, activeCheckoutItem.selectedRegion?.id,
              activeCheckoutItem.selectedDenomination?.id, activeCheckoutItem.customInputValue, activeCheckoutItem.customInputLabel, method
          );
          alert('تمت العملية بنجاح!');
          removeFromCart(activeCheckoutItem.id);
          setActiveCheckoutItem(null);
      }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const myOrders = currentUser ? orders.filter(o => o.userId === currentUser.id) : [];

  const renderView = () => {
    switch (currentView) {
      case View.HOME:
        return (
          <Home 
            setView={handleSetView} 
            formatPrice={formatPrice} 
            products={products} 
            categories={categories} 
            banners={banners}
            announcements={announcements.filter(a => a.isActive)}
            addToCart={addToCart}
            userBalance={balanceUSD}
            onPurchase={handlePurchase}
            onProductSelect={handleProductSelect}
          />
        );
      case View.SEARCH:
        return (
            <SearchPage 
                setView={handleSetView} 
                formatPrice={formatPrice} 
                products={products}
                categories={categories} 
                addToCart={addToCart}
                userBalance={balanceUSD}
                onPurchase={handlePurchase}
                onProductSelect={handleProductSelect}
            />
        );
      case View.WALLET:
        return (
            <Wallet 
                setView={handleSetView} 
                formatPrice={formatPrice} 
                balance={balanceUSD} 
                onAddBalance={handleAddBalance} // Handled inside Wallet now partially
                transactions={transactions} 
            />
        );
      case View.PROFILE:
        return (
          <Profile 
            setView={handleSetView} 
            currentCurrency={currencyCode} 
            onCurrencyChange={setCurrencyCode}
            terms={terms} 
            user={currentUser || undefined}
            currencies={currencies}
            rateAppLink={rateAppLink} 
            onLogout={handleUserLogout} 
            onUpdateUser={handleUpdateProfile} 
          />
        );
      case View.ADMIN:
        if (!isAdminLoggedIn) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-[#13141f] p-6 z-[200] relative">
                     <div className="w-20 h-20 bg-[#242636] rounded-full flex items-center justify-center mb-6 shadow-lg border border-gray-700">
                        <Lock size={32} className="text-yellow-400" />
                     </div>
                     <h2 className="text-2xl font-bold text-white mb-2">منطقة المسؤولين</h2>
                     <p className="text-gray-400 text-sm mb-8">يرجى إدخال رمز الدخول للمتابعة</p>
                     
                     <div className="w-full max-w-xs space-y-4">
                        <input 
                            type="password" 
                            value={adminPasswordInput}
                            onChange={(e) => setAdminPasswordInput(e.target.value)}
                            placeholder="رمز الدخول"
                            className="w-full bg-[#1e1f2b] border border-gray-700 rounded-xl p-4 text-white text-center text-lg outline-none focus:border-yellow-400 transition-colors"
                            onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                        />
                        {adminLoginError && <div className="text-red-500 text-xs p-3 text-center font-bold">{adminLoginError}</div>}
                        <button onClick={handleAdminLogin} className="w-full bg-yellow-400 text-black font-bold py-4 rounded-xl">دخول</button>
                        <button onClick={() => setCurrentView(View.HOME)} className="w-full text-gray-500 text-sm py-2">العودة للرئيسية</button>
                     </div>
                </div>
            );
        }

        return (
          <Admin 
            setView={handleSetView}
            products={products}
            setProducts={setProducts} // Admin will call API then update these
            categories={categories}
            setCategories={setCategories}
            terms={terms}
            setTerms={setTerms}
            banners={banners}
            setBanners={setBanners}
            users={users}
            setUsers={setUsers}
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            currencies={currencies}
            setCurrencies={setCurrencies}
            orders={orders}
            setOrders={setOrders}
            inventory={inventory}
            setInventory={setInventory}
            rateAppLink={rateAppLink} 
            setRateAppLink={setRateAppLink} 
            transactions={transactions} 
            setTransactions={setTransactions} 
            onLogout={handleAdminLogout} 
          />
        );
      case View.NOTIFICATIONS:
        return <Notifications setView={handleSetView} formatPrice={formatPrice} announcements={announcements} />;
      case View.CART:
        return (
          <div className="pt-4">
             <div className="px-4 mb-4"><h1 className="text-xl font-bold text-white text-right">سلة المشتريات</h1></div>
             {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-16 text-center px-6">
                    <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mb-4"><ShoppingCart size={48} className="text-black" /></div>
                    <h2 className="text-xl font-bold mb-2 text-white">السلة فارغة</h2>
                    <button onClick={() => handleSetView(View.HOME)} className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold text-sm shadow-lg mt-4">تصفح المنتجات</button>
                </div>
             ) : (
                <div className="px-4 space-y-4">
                    <div className="bg-[#242636] p-4 rounded-2xl border border-gray-700 shadow-lg mb-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">عدد العناصر</span><span className="text-white font-bold">{cartItems.length}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400 text-sm">الإجمالي</span><span className="text-yellow-400 font-black text-xl dir-ltr">{formatPrice(cartTotal)}</span>
                        </div>
                        <button onClick={handleBuyAll} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                            <CheckCircle size={20} /> شراء الكل
                        </button>
                    </div>
                    <div className="space-y-3">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-[#242636] p-3 rounded-xl border border-gray-700 shadow-sm relative group">
                                <div className="flex items-start gap-3">
                                    <div className={`w-20 h-24 rounded-lg bg-gradient-to-br ${item.imageColor} flex items-center justify-center overflow-hidden`}>
                                        {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover opacity-90" /> : <span className="text-white text-[10px]">{item.name.slice(0,5)}</span>}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-white line-clamp-1">{item.name}</h3>
                                        <p className="text-lg font-black text-yellow-400 dir-ltr font-mono mb-2">{formatPrice(item.price)}</p>
                                        <button onClick={() => handleBuyItem(item)} className="bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1"><CheckCircle size={12} /> شراء</button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="absolute top-2 left-2 text-red-500 p-1"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             )}
             <CheckoutModal 
                isOpen={!!activeCheckoutItem || isBulkCheckout}
                onClose={() => { setActiveCheckoutItem(null); setIsBulkCheckout(false); }}
                itemName={isBulkCheckout ? `شراء الكل (${cartItems.length})` : activeCheckoutItem?.name || ''}
                price={isBulkCheckout ? cartTotal : activeCheckoutItem?.price || 0}
                userBalance={balanceUSD}
                onSuccess={handleCheckoutSuccess}
                formatPrice={formatPrice}
             />
          </div>
        );
      case View.ORDERS:
        return (
          <div className="min-h-screen pb-24 bg-[#13141f] pt-4">
               <div className="px-4 mb-4 flex items-center justify-between">
                  <button onClick={() => handleSetView(View.HOME)}><ArrowLeft className="text-white" /></button>
                  <h1 className="text-xl font-bold text-white">طلباتي</h1>
                  <div className="w-6"></div>
               </div>
               <div className="px-4 space-y-3">
                   {myOrders.map(order => (
                       <div key={order.id} className="bg-[#242636] p-4 rounded-xl border border-gray-700 flex flex-col gap-2">
                           <div className="flex justify-between">
                               <h4 className="font-bold text-white">{order.productName}</h4>
                               <span className={`text-xs px-2 py-0.5 rounded ${order.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{order.status}</span>
                           </div>
                           <p className="text-xs text-gray-500">{order.id} • {order.date}</p>
                           {order.status === 'completed' && order.deliveredCode && (
                               <div className="bg-[#13141f] p-2 rounded border border-gray-600 font-mono text-xs text-white select-all">{order.deliveredCode}</div>
                           )}
                           {order.status === 'completed' && (
                               <button onClick={() => setSelectedInvoiceOrder(order)} className="text-xs text-yellow-400 underline mt-1">عرض الفاتورة</button>
                           )}
                       </div>
                   ))}
               </div>
          </div>
        );
      default: return null;
    }
  };

  if (isSecurityBlocked) return <div className="h-screen bg-black text-white flex items-center justify-center p-10 text-center"><ShieldAlert size={50} className="mb-4 text-red-500"/>{securityMessage}</div>;

  return (
    <div className="flex justify-center absolute inset-0 bg-[#000000] overflow-hidden">
      <div className="w-full h-full bg-[#13141f] text-white font-cairo sm:max-w-[430px] sm:h-[900px] sm:my-auto sm:rounded-[3rem] sm:border-[8px] sm:border-[#2d2d2d] shadow-2xl relative overflow-hidden ring-1 ring-white/10 flex flex-col">
        {currentView !== View.ADMIN && (
          <TopHeader 
            setView={handleSetView} 
            formattedBalance={formatPrice(balanceUSD)} 
            cartItemCount={cartItems.length}
            isLoggedIn={!!currentUser}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}
        <div key={currentView} className={`flex-1 overflow-y-auto no-scrollbar scroll-smooth ${currentView !== View.ADMIN ? 'pb-24 pt-14' : ''}`}>
          {renderView()}
        </div>
        {currentView !== View.ADMIN && <BottomNav currentView={currentView} setView={handleSetView} />}
        
        {selectedProduct && (
            <ProductDetailsModal 
              product={selectedProduct} 
              isOpen={!!selectedProduct} 
              onClose={() => setSelectedProduct(null)} 
              formatPrice={formatPrice}
              addToCart={addToCart}
              userBalance={balanceUSD}
              onPurchase={handlePurchase}
              isLoggedIn={!!currentUser}
              onRequireAuth={() => setShowLoginModal(true)}
            />
        )}
        
        {selectedInvoiceOrder && (
            <InvoiceModal order={selectedInvoiceOrder} isOpen={!!selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} formatPrice={formatPrice} />
        )}

        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} terms={terms} />
        <div className="hidden sm:block absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-[#2d2d2d] rounded-b-2xl z-[60]"></div>
      </div>
    </div>
  );
};

export default App;
