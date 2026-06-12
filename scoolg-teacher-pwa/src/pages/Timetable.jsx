import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const JS_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const subjectTone = (subject) => {
  const s = (subject || '').toLowerCase();
  if (s.includes('math')) return 'bg-blue-50 text-blue-700 border-blue-100';
  if (s.includes('sci') || s.includes('phys') || s.includes('chem')) return 'bg-teal-50 text-teal-700 border-teal-100';
  if (s.includes('eng')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (s.includes('hin')) return 'bg-amber-50 text-amber-700 border-amber-100';
  if (s.includes('com') || s.includes('it')) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
  return 'bg-slate-50 text-slate-700 border-slate-100';
};

const Timetable = () => {
  const today = JS_DAYS[new Date().getDay()];
  const [activeDay, setActiveDay] = useState(DAYS.includes(today) ? today : 'Monday');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nowHM, setNowHM] = useState(() => new Date().toTimeString().slice(0, 5));

  // Keep the "now" clock fresh so the live highlight moves between periods
  useEffect(() => {
    const tick = setInterval(() => setNowHM(new Date().toTimeString().slice(0, 5)), 30000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/teacher/timetable');
        setSchedule(res.data?.schedule || []);
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
    <div className="min-h-full px-container-margin lg:px-8 pt-6 pb-32 lg:pb-10 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">My Schedule</p>
          <h2 className="text-[26px] sm:text-3xl font-black text-slate-900 tracking-tight">Weekly Timetable</h2>
        </div>
        {!loading && (
          <span className="shrink-0 px-3 py-1.5 mb-0.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
            {periods.length} {periods.length === 1 ? 'period' : 'periods'}
          </span>
        )}
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-2.5 rounded-full text-xs whitespace-nowrap transition-all active:scale-95 ${activeDay === day
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
              : 'bg-white text-slate-500 border border-slate-100 font-bold'}`}
          >
            <span className="inline-flex items-center gap-1.5">
              {day.substring(0, 3)}
              {day === today && activeDay !== day && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" aria-label="Today"></span>
              )}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-[20px] h-[88px]"></div>
          ))}
        </div>
      ) : periods.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-[28px] p-10 text-center bg-slate-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100 shadow-sm">
            <span className="material-symbols-outlined text-3xl text-slate-300">event_busy</span>
          </div>
          <p className="text-sm font-bold text-slate-700">No classes on {activeDay}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {periods.map((p, i) => {
            const live = isLive(p);
            return (
              <div
                key={i}
                className={`bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border transition-all ${live
                  ? 'ring-2 ring-blue-600/40 border-blue-600/30'
                  : 'border-slate-100'}`}
              >
                <div className="w-16 h-14 rounded-[16px] bg-blue-50 text-blue-700 border border-blue-100 flex flex-col items-center justify-center shadow-sm shrink-0">
                  <p className="text-[13px] font-black leading-none">{p.startTime || '--'}</p>
                  <p className="text-[10px] font-bold text-blue-600/60 mt-1">{p.endTime || ''}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest mb-1 ${subjectTone(p.subject)}`}>
                    Period {p.periodNumber}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-900 text-[15px] tracking-tight leading-tight truncate">{p.subject || 'Free'}</p>
                    {live && (
                      <span className="text-[9px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full animate-pulse shrink-0">
                        Now
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-400">Class {p.className}-{p.sectionName}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Timetable;
