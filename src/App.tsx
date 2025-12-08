import React, { useState, useEffect } from 'react';
import {
  View,
  Product,
  Category,
  AppTerms,
  Banner,
  UserProfile,
  Announcement,
  CartItem,
  Currency,
  Order,
  InventoryCode,
  Transaction,
} from '../types';

import Home from '../pages/Home';
import SearchPage from '../pages/Search';
import Wallet from '../pages/Wallet';
import Profile from '../pages/Profile';
import Notifications from '../pages/Notifications';
import Admin from '../pages/Admin';

import BottomNav from '../components/BottomNav';
import TopHeader from '../components/TopHeader';
import CheckoutModal from '../components/CheckoutModal';
import ProductDetailsModal from '../components/ProductDetailsModal';
import InvoiceModal from '../components/InvoiceModal';
import LoginModal from '../components/LoginModal';

import {
  ShoppingBag,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  CheckCircle,
  Clock,
  X,
  AlertTriangle,
  Receipt,
  Copy,
  ShieldAlert,
  Lock,
  Flag,
  Tags,
  User,
  CreditCard,
} from 'lucide-react';

import {
  INITIAL_CURRENCIES,
  INITIAL_TERMS,
  INITIAL_BANNERS,
} from '../constants';

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// =============================
// 🔌 إعداد الاتصال مع الباك إند
// =============================

// غيّر هذا المتغير من .env => VITE_API_URL ليكون رابط سيرفر Railway
// مثال داخل .env.development أو .env.production
// VITE_API_URL="https://your-railway-app.up.railway.app/api"
const API_URL = import.meta.env.VITE_API_URL || '';

type LoginPayload = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  isRegister: boolean;
};

