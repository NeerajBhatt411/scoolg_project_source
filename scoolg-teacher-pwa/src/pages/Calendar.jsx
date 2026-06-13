import React, { useState, useEffect } from 'react';
import { Clock, MapPin, CalendarDays } from 'lucide-react';
import TopHeader from '@/components/TopHeader';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockEvents = [
      { id: 1, title: 'Summer Break Begins', date: '2026-06-20', type: 'Holiday' },
      { id: 2, title: 'Teacher Training Session', date: '2026-06-25', type: 'Meeting', time: '10:00 AM - 02:00 PM', location: 'Main Auditorium' },
      { id: 3, title: 'Mid-Term Examinations', date: '2026-07-15', type: 'Exam' },
      { id: 4, title: 'Independence Day', date: '2026-08-15', type: 'Event', time: '08:00 AM', location: 'School Ground' },
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32">
      <TopHeader title="Calendar" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        <div className="mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">School Calendar</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Upcoming events, holidays, and important dates.</p>
        </div>

        <div className="space-y-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-28 w-full rounded-[24px] bg-white border border-slate-100 shadow-sm animate-pulse" />
            ))
          ) : events.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-[32px] border border-slate-100 border-dashed">
              <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No upcoming events</h3>
              <p className="text-slate-500 text-sm">Your calendar is clear for now.</p>
            </div>
          ) : (
            events.map((event) => {
              const dateObj = new Date(event.date);
              const month = dateObj.toLocaleString('default', { month: 'short' });
              const day = dateObj.getDate();

              return (
                <div key={event.id} className="bg-[#faf9f6] rounded-[24px] shadow-[0_8px_20px_rgba(120,113,108,0.06)] border border-stone-200/60 border-b-[4px] border-b-stone-300/60 flex overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(120,113,108,0.1)] hover:border-b-stone-400/50 transition-all cursor-default">
                  
                  {/* Date Block */}
                  <div className="w-24 sm:w-28 bg-white border-r border-stone-200/60 flex flex-col items-center justify-center p-4 shrink-0">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{month}</span>
                    <span className="text-3xl font-black text-blue-600 mt-0.5">{day}</span>
                  </div>
                  
                  {/* Details Block */}
                  <div className="p-5 flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <h3 className="text-[17px] sm:text-lg font-black text-slate-900 leading-tight drop-shadow-sm truncate pr-4">{event.title}</h3>
                      <span className="self-start sm:self-auto shrink-0 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200/60 shadow-sm">
                        {event.type}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                      {event.time && (
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                          <MapPin className="h-3.5 w-3.5 text-orange-500" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
