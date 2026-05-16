import React from 'react';
import { motion } from 'framer-motion';

const Attendance = () => {
  return (
    <div className="min-h-full pb-32">
      {/* MOBILE CONTENT (Matches attendance_screen design) */}
      <div className="lg:hidden space-y-stack-gap px-container-margin pt-6">
        
        {/* Circle Progress Section */}
        <section className="bg-white p-section-padding rounded-[32px] shadow-sm flex flex-col items-center">
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="90"
                stroke="currentColor"
                strokeWidth="16"
                fill="transparent"
                className="text-surface-container-high"
              />
              {/* Progress Circle */}
              <circle
                cx="112"
                cy="112"
                r="90"
                stroke="currentColor"
                strokeWidth="16"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 90}
                strokeDashoffset={2 * Math.PI * 90 * (1 - 0.94)}
                strokeLinecap="round"
                className="text-primary transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-[48px] font-bold text-primary leading-none">94%</span>
              <span className="text-label-md font-bold text-secondary uppercase tracking-widest mt-1">Attendance</span>
            </div>
          </div>
          <p className="mt-8 text-body-lg text-on-surface-variant text-center leading-relaxed">
            Great job! Your attendance is consistently above the class average of 88%.
          </p>
        </section>

        {/* Calendar Section */}
        <section className="bg-white p-card-internal-padding rounded-[32px] shadow-sm">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-headline-md font-headline-md text-on-surface">October 2023</h2>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-secondary cursor-pointer">chevron_left</span>
              <span className="material-symbols-outlined text-secondary cursor-pointer">chevron_right</span>
            </div>
          </div>
          
          <div className="grid grid-cols-7 text-center mb-4">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
              <span key={day} className="text-[10px] font-bold text-outline tracking-wider">{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-6 text-center">
            {[28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((date, i) => {
              const isPast = i < 3;
              const isPresent = [3, 4, 7, 10, 11, 12, 13].includes(i);
              const isLeave = i === 5;
              const isAbsent = i === 8;
              
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className={`text-body-md font-bold ${isPast ? 'text-outline/40' : 'text-on-surface'}`}>{date}</span>
                  {(isPresent || isLeave || isAbsent) && (
                    <div className={`w-1.5 h-1.5 rounded-full ${isPresent ? 'bg-green-500' : isLeave ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-surface-container flex justify-center gap-6">
            <LegendItem color="bg-green-500" label="Present" />
            <LegendItem color="bg-red-500" label="Absent" />
            <LegendItem color="bg-orange-500" label="Leave" />
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[32px] shadow-sm col-span-2 sm:col-span-1">
            <p className="text-label-md font-bold text-secondary uppercase tracking-widest mb-2">Total Present</p>
            <p className="text-[40px] font-bold text-primary mb-4">120</p>
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[85%]"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-[32px] shadow-sm flex justify-between items-center">
              <div>
                <p className="text-label-md font-bold text-secondary uppercase tracking-widest mb-1">Absent</p>
                <p className="text-title-lg font-bold text-error">5</p>
              </div>
              <span className="material-symbols-outlined text-error-container bg-error/10 p-2 rounded-full">cancel</span>
            </div>
            <div className="bg-white p-6 rounded-[32px] shadow-sm flex justify-between items-center">
              <div>
                <p className="text-label-md font-bold text-secondary uppercase tracking-widest mb-1">Leaves</p>
                <p className="text-title-lg font-bold text-orange-600">2</p>
              </div>
              <span className="material-symbols-outlined text-orange-200 bg-orange-50 p-2 rounded-full">medical_services</span>
            </div>
          </div>
        </div>

        {/* Holiday Banner */}
        <section className="bg-primary-container p-6 rounded-[32px] text-white flex items-center gap-4 shadow-lg">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">event</span>
          </div>
          <div>
            <h4 className="font-bold text-title-lg">Upcoming Holiday</h4>
            <p className="text-white/80 text-body-md mt-1">Autumn Break starts in 4 days (Oct 14-21)</p>
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
