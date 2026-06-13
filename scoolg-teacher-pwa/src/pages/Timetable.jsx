import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import TopHeader from '@/components/TopHeader';
import { CalendarDays, Clock, ChevronRight } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const JS_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Map subjects to colors for the timeline dot
const getSubjectColor = (subject) => {
    const sub = (subject || '').toLowerCase();
    if (sub.includes('math')) return '#22c55e'; // Green
    if (sub.includes('computer') || sub.includes('cs')) return '#3b82f6'; // Blue
    if (sub.includes('english') || sub.includes('lang')) return '#a855f7'; // Purple
    if (sub.includes('science') || sub.includes('phy') || sub.includes('chem') || sub.includes('bio')) return '#f97316'; // Orange
    if (sub.includes('history') || sub.includes('social')) return '#eab308'; // Yellow
    return '#64748b'; // Slate
};

let cachedSchedule = null;

const Timetable = () => {
    const today = JS_DAYS[new Date().getDay()];
    const [activeDay, setActiveDay] = useState(DAYS.includes(today) ? today : 'Monday');
    const [schedule, setSchedule] = useState(cachedSchedule || []);
    const [loading, setLoading] = useState(!cachedSchedule);
    const [nowHM, setNowHM] = useState(() => new Date().toTimeString().slice(0, 5));

    useEffect(() => {
        const tick = setInterval(() => setNowHM(new Date().toTimeString().slice(0, 5)), 30000);
        return () => clearInterval(tick);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                if (!cachedSchedule) {
                    const res = await api.get('/teacher/timetable');
                    const sched = res.data?.schedule || [];
                    cachedSchedule = sched;
                    setSchedule(sched);
                }
            } catch (e) {
                console.error('Timetable load failed', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const periods = schedule.find(d => d.dayOfWeek === activeDay)?.periods || [];

    const isLive = (p) =>
        activeDay === today &&
        !!p.startTime && !!p.endTime &&
        p.startTime <= nowHM && nowHM < p.endTime;

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-24">
            <TopHeader title="Timetable" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
                
                {/* Header & Tabs */}
                <div className="mb-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Weekly Schedule</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        {loading ? 'Loading schedule...' : `You have ${periods.length} periods on ${activeDay}.`}
                    </p>
                </div>

                {/* Day Tabs */}
                <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-2">
                    {DAYS.map(day => {
                        const isToday = day === today;
                        const isActive = activeDay === day;
                        return (
                            <button 
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`relative whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                                    isActive 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {day.substring(0, 3)}
                                {isToday && !isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Timeline content */}
                <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_8px_20px_rgba(120,113,108,0.04)] border border-stone-200/60">
                    {loading ? (
                        <div className="space-y-6">
                            {[1,2,3,4,5].map(i => <div key={i} className="h-16 animate-pulse bg-slate-50 rounded-2xl"></div>)}
                        </div>
                    ) : periods.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CalendarDays className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Free Day</h3>
                            <p className="text-slate-500 text-sm">No classes scheduled for {activeDay}.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col relative">
                            {periods.map((p, i) => {
                                const live = isLive(p);
                                const color = getSubjectColor(p.subject);
                                return (
                                    <div key={i} className="relative flex items-stretch group cursor-default">
                                        {/* Time Column */}
                                        <div className="w-16 sm:w-20 shrink-0 text-right pr-4 py-6">
                                            <p className={`text-[12px] sm:text-sm font-black leading-none ${live ? 'text-blue-600' : 'text-slate-900'}`}>{p.startTime}</p>
                                            <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-1.5 ${live ? 'text-blue-400' : 'text-slate-400'}`}>{p.endTime}</p>
                                        </div>
                                        
                                        {/* Timeline divider */}
                                        <div className="relative flex flex-col items-center px-2">
                                            <div className={`w-[2px] h-full ${live ? 'bg-blue-200' : 'bg-slate-200'} absolute top-0 bottom-0`}></div>
                                            {/* Center Dot */}
                                            <div className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center">
                                                {live && <div className="absolute w-6 h-6 rounded-full bg-blue-100 animate-ping"></div>}
                                                <div 
                                                    className={`w-3.5 h-3.5 rounded-full border-2 border-white relative z-10 shadow-sm ${live ? 'bg-blue-600' : ''}`}
                                                    style={{ backgroundColor: !live ? color : undefined }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        {/* Card Content */}
                                        <div className="flex-1 py-3 pl-3 sm:pl-5">
                                            <div className={`p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] shadow-[0_10px_30px_rgba(120,113,108,0.08)] border border-b-[6px] transition-all flex justify-between items-center ${live ? 'bg-blue-50 border-blue-200 border-b-blue-300 shadow-[0_10px_30px_rgba(37,99,235,0.12)] hover:-translate-y-1' : 'bg-[#faf9f6] border-stone-200 border-b-stone-300 hover:-translate-y-1 hover:border-b-stone-400 hover:shadow-[0_15px_35px_rgba(120,113,108,0.12)]'}`}>
                                                <div className="min-w-0 pr-2">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <h4 className="text-[14px] sm:text-base font-black text-slate-900 truncate drop-shadow-sm">{p.subject || 'Subject Not Set'}</h4>
                                                        {live && <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white animate-pulse">Now</span>}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-none shadow-inner bg-white/80" style={{ color: color, border: `1px solid ${color}20`, backgroundColor: `${color}0A` }}>
                                                            {p.className} {p.sectionName}
                                                        </span>
                                                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 border border-slate-200/60">
                                                            P{p.periodNumber}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Timetable;
