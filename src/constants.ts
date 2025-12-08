import { Gamepad2, Smartphone, Monitor, ShoppingBag, CreditCard, Gift, Globe, Grid, Wifi, Ticket, Settings, MessageCircle, Home, ShoppingBasket, Clapperboard, Share2 } from 'lucide-react';
import { Product, Category, Transaction, Currency, AppTerms, Banner, UserProfile, Region, Order, InventoryCode } from './types';

export const APP_NAME = "خدمات راتلوزن";

// Predefined regions to choose from in Admin
export const PREDEFINED_REGIONS: Region[] = [
  { id: 'us', name: 'أمريكي', flag: '🇺🇸' },
  { id: 'sa', name: 'سعودي', flag: '🇸🇦' },
  { id: 'ae', name: 'إماراتي', flag: '🇦🇪' },
  { id: 'kw', name: 'كويتي', flag: '🇰🇼' },
  { id: 'qa', name: 'قطري', flag: '🇶🇦' },
  { id: 'bh', name: 'بحريني', flag: '🇧🇭' },
  { id: 'om', name: 'عماني', flag: '🇴🇲' },
  { id: 'iq', name: 'عراقي', flag: '🇮🇶' },
  { id: 'eg', name: 'مصري', flag: '🇪🇬' },
  { id: 'jo', name: 'أردني', flag: '🇯🇴' },
  { id: 'tr', name: 'تركي', flag: '🇹🇷' },
  { id: 'global', name: 'عالمي', flag: '🌍' },
];

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'الجميع', icon: Grid },
  { id: 'stores', name: 'متاجر التطبيقات', icon: ShoppingBag },
  { id: 'games', name: 'ألعاب', icon: Gamepad2 },
  { id: 'telecom', name: 'اتصالات', icon: Wifi },
  { id: 'software', name: 'خدمات واشتراكات', icon: Monitor },
  { id: 'media', name: 'خدمات الميديا', icon: Share2 },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'شحن شدات ببجي',
    category: 'games',
    price: 0.99,
    imageColor: 'from-yellow-600 to-yellow-800',
    tag: 'شحن فوري',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/3408/3408506.png',
    description: 'شحن فوري ومباشر عن طريق المعرف (ID).\nيصلك خلال ثواني!',
    regions: [PREDEFINED_REGIONS[11]], // Global
    denominations: [
        { id: 'uc60', label: '60 UC', price: 0.99 },
        { id: 'uc325', label: '325 UC', price: 4.99 },
        { id: 'uc660', label: '660 UC', price: 9.99 },
        { id: 'uc1800', label: '1800 UC', price: 24.99 }
    ],
    apiConfig: { type: 'api', providerName: 'EzPin', serviceId: 'PUBG-GLOBAL-60' }
  },
  {
    id: '2',
    name: 'بطاقات ايتونز',
    category: 'stores',
    price: 10.00,
    imageColor: 'from-blue-500 to-cyan-500',
    description: 'كود رقمي أصلي 100%.\nيستخدم لشراء التطبيقات والألعاب.',
    regions: [PREDEFINED_REGIONS[0], PREDEFINED_REGIONS[1], PREDEFINED_REGIONS[2]], // US, SA, AE
    denominations: [
        { id: 'it5', label: '5$', price: 5.00 },
        { id: 'it10', label: '10$', price: 10.00 },
        { id: 'it15', label: '15$', price: 15.00 },
        { id: 'it25', label: '25$', price: 25.00 },
        { id: 'it50', label: '50$', price: 50.00 },
        { id: 'it100', label: '100$', price: 100.00 }
    ],
    apiConfig: { type: 'manual' }
  },
  {
    id: '3',
    name: 'بلايستيشن ستور',
    category: 'stores',
    price: 20.00,
    imageColor: 'from-blue-700 to-indigo-900',
    description: 'بطاقات ستور لشراء الألعاب والإضافات.\nتسليم فوري للكود.',
    regions: [PREDEFINED_REGIONS[0], PREDEFINED_REGIONS[1]],
    denominations: [
        { id: 'ps10', label: '10$', price: 10.00 },
        { id: 'ps20', label: '20$', price: 20.00 },
        { id: 'ps50', label: '50$', price: 50.00 }
    ],
    apiConfig: { type: 'manual' }
  },
  {
    id: '4',
    name: 'شحن رصيد سوا',
    category: 'telecom',
    price: 26.50,
    imageColor: 'from-purple-600 to-purple-900',
    description: 'بطاقات شحن رصيد سوا STC.\nتعمل على جميع الخطوط السعودية.',
    regions: [PREDEFINED_REGIONS[1]], // SA Only
    denominations: [
        { id: 'stc20', label: '20 ريال', price: 5.33 },
        { id: 'stc50', label: '50 ريال', price: 13.33 },
        { id: 'stc100', label: '100 ريال', price: 26.66 }
    ],
    apiConfig: { type: 'manual' }
  },
  {
    id: '5',
    name: 'شحن موبايلي',
    category: 'telecom',
    price: 13.25,
    imageColor: 'from-sky-400 to-blue-600',
    description: 'رصيد موبايلي السعودية.\nشحن سريع ومضمون.',
    regions: [PREDEFINED_REGIONS[1]], // SA Only
  },
  {
    id: '6',
    name: 'جواهر فري فاير',
    category: 'games',
    price: 1.50,
    imageColor: 'from-orange-500 to-red-600',
    description: 'شحن جواهر فري فاير عبر المعرف.\nاستمتع باللعب الآن!',
    regions: [PREDEFINED_REGIONS[11]], // Global
    denominations: [
        { id: 'ff100', label: '100 Diamond', price: 1.50 },
        { id: 'ff210', label: '210 Diamond', price: 3.00 },
        { id: 'ff530', label: '530 Diamond', price: 7.00 }
    ]
  },
    {
    id: '7',
    name: 'نتفليكس',
    category: 'software',
    price: 25.00,
    imageColor: 'from-red-600 to-red-900',
    description: 'استمتع بمشاهدة أفلامك المفضلة.\nبطاقة اشتراك نتفليكس.',
    regions: [PREDEFINED_REGIONS[0], PREDEFINED_REGIONS[11]],
  },
    {
    id: '8',
    name: 'فيفا 26 كوينز',
    category: 'games',
    price: 14.99,
    imageColor: 'from-green-600 to-green-800',
    description: 'كوينز فيفا 26 بأفضل الأسعار.\nتسليم آمن وسريع.',
    regions: [PREDEFINED_REGIONS[11]],
  },
];

