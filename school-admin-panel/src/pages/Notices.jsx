import React, { useState } from 'react';

const Notices = () => {
    const [activeTab, setActiveTab] = useState('All Notices');
    const tabs = ['All Notices', 'Sent', 'Scheduled', 'Drafts'];

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col relative pb-20">
            {/* TopNavBar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex flex-col w-full md:w-auto">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Academic Curator</p>
                    <h2 className="text-[1.3rem] md:text-[1.6rem] font-[900] text-[#1e293b] tracking-tight leading-tight">Scoolg Admin</h2>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <div className="relative group hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            className="w-48 xl:w-72 h-10 pl-10 pr-4 rounded-full border-none bg-slate-100 focus:ring-2 focus:ring-[#2563eb]/40 focus:bg-white transition-all text-xs font-semibold placeholder-slate-400"
                            placeholder="Search notices, audience or date..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="h-10 w-10 flex items-center justify-center bg-transparent hover:bg-slate-100 transition-colors rounded-full text-slate-600">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-[11px] font-bold text-slate-800">Admin Principal</p>
                                <p className="text-[9px] font-semibold text-slate-500">St. Xaviers High</p>
                            </div>
                            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer bg-slate-100">
                                <img
                                    alt="Admin Avatar"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHgLzAW4q9gKYtvpNlK9SDBOmEmZz_cbEGEcME0yuZXD71yssyHMP13nfuOD4qP1vztDL0ZoCvw1CmCEgHBiWXvvviZ-7FGhK6plEy587L9lEQKffCVIqQA4SWKS0-hxXVpCcVvnnCfwC0nbrOoSz6GsCX7ZbdvRQM4dY9W2eE8uFyaO0Hwx89fnLwF0ynHHsxREW2jn5OWmvBy-hTc3OsUn9M47f0ADOiTkqrl-pw5XT_-8QgssdjtypuBEOaxitVXKoX5_Jp5489"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Canvas */}
            <div className="p-4 sm:p-8 max-w-[1000px] mx-auto space-y-6 w-full">

                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Notices & Announcements</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">Broadcast critical information to students, staff, and parents.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#2563eb] text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 shrink-0">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Create Notice
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 sm:pb-0">
                    {tabs.map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                                activeTab === tab 
                                ? 'bg-blue-50 text-[#2563eb] border border-blue-100' 
                                : 'bg-transparent text-slate-500 hover:bg-slate-100 border border-transparent'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Notice Cards */}
                <div className="space-y-4">
                    {/* Notice 1 */}
                    <div className="bg-white rounded-3xl p-6 premium-shadow hover:shadow-md transition-shadow relative group">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[24px]">warning</span>
                            </div>
                            <div className="flex-1 w-full flex flex-col">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight">Annual Sports Meet Rescheduled</h3>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                            <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest leading-none">URGENT</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 sm:text-right shrink-0">Oct 24, 2023 • 09:15 AM</p>
                                </div>
                                <p className="text-sm font-medium text-slate-500 mb-4 leading-relaxed">
                                    Due to unforeseen weather conditions, the Annual Sports Meet scheduled for tomorrow has been moved to next Friday, Nov 1st. All participants are requested to check the revised schedule...
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-auto">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600">
                                        <span className="material-symbols-outlined text-[16px]">groups</span>
                                        <span className="text-xs font-bold">All Classes</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600">
                                        <span className="material-symbols-outlined text-[16px]">assignment</span>
                                        <span className="text-xs font-bold">By : Admin Office</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notice 2 */}
                    <div className="bg-white rounded-3xl p-6 premium-shadow hover:shadow-md transition-shadow relative group">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[24px]">info</span>
                            </div>
                            <div className="flex-1 w-full flex flex-col">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight">Updated Library Policy 2023-24</h3>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest leading-none">IMPORTANT</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 sm:text-right shrink-0">Oct 22, 2023 • 02:45 PM</p>
                                </div>
                                <p className="text-sm font-medium text-slate-500 mb-4 leading-relaxed">
                                    The new library guidelines regarding book issuing limits and late fee structure have been updated. Students from Middle and Senior School are advised to review the digital copy available...
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-auto">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600">
                                        <span className="material-symbols-outlined text-[16px]">groups</span>
                                        <span className="text-xs font-bold">Class 6 - Class 12</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600">
                                        <span className="material-symbols-outlined text-[16px]">attach_file</span>
                                        <span className="text-xs font-bold">Policy_Final.pdf</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notice 3 */}
                    <div className="bg-white rounded-3xl p-6 premium-shadow hover:shadow-md transition-shadow relative group">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[24px]">campaign</span>
                            </div>
                            <div className="flex-1 w-full flex flex-col">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight">Science Club: Registration Open</h3>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">NORMAL</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 sm:text-right shrink-0">Oct 20, 2023 • 11:00 AM</p>
                                </div>
                                <p className="text-sm font-medium text-slate-500 mb-4 leading-relaxed">
                                    Interested in Robotics and Chemistry? The Science Club is now accepting new members for the winter semester. Sign-up sheets are available at the physics laboratory office...
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-auto">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600">
                                        <span className="material-symbols-outlined text-[16px]">groups</span>
                                        <span className="text-xs font-bold">All Students</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600">
                                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                                        <span className="text-xs font-bold">Due: Oct 31</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notice 4 */}
                    <div className="bg-white rounded-3xl p-6 premium-shadow hover:shadow-md transition-shadow relative group">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[24px]">school</span>
                            </div>
                            <div className="flex-1 w-full flex flex-col">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight">Parent-Teacher Meeting: Grade 5</h3>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">NORMAL</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 sm:text-right shrink-0">Oct 18, 2023 • 08:30 AM</p>
                                </div>
                                <p className="text-sm font-medium text-slate-500 mb-4 leading-relaxed">
                                    The mid-term review for Grade 5 will be held this Saturday. Teachers will be available in their respective classrooms to discuss academic progress and extracurricular involvement...
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-auto">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600">
                                        <span className="material-symbols-outlined text-[16px]">groups</span>
                                        <span className="text-xs font-bold">Parents (Grade 5)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Archive Box */}
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center mt-10 bg-slate-50/50">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[24px]">archive</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-800 mb-1">Notice Archive</h4>
                    <p className="text-xs font-medium text-slate-500 max-w-sm mb-4">Looking for older announcements? Access the complete history of sent notices here.</p>
                    <button className="text-sm font-bold text-[#2563eb] hover:underline">View Archived Notices</button>
                </div>

            </div>

             {/* Floating FAB */}
             <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-lg hover:shadow-blue-500/40 hover:scale-105 transition-all z-50">
                <span className="material-symbols-outlined text-[28px]">add</span>
            </button>

        </div>
    );
};

export default Notices;
