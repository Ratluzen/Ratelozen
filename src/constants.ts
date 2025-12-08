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

export const CATEGORIES: Category[] = [];

export const PRODUCTS: Product[] = [];

export const TRANSACTIONS: Transaction[] = [];

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

export const MOCK_USERS: UserProfile[] = [];

export const MOCK_ORDERS: Order[] = [];

export const MOCK_INVENTORY: InventoryCode[] = [];

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
