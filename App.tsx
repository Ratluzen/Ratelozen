
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
import CheckoutModal from './components/CheckoutModal';
import ProductDetailsModal from './components/ProductDetailsModal'; // Imported here
import InvoiceModal from './components/InvoiceModal'; // Import InvoiceModal
import LoginModal from './components/LoginModal'; // Import LoginModal
import { ShoppingBag, ShoppingCart, Trash2, ArrowLeft, CheckCircle, Clock, X, CheckSquare, AlertTriangle, Receipt, Copy, ChevronDown, ChevronUp, ShieldAlert, Lock, Flag, Tags, User, CreditCard } from 'lucide-react';
import { INITIAL_CURRENCIES, PRODUCTS as INITIAL_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES, INITIAL_TERMS, INITIAL_BANNERS, MOCK_USERS, MOCK_ORDERS, MOCK_INVENTORY, TRANSACTIONS as INITIAL_TRANSACTIONS } from './constants';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  const [isSecurityBlocked, setIsSecurityBlocked] = useState(false);
  const [securityMessage, setSecurityMessage] = useState('');
  
  // --- Global App State (Lifted for Admin Control) ---
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [terms, setTerms] = useState<AppTerms>(INITIAL_TERMS); // Updated type
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>(INITIAL_CURRENCIES);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [inventory, setInventory] = useState<InventoryCode[]>(MOCK_INVENTORY);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS); // NEW: Transactions State
  const [rateAppLink, setRateAppLink] = useState<string>(''); // New State for Rate Link
  
  // --- Cart State ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeCheckoutItem, setActiveCheckoutItem] = useState<CartItem | null>(null);
  const [isBulkCheckout, setIsBulkCheckout] = useState(false); // NEW: State for bulk checkout

  // --- Product Modal State (Global) ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- Invoice Modal State ---
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null); // Start as null (Guest)
  const [showLoginModal, setShowLoginModal] = useState(false);

  // --- Admin Auth State ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('ratelozn_admin_auth') === 'true';
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // --- Security Check Effect ---
  useEffect(() => {
    const checkSecurity = async () => {
      if (Capacitor.getPlatform() === 'android') {
        try {
          // Check for App Cloning / Parallel Space
          // Standard path: /data/user/0/com.ratelozn.services/files
          // Cloned paths often contain: '999', 'parallel', 'virtual', 'dual', '10', '11' (multi-user)
          
          const uriResult = await Filesystem.getUri({
            directory: Directory.Data,
            path: '',
          });
          
          const path = uriResult.uri;
          
          // List of suspicious keywords in path
          const suspiciousIndicators = ['999', 'parallel', 'virtual', 'dual', 'clone', 'lbe', 'exposed', 'space'];
          
          // Check if path indicates a non-owner user (User 0 is owner)
          // Dual apps usually run as user 999 or 10+
          const isStandardUser = path.includes('/user/0/') || path.includes('/data/data/com.ratelozn.services');
          const hasSuspiciousKeywords = suspiciousIndicators.some(keyword => path.toLowerCase().includes(keyword));

          if (hasSuspiciousKeywords || (!isStandardUser && !path.includes('localhost'))) {
             setIsSecurityBlocked(true);
             setSecurityMessage('تم اكتشاف تشغيل التطبيق في بيئة غير آمنة (ناسخ تطبيقات أو مساحة مزدوجة). يرجى تشغيل التطبيق من الواجهة الرئيسية للهاتف لضمان حماية بياناتك المالية.');
          }

        } catch (error) {
          // If we can't access filesystem, it might be restricted, which is also suspicious
          console.error("Security Check Failed:", error);
        }
      }
    };

    checkSecurity();
  }, []);

  const balanceUSD = currentUser ? currentUser.balance : 0.00;

  // --- Login Logic ---
  const handleLogin = (data: { name?: string; email?: string; phone?: string; password?: string; isRegister: boolean }) => {
    // Search for existing user
    const existingUser = users.find(u => 
        (data.email && u.email === data.email) || 
        (data.phone && u.phone === data.phone)
    );

    if (data.isRegister) {
        // --- REGISTER FLOW ---
        if (existingUser) {
            alert('عذراً، هذا الحساب مسجل مسبقاً. يرجى تسجيل الدخول.');
            return;
        }

        // Create new user
        const newUser: UserProfile = {
            id: Math.floor(Math.random() * 1000000).toString(),
            name: data.name || 'New User',
            email: data.email || `user${Date.now()}@app.com`,
            phone: data.phone || '',
            balance: 0.00,
            joinedDate: new Date().toISOString().split('T')[0],
            status: 'active',
            password: data.password // Save password
        };
        
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        setShowLoginModal(false);
        alert('تم إنشاء الحساب بنجاح! مرحباً بك.');

    } else {
        // --- LOGIN FLOW ---
        if (!existingUser) {
            alert('عذراً، الحساب غير موجود. يرجى إنشاء حساب جديد.');
            return;
        }

        if (existingUser.status === 'banned') {
            alert('عذراً، تم حظر هذا الحساب. يرجى التواصل مع الدعم الفني.');
            return;
        }

        // Password Check
        // If the user has a password in DB, verify it
        if (existingUser.password) {
            if (data.password !== existingUser.password) {
                alert('كلمة المرور غير صحيحة');
                return;
            }
        } else {
            // Legacy user without password - Optional: force them to set one or let them in?
            // For now, let's assume if no password set, we just let them in (or strictly require password if we updated all mock users)
            // But since we updated LoginModal to always require password, we should probably update existing user password if it's missing on first login, OR fail.
            // Let's allow access but alert them to set password in profile.
            // NOTE: For strict security, you should block login if no password and force reset flow.
        }

        setCurrentUser(existingUser);
        setShowLoginModal(false);
        // alert('تم تسجيل الدخول بنجاح'); // Optional toast
    }
  };

  const handleSetView = (view: View) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(5);
    }

    // Guest Guard for Restricted Views
    if (!currentUser && [View.WALLET, View.ORDERS, View.PROFILE, View.CART].includes(view)) {
        setShowLoginModal(true);
        return;
    }

    setCurrentView(view);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const formatPrice = (amountInUSD: number): string => {
    // Use the dynamic currencies state instead of the constant
    const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
    const convertedAmount = amountInUSD * currency.rate;
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${currency.symbol} ${formatter.format(convertedAmount)}`;
  };

  // --- Admin Login Logic ---
  const handleAdminLogin = () => {
      if (adminPasswordInput === '693693') {
          setIsAdminLoggedIn(true);
          localStorage.setItem('ratelozn_admin_auth', 'true');
          setAdminLoginError('');
          setAdminPasswordInput('');
      } else {
          setAdminLoginError('رمز الدخول غير صحيح');
      }
  };

  const handleAdminLogout = () => {
      setIsAdminLoggedIn(false);
      localStorage.removeItem('ratelozn_admin_auth');
      setCurrentView(View.HOME);
  };

  // --- User Logout Logic ---
  const handleUserLogout = () => {
      setCurrentUser(null);
      setCurrentView(View.HOME);
  };
  
  // --- Update User Profile Logic ---
  const handleUpdateProfile = (updatedUser: UserProfile) => {
      // Update global user list
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      // Update current logged in user
      setCurrentUser(updatedUser);
  };

  // --- Purchase Logic ---
  const handlePurchase = (
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

      // 1. Deduct Balance (ONLY IF WALLET)
      if (paymentMethod === 'wallet') {
        // Use functional update to ensure loop safety during bulk purchase
        setUsers(prev => prev.map(u => {
            if (u.id === currentUser.id) {
                return { ...u, balance: u.balance - price };
            }
            return u;
        }));
        
        // Update current user local state as well for UI responsiveness
        setCurrentUser(prev => prev ? { ...prev, balance: prev.balance - price } : null);

        // ADD DEBIT TRANSACTION (Only for Wallet)
        const newTx: Transaction = {
            id: `tx-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            title: `شراء: ${itemName}`,
            date: new Date().toLocaleString('en-US'), // Format: MM/DD/YYYY, HH:MM:SS PM
            amount: price,
            type: 'debit',
            status: 'completed',
            icon: ShoppingBag
        };
        setTransactions(prev => [newTx, ...prev]);
      }

      // 2. Determine Order Status and Code (Auto Delivery Logic)
      let orderStatus: 'pending' | 'completed' = 'pending';
      let deliveredCode = undefined;
      let actualFulfillmentType: 'manual' | 'api' | 'stock' = fulfillmentType;

      // Find the product to check if auto-delivery is enabled
      const productObj = productId ? products.find(p => p.id === productId) : null;

      if (productObj && productObj.autoDeliverStock) {
          // Find matching available code in inventory
          const stockItem = inventory.find(item => 
              item.productId === productId && 
              !item.isUsed && 
              // Match region if specified in inventory, or if inventory item has no region (global)
              (item.regionId === regionId || (!item.regionId && !regionId) || (!item.regionId && regionId)) &&
              // Match denomination if specified in inventory
              (item.denominationId === denominationId || (!item.denominationId && !denominationId) || (!item.denominationId && denominationId))
          );

          if (stockItem) {
              orderStatus = 'completed';
              deliveredCode = stockItem.code;
              actualFulfillmentType = 'stock'; // Explicitly mark as stock fulfillment
              
              // Mark inventory item as used
              setInventory(prev => prev.map(inv => inv.id === stockItem.id ? { ...inv, isUsed: true } : inv));
          }
      }

      // 3. Create Order
      const newOrder: Order = {
          id: `#${Math.floor(Math.random() * 90000) + 10000}`,
          userId: currentUser.id,
          userName: currentUser.name,
          productName: itemName,
          productCategory: category,
          amount: price,
          date: new Date().toLocaleString('en-US'),
          status: orderStatus,
          fulfillmentType: actualFulfillmentType,
          regionName: regionName,
          quantityLabel: quantityLabel,
          deliveredCode: deliveredCode,
          customInputValue: customInputValue,
          customInputLabel: customInputLabel
      };

      setOrders(prev => [newOrder, ...prev]);
  };

  const handleAddBalance = (amount: number) => {
      if (!currentUser) {
          setShowLoginModal(true);
          return;
      }
      const newBalance = currentUser.balance + amount;
      
      // Update User Balance
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, balance: newBalance } : u));
      setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
      
      // Add Credit Transaction
      const newTx: Transaction = {
          id: `tx-add-${Date.now()}`,
          title: 'شحن محفظة (Card)',
          date: new Date().toLocaleString('en-US'),
          amount: amount,
          type: 'credit',
          status: 'completed',
          icon: CreditCard
      };
      setTransactions(prev => [newTx, ...prev]);
  };

  // --- Cart Logic ---
  const addToCart = (item: CartItem) => {
    if (!currentUser) {
        setShowLoginModal(true);
        return;
    }
    setCartItems(prev => [...prev, item]);
    // Optional: Vibrate or show toast could be triggered here
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleBuyItem = (item: CartItem) => {
      if (!currentUser) {
          setShowLoginModal(true);
          return;
      }
      setActiveCheckoutItem(item);
  };

  const handleBuyAll = () => {
      if (!currentUser) {
          setShowLoginModal(true);
          return;
      }
      if (cartItems.length === 0) return;
      setIsBulkCheckout(true);
  };

  const handleCheckoutSuccess = (method: 'wallet' | 'card') => {
      if (isBulkCheckout) {
          // Process all items in cart
          cartItems.forEach(item => {
              handlePurchase(
                  item.name, 
                  item.price, 
                  item.apiConfig?.type || 'manual',
                  item.selectedRegion?.name,
                  item.selectedDenomination?.label,
                  item.category,
                  item.productId,
                  item.selectedRegion?.id,
                  item.selectedDenomination?.id,
                  item.customInputValue,
                  item.customInputLabel,
                  method
              );
          });
          alert('تم شراء جميع العناصر بنجاح! تجد الأكواد في قائمة طلباتي.');
          setCartItems([]);
          setIsBulkCheckout(false);
      } else if (activeCheckoutItem) {
          handlePurchase(
              activeCheckoutItem.name, 
              activeCheckoutItem.price, 
              activeCheckoutItem.apiConfig?.type || 'manual',
              activeCheckoutItem.selectedRegion?.name,
              activeCheckoutItem.selectedDenomination?.label,
              activeCheckoutItem.category,
              activeCheckoutItem.productId,
              activeCheckoutItem.selectedRegion?.id,
              activeCheckoutItem.selectedDenomination?.id,
              activeCheckoutItem.customInputValue,
              activeCheckoutItem.customInputLabel,
              method
          );
          alert('تمت عملية الشراء بنجاح! تجد الكود في قائمة طلباتي.');
          removeFromCart(activeCheckoutItem.id);
          setActiveCheckoutItem(null);
      }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  // Filter orders for current user view
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
                onAddBalance={handleAddBalance} 
                transactions={transactions.filter(t => !currentUser || (currentUser && !t.userId) || (t.userId === currentUser.id) || !t.userId /* Fallback for legacy */)} 
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
            rateAppLink={rateAppLink} // Pass link
            onLogout={handleUserLogout} // Pass Logout Handler
            onUpdateUser={handleUpdateProfile} // Pass Profile Update Handler
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
                        
                        {adminLoginError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg text-center font-bold">
                                {adminLoginError}
                            </div>
                        )}
                        
                        <button 
                            onClick={handleAdminLogin}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 rounded-xl shadow-lg shadow-yellow-400/20 transition-all active:scale-95"
                        >
                            دخول
                        </button>
                        
                        <button 
                            onClick={() => setCurrentView(View.HOME)}
                            className="w-full text-gray-500 text-sm py-2 hover:text-white transition-colors"
                        >
                            العودة للرئيسية
                        </button>
                     </div>
                </div>
            );
        }

        return (
          <Admin 
            setView={handleSetView}
            products={products}
            setProducts={setProducts}
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
            rateAppLink={rateAppLink} // Pass link
            setRateAppLink={setRateAppLink} // Pass setter
            transactions={transactions} // Pass transactions
            setTransactions={setTransactions} // Pass setter for logs
            onLogout={handleAdminLogout} // Pass logout handler
          />
        );
      case View.NOTIFICATIONS:
        return <Notifications setView={handleSetView} formatPrice={formatPrice} announcements={announcements} />;
      case View.CART:
        return (
          <div className="pt-4">
             {/* Header */}
             <div className="px-4 mb-4">
                <h1 className="text-xl font-bold text-white text-right">سلة المشتريات</h1>
             </div>

             {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-16 text-center px-6 animate-fadeIn">
                    <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mb-4 relative shadow-lg shadow-yellow-400/20">
                        <ShoppingCart size={48} className="text-black" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-white">قائمة مشترياتك فارغة</h2>
                    <p className="text-gray-400 text-sm mb-8">لم تقم باضافه شيئ الى السلة</p>
                    <button onClick={() => handleSetView(View.HOME)} className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-yellow-500 transition-colors active:scale-95 transform">
                        تصفح المنتجات
                    </button>
                </div>
             ) : (
                <div className="px-4 space-y-4 animate-slide-up">
                    
                    {/* Summary (Moved to Top) */}
                    <div className="bg-[#242636] p-4 rounded-2xl border border-gray-700 shadow-lg mb-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">عدد العناصر</span>
                            <span className="text-white font-bold">{cartItems.length}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400 text-sm">الإجمالي الكلي</span>
                            <span className="text-yellow-400 font-black text-xl dir-ltr">{formatPrice(cartTotal)}</span>
                        </div>
                        {/* Buy All Button */}
                        <button 
                            onClick={handleBuyAll}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            <CheckCircle size={20} />
                            شراء الكل ({formatPrice(cartTotal)})
                        </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-3">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-[#242636] p-3 rounded-xl border border-gray-700 shadow-sm relative overflow-hidden group">
                                <div className="flex items-start gap-3">
                                    {/* Image */}
                                    <div className={`w-20 h-24 rounded-lg bg-gradient-to-br ${item.imageColor} flex-shrink-0 relative overflow-hidden flex items-center justify-center`}>
                                        {item.imageUrl ? (
                                             <img 
                                               src={item.imageUrl} 
                                               alt={item.name} 
                                               className="w-full h-full object-cover opacity-90"
                                               referrerPolicy="no-referrer"
                                               onError={(e) => {
                                                  const target = e.target as HTMLImageElement;
                                                  target.style.display = 'none';
                                                  target.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                                  const span = document.createElement('span');
                                                  span.className = 'text-white text-[10px] font-bold';
                                                  span.innerText = item.name.slice(0, 5);
                                                  target.parentElement!.appendChild(span);
                                               }}
                                             />
                                        ) : (
                                             <span className="text-white text-[10px] font-bold">{item.name.slice(0,5)}</span>
                                        )}
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-sm font-bold text-white line-clamp-1">{item.name}</h3>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {item.selectedRegion && (
                                                <span className="text-[10px] bg-[#13141f] text-gray-300 px-1.5 py-0.5 rounded border border-gray-700 flex items-center gap-1">
                                                    {item.selectedRegion.flag} {item.selectedRegion.name}
                                                </span>
                                            )}
                                            {item.selectedDenomination && (
                                                <span className="text-[10px] bg-yellow-400/10 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-400/30">
                                                    {item.selectedDenomination.label}
                                                </span>
                                            )}
                                        </div>

                                        {/* Show Custom Input in Cart */}
                                        {item.customInputValue && (
                                            <div className="mb-2 text-[10px] bg-[#13141f] border border-gray-700 rounded px-2 py-1 text-gray-400 flex items-center gap-1">
                                                <User size={10} className="text-gray-500" />
                                                <span className="font-bold">{item.customInputLabel}:</span>
                                                <span className="text-white">{item.customInputValue}</span>
                                            </div>
                                        )}
                                        
                                        <p className="text-lg font-black text-yellow-400 dir-ltr font-mono leading-none mb-3">{formatPrice(item.price)}</p>
                                    </div>
                                </div>

                                {/* Actions Row */}
                                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-700/50">
                                    <button 
                                        onClick={() => handleBuyItem(item)}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg text-xs shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                                    >
                                        <CheckCircle size={14} />
                                        شراء الآن
                                    </button>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="px-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center active:scale-95"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             )}

             {/* Checkout Modal for Cart */}
             <CheckoutModal 
                isOpen={!!activeCheckoutItem || isBulkCheckout}
                onClose={() => { setActiveCheckoutItem(null); setIsBulkCheckout(false); }}
                itemName={isBulkCheckout ? `شراء الكل (${cartItems.length} منتجات)` : activeCheckoutItem?.name || ''}
                price={isBulkCheckout ? cartTotal : activeCheckoutItem?.price || 0}
                userBalance={balanceUSD}
                onSuccess={handleCheckoutSuccess}
                formatPrice={formatPrice}
                onRequireLogin={() => setShowLoginModal(true)}
             />
          </div>
        );
      case View.ORDERS:
        return (
          <div className="min-h-screen pb-24 bg-[#13141f] pt-4">
               {/* Header */}
               <div className="px-4 mb-4 flex items-center justify-between">
                  <button onClick={() => handleSetView(View.HOME)}><ArrowLeft className="text-white" /></button>
                  <h1 className="text-xl font-bold text-white">طلباتي</h1>
                  <div className="w-6"></div>
               </div>

               {myOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center pt-16 text-center px-6 animate-fadeIn">
                     <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mb-4 text-black shadow-lg shadow-yellow-400/20">
                        <ShoppingBag size={48} strokeWidth={1.5} />
                     </div>
                     <h2 className="text-xl font-bold mb-2 text-white">لا توجد طلبات</h2>
                     <p className="text-gray-500 text-sm">لم تقم بأي عملية شراء حتى الآن</p>
                     <button onClick={() => handleSetView(View.HOME)} className="mt-6 bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform">
                     تصفح المنتجات
                     </button>
                  </div>
               ) : (
                   <div className="px-4 space-y-3 animate-slide-up">
                       {myOrders.map(order => {
                           const isPending = order.status === 'pending';
                           const isCompleted = order.status === 'completed';
                           const isCancelled = order.status === 'cancelled';
                           
                           return (
                             <div 
                                key={order.id} 
                                className={`rounded-2xl border flex flex-col gap-2 shadow-sm relative overflow-hidden transition-all ${
                                    isPending 
                                    ? 'bg-[#242636] p-4 border-gray-700' 
                                    : 'bg-[#242636]/80 p-3 border-gray-800 hover:bg-[#242636]'
                                }`}
                             >
                                {/* Header Row: Icon | Name | Price */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`rounded-full flex items-center justify-center border flex-shrink-0 ${
                                            isPending ? 'w-10 h-10 bg-yellow-500/10 border-yellow-500 text-yellow-500' : 
                                            isCompleted ? 'w-8 h-8 bg-green-500/10 border-green-500 text-green-500' : 
                                            'w-8 h-8 bg-red-500/10 border-red-500 text-red-500'
                                        }`}>
                                            {isCompleted ? <CheckCircle size={isPending ? 20 : 16} /> : isPending ? <Clock size={isPending ? 20 : 16} /> : <X size={isPending ? 20 : 16} />}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-white ${isPending ? 'text-sm' : 'text-xs'}`}>{order.productName}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-gray-500 dir-ltr font-mono select-all">{order.id}</span>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(order.id);
                                                        }}
                                                        className="text-gray-600 hover:text-white p-0.5"
                                                    >
                                                        <Copy size={10} />
                                                    </button>
                                                </div>
                                                <span className="text-[10px] text-gray-600">•</span>
                                                <span className="text-[10px] text-gray-500">{order.date.split(',')[0]}</span>
                                            </div>

                                            {/* Region and Quantity Badges */}
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {order.regionName && (
                                                    <span className="text-[9px] bg-[#13141f] text-gray-300 px-1.5 py-0.5 rounded border border-gray-600 flex items-center gap-1">
                                                        <Flag size={8} /> {order.regionName}
                                                    </span>
                                                )}
                                                {order.quantityLabel && (
                                                    <span className="text-[9px] bg-yellow-400/5 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-400/20 flex items-center gap-1">
                                                        <Tags size={8} /> {order.quantityLabel}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Custom Input Value Display */}
                                            {order.customInputValue && (
                                                <div className="mt-1.5 bg-[#13141f] rounded px-2 py-1 border border-gray-700 w-fit">
                                                    <span className="text-[9px] text-gray-400 font-bold">{order.customInputLabel || 'معلومات إضافية'}: </span>
                                                    <span className="text-[9px] text-white select-all">{order.customInputValue}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end">
                                        <span className={`font-black dir-ltr text-yellow-400 ${isPending ? 'text-sm' : 'text-xs'}`}>
                                            {formatPrice(order.amount)}
                                        </span>
                                        <span className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded ${
                                            isCompleted ? 'text-green-500 bg-green-500/10' : 
                                            isPending ? 'text-yellow-500 bg-yellow-500/10' : 
                                            'text-red-500 bg-red-500/10'
                                        }`}>
                                            {isCompleted ? 'مكتمل' : isPending ? 'قيد الانتظار' : 'ملغي'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Detail Sections for Compact Cards */}
                                
                                {/* If Completed: Compact Code Display */}
                                {isCompleted && order.deliveredCode && (
                                    <div className="mt-1 bg-[#13141f] rounded-lg border border-dashed border-gray-700 flex items-center justify-between p-2">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap">الكود:</span>
                                            <p className="text-white font-mono text-[10px] truncate dir-ltr select-all">{order.deliveredCode}</p>
                                        </div>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(order.deliveredCode || '')}
                                            className="text-gray-500 hover:text-white transition-colors p-1"
                                        >
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                )}

                                {/* If Cancelled: Compact Reason */}
                                {isCancelled && order.rejectionReason && (
                                    <div className="mt-1 bg-red-500/5 rounded-lg border border-red-500/20 p-2 flex gap-2 items-start">
                                        <AlertTriangle size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-red-300 leading-tight">{order.rejectionReason}</p>
                                    </div>
                                )}

                                {/* Actions Footer */}
                                {isCompleted && (
                                    <div className="flex justify-end mt-1 pt-2 border-t border-gray-700/30">
                                        <button 
                                            onClick={() => setSelectedInvoiceOrder(order)}
                                            className="text-[10px] flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Receipt size={12} />
                                            <span>عرض الفاتورة</span>
                                        </button>
                                    </div>
                                )}
                             </div>
                           );
                       })}
                   </div>
               )}
          </div>
        );
      default:
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
    }
  };

  // --- SECURITY BLOCK SCREEN ---
  if (isSecurityBlocked) {
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-[#13141f] text-center p-8 z-[9999] absolute inset-0">
              <div className="bg-red-500/10 p-6 rounded-full border border-red-500/30 mb-6 animate-pulse">
                  <ShieldAlert size={64} className="text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-white mb-4">تم اكتشاف تهديد أمني</h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-8">
                  {securityMessage}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-black/20 px-4 py-2 rounded-lg border border-gray-800">
                  <Lock size={12} />
                  <span>Ratluzen Security System v1.0</span>
              </div>
          </div>
      );
  }

  return (
    <div className="flex justify-center absolute inset-0 bg-[#000000] overflow-hidden">
      <div className="w-full h-full bg-[#13141f] text-white font-cairo sm:max-w-[430px] sm:h-[900px] sm:my-auto sm:rounded-[3rem] sm:border-[8px] sm:border-[#2d2d2d] shadow-2xl relative overflow-hidden ring-1 ring-white/10 flex flex-col">
        
        {/* Persistent Top Header (Hidden in Admin View) */}
        {currentView !== View.ADMIN && (
          <TopHeader 
            setView={handleSetView} 
            formattedBalance={formatPrice(balanceUSD)} 
            cartItemCount={cartItems.length}
            isLoggedIn={!!currentUser}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}

        {/* Scrollable Content Area */}
        <div 
          key={currentView} // Force scroll reset on view change
          className={`flex-1 overflow-y-auto no-scrollbar scroll-smooth ${currentView !== View.ADMIN ? 'pb-24 pt-14' : ''}`}
        >
          {renderView()}
        </div>

        {/* Persistent Bottom Nav (Hidden in Admin View) */}
        {currentView !== View.ADMIN && (
          <BottomNav currentView={currentView} setView={handleSetView} />
        )}
        
        {/* Global Product Details Modal - Rendered here to cover entire screen including header/footer */}
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
        
        {/* Invoice Modal */}
        {selectedInvoiceOrder && (
            <InvoiceModal 
                order={selectedInvoiceOrder}
                isOpen={!!selectedInvoiceOrder}
                onClose={() => setSelectedInvoiceOrder(null)}
                formatPrice={formatPrice}
            />
        )}

        {/* Login Modal */}
        <LoginModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)}
            onLogin={handleLogin}
            terms={terms}
        />

        <div className="hidden sm:block absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-[#2d2d2d] rounded-b-2xl z-[60]"></div>
      </div>
    </div>
  );
};

export default App;