export const TRANSACTIONS: Transaction[] = [
  { id: 'tx2', title: 'شحن محفظة (Visa)', date: '2025-10-09 | 04:20 م', amount: 50.00, type: 'credit', status: 'completed', icon: CreditCard },
];

export const INITIAL_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'دولار أمريكي', flag: '🇺🇸', rate: 1, symbol: '$' },
  { code: 'SAR', name: 'ريال سعودي', flag: '🇸🇦', rate: 3.75, symbol: 'ر.س' },
  { code: 'IQD', name: 'دينار عراقي', flag: '🇮🇶', rate: 1320, symbol: 'د.ع' },
  { code: 'AED', name: 'درهم اماراتي', flag: '🇦🇪', rate: 3.67, symbol: 'د.إ' },
  { code: 'QAR', name: 'ريال قطري', flag: '🇶🇦', rate: 3.64, symbol: 'ر.ق' },
  { code: 'OMR', name: 'ريال عماني', flag: '🇴🇲', rate: 0.38, symbol: 'ر.ع' },
  { code: 'KWD', name: 'دينار كويتي', flag: '🇰🇼', rate: 0.31, symbol: 'د.ك' },
  { code: 'JOD', name: 'دينار أردني', flag: '🇯🇴', rate: 0.71, symbol: 'د.أ' },
  { code: 'EGP', name: 'جنيه مصري', flag: '🇪🇬', rate: 50.5, symbol: 'ج.م' },
  { code: 'BHD', name: 'دينار بحريني', flag: '🇧🇭', rate: 0.38, symbol: 'د.ب' },
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 1,
    title: 'راتلوزن',
    subtitle: 'تكفيك وتوفيك',
    desc: 'وبالحظوظ تغنيك !',
    bg: 'from-[#1f212e] to-[#2a2d3e]',
    pattern: 'radial-gradient(circle, #fff 1px, transparent 1px)'
  },
  {
    id: 2,
    title: 'عروض حصرية',
    subtitle: 'خصومات تصل 50%',
    desc: 'على جميع بطاقات الألعاب',
    bg: 'from-blue-900 to-indigo-900',
    pattern: 'radial-gradient(circle, #60a5fa 1px, transparent 1px)'
  },
  {
    id: 3,
    title: 'شحن فوري',
    subtitle: 'سرعة في الأداء',
    desc: 'استلم كودك خلال ثواني',
    bg: 'from-green-900 to-emerald-900',
    pattern: 'radial-gradient(circle, #34d399 1px, transparent 1px)'
  },
  {
    id: 4,
    title: 'جديد المتجر',
    subtitle: 'بطاقات الهدايا',
    desc: 'متوفرة الآن بأسعار منافسة',
    bg: 'from-purple-900 to-fuchsia-900',
    pattern: 'radial-gradient(circle, #e879f9 1px, transparent 1px)'
  }
];

export const MOCK_USERS: UserProfile[] = [
  {
    id: '123456',
    name: 'Ratluzen',
    email: 'admin@ratlozen.com',
    phone: '+9647700000000',
    balance: 100.00,
    joinedDate: '2023-01-15',
    status: 'active',
    ip: '192.168.1.50',
    password: '123' 
  },
  {
    id: '999999',
    name: 'Ahmed Ali',
    email: 'ahmed@gmail.com',
    phone: '+9647801234567',
    balance: 150.00,
    joinedDate: '2024-05-20',
    status: 'active',
    ip: '10.0.0.5',
    password: 'password123'
  },
  {
    id: '666666',
    name: 'Banned User',
    email: 'bad@user.com',
    phone: '+9647711112222',
    balance: 0.00,
    joinedDate: '2024-06-01',
    status: 'banned',
    ip: '192.168.0.1'
  }
];

