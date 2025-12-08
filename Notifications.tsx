import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

const Notifications: React.FC<Props> = ({ setView }) => {
  return (
    <div className="min-h-screen pb-24 bg-[#13141f]">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
         <button onClick={() => setView(View.HOME)} className="p-1">
           <ArrowLeft className="text-white w-6 h-6" />
         </button>
         <h1 className="text-xl font-bold text-white">الإشعارات</h1>
         <div className="w-6"></div>
      </div>

      <div className="p-4 space-y-3">
        {/* Notification Item 1 */}
        <div className="bg-[#242636] p-4 rounded-xl shadow-md flex items-start gap-4 relative">
           {/* Red dot badge */}
           <div className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full"></div>
           
           <div className="text-3xl mt-1">🤩</div>
           <div className="flex-1">
             <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-white text-sm">رصيدك باقي له 24 ساعة وينتهي</h3>
             </div>
             <p className="text-gray-400 text-xs mb-3 leading-relaxed">استغل رصيدك في المحفظة واطلب الآن!</p>
             <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                <Clock size={12} />
                <span>22/11/25</span>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Notifications;