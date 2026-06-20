import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Star, BookOpen, Palmtree } from 'lucide-react';
import api from '../utils/api';
import { getCached, peekCache } from '../utils/cache';
import { PageShimmer } from '../components/StudentShimmer';

const Calendar = () => {
  const [events, setEvents] = useState(() => peekCache('student:calendar') || []);
  const [loading, setLoading] = useState(() => !peekCache('student:calendar'));
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch the full event list once; month/year navigation is client-side only.
  useEffect(() => {
    let alive = true;
    getCached('student:calendar', () => api.get('/student/calendar').then(r => Array.isArray(r.data) ? r.data : []))
      .then(data => { if (alive) setEvents(data); })
      .catch(() => {
        if (!alive) return;
        const y = new Date().getFullYear();
        const m = new Date().getMonth();
        setEvents([
          { id: 1, title: 'Winter Vacation', type: 'Holiday', date: new Date(y, m, 25).toISOString(), description: 'School will remain closed for winter holidays.' },
          { id: 2, title: 'Annual Sports Meet', type: 'Event', date: new Date(y, m, 15).toISOString(), description: 'All students are invited to participate in the annual sports day.' },
          { id: 3, title: 'Science Exhibition', type: 'Academic', date: new Date(y, m, 10).toISOString(), description: 'Science exhibition projects presentation in the main hall.' },
          { id: 4, title: 'Republic Day', type: 'Holiday', date: new Date(y, 0, 26).toISOString(), description: 'National holiday.' },
        ]);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const nextMonth = () => {
    setSelectedEvent(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    setSelectedEvent(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const getEventForDay = (day) => {
    return events.find(e => {
      const eDate = new Date(e.date);
      return eDate.getDate() === day && eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
    });
  };

  const handleDayClick = (day, event) => {
    if (event) {
        setSelectedEvent({...event, dayNumber: day});
    } else {
        setSelectedEvent(null);
    }
  };

  if (loading) {
    return <PageShimmer />;
  }

  return (
    <div className="min-h-full pb-32 pt-stack-gap flex flex-col">
      <div className="flex-1 flex flex-col px-container-margin lg:px-8 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3 sm:p-6 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors shadow-sm">
                <ChevronLeft strokeWidth={2.5} size={20} />
              </button>
              <button onClick={nextMonth} className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors shadow-sm">
                <ChevronRight strokeWidth={2.5} size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-2 sm:p-6 flex-1 flex flex-col">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-1">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 sm:gap-3 flex-1">
                {[...Array(firstDayOfMonth)].map((_, i) => (
                  <div key={`empty-${i}`} className="w-full h-10 sm:h-16 rounded-[12px] sm:rounded-2xl"></div>
                ))}
                
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const event = getEventForDay(day);
                  const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                  
                  // Style logic based on event type
                  let bgClass = "bg-white border-slate-100";
                  let textClass = "text-slate-600";
                  let indicatorClass = "";
                  
                  if (event) {
                      const eventType = (event.type || '').toLowerCase();
                      if (eventType === 'holiday') {
                          bgClass = "bg-rose-50 border-rose-200";
                          textClass = "text-rose-700";
                          indicatorClass = "bg-rose-500";
                      } else if (eventType === 'event') {
                          bgClass = "bg-amber-50 border-amber-200";
                          textClass = "text-amber-700";
                          indicatorClass = "bg-amber-500";
                      } else if (eventType === 'academic') {
                          bgClass = "bg-blue-50 border-blue-200";
                          textClass = "text-blue-700";
                          indicatorClass = "bg-blue-500";
                      }
                  } else if (isToday) {
                      bgClass = "bg-slate-50 border-slate-200 ring-2 ring-blue-500 ring-offset-1";
                  }

                  const isSelected = selectedEvent?.dayNumber === day;
                  if (isSelected) {
                      bgClass += " ring-2 ring-slate-800 ring-offset-2 scale-105 z-10 shadow-md";
                  }

                  return (
                    <div 
                        key={day} 
                        onClick={() => handleDayClick(day, event)}
                        className={`w-full h-10 sm:h-16 rounded-[10px] sm:rounded-2xl border flex flex-col items-center justify-center relative cursor-pointer hover:shadow-sm hover:scale-[1.02] transition-all ${bgClass}`}
                    >
                      <span className={`text-[12px] sm:text-base font-black ${textClass}`}>
                        {day}
                      </span>
                      {event && (
                        <div className="absolute bottom-0.5 sm:bottom-1.5 w-full px-1 flex justify-center">
                            <div className="hidden sm:block w-full text-[9px] font-bold text-center truncate px-1 rounded-sm leading-tight mix-blend-color-burn">
                                {event.title}
                            </div>
                            <div className={`sm:hidden w-1.5 h-1.5 rounded-full ${indicatorClass}`}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
          </div>
          
          {/* Selected Event Details or Legend */}
          <div className="p-3 sm:p-6 border-t border-slate-100 bg-slate-50/50 min-h-[80px] sm:min-h-[100px] flex items-center justify-center">
             {selectedEvent ? (
                <div className="w-full flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm
                        ${(selectedEvent.type || '').toLowerCase() === 'holiday' ? 'bg-rose-100 text-rose-600' : 
                          (selectedEvent.type || '').toLowerCase() === 'event' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}
                    `}>
                        {(selectedEvent.type || '').toLowerCase() === 'holiday' ? <Palmtree strokeWidth={2.5} size={24} /> : 
                         (selectedEvent.type || '').toLowerCase() === 'event' ? <Star strokeWidth={2.5} size={24} /> : <BookOpen strokeWidth={2.5} size={24} />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full
                                ${(selectedEvent.type || '').toLowerCase() === 'holiday' ? 'bg-rose-50 text-rose-600' : 
                                  (selectedEvent.type || '').toLowerCase() === 'event' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}
                            `}>{selectedEvent.type}</span>
                        </div>
                        <h4 className="font-black text-slate-800 leading-tight">{selectedEvent.title}</h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{selectedEvent.description}</p>
                    </div>
                </div>
             ) : (
                <div className="flex flex-wrap gap-4 sm:gap-6 justify-center w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></div>
                    <span className="text-xs font-bold text-slate-600">Holiday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
                    <span className="text-xs font-bold text-slate-600">Event</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                    <span className="text-xs font-bold text-slate-600">Academic</span>
                  </div>
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Calendar;
