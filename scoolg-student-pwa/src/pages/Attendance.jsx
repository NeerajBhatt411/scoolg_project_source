import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, UserMinus, CalendarClock, ChevronLeft, ChevronRight, Palmtree } from 'lucide-react';
import api from '../utils/api';


const Attendance = () => {
  const [allAttendance, setAllAttendance] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/student/attendance');
        setAllAttendance(res.data || []);
      } catch (err) {
        console.error('Failed to fetch attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
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
    return (
      <div className="min-h-full pb-32 flex items-center justify-center">
         <div className="animate-pulse flex flex-col items-center gap-4 mt-32">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-secondary font-bold tracking-widest text-sm uppercase">Loading Records...</p>
         </div>
      </div>
    );
  }


  return (
    <div className="min-h-full pb-32">

      {/* CONTENT (Premium Bento Grid Layout) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        
        {/* TOP ROW: Progress & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Progress Card */}
          <section className="col-span-1 bg-gradient-to-br from-white to-slate-50 p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              {/* Background Circle */}
              <svg className="w-full h-full -rotate-90 filter drop-shadow-sm">
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  stroke="currentColor"
                  strokeWidth="12%"
                  fill="transparent"
                  className="text-slate-100"
                />
                {/* Progress Circle */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  stroke="currentColor"
                  strokeWidth="12%"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}%`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.percentage / 100)}%`}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl sm:text-[54px] font-black text-slate-800 leading-none">{stats.percentage}<span className="text-2xl sm:text-3xl text-primary">%</span></span>
                <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest mt-2">Attendance</span>
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Total Present */}
            <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 border border-emerald-100/50 shadow-sm">
                  <BadgeCheck strokeWidth={2.5} size={28} />
              </div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Total Present</p>
              <p className="text-5xl font-black text-emerald-600 mb-2">{stats.present} <span className="text-xl text-slate-400 font-bold">Days</span></p>
            </div>

            {/* Absent & Leaves */}
            <div className="space-y-6 flex flex-col">
              <div className="flex-1 bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Absent</p>
                  <p className="text-3xl font-black text-rose-600">{stats.absent} <span className="text-sm text-slate-400 font-bold">Days</span></p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/50 shadow-sm">
                  <UserMinus strokeWidth={2.5} size={28} />
                </div>
              </div>
              
              <div className="flex-1 bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Leaves</p>
                  <p className="text-3xl font-black text-amber-500">{stats.leave} <span className="text-sm text-slate-400 font-bold">Days</span></p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/50 shadow-sm">
                  <CalendarClock strokeWidth={2.5} size={28} />
                </div>
              </div>
            </div>

          </div>
        </div>


        {/* BOTTOM ROW: Calendar Section */}
        <section className="bg-white p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="flex justify-between items-center mb-8 px-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">{monthName}</h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 hover:bg-primary/10 text-slate-600 hover:text-primary transition-all shadow-sm">
                <ChevronLeft strokeWidth={3} size={22} />
              </button>
              <button onClick={handleNextMonth} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 hover:bg-primary/10 text-slate-600 hover:text-primary transition-all shadow-sm">
                <ChevronRight strokeWidth={3} size={22} />
              </button>
            </div>
          </div>


          
          <div className="grid grid-cols-7 text-center mb-4 gap-2">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
              <span key={day} className="text-[10px] font-black text-slate-400 tracking-widest">{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
            {/* Offset empty blocks for first day alignment */}
            {Array.from({ length: startOffset }).map((_, i) => (
               <div key={`empty-${i}`} className="w-full aspect-square"></div>
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

              const showNM = !record && !isFuture && !isSunday;

              return (
                <div key={dayNumber} className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-[20px] sm:rounded-2xl border transition-all duration-300 hover:scale-[1.05] hover:shadow-md cursor-default 
                    ${isSunday ? 'bg-rose-50 border-rose-200' 
                    : isPresent ? 'bg-emerald-50 border-emerald-200' 
                    : isAbsent ? 'bg-rose-50 border-rose-200' 
                    : isLeave ? 'bg-amber-50 border-amber-200' 
                    : showNM ? 'bg-slate-50 border-slate-200' 
                    : 'bg-white border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]'}
                `}>
                  <span className={`text-xs sm:text-sm font-extrabold 
                    ${isSunday ? 'text-rose-600'
                    : isPresent ? 'text-emerald-700' 
                    : isAbsent ? 'text-rose-700' 
                    : isLeave ? 'text-amber-700' 
                    : showNM ? 'text-slate-400' 
                    : 'text-slate-500'} 
                  `}>{dayNumber}</span>
                  
                  {isSunday && (
                     <div className="mt-0.5 sm:mt-1 text-[8px] sm:text-[10px] font-extrabold px-1.5 py-[2px] rounded-full bg-rose-200 text-rose-600">
                        H
                     </div>
                  )}

                  {(isPresent || isLeave || isAbsent) && (
                    <div className={`mt-0.5 sm:mt-1 text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-[2px] rounded-full shadow-sm ${isPresent ? 'bg-emerald-500 text-white' : isLeave ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {isPresent ? 'P' : isLeave ? 'L' : 'A'}
                    </div>
                  )}
                  {showNM && (
                     <div className="mt-0.5 sm:mt-1 text-[8px] sm:text-[10px] font-extrabold px-1.5 py-[2px] rounded-full bg-slate-200 text-slate-500">
                        NM
                     </div>
                  )}
                </div>
              );
            })}
          </div>


          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap justify-center gap-4 sm:gap-6">
            <LegendItem color="bg-emerald-500" label="Present" />
            <LegendItem color="bg-rose-500" label="Absent" />
            <LegendItem color="bg-amber-500" label="Leave" />
            <LegendItem color="bg-rose-300" label="Holiday/Sunday" />
            <LegendItem color="bg-slate-300" label="Not Marked" />
          </div>
        </section>

        {/* Holiday Banner */}
        <section className="bg-primary p-6 sm:p-8 rounded-[32px] text-white flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="w-16 h-16 bg-white/20 rounded-[20px] flex items-center justify-center border border-white/10 shadow-sm shrink-0">
            <Palmtree strokeWidth={2.5} size={32} />
          </div>
          <div>
            <h4 className="font-black text-xl tracking-tight">Upcoming Holiday</h4>
            <p className="text-white/80 text-sm font-medium mt-1">Autumn Break starts in 4 days (Oct 14-21)</p>
          </div>
        </section>

      </div>

    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <span className="text-label-md font-medium text-secondary">{label}</span>
  </div>
);

export default Attendance;
