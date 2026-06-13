import React from 'react';
import { Wallet } from 'lucide-react';

const Fees = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 sm:p-12 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center max-w-sm w-full">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Wallet strokeWidth={2} size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Coming Soon</h2>
            <p className="text-slate-500 font-medium">The fees and finance module is currently under development. Please check back later.</p>
        </div>
      </div>
    </div>
  );
};

export default Fees;
