
import React from 'react';
import { Clock, Info, AlertTriangle, Gift, Megaphone } from 'lucide-react';
import { View, Announcement } from '../types';

interface Props {
  setView: (view: View) => void;
  formatPrice: (price: number) => string;
  announcements?: Announcement[];
}

const Notifications: React.FC<Props> = ({ setView, formatPrice, announcements = [] }) => {
  return (
    <div className="min-h-screen pb-24 bg-[#13141f] pt-4">
      {/* Header */}
      <div className="px-4 mb-4">
         <h1 className="text-xl font-bold text-white text-right">الإشعارات</h1>
      </div>

      <div className="p-4 space-y-3 pt-0">
        
        {/* Dynamic Announcements from Admin */}
        {announcements.map(ann => (
           <div 
             key={ann.id} 
             className={`bg-[#242636] p-4 rounded-xl shadow-md flex items-start gap-4 relative border border-l-4 overflow-hidden animate-fadeIn ${
                ann.type === 'offer' ? 'border-yellow-400 border-l-yellow-400' : 
                ann.type === 'alert' ? 'border-red-500 border-l-red-500' : 
                ann.type === 'ad' ? 'border-purple-500 border-l-purple-500' :
                'border-blue-500 border-l-blue-500'
             }`}
           >
              {/* Status Dot */}
              <div className={`absolute top-2 left-2 w-2 h-2 rounded-full ${
                  ann.type === 'offer' ? 'bg-yellow-400' : 
                  ann.type === 'alert' ? 'bg-red-500' : 
                  ann.type === 'ad' ? 'bg-purple-500' :
                  'bg-blue-500'
              }`}></div>
              
              <div className="text-2xl mt-1">
                 {ann.type === 'offer' && <Gift className="text-yellow-400" size={32} />}
                 {ann.type === 'alert' && <AlertTriangle className="text-red-500" size={32} />}
                 {ann.type === 'info' && <Info className="text-blue-500" size={32} />}
                 {ann.type === 'ad' && <Megaphone className="text-purple-500" size={32} />}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white text-sm">{ann.title}</h3>
                </div>
                <p className="text-gray-400 text-xs mb-3 leading-relaxed">{ann.message}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                    <Clock size={12} />
                    <span>{ann.date}</span>
                </div>
              </div>
           </div>
        ))}

        {/* Fallback Static Notification (Simulated System Notification) */}
        {announcements.length === 0 && (
          <div className="bg-[#242636] p-4 rounded-xl shadow-md flex items-start gap-4 relative border-l-4 border-l-red-500">
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
        )}

      </div>
    </div>
  );
};

export default Notifications;
