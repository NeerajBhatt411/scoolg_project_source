import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, CalendarCheck, TrendingUp, Filter } from 'lucide-react';

const StudentAttendance = ({ onBack }) => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            const token = localStorage.getItem('studentToken');
            try {
                const res = await axios.get('http://localhost:5001/api/student/attendance', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAttendance(res.data);
            } catch (err) {
                console.error("Attendance fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'P').length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white p-6">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#FDFDFF] animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-6 bg-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Attendance</h2>
                    </div>
                    <button className="p-2 bg-slate-50 rounded-xl text-slate-400 border border-slate-100">
                        <Filter size={20} />
                    </button>
                </div>

                {/* Summary Card */}
                <div className="bg-slate-950 rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl shadow-emerald-100/50">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp size={80} />
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-1">Overall Presence</p>
                            <h3 className="text-5xl font-black tracking-tighter">{percentage}%</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Total Classes</p>
                            <h3 className="text-xl font-black">{totalDays}</h3>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex gap-4 relative z-10">
                        <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Present</p>
                            <p className="text-lg font-black text-emerald-400">{presentDays}</p>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Absent</p>
                            <p className="text-lg font-black text-rose-400">{totalDays - presentDays}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-32">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 mt-2">Recent Records</h3>
                
                {attendance.length > 0 ? (
                    attendance.map((record, idx) => (
                        <div key={idx} className="bg-white rounded-[24px] border border-slate-100 p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    record.status === 'P' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                    <CalendarCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">
                                        {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Scoolg Logged</p>
                                </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                record.status === 'P' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                                {record.status === 'P' ? 'Present' : 'Absent'}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                        <CalendarCheck size={48} strokeWidth={1} />
                        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em]">No attendance records found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendance;
