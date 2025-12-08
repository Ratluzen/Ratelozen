import React, { useState } from 'react';
import { 
  ArrowLeft, ChevronLeft, Globe, HelpCircle, FileText, 
  LogOut, Star, MessageSquare, Trash2 
} from 'lucide-react';
import { View } from '../types';
import { INITIAL_CURRENCIES } from '../constants';

interface Props {
  setView: (view: View) => void;
}

const Profile: React.FC<Props> = ({ setView }) => {
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const menuItems = [
    { icon: Globe, label: 'العملة', action: () => setShowCurrencyModal(true) },
    { icon: MessageSquare, label: 'الاسئلة الشائعة', action: () => {} },
    { icon: FileText, label: 'الشروط والاحكام', action: () => {} },
    { icon: Star, label: 'تقييم التطبيق', action: () => {} },
    { icon: HelpCircle, label: 'الدعم الفني', action: () => setView(View.NOTIFICATIONS) }, // Redirecting to notifications as a placeholder for support
  ];

  return (
    <div className="min-h-screen pb-24 bg-[#13141f] relative">
      {/* Header */}
      <div className="p-4 flex items-center justify-between mb-4">
        <button onClick={() => setView(View.HOME)}>
           <ArrowLeft className="text-white w-6 h-6" />
        </button>
        <div className="w-16 h-8 bg-yellow-400 rounded flex items-center justify-center">
            {/* Small Logo Placeholder */}
            <span className="font-black text-xs text-black tracking-widest">ISH7NHA</span>
        </div>
        <div className="flex items-center gap-1 bg-[#242636] px-2 py-1 rounded border border-gray-700">
            <span className="text-white font-bold text-xs">$ 0.03</span>
            <span className="w-4 h-4 bg-gray-600 rounded-sm"></span>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* Menu Items */}
        {menuItems.map((item, idx) => (
          <button 
            key={idx} 
            onClick={item.action}
            className="w-full bg-[#1e1f2b] p-4 rounded-xl flex items-center justify-between border border-gray-800 hover:bg-[#252836] transition-colors"
          >
            <div className="flex items-center gap-4">
               {/* Icon */}
               <item.icon size={20} className="text-gray-400" />
               <span className="font-bold text-sm text-white">{item.label}</span>
            </div>
            <ChevronLeft className="text-gray-600 w-5 h-5" />
          </button>
        ))}

        {/* Logout */}
        <button className="w-full bg-[#1e1f2b] p-4 rounded-xl flex items-center justify-between border border-gray-800 hover:bg-[#252836] transition-colors mt-6">
            <div className="flex items-center gap-4">
               <LogOut size={20} className="text-red-500" />
               <span className="font-bold text-sm text-red-500">تسجيل الخروج</span>
            </div>
            <ChevronLeft className="text-gray-600 w-5 h-5" />
        </button>

         {/* Delete Account */}
         <button className="w-full bg-[#1e1f2b] p-4 rounded-xl flex items-center justify-between border border-gray-800 hover:bg-[#252836] transition-colors">
            <div className="flex items-center gap-4">
               <Trash2 size={20} className="text-red-500" />
               <span className="font-bold text-sm text-red-500">حذف الحساب</span>
            </div>
            <ChevronLeft className="text-gray-600 w-5 h-5" />
        </button>
      </div>

       {/* Version */}
       <div className="text-center text-gray-500 text-xs mt-8 font-mono">
         v3.3.6
       </div>

       {/* Currency Modal (Bottom Sheet) */}
       {showCurrencyModal && (
         <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCurrencyModal(false)}></div>
            <div className="bg-[#1f212e] w-full max-w-md rounded-t-3xl p-6 relative z-10 animate-slide-up">
               <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6 opacity-50"></div>
               
               <h2 className="text-xl font-bold mb-2 text-center text-white">العملة</h2>
               <p className="text-gray-400 text-sm text-center mb-6">اختر العملة التي تريد عرض الأسعار بها</p>
               
               <div className="bg-[#13141f] rounded-xl border border-gray-700 p-2 mb-4">
                 <div className="flex items-center justify-between p-3">
                    <span className="text-white font-bold">دولار أمريكي</span>
                    <span className="text-2xl">🇺🇸</span>
                 </div>
               </div>
               
               <button 
                 onClick={() => setShowCurrencyModal(false)}
                 className="w-full bg-yellow-400 text-black font-bold py-3.5 rounded-xl hover:bg-yellow-500 transition-colors"
               >
                 تغيير العملة
               </button>
            </div>
         </div>
       )}
    </div>
  );
};

export default Profile;