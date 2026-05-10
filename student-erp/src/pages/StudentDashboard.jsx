import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LogOut,
    CalendarDays,
    ClipboardList,
    Bell,
    LayoutDashboard,
    ChevronRight,
    User,
    GraduationCap,
    Clock,
    BookOpen,
    Zap,
    MapPin,
    Phone,
    Shield
} from 'lucide-react';
import StudentTimetable from './StudentTimetable';
import StudentAttendance from './StudentAttendance';
import { STUDENT_API_BASE } from '../lib/api';

const StudentDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('home');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('studentToken');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const res = await axios.get(`${STUDENT_API_BASE}/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (err) {
                localStorage.removeItem('studentToken');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('studentToken');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
                <div className="relative">
                    <div className="w-12 h-12 border-[3px] border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping"></div>
                    </div>
                </div>
                <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Scoolg Intelligence</p>
            </div>
        );
    }

    if (!data) return null;
    const { student, school } = data;

    const renderProfile = () => (
        <div className="flex flex-col h-full bg-[#FDFDFF] animate-fade-in overflow-y-auto pb-32">
            <header className="p-8 pb-10 bg-white relative">
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-8">Personal ID</h2>
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-[40px] bg-white p-1.5 shadow-xl shadow-blue-100/50 border border-slate-100 mb-6 overflow-hidden">
                        {student.profileImageUrl ? (
                            <img src={student.profileImageUrl} alt="Profile" className="w-full h-full rounded-[34px] object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-50 rounded-[34px] flex items-center justify-center text-slate-300">
                                <User size={48} strokeWidth={1} />
                            </div>
                        )}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">{student.firstName} {student.lastName}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Student of Class {student.class}-{student.section}</p>
                </div>
            </header>

            <div className="px-6 space-y-4">
                <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Parents</p>
                                <p className="text-sm font-black text-slate-900">{student.fatherName} & {student.motherName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact</p>
                                <p className="text-sm font-black text-slate-900">{student.primaryContact}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Address</p>
                                <p className="text-xs font-black text-slate-900 leading-relaxed">{student.currentAddress}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                                <Shield size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aadhaar Verification</p>
                                <p className="text-sm font-black text-slate-900">{student.aadhaarNumber || 'Not Linked'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={handleLogout} className="w-full bg-rose-50 text-rose-600 rounded-[24px] p-5 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-rose-100 active:scale-95 transition-transform">
                    <LogOut size={16} /> Sign Out Session
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#FDFDFF] relative z-10 w-full overflow-hidden">
            {/* Conditional Content Rendering */}
            {activeTab === 'home' && (
                <div className="flex-1 overflow-y-auto pb-32 custom-scrollbar">
                    {/* Header Profile Section */}
                    <header className="p-6 pt-8 pb-10 bg-white relative">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <Zap size={16} className="text-blue-600 fill-blue-600" />
                                </div>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Student Portal</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                <Bell size={18} />
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[22px] blur-sm opacity-20"></div>
                                <div className="w-20 h-20 rounded-[20px] bg-white p-1 shadow-sm relative overflow-hidden border border-slate-100">
                                    {student.profileImageUrl ? (
                                        <img src={student.profileImageUrl} alt="Profile" className="w-full h-full rounded-[16px] object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50 rounded-[16px] flex items-center justify-center text-slate-300">
                                            <User size={32} strokeWidth={1.5} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Class {student.class}-{student.section}</p>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                    {student.firstName}
                                </h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {student.studentAppId}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="px-6 space-y-8 animate-fade-in">
                        <section className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => setActiveTab('attendance')}
                                className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                                    <CalendarDays size={48} className="text-emerald-600" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                    <CalendarDays size={20} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">92%</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Attendance</p>
                            </div>
                            <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                                    <GraduationCap size={48} className="text-blue-600" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                    <GraduationCap size={20} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">A2</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Academics</p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Live Timetable</h3>
                                <button onClick={() => setActiveTab('timetable')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                                    Full View <ChevronRight size={12} />
                                </button>
                            </div>

                            <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[8px] font-black uppercase opacity-60 leading-none mb-1">Period</span>
                                        <span className="text-lg font-black leading-none">03</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-slate-900 uppercase tracking-tight">Mathematics</h4>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                                <Clock size={12} /> 10:45 AM
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                                <User size={12} /> Mr. Sharma
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 w-1/2 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] px-1">My Schooling</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <button className="w-full bg-white rounded-[24px] p-5 flex items-center gap-4 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <BookOpen size={22} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Homework</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">3 Pending assignments</p>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-400" />
                                </button>
                                <button className="w-full bg-white rounded-[24px] p-5 flex items-center gap-4 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                        <ClipboardList size={22} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Report Cards</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Final term results are out</p>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-400" />
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {activeTab === 'timetable' && <StudentTimetable onBack={() => setActiveTab('home')} />}
            {activeTab === 'attendance' && <StudentAttendance onBack={() => setActiveTab('home')} />}
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'alerts' && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-40 animate-fade-in">
                    <Bell size={64} strokeWidth={1} />
                    <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em]">No new alerts</p>
                </div>
            )}

            {/* Premium Bottom Navigation */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md h-20 bg-slate-950/95 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl flex items-center justify-around px-4 z-50 transition-transform duration-500">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${activeTab === 'home' || activeTab === 'attendance' ? 'text-blue-400 scale-110' : 'text-slate-500'}`}
                >
                    <LayoutDashboard size={activeTab === 'home' ? 24 : 22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${(activeTab === 'home' || activeTab === 'attendance') ? 'opacity-100' : 'opacity-0 h-0'}`}>Home</span>
                </button>

                <button
                    onClick={() => setActiveTab('timetable')}
                    className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${activeTab === 'timetable' ? 'text-blue-400 scale-110' : 'text-slate-500'}`}
                >
                    <Clock size={activeTab === 'timetable' ? 24 : 22} strokeWidth={activeTab === 'timetable' ? 2.5 : 2} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === 'timetable' ? 'opacity-100' : 'opacity-0 h-0'}`}>Timetable</span>
                </button>

                <button
                    onClick={() => setActiveTab('alerts')}
                    className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${activeTab === 'alerts' ? 'text-blue-400 scale-110' : 'text-slate-500'}`}
                >
                    <div className="relative">
                        <Bell size={activeTab === 'alerts' ? 24 : 22} strokeWidth={activeTab === 'alerts' ? 2.5 : 2} />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === 'alerts' ? 'opacity-100' : 'opacity-0 h-0'}`}>Alerts</span>
                </button>

                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${activeTab === 'profile' ? 'text-blue-400 scale-110' : 'text-slate-500'}`}
                >
                    <User size={activeTab === 'profile' ? 24 : 22} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === 'profile' ? 'opacity-100' : 'opacity-0 h-0'}`}>Profile</span>
                </button>
            </nav>
        </div>
    );
};

export default StudentDashboard;
