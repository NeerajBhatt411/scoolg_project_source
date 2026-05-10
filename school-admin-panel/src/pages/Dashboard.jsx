import React, { useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';

const Dashboard = () => {
    const { stats, loadingStats, refreshStats } = useAdmin();
    const schoolName = localStorage.getItem('scoolg_school_name') || 'St. Andrews International';

    useEffect(() => {
        // Refresh silently in background when landing on dashboard
        refreshStats(true);
    }, []);

    const Shimmer = ({ className }) => (
        <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
    );


    return (
        <>
            {/* TopNavBar Shell */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-on-surface tracking-tight">Dashboard</h2>
                    <div className="flex md:hidden items-center gap-3">
                        <button className="h-9 w-9 flex items-center justify-center bg-slate-100 rounded-full">
                            <span className="material-symbols-outlined text-[20px] text-[#434655]">notifications</span>
                        </button>
                        <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <img
                                alt="User Avatar"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHgLzAW4q9gKYtvpNlK9SDBOmEmZz_cbEGEcME0yuZXD71yssyHMP13nfuOD4qP1vztDL0ZoCvw1CmCEgHBiWXvvviZ-7FGhK6plEy587L9lEQKffCVIqQA4SWKS0-hxXVpCcVvnnCfwC0nbrOoSz6GsCX7ZbdvRQM4dY9W2eE8uFyaO0Hwx89fnLwF0ynHHsxREW2jn5OWmvBy-hTc3OsUn9M47f0ADOiTkqrl-pw5XT_-8QgssdjtypuBEOaxitVXKoX5_Jp5489"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                        <input
                            className="w-full h-10 pl-10 pr-4 rounded-xl border-none bg-surface-container-high focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all text-xs font-semibold"
                            placeholder="Quick search..."
                            type="text"
                        />
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <button className="hover:bg-[#e6e8ea] rounded-full p-2 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-[#434655]">notifications</span>
                        </button>
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer">
                            <img
                                alt="User Avatar"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHgLzAW4q9gKYtvpNlK9SDBOmEmZz_cbEGEcME0yuZXD71yssyHMP13nfuOD4qP1vztDL0ZoCvw1CmCEgHBiWXvvviZ-7FGhK6plEy587L9lEQKffCVIqQA4SWKS0-hxXVpCcVvnnCfwC0nbrOoSz6GsCX7ZbdvRQM4dY9W2eE8uFyaO0Hwx89fnLwF0ynHHsxREW2jn5OWmvBy-hTc3OsUn9M47f0ADOiTkqrl-pw5XT_-8QgssdjtypuBEOaxitVXKoX5_Jp5489"
                            />
                        </div>
                    </div>
                </div>
            </header>


            <div className="p-4 sm:p-8 space-y-8 max-w-full">
                {/* Welcome Section */}
                <section className="max-w-full overflow-hidden flex flex-col gap-2">
                    <h3 className="text-[20px] sm:text-[28px] font-[800] text-on-surface tracking-tight leading-tight truncate sm:whitespace-normal" title={schoolName}>
                        Welcome back, {schoolName}!
                    </h3>
                    <p className="text-on-surface-variant font-medium text-xs sm:text-sm">
                        Snapshot of today's academic metrics.
                    </p>
                </section>



                {/* Stat Cards Bento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-primary">

                        <div>
                            <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                                Total Students
                            </p>
                            {loadingStats && !stats ? (
                                <div className="h-8 w-20 bg-slate-200 animate-pulse rounded-lg mt-1"></div>
                            ) : (
                                <h4 className="text-2xl font-extrabold text-on-surface">{stats?.students?.toLocaleString() || 0}</h4>
                            )}
                            <div className="flex items-center gap-1 mt-2 text-primary font-bold text-xs">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                <span>Real-time data</span>
                            </div>
                        </div>
                        <div className="p-3 bg-primary-container/10 rounded-xl text-primary">
                            <span className="material-symbols-outlined text-3xl">group</span>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-secondary">

                        <div>
                            <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                                Teachers
                            </p>
                            <h4 className="text-2xl font-extrabold text-on-surface">{stats?.teachers || 0}</h4>
                            <div className="flex items-center gap-1 mt-2 text-on-surface-variant font-medium text-xs">
                                <span>Active across faculty</span>
                            </div>
                        </div>
                        <div className="p-3 bg-secondary-container/10 rounded-xl text-secondary">
                            <span className="material-symbols-outlined text-3xl">school</span>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-tertiary">
                        {/* Calculate unique code: first 3 of name + last 4 of ID */}
                        {(() => {
                            const sid = localStorage.getItem('scoolg_school_id') || "";
                            const suffix = sid.slice(-4);
                            const code = (schoolName.substring(0, 3) + suffix).toUpperCase();
                            return (
                                <div>
                                    <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                                        School Code
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-2xl font-extrabold text-on-surface uppercase">{code}</h4>
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(code); alert('Copied!') }}
                                            title="Copy Code"
                                            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1 mt-2 text-tertiary font-bold text-xs">
                                        <span className="material-symbols-outlined text-sm">vpn_key</span>
                                        <span>Used for student app</span>
                                    </div>
                                </div>
                            );
                        })()}
                        <div className="p-3 bg-tertiary-container/10 rounded-xl text-tertiary">
                            <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-outline">

                        <div>
                            <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                                Classes
                            </p>
                            <h4 className="text-2xl font-extrabold text-on-surface">{stats?.classes || 0}</h4>
                            <div className="flex items-center gap-1 mt-2 text-on-surface-variant font-medium text-xs">
                                <span>Academic Wings</span>
                            </div>
                        </div>
                        <div className="p-3 bg-surface-container-high rounded-xl text-outline">
                            <span className="material-symbols-outlined text-3xl">class</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="bg-surface-container-lowest p-5 sm:p-8 rounded-xl premium-shadow border border-slate-100">
                    <h5 className="text-lg sm:text-2xl text-on-surface font-bold mb-5 sm:mb-6 flex items-center gap-2">
                        Quick Administrative Actions
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button onClick={() => window.location.href = '/admin/students/add'} className="bg-[#eff6ff] border border-blue-200 border-b-4 text-blue-900 font-bold py-5 px-5 rounded-2xl flex items-center gap-4 transition-all hover:shadow-lg hover:border-blue-300 active:border-b-0 active:translate-y-1 group">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                                <span className="material-symbols-outlined text-[24px]">person_add</span>
                            </div>
                            <span className="text-sm font-extrabold tracking-tight">Add Student</span>
                        </button>
                        <button onClick={() => window.location.href = '/admin/teachers/add'} className="bg-[#f5f3ff] border border-indigo-200 border-b-4 text-indigo-900 font-bold py-5 px-5 rounded-2xl flex items-center gap-4 transition-all hover:shadow-lg hover:border-indigo-300 active:border-b-0 active:translate-y-1 group">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                                <span className="material-symbols-outlined text-[24px]">person_add_alt</span>
                            </div>
                            <span className="text-sm font-extrabold tracking-tight">Add Teacher</span>
                        </button>
                        <button onClick={() => window.location.href = '/admin/notices'} className="bg-[#fff7ed] border border-orange-200 border-b-4 text-orange-900 font-bold py-5 px-5 rounded-2xl flex items-center gap-4 transition-all hover:shadow-lg hover:border-orange-300 active:border-b-0 active:translate-y-1 group">
                            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                                <span className="material-symbols-outlined text-[24px]">send</span>
                            </div>
                            <span className="text-sm font-extrabold tracking-tight">Send Notice</span>
                        </button>
                        <button onClick={() => window.location.href = '/admin/timetable'} className="bg-[#ecfdf5] border border-emerald-200 border-b-4 text-emerald-900 font-bold py-5 px-5 rounded-2xl flex items-center gap-4 transition-all hover:shadow-lg hover:border-emerald-300 active:border-b-0 active:translate-y-1 group">
                            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                                <span className="material-symbols-outlined text-[24px]">event_note</span>
                            </div>
                            <span className="text-sm font-extrabold tracking-tight">Timetable</span>
                        </button>
                    </div>


                </div>

                {/* Middle Row: Charts & Notices */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Attendance Chart */}
                    <div className="bg-surface-container-lowest p-5 sm:p-8 rounded-xl premium-shadow">
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                            <h5 className="text-title-md text-on-surface font-bold">Class Attendance</h5>
                            <button className="text-primary font-bold text-sm hover:underline">View Analytics</button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-on-surface">Class 1</span>
                                    <span className="text-primary">96%</span>
                                </div>
                                <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: '96%' }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-on-surface">Class 2</span>
                                    <span className="text-primary">88%</span>
                                </div>
                                <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: '88%' }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-on-surface">Class 3</span>
                                    <span className="text-primary">92%</span>
                                </div>
                                <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: '92%' }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-on-surface">Class 4</span>
                                    <span className="text-primary">79%</span>
                                </div>
                                <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                                    <div className="h-full bg-error/80 rounded-full" style={{ width: '79%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Notices */}
                    <div className="bg-surface-container-lowest p-5 sm:p-8 rounded-xl premium-shadow">
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                            <h5 className="text-title-md text-on-surface font-bold">Recent Notices</h5>
                            <button className="bg-surface-container-low hover:bg-surface-container-high p-2 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-on-surface-variant text-xl">open_in_new</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">groups</span>
                                </div>
                                <div className="flex-1">
                                    <h6 className="font-bold text-on-surface text-[0.875rem]">PTM on 15 Apr</h6>
                                    <p className="text-on-surface-variant text-xs mt-0.5">Parent Teacher Meeting for Grade 5-10</p>
                                </div>
                                <span className="text-xs font-bold text-on-surface-variant">2h ago</span>
                            </div>
                            <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                                    <span className="material-symbols-outlined">celebration</span>
                                </div>
                                <div className="flex-1">
                                    <h6 className="font-bold text-on-surface text-[0.875rem]">Holiday: Holi</h6>
                                    <p className="text-on-surface-variant text-xs mt-0.5">School will remain closed on 25th March</p>
                                </div>
                                <span className="text-xs font-bold text-on-surface-variant">1d ago</span>
                            </div>
                            <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-secondary-container/10 flex items-center justify-center text-secondary">
                                    <span className="material-symbols-outlined">sports_basketball</span>
                                </div>
                                <div className="flex-1">
                                    <h6 className="font-bold text-on-surface text-[0.875rem]">Sports Day</h6>
                                    <p className="text-on-surface-variant text-xs mt-0.5">Annual sports meet registration is open</p>
                                </div>
                                <span className="text-xs font-bold text-on-surface-variant">3d ago</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Dashboard;
