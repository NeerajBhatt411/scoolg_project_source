import React from 'react';
import { motion } from 'framer-motion';

const Fees = () => {
  return (
    <div className="min-h-full">
      {/* MOBILE VIEW - FROM raw_design/fees_screen */}
      <div className="lg:hidden px-container-margin pt-6 pb-32 space-y-stack-gap">
        <header>
          <h2 className="text-display-lg font-display-lg text-on-surface">Fees & Dues</h2>
          <p className="text-body-md text-on-surface-variant">Academic Session 2023-24</p>
        </header>

        {/* Highlight Card */}
        <div className="bg-primary-container text-on-primary-container p-card-internal-padding rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-label-md font-bold uppercase tracking-widest opacity-80 mb-2">Total Outstanding</p>
            <h3 className="text-[42px] font-bold leading-tight mb-6">$1,240.00</h3>
            <button className="w-full h-12 bg-white text-primary rounded-xl font-bold active:scale-95 transition-transform">
              PAY BALANCE
            </button>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10 rotate-12">account_balance_wallet</span>
        </div>

        {/* List */}
        <div className="space-y-4">
          <MobileFeeRow title="Tuition Fee - Quarter 3" date="Due by Oct 30" amount="$850.00" pending />
          <MobileFeeRow title="Library Fine" date="Paid on Oct 12" amount="$15.00" />
          <MobileFeeRow title="Sports Kit" date="Paid on Sep 28" amount="$120.00" />
        </div>
      </div>

      {/* DESKTOP VIEW - FROM raw_design/desktop_fees */}
      <div className="hidden lg:block p-8 space-y-stack-gap max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-display-lg font-headline-md text-on-surface">Fees & Finance</h2>
            <p className="text-body-lg text-on-surface-variant">Manage your academic financial commitments</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-surface-container-high rounded-xl font-bold hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined">print</span>
            Print All Receipts
          </button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-5 bg-white p-12 rounded-[32px] shadow-soft border border-surface-container flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary-container/10 flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-primary text-[40px]">account_balance_wallet</span>
            </div>
            <h3 className="text-display-lg font-bold text-on-surface mb-2">Outstanding Dues</h3>
            <p className="text-error text-[32px] font-bold mb-8">$1,240.00</p>
            <button className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-[18px] shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]">
              PROCEED TO PAYMENT
            </button>
            <p className="mt-6 text-label-md text-secondary">Last payment made on Oct 12, 2023</p>
          </div>

          <div className="col-span-7 space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-title-lg font-bold text-on-surface">Transaction History</h3>
              <div className="flex gap-2 p-1 bg-surface-container rounded-xl border border-surface-container-high">
                <button className="px-6 py-2 rounded-lg bg-white shadow-sm text-label-md font-bold text-primary">Recent</button>
                <button className="px-6 py-2 rounded-lg text-label-md font-bold text-secondary hover:bg-white/50 transition-colors">Archived</button>
              </div>
            </div>
            <div className="space-y-4">
              <DesktopFeeRow title="Tuition Fee - Quarter 3" date="October 2023" amount="$850.00" status="Pending" icon="school" />
              <DesktopFeeRow title="Exam Registration Fees" date="September 2023" amount="$250.00" status="Paid" icon="description" />
              <DesktopFeeRow title="Annual Transport Charges" date="August 2023" amount="$1,200.00" status="Paid" icon="bus_alert" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileFeeRow = ({ title, date, amount, pending }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-surface-container flex justify-between items-center">
    <div className="flex gap-4 items-center">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pending ? 'bg-error/10 text-error' : 'bg-green-100 text-green-700'}`}>
        <span className="material-symbols-outlined text-[20px]">{pending ? 'pending' : 'check_circle'}</span>
      </div>
      <div>
        <p className="font-bold text-on-surface">{title}</p>
        <p className="text-label-md text-secondary">{date}</p>
      </div>
    </div>
    <p className={`font-bold ${pending ? 'text-error' : 'text-on-surface'}`}>{amount}</p>
  </div>
);

const DesktopFeeRow = ({ title, date, amount, status, icon }) => (
  <div className="bg-white p-6 rounded-3xl border border-surface-container flex justify-between items-center hover:border-primary/20 transition-all cursor-pointer group">
    <div className="flex items-center gap-6">
      <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
        <span className="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">{icon}</span>
      </div>
      <div>
        <p className="font-bold text-title-lg text-on-surface">{title}</p>
        <p className="text-label-md font-medium text-secondary">{date}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={`font-bold text-title-lg ${status === 'Paid' ? 'text-green-600' : 'text-error'}`}>{amount}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-outline">{status}</p>
    </div>
  </div>
);

export default Fees;
