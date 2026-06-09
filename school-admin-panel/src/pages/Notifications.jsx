import React from 'react';
import ProfileButton from '../components/ProfileButton';
import MenuButton from '../components/MenuButton';

const Notifications = () => {
    return (
        <>
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <MenuButton />
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-on-surface tracking-tight">Notifications</h2>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <ProfileButton size={40} />
                </div>
            </header>

            <div className="min-h-[calc(100vh-72px)] bg-slate-50/50 p-4 sm:p-8">
                <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.04)] py-20 px-6 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-500 grid place-items-center mb-5">
                        <span className="material-symbols-outlined text-5xl">notifications</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800">No notifications yet</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1.5 max-w-sm">
                        School alerts, scheduled events and updates will show up here. Real-time push notifications are coming soon.
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                        <span className="material-symbols-outlined text-[15px]">bolt</span> Powered by notifications · coming soon
                    </span>
                </div>
            </div>
        </>
    );
};

export default Notifications;
