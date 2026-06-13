import React from 'react';
import { BellOff } from 'lucide-react';

const Notifications = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 sm:p-12 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center max-w-sm w-full">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <BellOff strokeWidth={2} size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">No Notifications</h2>
            <p className="text-slate-500 font-medium leading-relaxed">You don't have any new notifications at the moment. We'll alert you when something important comes up!</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