export const MOCK_ORDERS: Order[] = [
    { id: '#9001', userId: '123456', userName: 'Ratluzen', productName: 'شحن شدات ببجي (660 UC)', productCategory: 'games', amount: 9.99, date: '2025-10-10 10:30 AM', status: 'pending', fulfillmentType: 'manual', regionName: 'عالمي', quantityLabel: '660 UC' },
    { id: '#9002', userId: '999999', userName: 'Ahmed Ali', productName: 'بطاقة ايتونز 10$', productCategory: 'stores', amount: 10.00, date: '2025-10-10 09:15 AM', status: 'completed', deliveredCode: 'XJ99-1234-ABCD-5678', fulfillmentType: 'stock', regionName: 'أمريكي', quantityLabel: '10$' },
    { id: '#9003', userId: '999999', userName: 'Ahmed Ali', productName: 'رصيد سوا 20', productCategory: 'telecom', amount: 5.33, date: '2025-10-09 08:00 PM', status: 'cancelled', fulfillmentType: 'api', regionName: 'سعودي', quantityLabel: '20 ريال' },
];

export const MOCK_INVENTORY: InventoryCode[] = [
    { id: '1', productId: '2', regionId: 'us', denominationId: 'it10', code: 'XJ99-1111-AAAA-2222', isUsed: false, dateAdded: '2025-10-01' },
    { id: '2', productId: '2', regionId: 'us', denominationId: 'it10', code: 'XJ99-3333-BBBB-4444', isUsed: false, dateAdded: '2025-10-01' },
    { id: '3', productId: '2', regionId: 'sa', denominationId: 'it10', code: 'SA99-5555-CCCC-6666', isUsed: true, dateAdded: '2025-10-02' },
];

export const INITIAL_TERMS: AppTerms = {
  contentAr: `1. طبيعة المنتجات
جميع المنتجات إلكترونية وغير ملموسة.
يتم تسليم المنتجات داخل قسم "الطلبات" في حساب العميل بالتطبيق.

2. قبل الشراء والدفع
يجب على العميل قراءة وصف المنتج بعناية قبل إتمام عملية الدفع.
شراء أي منتج يُعد موافقة صريحة على الوصف والشروط المذكورة له.

3. الاسترجاع والاسترداد
جميع المنتجات غير قابلة للاسترجاع أو الاسترداد نهائيًا.
لا يتحمل المتجر مسؤولية أي خطأ نتيجة إدخال العميل لبيانات غير صحيحة أثناء الطلب.

4. مشاكل المنتجات
في حال حدوث أي خلل بالمنتج، يجب على العميل تقديم فيديو كامل للحظة حدوث المشكلة.
لن يتم قبول أي شكوى بدون توفير فيديو واضح يثبت الخلل.

5. مسؤولية البيانات
العميل مسؤول مسؤولية كاملة عن جميع البيانات التي يقوم بإدخالها.
المتجر غير ملزم بالتبديل أو التعويض في حال كانت المشكلة ناتجة عن إهمال العميل.

6. الحسابات والبيانات الإلكترونية
لا يتحمل المتجر مسؤولية ضياع أو فقدان أي معلومات أو حسابات إلكترونية قام العميل بشرائها.
أي خسارة تنتج عن استخدام العميل للحساب تكون على مسؤوليته الشخصية.

7. الأسعار والتحديثات
قد تتغير أسعار المنتجات يوميًا / أسبوعيًا / شهريًا حسب سياسة المتجر.
لا يحق للعميل المطالبة باسترجاع فرق السعر.

8. تحديث الشروط
يحتفظ المتجر بحق تعديل أو إضافة بنود جديدة في أي وقت يراه مناسبًا.
يتوجب على العميل متابعة هذه الصفحة باستمرار.

9. القبول العام
شراؤك لأي منتج من المتجر يُعد موافقة كاملة على جميع الشروط والأحكام المذكورة في هذه الصفحة.`,
  
  contentEn: `1. Nature of Products
All products are digital, non-physical.
Products will be delivered to the "Orders" section.

2. Before Making a Purchase
Before making a payment, the customer must carefully read the product description.
The purchase signifies acceptance of specifications.

3. Refund and Return Policy
All products are strictly non-refundable and non-returnable.
Ratluzen Services bears no responsibility for incorrect info provided by customer.

4. Issues or Problems With Products
In case of any issue, the customer must provide a complete video recording.
Complaints will not be accepted without a video.

5. Customer Responsibility
Ratluzen Services is not responsible for any mistaken purchases.
The store is not obligated to replace or refund once delivered.

6. Digital Product Responsibility
Ratluzen Services is not responsible for any loss or damage to digital products.
Any loss incurred by the customer is their sole responsibility.

7. Pricing Policy
Prices on the website are subject to change.
Customers are not entitled to claim any price difference.

8. Modification of Terms
The store reserves the right to modify terms at any time.
Customers are responsible for reviewing terms regularly.

9. General Acceptance
Purchasing any product signifies your acceptance of all terms stated on this page.`
};