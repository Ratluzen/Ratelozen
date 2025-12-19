import React, { useState, useRef, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
// ProductDetailsModal import removed
import { View, Product, Category, Banner, Announcement, CartItem } from '../types';
import { Megaphone } from 'lucide-react';

interface Props {
  setView: (view: View) => void;
  formatPrice: (price: number) => string;
  products: Product[];
  categories: Category[];
  banners: Banner[];
  announcements: Announcement[];
  addToCart: (item: CartItem) => boolean;
  userBalance: number;
  onPurchase: (
    itemName: string, 
    price: number, 
    fulfillmentType?: 'manual' | 'api', 
    regionName?: string, 
    quantityLabel?: string, 
    category?: string, 
    productId?: string, 
    regionId?: string, 
    denominationId?: string,
    customInputValue?: string,
    customInputLabel?: string,
    paymentMethod?: 'wallet' | 'card'
  ) => void;
  onProductSelect: (product: Product) => void;
}

const Home: React.FC<Props> = ({ setView, formatPrice, products, categories, banners, announcements, addToCart, userBalance, onPurchase, onProductSelect }) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  // Category Filter State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Extend banners: Add a clone of the first banner to the end for the infinite loop illusion
  const extendedBanners = [...banners, { ...banners[0], id: -999 }]; 

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const slider = scrollRef.current;
        const width = slider.offsetWidth;
        
        // Current Scroll Position (Handle Negative for RTL in Chrome/Android)
        const currentScroll = Math.abs(slider.scrollLeft);
        const currentIndex = Math.round(currentScroll / width);
        
        // If user manually scrolled to the clone (last item), reset instantly to 0 before animating
        if (currentIndex >= extendedBanners.length - 1) {
            slider.scrollTo({ left: 0, behavior: 'instant' });
            // Wait a microtask then animate to 1
            setTimeout(() => {
                if(scrollRef.current) {
                    scrollRef.current.style.scrollSnapType = 'none';
                    scrollRef.current.scrollTo({ left: -width, behavior: 'smooth' });
                }
            }, 50);
            return;
        }

        const nextIndex = currentIndex + 1;

        // 1. Disable Snap temporarily to prevent stuttering during auto-scroll
        slider.style.scrollSnapType = 'none';

        // 2. Smooth Scroll to the next item
        slider.scrollTo({
          left: -(nextIndex * width), // Negative value for RTL direction
          behavior: 'smooth'
        });

        // 3. Reset logic after animation finishes (approx 500ms)
        setTimeout(() => {
            if (scrollRef.current) {
                // Re-enable Snap for manual swiping
                scrollRef.current.style.scrollSnapType = 'x mandatory';

                // If we reached the CLONE (Last Item), jump back to start instantly
                if (nextIndex >= extendedBanners.length - 1) {
                    scrollRef.current.scrollTo({
                        left: 0,
                        behavior: 'instant' 
                    });
                }
            }
        }, 600); // Buffer time to ensure smooth scroll finished
      }
    }, 3500); // 3.5 seconds per slide

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = Math.abs(scrollRef.current.scrollLeft);
      const width = scrollRef.current.offsetWidth;
      // Calculate index based on scroll position
      const rawIndex = Math.round(scrollLeft / width);
      
      // If we are at the clone (last index), show the dot for the first slide (0)
      const visualIndex = rawIndex >= banners.length ? 0 : rawIndex;
      
      if (currentBannerIndex !== visualIndex) {
        setCurrentBannerIndex(visualIndex);
      }
    }
  };

  // Filter Products Logic
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <div className="pb-24 pt-4 space-y-6">
      
      {/* Announcements / Alerts */}
      {announcements.length > 0 && (
        <div className="px-4">
           <div className="bg-[#242636] border border-yellow-400/30 rounded-xl p-3 flex items-center gap-3 overflow-hidden shadow-sm">
              <Megaphone size={18} className="text-yellow-400 animate-pulse flex-shrink-0" />
              <div className="flex-1 overflow-hidden relative h-5">
                 <div className="animate-marquee whitespace-nowrap absolute right-0 text-xs font-bold text-white">
                    {announcements[0].message}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Hero Slider Section */}
      <div className="px-4">
        <div className="w-full h-44 rounded-2xl relative overflow-hidden shadow-lg border border-gray-800">
           <div 
             ref={scrollRef}
             onScroll={handleScroll}
             dir="rtl"
             className="flex overflow-x-auto snap-x snap-mandatory h-full w-full no-scrollbar"
             // Note: Removed style={{ scrollBehavior: 'smooth' }} to allow JS to control smoothness without conflict
           >
             {extendedBanners.map((banner, index) => (
                <div 
                  key={index}
                  className="w-full flex-shrink-0 snap-center h-full relative flex items-center justify-center bg-gradient-to-r"
                  style={{ scrollSnapStop: 'always' }} 
                >
                    {banner.imageUrl ? (
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title} 
                          className="absolute inset-0 w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className={`absolute inset-0 bg-gradient-to-r ${banner.bg}`}></div>
                    )}
                    
                    {!banner.imageUrl && banner.pattern && <div className="absolute inset-0 opacity-20" style={{ backgroundImage: banner.pattern, backgroundSize: '20px 20px' }}></div>}
                    
                    {/* Only show text overlay if it's NOT an image banner, OR if the user explicitly added text to an image banner */}
                    {(!banner.imageUrl || (banner.title || banner.subtitle)) && (
                        <>
                           {/* Add dim overlay if there is text over an image */}
                           {banner.imageUrl && <div className="absolute inset-0 bg-black/30"></div>}
                           
                           <div className="z-10 w-full flex flex-col items-center justify-center text-center px-6">
                                {banner.title && (
                                    <h2 className="text-3xl font-black text-yellow-400 mb-2 drop-shadow-lg" style={{ fontFamily: 'Tahoma, Arial' }}>
                                    {banner.title}
                                    </h2>
                                )}
                                {banner.subtitle && <p className="text-white text-lg font-bold drop-shadow-md">{banner.subtitle}</p>}
                                {banner.desc && <p className="text-yellow-400/80 text-lg font-bold drop-shadow-md">{banner.desc}</p>}
                           </div>
                        </>
                    )}
                </div>
             ))}
           </div>
        </div>

        {/* Circular Dots */}
        <div className="flex justify-center gap-2 mt-3">
            {banners.map((_, index) => (
              <div 
                key={index}
                className={`rounded-full transition-all duration-300 ${
                  currentBannerIndex === index 
                    ? 'w-2 h-2 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)] scale-110' 
                    : 'w-2 h-2 bg-gray-600 opacity-40 hover:opacity-100'
                }`}
              ></div>
            ))}
        </div>
      </div>

      {/* Categories (Scrollable) */}
      <div className="px-4">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pr-1">
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)}
              className="flex flex-col items-center min-w-[65px] group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 transition-colors border shadow-md ${
                  activeCategory === cat.id 
                  ? 'bg-yellow-400 text-black border-yellow-400' 
                  : 'bg-[#242636] border-gray-800 text-white group-hover:bg-yellow-400 group-hover:text-black'
              }`}>
                <cat.icon size={22} />
              </div>
              <span className={`text-[10px] font-bold whitespace-nowrap transition-colors ${activeCategory === cat.id ? 'text-yellow-400' : 'text-gray-400'}`}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Sections */}
      <div className="px-4 pb-4">
          
          <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex items-center gap-2">
                 <div className="w-1 h-5 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                 <h3 className="font-bold text-lg text-white tracking-wide">
                     {activeCategory === 'all' ? 'أحدث المنتجات' : categories.find(c => c.id === activeCategory)?.name}
                 </h3>
              </div>
              {activeCategory !== 'all' && (
                  <button onClick={() => setActiveCategory('all')} className="text-[10px] bg-[#242636] hover:bg-[#2f3245] text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors">عرض الكل</button>
              )}
          </div>
          
          {/* Grid Layout - 3 Columns */}
          <div className="grid grid-cols-3 gap-3">
            {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    formattedPrice={formatPrice(product.price)}
                    onClick={() => onProductSelect(product)}
                  />
                ))
            ) : (
                <div className="col-span-3 text-center py-10 text-gray-500 font-bold text-sm bg-[#242636] rounded-2xl border border-dashed border-gray-700">
                    لا توجد منتجات في هذا القسم
                </div>
            )}
          </div>

      </div>
    </div>
  );
};

export default Home;
