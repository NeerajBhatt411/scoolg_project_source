import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { getCached, peekCache } from '../utils/cache';
import { Clock, MapPin, User, BookOpen, Coffee, Calendar } from 'lucide-react';

const getSubjectColor = (subject) => {
    const sub = (subject || '').toLowerCase();
    if (sub.includes('math')) return '#22c55e'; // Green
    if (sub.includes('computer') || sub.includes('cs')) return '#3b82f6'; // Blue
    if (sub.includes('english') || sub.includes('lang')) return '#a855f7'; // Purple
    if (sub.includes('science') || sub.includes('phy') || sub.includes('chem') || sub.includes('bio')) return '#f97316'; // Orange
    if (sub.includes('history') || sub.includes('social')) return '#eab308'; // Yellow
    return '#64748b'; // Slate
};

const Timetable = () => {
    const [timetable, setTimetable] = useState(() => peekCache('student:timetable') || null);
    const [loading, setLoading] = useState(() => !peekCache('student:timetable'));

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay() - 1] || 'Monday';
    const [activeDay, setActiveDay] = useState(todayName);

    useEffect(() => {
        let alive = true;
        getCached('student:timetable', () => api.get('/student/timetable').then(r => r.data))
            .then(data => { if (alive) setTimetable(data); })
            .catch(err => console.error('Failed to fetch timetable:', err))
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, []);

    const currentDaySchedule = timetable?.schedule?.find(s => s.dayOfWeek === activeDay)?.periods || [];

    if (loading) {
        return (
            <div className="w-full h-full pb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
                    <div className="w-48 h-8 rounded-xl bg-slate-200/70 animate-pulse mb-6"></div>
                    <div className="w-full h-14 rounded-2xl bg-slate-200/50 animate-pulse mb-8"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-full h-24 rounded-2xl bg-slate-100 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
                
                {/* Title */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Weekly Timetable</h1>
                    <p className="text-sm sm:text-base text-slate-500 mt-1 font-medium">View your daily class schedule</p>
                </div>

                {/* Day Tabs - Responsive & No Scroll needed */}
                <div className="w-full bg-white p-1.5 sm:p-2 rounded-2xl border border-slate-200 shadow-sm flex overflow-hidden">
                    {days.map(day => (
                        <button 
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`flex-1 py-2 sm:py-3 text-[11px] sm:text-sm font-bold rounded-xl transition-all active:scale-95 ${
                                activeDay === day 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <span className="sm:hidden">{day.substring(0, 3)}</span>
                            <span className="hidden sm:inline">{day}</span>
                        </button>
                    ))}
                </div>

                {/* Timeline Layout */}
                <div className="mt-8 bg-white rounded-[24px] p-5 sm:p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            {activeDay}'s Classes
                        </h2>
                        <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                            {currentDaySchedule.length} Periods
                        </span>
                    </div>

                    {currentDaySchedule.length > 0 ? (
                        <div className="flex flex-col relative">
                            {currentDaySchedule.map((p, i) => {
                                const color = getSubjectColor(p.subject);
                                return (
                                    <React.Fragment key={i}>
                                        <div className="relative flex items-stretch group cursor-pointer">
                                            {/* Time Column */}
                                            <div className="w-14 sm:w-20 shrink-0 text-right pr-3 sm:pr-4 py-3">
                                                <p className="text-xs sm:text-sm font-black text-slate-900 leading-none">{p.startTime}</p>
                                                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{p.endTime}</p>
                                            </div>

                                            {/* Timeline divider */}
                                            <div className="relative flex flex-col items-center px-1">
                                                <div className="w-[2px] h-full bg-slate-200 absolute top-0 bottom-0"></div>
                                                <div className="w-4 h-4 rounded-full border-[3px] border-white relative mt-3 shadow-sm z-10 transition-transform group-hover:scale-125" style={{ backgroundColor: color }}></div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="flex-1 py-1 pl-3 sm:pl-4">
                                                <div className="bg-[#faf9f6] p-3 sm:p-4 rounded-[16px] sm:rounded-[20px] shadow-[0_4px_12px_rgba(120,113,108,0.04)] border border-stone-200/60 border-b-[3px] border-b-stone-300/60 hover:shadow-[0_8px_20px_rgba(120,113,108,0.08)] hover:border-b-stone-400/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:-translate-y-0.5">
                                                    
                                                    <div className="min-w-0">
                                                        <h4 className="text-[15px] sm:text-[17px] font-black text-slate-900 mb-2 truncate drop-shadow-sm flex items-center gap-2">
                                                            <BookOpen className="w-4 h-4 text-slate-400" />
                                                            {p.subject || 'Subject Not Set'}
                                                        </h4>
                                                        
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <p className="text-[11px] sm:text-[13px] font-bold text-slate-600 flex items-center gap-1.5">
                                                                <User className="w-3.5 h-3.5" />
                                                                {p.teacherName || p.teacher || 'Unassigned'}
                                                            </p>
                                                            {p.room && (
                                                                <p className="text-[11px] sm:text-[13px] font-bold text-slate-600 flex items-center gap-1.5">
                                                                    <MapPin className="w-3.5 h-3.5" />
                                                                    Room {p.room}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <span className="inline-flex items-center self-start sm:self-auto px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-none shadow-inner bg-white/80 shrink-0" style={{ color: color, border: `1px solid ${color}30`, backgroundColor: `${color}0A` }}>
                                                        Period {p.periodNumber || i + 1}
                                                    </span>

                                                </div>
                                            </div>
                                        </div>

                                        {/* Insert Lunch Break after Period 4 (or midway) for realism, if your backend doesn't send it */}
                                        {i === 3 && currentDaySchedule.length > 4 && (
                                            <div className="relative flex items-stretch opacity-70">
                                                <div className="w-16 sm:w-24 shrink-0 text-right pr-4 sm:pr-6 py-4"></div>
                                                <div className="relative flex flex-col items-center px-1">
                                                    <div className="w-[2px] h-full bg-slate-200 absolute top-0 bottom-0"></div>
                                                    <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-white relative mt-5 z-10"></div>
                                                </div>
                                                <div className="flex-1 py-2 pl-4 sm:pl-6">
                                                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-[16px] p-4 flex items-center gap-3">
                                                        <Coffee className="w-5 h-5 text-slate-400" />
                                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Lunch Break</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                <Calendar className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No Classes Scheduled</h3>
                            <p className="text-sm text-slate-500 max-w-xs">There are no periods assigned for {activeDay}. Enjoy your day!</p>
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
};

export default Timetable;
