import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, UserMinus, CalendarClock, ChevronLeft, ChevronRight, Palmtree, Calendar } from 'lucide-react';
import api from '../utils/api';
import { getCached, peekCache } from '../utils/cache';
import { PageShimmer } from '../components/StudentShimmer';


const Attendance = () => {
  const [allAttendance, setAllAttendance] = useState(() => peekCache('student:attendance') || []);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(() => !peekCache('student:attendance'));
  const [upcomingEvent, setUpcomingEvent] = useState(null);

  useEffect(() => {
    let alive = true;
    getCached('student:attendance', () => api.get('/student/attendance').then(r => Array.isArray(r.data) ? r.data : []))
      .then(data => { if (alive) setAllAttendance(data); })
      .catch(err => console.error('Failed to fetch attendance:', err))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const monthlyData = allAttendance.filter(r => {
      if (!r.date) return false;
      const [year, month] = r.date.includes('T') 
         ? [new Date(r.date).getFullYear(), new Date(r.date).getMonth()] 
         : [parseInt(r.date.split('-')[0], 10), parseInt(r.date.split('-')[1], 10) - 1];
      
      const isCorrectMonth = year === currentMonth.getFullYear() && month === currentMonth.getMonth();
      if (!isCorrectMonth) return false;

      const dayStr = r.date.includes('T') ? new Date(r.date).getDate() : parseInt(r.date.split('-')[2], 10);
      const isSun = new Date(year, month, dayStr).getDay() === 0;
      return !isSun; // Ignore Sundays
  });


  const present = monthlyData.filter(r => r.status === 'Present' || r.status === 'P').length;
  const absent = monthlyData.filter(r => r.status === 'Absent' || r.status === 'A').length;
  const leave = monthlyData.filter(r => r.status === 'Leave' || r.status === 'Late' || r.status === 'L').length;
  const percentage = monthlyData.length > 0 ? Math.round((present / monthlyData.length) * 100) : 0;
  const stats = { percentage, present, absent, leave, total: monthlyData.length };

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Align to Mon-Sun
  
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });


  if (loading) {
    return <PageShimmer />;
  }


  return (
    <div className="min-h-full pb-32">

      {/* CONTENT (Premium Bento Grid Layout) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 lg:pt-8 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 lg:items-start pb-6">
        
        {/* Graph Section */}
        <div className="lg:col-span-5 w-full flex flex-col order-2 lg:order-1">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 w-full mb-6 text-left flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-blue-600" />
                Attendance Overview
            </h2>
            <div className="w-full flex items-end justify-center gap-6 sm:gap-10 h-48 sm:h-56 mb-6">
                {/* Present Bar */}
                <div className="flex flex-col items-center h-full group w-12 sm:w-16">
                    <span className="text-[11px] sm:text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 shadow-sm px-2.5 py-1 rounded-xl z-10 mb-2 transition-transform group-hover:-translate-y-1">{stats.present}</span>
                    <div className="flex-1 w-full flex items-end bg-slate-50 rounded-t-2xl p-1 pb-0 border border-slate-100 border-b-0">
                        <div className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-xl transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover:from-emerald-400 group-hover:to-emerald-300" style={{ height: `${stats.total ? Math.max((stats.present/stats.total)*100, 5) : 5}%` }}></div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-widest mt-2">Present</span>
                </div>
                
                {/* Absent Bar */}
                <div className="flex flex-col items-center h-full group w-12 sm:w-16">
                    <span className="text-[11px] sm:text-xs font-black text-rose-700 bg-rose-50 border border-rose-100 shadow-sm px-2.5 py-1 rounded-xl z-10 mb-2 transition-transform group-hover:-translate-y-1">{stats.absent}</span>
                    <div className="flex-1 w-full flex items-end bg-slate-50 rounded-t-2xl p-1 pb-0 border border-slate-100 border-b-0">
                        <div className="w-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-xl transition-all duration-1000 shadow-[0_0_15px_rgba(244,63,94,0.3)] group-hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] group-hover:from-rose-400 group-hover:to-rose-300" style={{ height: `${stats.total ? Math.max((stats.absent/stats.total)*100, 5) : 5}%` }}></div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-widest mt-2">Absent</span>
                </div>

            </div>
            
            <div className="w-full border-t border-slate-100 pt-5 flex items-center justify-between">
                <div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Overall Attendance</p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.percentage}%</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Days</p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</p>
                </div>
            </div>
          </div>
        </div>

        {/* Stats Cards (Moved out of left column to control mobile order) */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 order-3 lg:order-3 lg:col-span-5 lg:col-start-1">
            {/* Total Present */}
            <div className="col-span-1 bg-white p-4 sm:p-5 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50 shadow-sm mb-3">
                  <BadgeCheck strokeWidth={2.5} size={20} />
                </div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Present</p>
                <p className="text-2xl font-black text-emerald-600">{stats.present} <span className="text-xs text-slate-400 font-bold">Days</span></p>
            </div>

            {/* Absent */}
            <div className="col-span-1 bg-white p-4 sm:p-5 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/50 shadow-sm mb-3">
                  <UserMinus strokeWidth={2.5} size={20} />
                </div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Absent</p>
                <p className="text-2xl font-black text-rose-600">{stats.absent} <span className="text-xs text-slate-400 font-bold">Days</span></p>
            </div>
        </div>


        {/* Calendar Section */}
        <div className="lg:col-span-7 w-full flex flex-col order-1 lg:order-2 lg:row-span-2">
            <section className="bg-white p-5 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">{monthName}</h2>
                <div className="flex gap-1.5 sm:gap-2">
                  <button onClick={handlePrevMonth} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-[14px] bg-slate-50 border border-slate-100 hover:bg-primary/10 text-slate-600 hover:text-primary transition-all shadow-sm">
                    <ChevronLeft strokeWidth={3} size={20} />
                  </button>
                  <button onClick={handleNextMonth} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-[14px] bg-slate-50 border border-slate-100 hover:bg-primary/10 text-slate-600 hover:text-primary transition-all shadow-sm">
                    <ChevronRight strokeWidth={3} size={20} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 text-center mb-2 gap-1.5 sm:gap-2">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                  <span key={day} className="text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest">{day}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center flex-1">
                {/* Offset empty blocks for first day alignment */}
                {Array.from({ length: startOffset }).map((_, i) => (
                   <div key={`empty-${i}`} className="w-full h-12 sm:h-14"></div>
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNumber) => {
                  const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
                  const isSunday = dateObj.getDay() === 0;

                  const record = !isSunday ? monthlyData.find(r => {
                      if (!r.date) return false;
                      const day = r.date.includes('T') ? new Date(r.date).getDate() : parseInt(r.date.split('-')[2], 10);
                      return day === dayNumber;
                  }) : null;

                  const isPresent = record?.status === 'Present' || record?.status === 'P';
                  const isLeave = record?.status === 'Leave' || record?.status === 'Late' || record?.status === 'L';
                  const isAbsent = record?.status === 'Absent' || record?.status === 'A';
                  
                  // Future date check
                  const today = new Date();
                  const isFuture = currentMonth.getFullYear() > today.getFullYear() || 
                      (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() > today.getMonth()) ||
                      (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth() && dayNumber > today.getDate());

                  const isToday = currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth() && dayNumber === today.getDate();

                  const showNM = !record && !isFuture && !isSunday;

                  return (
                    <div key={dayNumber} className={`relative flex flex-col items-center justify-center w-full h-12 sm:h-14 rounded-[12px] sm:rounded-2xl border transition-all duration-300 hover:scale-[1.05] hover:shadow-md cursor-default 
                        ${isToday ? 'ring-2 ring-primary ring-offset-1 scale-[1.05] shadow-sm z-10 ' : ''}
                        ${isSunday ? 'bg-rose-50 border-rose-200' 
                        : isPresent ? 'bg-emerald-50 border-emerald-200' 
                        : isAbsent ? 'bg-rose-50 border-rose-200' 
                        : isLeave ? 'bg-amber-50 border-amber-200' 
                        : showNM ? 'bg-slate-50 border-slate-200' 
                        : 'bg-white border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]'}
                    `}>
                      <span className={`text-[11px] sm:text-[13px] font-extrabold leading-none
                        ${isSunday ? 'text-rose-600'
                        : isPresent ? 'text-emerald-700' 
                        : isAbsent ? 'text-rose-700' 
                        : isLeave ? 'text-amber-700' 
                        : showNM ? 'text-slate-400' 
                        : 'text-slate-500'} 
                      `}>{dayNumber}</span>
                      
                      {isSunday && (
                         <div className="mt-0.5 sm:mt-1 text-[7px] sm:text-[9px] font-extrabold px-1.5 py-[2px] rounded-full bg-rose-200 text-rose-600 leading-none">
                            H
                         </div>
                      )}

                      {(isPresent || isLeave || isAbsent) && (
                        <div className={`mt-0.5 sm:mt-1 text-[7px] sm:text-[9px] font-black px-1.5 py-[2px] rounded-full shadow-sm leading-none ${isPresent ? 'bg-emerald-500 text-white' : isLeave ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {isPresent ? 'P' : isLeave ? 'L' : 'A'}
                        </div>
                      )}
                      {showNM && (
                         <div className="mt-0.5 sm:mt-1 text-[7px] sm:text-[9px] font-extrabold px-1 py-[2px] rounded-full bg-slate-200 text-slate-500 leading-none">
                            NM
                         </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Ultra Compact Legend */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap justify-center gap-x-4 gap-y-1">
                <LegendItem color="bg-emerald-500" label="Present" />
                <LegendItem color="bg-rose-500" label="Absent" />
                <LegendItem color="bg-amber-500" label="Leave" />
                <LegendItem color="bg-rose-300" label="Holiday" />
              </div>
            </section>
        </div>

      </div>

    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-1.5 sm:gap-2">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <span className="text-[10px] sm:text-xs font-bold text-slate-500">{label}</span>
  </div>
);

export default Attendance;
