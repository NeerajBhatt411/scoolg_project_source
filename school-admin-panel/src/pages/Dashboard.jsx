import React, { useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
  Users, 
  GraduationCap, 
  QrCode, 
  BookOpen, 
  Search, 
  Bell, 
  Zap, 
  Plus, 
  Send, 
  Calendar,
  TrendingUp,
  Key,
  Copy,
  ArrowRight,
  ClipboardList,
  Megaphone
} from 'lucide-react';

const Dashboard = () => {
    const { stats, loadingStats, refreshStats } = useAdmin();
    const schoolName = localStorage.getItem('scoolg_school_name') || 'St. Andrews International';

    useEffect(() => {
        refreshStats(true);
    }, []);

    const Shimmer = ({ className }) => (
        <div className={`animate-pulse bg-slate-100 rounded ${className}`}></div>
    );

    return (
        <div className="animate-fade-in">
            {/* Header Area */}
            <header className="h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-4 md:px-10">
                <div className="flex flex-col">
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Dashboard</h2>
                    <p className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Academic Overview</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group hidden sm:block">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            className="h-10 w-64 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs font-semibold outline-none"
                            placeholder="Quick search..."
                            type="text"
                        />
                    </div>
                    <button className="h-10 w-10 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-white hover:text-indigo-600 transition-all shadow-sm">
                        <Bell size={18} />
                    </button>
                    <div className="h-10 w-10 rounded-xl overflow-hidden border-2 border-white shadow-md cursor-pointer">
                        <img
                            alt="Avatar"
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                        />
                    </div>
                </div>
            </header>

            <main className="p-4 md:p-10 space-y-10 max-w-7xl mx-auto">
                {/* Welcome Message */}
                <section className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        Elevating Education, <span className="text-indigo-600">{schoolName}</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base">
                        Here's your school's current standing for today.
                    </p>
                </section>

                {/* Primary Stats Bento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat Card: Students */}
                    <div className="bento-card p-6 border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                                <Users size={24} />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">
                                <TrendingUp size={10} />
                                <span>+2%</span>
                            </div>
                        </div>
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Total Students</p>
                        {loadingStats && !stats ? (
                            <Shimmer className="h-8 w-24 mb-2" />
                        ) : (
                            <h4 className="text-3xl font-black text-slate-800 tracking-tight">{stats?.students || 0}</h4>
                        )}
                        <p className="text-[11px] font-bold text-slate-500 mt-2">Active enrollments</p>
                    </div>

                    {/* Stat Card: Teachers */}
                    <div className="bento-card p-6 border-l-4 border-rose-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                                <GraduationCap size={24} />
                            </div>
                        </div>
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Elite Faculty</p>
                        <h4 className="text-3xl font-black text-slate-800 tracking-tight">48</h4>
                        <p className="text-[11px] font-bold text-slate-500 mt-2">Specialists & Mentors</p>
                    </div>

                    {/* Stat Card: School Code */}
                    <div className="bento-card p-6 border-l-4 border-amber-500">
                        {(() => {
                            const sid = localStorage.getItem('scoolg_school_id') || "";
                            const suffix = sid.slice(-4);
                            const code = (schoolName.substring(0,3) + suffix).toLowerCase();
                            return (
                                <>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                                            <QrCode size={24} />
                                        </div>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(code)}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all active:scale-90"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                    <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Campus Code</p>
                                    <h4 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{code}</h4>
                                    <div className="flex items-center gap-1.5 mt-2 text-amber-600 font-bold text-[10px]">
                                        <Key size={10} />
                                        <span>Portal Access Key</span>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Stat Card: Classes */}
                    <div className="bento-card p-6 border-l-4 border-emerald-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                                <BookOpen size={24} />
                            </div>
                        </div>
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Classrooms</p>
                        <h4 className="text-3xl font-black text-slate-800 tracking-tight">14</h4>
                        <p className="text-[11px] font-bold text-slate-500 mt-2">Active learning hubs</p>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <section className="bento-card p-6 md:p-8 bg-slate-900 text-white border-none shadow-2xl shadow-indigo-200">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                            <Zap size={20} className="fill-white" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight">Command Center</h3>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="group flex items-center justify-center gap-3 p-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl transition-all font-bold text-sm border border-white/10 hover:border-white shadow-lg active:scale-95">
                            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                            Admission
                        </button>
                        <button className="group flex items-center justify-center gap-3 p-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl transition-all font-bold text-sm border border-white/10 hover:border-white shadow-lg active:scale-95">
                            <Plus size={18} />
                            Add Teacher
                        </button>
                        <button className="group flex items-center justify-center gap-3 p-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl transition-all font-bold text-sm border border-white/10 hover:border-white shadow-lg active:scale-95">
                            <Send size={18} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                            Broadcasting
                        </button>
                        <button className="group flex items-center justify-center gap-3 p-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl transition-all font-bold text-sm border border-white/10 hover:border-white shadow-lg active:scale-95">
                            <Calendar size={18} />
                            Timetable
                        </button>
                    </div>
                </section>

                {/* Bottom Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 bento-card flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <ClipboardList size={18} className="text-indigo-500" />
                                Operation Log
                            </h3>
                            <button className="text-indigo-600 text-[11px] font-bold uppercase tracking-wider hover:underline">Full Log</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50">
                                    <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em]">
                                        <th className="px-6 py-4 text-left">Action Item</th>
                                        <th className="px-6 py-4 text-left">Admin</th>
                                        <th className="px-6 py-4 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-slate-800">New Admission</p>
                                            <p className="text-[11px] text-slate-500">Rahul Kumar added manually</p>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-semibold text-slate-600">Admin Sarah</td>
                                        <td className="px-6 py-5">
                                            <span className="status-pill status-pill-success">Processed</span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-slate-800">Notice Published</p>
                                            <p className="text-[11px] text-slate-500">Parent Teacher Meeting</p>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-semibold text-slate-600">System Bot</td>
                                        <td className="px-6 py-5">
                                            <span className="status-pill status-pill-success">Broadcasted</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Announcement Preview */}
                    <div className="bento-card bg-indigo-50/30 border-indigo-100 flex flex-col p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-slate-800">Alerts</h3>
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                                <Megaphone size={14} />
                            </div>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-100/50">
                                <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1">Faculty Update</p>
                                <p className="text-sm font-bold text-slate-800 leading-snug">New teacher onboarding for Physics completed.</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-100/50">
                                <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1">System</p>
                                <p className="text-sm font-bold text-slate-800 leading-snug">Monthly database optimization successful.</p>
                            </div>
                        </div>
                        <button className="mt-8 w-full py-3 bg-white border border-indigo-200 text-indigo-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-sm group">
                            Global Newsroom
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