// مساعد عام لطلبات الـ API
async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {},
  withAuth: boolean = false
): Promise<T> {
  if (!API_URL) {
    console.warn('VITE_API_URL غير مضبوط، سيتم العمل محلياً فقط.');
    throw new Error('API URL not configured');
  }

  const token =
    withAuth && typeof window !== 'undefined'
      ? localStorage.getItem('ratelozn_token')
      : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any).Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = await res.json();
      msg = data.message || data.error || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  try {
    return (await res.json()) as T;
  } catch {
    // بعض النهايات قد ترجع 204 بدون جسم
    return {} as T;
  }
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  const [isSecurityBlocked, setIsSecurityBlocked] = useState(false);
  const [securityMessage, setSecurityMessage] = useState('');

  // حالة تحميل عامة
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  // --- Global App State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [terms, setTerms] = useState<AppTerms>(INITIAL_TERMS);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>(INITIAL_CURRENCIES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryCode[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rateAppLink, setRateAppLink] = useState<string>('');

  // --- Cart State ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeCheckoutItem, setActiveCheckoutItem] = useState<CartItem | null>(
    null
  );
  const [isBulkCheckout, setIsBulkCheckout] = useState(false);

  // --- Product Modal State ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- Invoice Modal State ---
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] =
    useState<Order | null>(null);

  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  // ✅ حل مشكلة بقاء واجهة تسجيل الدخول بعد النجاح
  const isLoginModalOpen = showLoginModal && !currentUser;

  // --- Admin Auth State ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ratelozn_admin_auth') === 'true';
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // --- Security Check Effect ---
  useEffect(() => {
    const checkSecurity = async () => {
      if (Capacitor.getPlatform() === 'android') {
        try {
          const uriResult = await Filesystem.getUri({
            directory: Directory.Data,
            path: '',
          });

          const path = uriResult.uri;

          const suspiciousIndicators = [
            '999',
            'parallel',
            'virtual',
            'dual',
            'clone',
            'lbe',
            'exposed',
            'space',
          ];

          const isStandardUser =
            path.includes('/user/0/') ||
            path.includes('/data/data/com.ratelozn.services');
          const hasSuspiciousKeywords = suspiciousIndicators.some((keyword) =>
            path.toLowerCase().includes(keyword)
          );

          if (hasSuspiciousKeywords || (!isStandardUser && !path.includes('localhost'))) {
            setIsSecurityBlocked(true);
            setSecurityMessage(
              'تم اكتشاف تشغيل التطبيق في بيئة غير آمنة (ناسخ تطبيقات أو مساحة مزدوجة). يرجى تشغيل التطبيق من الواجهة الرئيسية للهاتف لضمان حماية بياناتك المالية.'
            );
          }
        } catch (error) {
          console.error('Security Check Failed:', error);
        }
      }
    };

    checkSecurity();
  }, []);

  const balanceUSD = currentUser ? currentUser.balance : 0.0;

  // ===============================
  // 🔁 تحميل البيانات من الباك إند
  // ===============================
  useEffect(() => {
    const bootstrap = async () => {
      try {
        setIsBootstrapping(true);
        setBootstrapError(null);

        if (!API_URL) {
          // في حال لم يتم ضبط VITE_API_URL نكتفي بالوضع المحلي
          setIsBootstrapping(false);
          return;
        }

        // نقطة موحدة في السيرفر ترجع كل البيانات الأساسية
        // عدّل المسار حسب السيرفر عندك (مثال: /app/bootstrap أو /client/init)
        const data = await apiRequest<any>('/app/bootstrap', {}, false);

        if (data.products) setProducts(data.products);
        if (data.categories) setCategories(data.categories);
        if (data.terms) setTerms(data.terms);
        if (data.banners) setBanners(data.banners);
        if (data.announcements) setAnnouncements(data.announcements);
        if (data.currencies) setCurrencies(data.currencies);
        if (data.inventory) setInventory(data.inventory);
        if (data.rateAppLink) setRateAppLink(data.rateAppLink);
      } catch (err: any) {
        console.error(err);
        setBootstrapError(err.message || 'فشل تحميل البيانات من السيرفر');
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  // =====================
  // 👤 تسجيل / تسجيل دخول
  // =====================
  const handleLogin = async (data: LoginPayload) => {
    // لو ما في API_URL نستخدم النظام المحلي القديم
    if (!API_URL) {
      localLoginFallback(data);
      return;
    }

    try {
      if (data.isRegister) {
        const body = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        };

        const res = await apiRequest<{ user: UserProfile; token: string }>(
          '/auth/register',
          {
            method: 'POST',
            body: JSON.stringify(body),
          }
        );

        if (typeof window !== 'undefined') {
          localStorage.setItem('ratelozn_token', res.token);
        }
        setCurrentUser(res.user);
        setShowLoginModal(false);
        alert('تم إنشاء الحساب بنجاح! مرحباً بك.');
      } else {
        const body = {
          email: data.email,
          phone: data.phone,
          password: data.password,
        };

        const res = await apiRequest<{ user: UserProfile; token: string }>(
          '/auth/login',
          {
            method: 'POST',
            body: JSON.stringify(body),
          }
        );

        if (typeof window !== 'undefined') {
          localStorage.setItem('ratelozn_token', res.token);
        }
        setCurrentUser(res.user);
        setShowLoginModal(false);
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الاتصال بالسيرفر');
    }
  };

  // نسخة احتياطية تعمل محلياً لو ما فيه باك إند
  const localLoginFallback = (data: LoginPayload) => {
    const existingUser = users.find(
      (u) =>
        (data.email && u.email === data.email) ||
        (data.phone && u.phone === data.phone)
    );

    if (data.isRegister) {
      if (existingUser) {
        alert('عذراً، هذا الحساب مسجل مسبقاً. يرجى تسجيل الدخول.');
        return;
      }

      const newUser: UserProfile = {
        id: Math.floor(Math.random() * 1000000).toString(),
        name: data.name || 'New User',
        email: data.email || `user${Date.now()}@app.com`,
        phone: data.phone || '',
        balance: 0.0,
        joinedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        password: data.password,
      };

      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setShowLoginModal(false);
      alert('تم إنشاء الحساب بنجاح! مرحباً بك.');
    } else {
      if (!existingUser) {
        alert('عذراً، الحساب غير موجود. يرجى إنشاء حساب جديد.');
        return;
      }

      if (existingUser.status === 'banned') {
        alert('عذراً، تم حظر هذا الحساب. يرجى التواصل مع الدعم الفني.');
        return;
      }

      if (existingUser.password && data.password !== existingUser.password) {
        alert('كلمة المرور غير صحيحة');
        return;
      }

      setCurrentUser(existingUser);
      setShowLoginModal(false);
    }
  };

  const handleSetView = (view: View) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(5);
    }

    if (
      !currentUser &&
      [View.WALLET, View.ORDERS, View.PROFILE, View.CART].includes(view)
    ) {
      setShowLoginModal(true);
      return;
    }

    setCurrentView(view);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const formatPrice = (amountInUSD: number): string => {
    const currency =
      currencies.find((c) => c.code === currencyCode) || currencies[0];
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('ratelozn_admin_auth', 'true');
      }
      setAdminLoginError('');
      setAdminPasswordInput('');
    } else {
      setAdminLoginError('رمز الدخول غير صحيح');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ratelozn_admin_auth');
    }
    setCurrentView(View.HOME);
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ratelozn_token');
    }
    setCurrentView(View.HOME);
  };

  const handleUpdateProfile = async (updatedUser: UserProfile) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);

    // تحديث في الباك إند (اختياري)
    if (!API_URL) return;
    try {
      await apiRequest(`/users/${updatedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedUser),
      }, true);
    } catch (err) {
      console.warn('فشل تحديث الملف الشخصي في السيرفر، تم التحديث محلياً فقط.');
    }
  };

  // ======================
  // 💳 الشراء وإنشاء الطلب
  // ======================
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

    // خصم الرصيد محلياً (ويمكن ربطه مع السيرفر)
    if (paymentMethod === 'wallet') {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id ? { ...u, balance: u.balance - price } : u
        )
      );
      setCurrentUser((prev) =>
        prev ? { ...prev, balance: prev.balance - price } : null
      );

      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: `شراء: ${itemName}`,
        date: new Date().toISOString(),
        amount: price,
        type: 'debit',
        status: 'completed',
        icon: ShoppingBag,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    let orderStatus: 'pending' | 'completed' = 'pending';
    let deliveredCode: string | undefined = undefined;
    let actualFulfillmentType: 'manual' | 'api' | 'stock' = fulfillmentType;

    // محاولة سحب كود تلقائي من المخزون (محلياً)
    const productObj = productId
      ? products.find((p) => p.id === productId)
      : null;

    if (productObj && productObj.autoDeliverStock) {
      const stockItem = inventory.find(
        (item) =>
          item.productId === productId &&
          !item.isUsed &&
          (item.regionId === regionId ||
            (!item.regionId && !regionId) ||
            (!item.regionId && regionId)) &&
          (item.denominationId === denominationId ||
            (!item.denominationId && !denominationId) ||
            (!item.denominationId && denominationId))
      );

      if (stockItem) {
        orderStatus = 'completed';
        deliveredCode = stockItem.code;
        actualFulfillmentType = 'stock';

        setInventory((prev) =>
          prev.map((inv) =>
            inv.id === stockItem.id ? { ...inv, isUsed: true } : inv
          )
        );
      }
    }

    const newOrder: Order = {
      id: `#${Math.floor(Math.random() * 90000) + 10000}`,
      userId: currentUser.id,
      userName: currentUser.name,
      productName: itemName,
      productCategory: category,
      amount: price,
      date: new Date().toISOString(),
      status: orderStatus,
      fulfillmentType: actualFulfillmentType,
      regionName,
      quantityLabel,
      deliveredCode,
      customInputValue,
      customInputLabel,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // إرسال الطلب للباك إند
    if (API_URL) {
      try {
        await apiRequest('/orders', {
          method: 'POST',
          body: JSON.stringify({
            userId: currentUser.id,
            productId,
            price,
            regionId,
            denominationId,
            paymentMethod,
            customInputValue,
          }),
        }, true);
      } catch (err) {
        console.warn('تم إنشاء الطلب محلياً لكن فشل حفظه في السيرفر.');
      }
    }
  };

  const handleAddBalance = async (amount: number) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    const newBalance = currentUser.balance + amount;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, balance: newBalance } : u
      )
    );
    setCurrentUser((prev) =>
      prev ? { ...prev, balance: newBalance } : null
    );

    const newTx: Transaction = {
      id: `tx-add-${Date.now()}`,
      title: 'شحن محفظة (Card)',
      date: new Date().toISOString(),
      amount,
      type: 'credit',
      status: 'completed',
      icon: CreditCard,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // إرسال عملية الشحن للباك إند (اختياري)
    if (API_URL) {
      try {
        await apiRequest('/wallet/topup', {
          method: 'POST',
          body: JSON.stringify({
            userId: currentUser.id,
            amount,
          }),
        }, true);
      } catch (err) {
        console.warn('تم شحن الرصيد محلياً لكن فشل حفظ العملية في السيرفر.');
      }
    }
  };

  // --- Cart Logic ---
  const addToCart = (item: CartItem) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setCartItems((prev) => [...prev, item]);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
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
      cartItems.forEach((item) => {
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
  const myOrders = currentUser
    ? orders.filter((o) => o.userId === currentUser.id)
    : [];

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
            announcements={announcements.filter((a) => a.isActive)}
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
              <p className="text-gray-400 text-sm mb-8">
                يرجى إدخال رمز الدخول للمتابعة
              </p>

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
            rateAppLink={rateAppLink}
            setRateAppLink={setRateAppLink}
            transactions={transactions}
            setTransactions={setTransactions}
            onLogout={handleAdminLogout}
          />
        );

      case View.NOTIFICATIONS:
        return (
          <Notifications
            setView={handleSetView}
            formatPrice={formatPrice}
            announcements={announcements}
          />
        );

      case View.CART:
        return (
          <div className="pt-4">
            <div className="px-4 mb-4 flex items-center justify_between">
              <button onClick={() => handleSetView(View.HOME)}>
                <ArrowLeft className="text-white" />
              </button>
              <h1 className="text-xl font-bold text-white">سلة المشتريات</h1>
              <div className="w-6" />
            </div>

            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-16 text-center px-6 animate-fadeIn">
                <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mb-4 relative shadow-lg shadow-yellow-400/20">
                  <ShoppingCart size={48} className="text_black" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold mb-2 text-white">
                  قائمة مشترياتك فارغة
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                  لم تقم بإضافة شيء إلى السلة
                </p>
                <button
                  onClick={() => handleSetView(View.HOME)}
                  className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-yellow-500 transition-colors active:scale-95 transform"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              <div className="px-4 space-y-4 animate-slide-up">
                <div className="bg-[#242636] p-4 rounded-2xl border border-gray-700 shadow-lg mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">عدد العناصر</span>
                    <span className="text-white font-bold">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 text-sm">الإجمالي الكلي</span>
                    <span className="text-yellow-400 font-black text-xl dir-ltr">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>

                  <button
                    onClick={handleBuyAll}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <CheckCircle size={20} />
                    شراء الكل ({formatPrice(cartTotal)})
                  </button>
                </div>

                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#242636] p-3 rounded-xl border border-gray-700 shadow-sm relative overflow-hidden group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-20 h-24 rounded-lg bg-gradient-to-br ${item.imageColor} flex-shrink-0 relative overflow-hidden flex items-center justify-center`}
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover opacity-90"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-white text-[10px] font-bold">
                              {item.name.slice(0, 5)}
                            </span>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-sm font-bold text-white line-clamp-1">
                              {item.name}
                            </h3>
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

                          {item.customInputValue && (
                            <div className="mb-2 text-[10px] bg-[#13141f] border border-gray-700 rounded px-2 py-1 text-gray-400 flex items-center gap-1">
                              <User size={10} className="text-gray-500" />
                              <span className="font-bold">
                                {item.customInputLabel}:
                              </span>
                              <span className="text-white">
                                {item.customInputValue}
                              </span>
                            </div>
                          )}

                          <p className="text-lg font-black text-yellow-400 dir-ltr font-mono leading-none mb-3">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>

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
                          className="px-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors flex items_center justify-center active:scale-95"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <CheckoutModal
              isOpen={!!activeCheckoutItem || isBulkCheckout}
              onClose={() => {
                setActiveCheckoutItem(null);
                setIsBulkCheckout(false);
              }}
              itemName={
                isBulkCheckout
                  ? `شراء الكل (${cartItems.length} منتجات)`
                  : activeCheckoutItem?.name || ''
              }
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
            <div className="px-4 mb-4 flex items-center justify-between">
              <button onClick={() => handleSetView(View.HOME)}>
                <ArrowLeft className="text-white" />
              </button>
              <h1 className="text-xl font-bold text-white">طلباتي</h1>
              <div className="w-6" />
            </div>

            {myOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-16 text_center px-6 animate-fadeIn">
                <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mb-4 text-black shadow-lg shadow-yellow-400/20">
                  <ShoppingBag size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold mb-2 text-white">
                  لا توجد طلبات
                </h2>
                <p className="text-gray-500 text-sm">
                  لم تقم بأي عملية شراء حتى الآن
                </p>
                <button
                  onClick={() => handleSetView(View.HOME)}
                  className="mt-6 bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              <div className="px-4 space-y-3 animate-slide-up">
                {myOrders.map((order) => {
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
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-full flex items-center justify-center border flex-shrink-0 ${
                              isPending
                                ? 'w-10 h-10 bg-yellow-500/10 border-yellow-500 text-yellow-500'
                                : isCompleted
                                ? 'w-8 h-8 bg-green-500/10 border-green-500 text-green-500'
                                : 'w-8 h-8 bg-red-500/10 border-red-500 text-red-500'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle size={isPending ? 20 : 16} />
                            ) : isPending ? (
                              <Clock size={isPending ? 20 : 16} />
                            ) : (
                              <X size={isPending ? 20 : 16} />
                            )}
                          </div>
                          <div>
                            <h4
                              className={`font-bold text-white ${
                                isPending ? 'text-sm' : 'text-xs'
                              }`}
                            >
                              {order.productName}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-gray-500 dir-ltr font-mono select-all">
                                  {order.id}
                                </span>
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
                              <span className="text-[10px] text-gray-500">
                                {order.date.split('T')[0]}
                              </span>
                            </div>

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

                            {order.customInputValue && (
                              <div className="mt-1.5 bg-[#13141f] rounded px-2 py-1 border border-gray-700 w-fit">
                                <span className="text-[9px] text-gray-400 font-bold">
                                  {order.customInputLabel || 'معلومات إضافية'}:{' '}
                                </span>
                                <span className="text-[9px] text-white select-all">
                                  {order.customInputValue}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span
                            className={`font-black dir-ltr text-yellow-400 ${
                              isPending ? 'text-sm' : 'text-xs'
                            }`}
                          >
                            {formatPrice(order.amount)}
                          </span>
                          <span
                            className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded ${
                              isCompleted
                                ? 'text-green-500 bg-green-500/10'
                                : isPending
                                ? 'text-yellow-500 bg-yellow-500/10'
                                : 'text-red-500 bg-red-500/10'
                            }`}
                          >
                            {isCompleted
                              ? 'مكتمل'
                              : isPending
                              ? 'قيد الانتظار'
                              : 'ملغي'}
                          </span>
                        </div>
                      </div>

                      {isCompleted && order.deliveredCode && (
                        <div className="mt-1 bg-[#13141f] rounded-lg border border-dashed border-gray-700 flex items-center justify-between p-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap">
                              الكود:
                            </span>
                            <p className="text-white font-mono text-[10px] truncate dir-ltr select-all">
                              {order.deliveredCode}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(order.deliveredCode || '')
                            }
                            className="text-gray-500 hover:text-white transition-colors p-1"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      )}

                      {isCancelled && (order as any).rejectionReason && (
                        <div className="mt-1 bg-red-500/5 rounded-lg border border-red-500/20 p-2 flex gap-2 items-start">
                          <AlertTriangle
                            size={12}
                            className="text-red-500 flex-shrink-0 mt-0.5"
                          />
                          <p className="text-[10px] text-red-300 leading-tight">
                            {(order as any).rejectionReason}
                          </p>
                        </div>
                      )}

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
            announcements={announcements.filter((a) => a.isActive)}
            addToCart={addToCart}
            userBalance={balanceUSD}
            onPurchase={handlePurchase}
            onProductSelect={handleProductSelect}
          />
        );
    }
  };

  if (isSecurityBlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#13141f] text-center p-8 z-[9999] absolute inset-0">
        <div className="bg-red-500/10 p-6 rounded-full border border-red-500/30 mb-6 animate-pulse">
          <ShieldAlert size={64} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-white mb-4">
          تم اكتشاف تهديد أمني
        </h1>
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
        {currentView !== View.ADMIN && (
          <TopHeader
            setView={handleSetView}
            formattedBalance={formatPrice(balanceUSD)}
            cartItemCount={cartItems.length}
            isLoggedIn={!!currentUser}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}

        {/* رسالة خطأ عامة لو فشل البوت ستراب */}
        {bootstrapError && (
          <div className="bg-red-500/10 text-red-300 text-xs px-4 py-2 text-center">
            {bootstrapError} - سيتم استخدام بيانات فارغة، تأكد من رابط السيرفر.
          </div>
        )}

        <div
          key={currentView}
          className={`flex-1 overflow-y-auto no-scrollbar scroll-smooth ${
            currentView !== View.ADMIN ? 'pb-24 pt-14' : ''
          }`}
        >
          {isBootstrapping ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              جاري تحميل البيانات...
            </div>
          ) : (
            renderView()
          )}
        </div>

        {currentView !== View.ADMIN && (
          <BottomNav currentView={currentView} setView={handleSetView} />
        )}

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
          <InvoiceModal
            order={selectedInvoiceOrder}
            isOpen={!!selectedInvoiceOrder}
            onClose={() => setSelectedInvoiceOrder(null)}
            formatPrice={formatPrice}
          />
        )}

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          terms={terms}
        />

        <div className="hidden sm:block absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-[#2d2d2d] rounded-b-2xl z-[60]" />
      </div>
    </div>
  );
};

export default App;
