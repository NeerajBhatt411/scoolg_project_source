import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, CalendarCheck, FileText, Bell, CreditCard, ChevronRight, User } from 'lucide-react';

const StudentDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('studentToken');
            try {
                const res = await axios.get('https://scoolg-backend.netlify.app/api/student/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (err) {
                setError('Session expired');
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
        return <div className="flex-1 flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (error || !data) return null;

    const { student, school } = data;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-20 animate-fade-in relative z-10 w-full overflow-y-auto">
            {/* Header Area */}
            <div className="bg-indigo-600 rounded-b-[40px] p-6 pb-12 shadow-lg shadow-indigo-200 text-white w-full">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        {school.logo ? (
                            <img src={school.logo} alt="Logo" className="w-8 h-8 rounded-full bg-white p-1" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                                {school.name.charAt(0)}
                            </div>
                        )}
                        <span className="font-bold text-sm opacity-90 truncate max-w-[150px]">{school.name}</span>
                    </div>
                    <button onClick={handleLogout} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <LogOut size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-inner">
                        {student.profileImageUrl ? (
                            <img src={student.profileImageUrl} alt="Profile" className="w-full h-full rounded-xl object-cover" />
                        ) : (
                            <div className="w-full h-full bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-400">
                                <User size={24} />
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Hi, {student.firstName}!</h1>
                        <p className="text-indigo-200 font-medium text-sm">Class {student.class}-{student.section} &bull; ID: {student.studentAppId}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Bento */}
            <div className="grid grid-cols-2 gap-4 px-6 -mt-6">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                        <CalendarCheck size={18} />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-800">85%</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Attendance</p>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                        <FileText size={18} />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-800">A+</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Overall Grade</p>
                    </div>
                </div>
            </div>

            {/* Main Menu List */}
            <div className="px-6 mt-8 space-y-4 flex-1 pb-10">
                <h3 className="text-lg font-black text-slate-800 mb-2">My Information</h3>
                
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-b border-slate-50 pb-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Father's Name</p>
                            <p className="font-bold text-slate-800 text-sm">{student.fatherName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mother's Name</p>
                            <p className="font-bold text-slate-800 text-sm">{student.motherName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                            <p className="font-bold text-slate-800 text-sm">{student.primaryContact}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Admission</p>
                            <p className="font-bold text-slate-800 text-sm">{student.dateOfAdmission ? new Date(student.dateOfAdmission).toLocaleDateString('en-GB') : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Aadhaar Card</p>
                                <p className="font-bold text-slate-800 text-sm">{student.aadhaarNumber || 'Not Linked'}</p>
                            </div>
                        </div>
                        {student.aadhaarNumber && (
                             <span className="bg-green-100 text-green-700 p-1 rounded-full">
                                <ChevronRight size={16} />
                             </span>
                        )}
                    </div>
                </div>

                <h3 className="text-lg font-black text-slate-800 mb-2 mt-8">My Modules</h3>
                
                <button className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                    </div>
                    <div className="flex-1 text-left">
                        <h4 className="font-bold text-slate-800">Academic Records</h4>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">Exams & Report Cards</p>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                </button>

                <button className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <CreditCard size={20} />
                    </div>
                    <div className="flex-1 text-left">
                        <h4 className="font-bold text-slate-800">Fee Details</h4>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">Receipts & Due Info</p>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                </button>
            </div>
            
            {/* Nav Bar placeholder for mobile feel */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center text-slate-400 max-w-md mx-auto z-20">
                <div className="flex flex-col items-center text-indigo-600">
                    <User fill="currentColor" size={24} />
                    <span className="text-[10px] font-bold mt-1">Profile</span>
                </div>
                <div className="flex flex-col items-center hover:text-slate-600 transition-colors">
                    <CalendarCheck size={24} />
                    <span className="text-[10px] font-bold mt-1">Timetable</span>
                </div>
                <div className="flex flex-col items-center hover:text-slate-600 transition-colors">
                    <Bell size={24} />
                    <span className="text-[10px] font-bold mt-1">Alerts</span>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
