import React, { useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';

const Dashboard = () => {
    const { stats, loadingStats, refreshStats } = useAdmin();
    const schoolName = localStorage.getItem('scoolg_school_name') || 'St. Andrews International';

    useEffect(() => {
        refreshStats(true);
    }, []);

    const Shimmer = ({ className }) => (
        <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
    );

    return (
        <div className="animate-fade">
            {/* TopNavBar Shell */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-slate-800 tracking-tight">Dashboard</h2>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <div className="relative group flex-1 md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 transition-all text-xs font-semibold"
                            placeholder="Quick search..."
                            type="text"
                        />
                    </div>
                    <button className="h-10 w-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-600">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                </div>
            </header>

            <div className="p-4 sm:p-8 space-y-8 max-w-full">
                {/* Welcome Section */}
                <section className="flex flex-col gap-2">
                    <h3 className="text-[20px] sm:text-[28px] font-[800] text-slate-800 tracking-tight">
                        Welcome back, {schoolName}!
                    </h3>
                    <p className="text-slate-500 font-medium text-xs sm:text-sm">
                        Snapshot of today's academic metrics.
                    </p>
                </section>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-white p-4 sm:p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-blue-500">
                        <div>
                            <p className="text-slate-400 text-[11px] uppercase font-bold tracking-widest mb-1">Total Students</p>
                            {loadingStats && !stats ? (
                                <Shimmer className="h-8 w-20 mt-1" />
                            ) : (
                                <h4 className="text-2xl font-extrabold text-slate-800">{stats?.students?.toLocaleString() || 0}</h4>
                            )}
                            <div className="flex items-center gap-1 mt-2 text-blue-600 font-bold text-xs">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                <span>Real-time</span>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <span className="material-symbols-outlined text-3xl">group</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-indigo-500">
                        <div>
                            <p className="text-slate-400 text-[11px] uppercase font-bold tracking-widest mb-1">Teachers</p>
                            <h4 className="text-2xl font-extrabold text-slate-800">48</h4>
                            <p className="text-[11px] font-bold text-slate-500 mt-2">Active Faculty</p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                            <span className="material-symbols-outlined text-3xl">school</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-amber-500">
                        {(() => {
                            const sid = localStorage.getItem('scoolg_school_id') || "";
                            const suffix = sid.slice(-4);
                            const code = (schoolName.substring(0,3) + suffix).toLowerCase();
                            return (
                                <div>
                                    <p className="text-slate-400 text-[11px] uppercase font-bold tracking-widest mb-1">School Code</p>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-2xl font-extrabold text-slate-800 uppercase">{code}</h4>
                                        <button onClick={() => navigator.clipboard.writeText(code)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><span className="material-symbols-outlined text-[18px]">content_copy</span></button>
                                    </div>
                                    <p className="text-[11px] font-bold text-amber-600 mt-2">Portal Access</p>
                                </div>
                            );
                        })()}
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                            <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-emerald-500">
                        <div>
                            <p className="text-slate-400 text-[11px] uppercase font-bold tracking-widest mb-1">Classes</p>
                            <h4 className="text-2xl font-extrabold text-slate-800">14</h4>
                            <p className="text-[11px] font-bold text-slate-500 mt-2">Active Units</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <span className="material-symbols-outlined text-3xl">class</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 sm:p-8 rounded-xl premium-shadow">
                    <h5 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">bolt</span>
                        Quick Actions
                    </h5>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="primary-gradient text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                            <span className="material-symbols-outlined">person_add</span>
                            Add Student
                        </button>
                        <button className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-slate-200 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-blue-600">person_add_alt</span>
                            Add Teacher
                        </button>
                        <button className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-slate-200 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-blue-600">campaign</span>
                            Send Notice
                        </button>
                        <button className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-slate-200 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-blue-600">event_note</span>
                            Timetable
                        </button>
                    </div>
                </div>

                {/* Bottom Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-xl premium-shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h5 className="font-bold text-slate-800">Recent Admissions</h5>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><span className="material-symbols-outlined">person</span></div>
                                        <div>
                                            <p className="font-bold text-slate-800">Neeraj Bhatt</p>
                                            <p className="text-xs text-slate-500">Class 10 - A</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl premium-shadow flex flex-col gap-4">
                        <h5 className="font-bold text-slate-800">Announcements</h5>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-600 uppercase mb-1">System</p>
                            <p className="text-sm font-medium text-slate-700">All student counts are now syncing in real-time from the backend.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
