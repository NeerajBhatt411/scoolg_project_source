import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';


const Timetable = () => {
  const [timetable, setTimetable] = useState(null);
  const [activeDay, setActiveDay] = useState('Monday');

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get('/student/timetable');
        setTimetable(res.data);
      } catch (err) {
        console.error('Failed to fetch timetable:', err);
      }
    };
    fetchTimetable();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDaySchedule = timetable?.schedule?.find(s => s.dayOfWeek === activeDay)?.periods || [];


  return (
    <div className="min-h-full">

      {/* MOBILE VIEW - FROM raw_design/timetable_screen */}
      <div className="lg:hidden px-container-margin pt-6 pb-32 space-y-stack-gap">
        <section className="space-y-1">
          <p className="text-label-md font-label-md text-secondary uppercase tracking-widest">Academic Calendar</p>
          <h2 className="text-display-lg font-display-lg text-on-surface">Weekly Schedule</h2>
        </section>

        {/* Day Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {days.map(day => (
            <DayTab 
              key={day} 
              label={day.substring(0, 3)} 
              active={activeDay === day} 
              onClick={() => setActiveDay(day)}
            />
          ))}
        </div>


        {/* Timeline */}
        <section className="space-y-4">
          {currentDaySchedule.length > 0 ? (
            currentDaySchedule.map((entry, i) => (
              <React.Fragment key={i}>
                <MobileTimelineEntry
                  icon="menu_book"
                  subject={entry.subject}
                  teacher={entry.teacherName || 'N/A'}
                  time={`${entry.startTime} - ${entry.endTime}`}
                  room={entry.room || 'N/A'}
                  color={i % 2 === 0 ? "bg-primary-fixed" : "bg-secondary-container"}
                  iconColor={i % 2 === 0 ? "text-primary" : "text-secondary"}
                />
                {/* Insert Lunch Break after Period 2 */}
                {entry.periodNumber === 2 && (
                  <div className="relative pl-6 border-l-2 border-outline-variant">
                    <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-surface-container-high border-4 border-surface shadow-sm"></div>
                    <div className="bg-surface-container-low/50 border border-dashed border-outline-variant rounded-2xl p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary">restaurant</span>
                        <span className="text-label-md font-label-md text-secondary uppercase tracking-widest font-semibold">Lunch Break</span>
                      </div>
                      <span className="text-body-md font-body-md text-on-surface-variant">10:20 AM - 10:50 AM</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div className="text-center py-12 text-outline">No classes scheduled for today.</div>
          )}
        </section>


      </div>

      {/* DESKTOP VIEW - FROM raw_design/desktop_timetable */}
      <div className="hidden lg:block p-8 space-y-stack-gap max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-display-lg font-headline-md text-on-surface">Academic Timetable</h2>
          <p className="text-body-lg text-on-surface-variant">Manage your weekly schedule and upcoming lectures</p>
        </div>

        <div className="flex gap-2 mb-8 bg-surface-container-low p-1.5 rounded-2xl w-max">
          {days.map(day => (
            <button 
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-8 py-3 rounded-xl transition-all font-bold ${activeDay === day ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:bg-white/50'}`}
            >
              {day}
            </button>
          ))}
        </div>


        <div className="space-y-4">
          {currentDaySchedule.length > 0 ? (
            currentDaySchedule.map((entry, i) => (
              <React.Fragment key={i}>
                <DesktopTimelineEntry
                  time={entry.startTime}
                  ampm=""
                  subject={entry.subject}
                  teacher={entry.teacherName || 'N/A'}
                  room={entry.room || 'N/A'}
                  duration={`${entry.startTime} - ${entry.endTime}`}
                  icon="menu_book"
                />
                {entry.periodNumber === 2 && (
                  <div className="group relative flex gap-6 items-stretch opacity-60">
                    <div className="w-24 pt-4 text-right">
                      <p className="font-bold text-on-surface font-title-lg">10:20</p>
                      <p className="text-label-md text-outline uppercase tracking-wider">AM</p>
                    </div>
                    <div className="flex-1 bg-surface-container p-4 rounded-2xl border border-dashed border-outline-variant flex items-center justify-center gap-3">
                      <span className="material-symbols-outlined text-secondary">restaurant</span>
                      <span className="font-title-lg text-body-lg text-secondary">Lunch Break</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div className="text-center py-12 text-outline">No classes scheduled for this day.</div>
          )}
        </div>



        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className="bg-primary text-on-primary p-6 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <p className="opacity-80 text-label-md uppercase font-bold tracking-widest mb-2">Weekly Load</p>
              <h4 className="text-display-lg font-headline-md">24 Hours</h4>
              <p className="text-body-md mt-2 opacity-90">On track for this week's objectives.</p>
            </div>
            <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[120px] opacity-10">pending_actions</span>
          </div>
          <div className="bg-surface-container-high p-6 rounded-3xl flex flex-col justify-between border border-surface-container">
            <div>
              <p className="text-outline text-label-md uppercase font-bold tracking-widest mb-2">Next Subject</p>
              <h4 className="text-title-lg font-headline-md text-on-surface">Molecular Biology</h4>
            </div>
            <span className="text-primary font-bold text-body-md">Starts in 15m</span>
          </div>
          <div className="bg-white border border-surface-container p-6 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined">event_available</span>
            </div>
            <div>
              <p className="text-on-surface font-bold font-title-lg">Academic Holiday</p>
              <p className="text-body-md text-outline">This Friday, Oct 27</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DayTab = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-shrink-0 px-6 py-3 rounded-xl font-title-lg transition-all ${active ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
    }`}>
    {label}
  </button>
);


const MobileTimelineEntry = ({ icon, subject, teacher, time, room, current, color, iconColor }) => (
  <div className={`relative pl-6 border-l-2 ${current ? 'border-primary-container' : 'border-outline-variant'}`}>
    <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-4 border-surface shadow-sm ${current ? 'bg-primary-container' : 'bg-surface-container-high'}`}></div>
    <div className={`bg-white rounded-3xl p-card-internal-padding flex gap-4 items-start shadow-sm border ${current ? 'border-primary-container ring-4 ring-primary-container/10' : 'border-surface-container'}`}>
      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${color} flex items-center justify-center ${iconColor}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-title-lg font-title-lg text-on-surface">{subject}</h3>
            <p className="text-body-md font-body-md text-secondary">{teacher}</p>
          </div>
          {current && <span className="bg-primary-container text-on-primary-container text-label-md font-label-md px-3 py-1 rounded-full uppercase">Now</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-outline text-[18px]">schedule</span>
            <span className="text-body-md text-on-surface-variant">{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-outline text-[18px]">meeting_room</span>
            <span className="text-body-md text-on-surface-variant">{room}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DesktopTimelineEntry = ({ time, ampm, subject, teacher, room, duration, icon, current }) => (
  <div className="group relative flex gap-6 items-stretch">
    <div className="w-24 pt-4 text-right">
      <p className={`font-bold font-title-lg ${current ? 'text-primary' : 'text-on-surface'}`}>{time}</p>
      <p className="text-label-md text-outline uppercase tracking-wider">{ampm}</p>
    </div>
    <div className={`flex-1 bg-white p-6 rounded-3xl shadow-sm border-2 flex items-center justify-between transition-all hover:scale-[1.01] ${current ? 'border-primary-container shadow-lg' : 'border-transparent hover:border-outline-variant/30'
      }`}>
      <div className="flex items-center gap-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${current ? 'bg-primary-container/10 text-primary' : 'bg-surface-container text-secondary'}`}>
          <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-headline-md text-title-lg text-on-surface">{subject}</h3>
            {current && <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Current Class</span>}
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant text-body-md">
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">person</span> {teacher}</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">meeting_room</span> {room}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-on-surface">{time} {ampm} - End</p>
        <p className="text-label-md text-outline">{duration} Session</p>
      </div>
    </div>
  </div>
);

export default Timetable;
