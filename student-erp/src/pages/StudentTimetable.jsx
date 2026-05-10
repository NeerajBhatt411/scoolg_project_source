import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, User, BookOpen, CalendarDays, ChevronLeft } from 'lucide-react';
import { STUDENT_API_BASE } from '../lib/api';

const StudentTimetable = ({ onBack }) => {
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        const fetchTimetable = async () => {
            const token = localStorage.getItem('studentToken');
            try {
                const res = await axios.get(`${STUDENT_API_BASE}/timetable`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTimetable(res.data);
            } catch (err) {
                console.error("Timetable fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white p-6">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const currentDayData = timetable?.schedule?.find(s => s.dayOfWeek === selectedDay);
    const currentSchedule = currentDayData?.periods || [];

    return (
        <div className="flex flex-col h-full bg-[#FDFDFF] animate-fade-in">
            {/* Header */}
            <div className="p-6 pb-4 bg-white border-b border-slate-50">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Timetable</h2>
                </div>

                {/* Day Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {days.map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${
                                selectedDay === day 
                                ? 'bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-200' 
                                : 'bg-white text-slate-400 border-slate-100'
                            }`}
                        >
                            {day.substring(0, 3)}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
                {currentSchedule.length > 0 ? (
                    currentSchedule.map((period, idx) => (
                        <div key={idx} className="bg-white rounded-[28px] border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:border-blue-100 transition-colors">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-900 flex flex-col items-center justify-center shrink-0 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                    <span className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Period</span>
                                    <span className="text-xl font-black leading-none">{period.periodNumber || idx + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{period.subject || 'Free Period'}</h4>
                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                                            {period.startTime}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                            <User size={12} className="opacity-70" />
                                            {period.teacherName || 'N/A'}
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                            <Clock size={12} className="opacity-70" />
                                            {period.endTime}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                        <CalendarDays size={48} strokeWidth={1} />
                        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em]">No classes scheduled</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentTimetable;
