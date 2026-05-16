import React from 'react';
import { motion } from 'framer-motion';

const Homework = () => {
  return (
    <div className="min-h-full">
      {/* MOBILE VIEW - FROM raw_design/homework_screen */}
      <div className="lg:hidden px-container-margin pt-6 pb-32 space-y-stack-gap">
        <div className="space-y-1">
          <h2 className="text-display-lg font-display-lg text-on-surface">Homework</h2>
          <p className="text-body-md font-body-md text-on-surface-variant">Stay updated with your weekly assignments</p>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <FilterChip label="All" active />
          <FilterChip label="Pending" />
          <FilterChip label="Submitted" />
          <FilterChip label="Archived" />
        </div>

        {/* Homework List */}
        <div className="space-y-4">
          <MobileHomeworkCard 
            subject="Mathematics" 
            title="Algebra Worksheet" 
            due="Oct 25" 
            files="2 Files" 
            status="Pending" 
            color="bg-primary" 
          />
          <MobileHomeworkCard 
            subject="Physics" 
            title="Newtonian Dynamics Lab" 
            due="Oct 24" 
            status="Pending" 
            color="bg-tertiary" 
            urgent
          />
          <MobileHomeworkCard 
            subject="Literature" 
            title="The Great Gatsby Analysis" 
            completed="Oct 21" 
            status="Submitted" 
            submitted
          />
        </div>
      </div>

      {/* DESKTOP VIEW - Polished Grid Design */}
      <div className="hidden lg:block p-8 space-y-stack-gap max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-display-lg font-display-lg text-on-surface">Assignments & Tasks</h2>
            <p className="text-body-lg text-secondary">Manage your academic submissions and deadlines</p>
          </div>
          <div className="flex bg-surface-container rounded-xl p-1">
            <button className="px-6 py-2 rounded-lg bg-white shadow-sm text-label-md font-bold text-primary">List View</button>
            <button className="px-6 py-2 rounded-lg text-label-md font-medium text-secondary hover:bg-white/50 transition-colors">Calendar</button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Task List */}
          <div className="col-span-8 space-y-4">
            <DesktopHomeworkCard 
              subject="Advanced Chemistry" 
              title="Organic Compounds Research Project" 
              due="Oct 30, 2023" 
              priority="High"
              desc="Comprehensive study on hydrocarbons and their industrial applications."
            />
            <DesktopHomeworkCard 
              subject="Computer Science" 
              title="Sorting Algorithms Implementation" 
              due="Oct 28, 2023" 
              priority="Medium"
              desc="Implement Bubble, Quick, and Merge sort in Java with complexity analysis."
            />
            <DesktopHomeworkCard 
              subject="World History" 
              title="The Industrial Revolution Essay" 
              due="Nov 02, 2023" 
              priority="Low"
              desc="Discuss the socio-economic impact of the industrial revolution in Europe."
            />
          </div>

          {/* Right Column: Summary & Progress */}
          <div className="col-span-4 space-y-6">
            <div className="bg-primary text-on-primary p-8 rounded-3xl shadow-soft">
              <h3 className="text-title-lg font-bold mb-4">Submission Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-body-md opacity-80">Completed Tasks</span>
                  <span className="text-title-lg font-bold">12/15</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full" style={{ width: '80%' }}></div>
                </div>
                <p className="text-label-md opacity-80">You are doing better than 85% of your class!</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-soft border border-surface-container">
              <h3 className="text-title-lg font-bold text-on-surface mb-4">Important Notes</h3>
              <ul className="space-y-3">
                <li className="flex gap-3 text-body-md text-secondary">
                  <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                  Submit all files in PDF format only.
                </li>
                <li className="flex gap-3 text-body-md text-secondary">
                  <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                  Late submissions incur a 10% penalty per day.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterChip = ({ label, active }) => (
  <span className={`${
    active ? 'bg-primary-container text-on-primary-container border-primary/10' : 'bg-white text-on-surface-variant border-outline-variant/30'
  } px-4 py-1.5 rounded-full text-label-md font-label-md border whitespace-nowrap cursor-pointer transition-colors`}>
    {label}
  </span>
);

const MobileHomeworkCard = ({ subject, title, due, completed, status, files, color, urgent, submitted }) => (
  <div className={`bg-white p-card-internal-padding rounded-xl shadow-sm border border-surface-container-high relative overflow-hidden active:scale-[0.98] transition-transform`}>
    {!submitted && <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>}
    <div className="flex justify-between items-start mb-3">
      <div className="space-y-1">
        <span className={`text-label-md font-label-md px-2 py-0.5 rounded ${
          submitted ? 'text-secondary bg-secondary/5' : `text-${color.split('-')[1]} ${color}/5`
        }`}>{subject}</span>
        <h3 className="text-title-lg font-title-lg text-on-surface">{title}</h3>
      </div>
      <div className={`${
        submitted ? 'bg-green-100 text-green-700' : 'bg-error/10 text-error'
      } px-3 py-1 rounded-full text-label-md font-label-md`}>
        {status}
      </div>
    </div>
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-4">
        {due ? (
          <div className={`flex items-center gap-1.5 ${urgent ? 'text-error' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-[18px]">{urgent ? 'schedule' : 'calendar_month'}</span>
            <span className="text-label-md font-label-md">Due {due}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">task_alt</span>
            <span className="text-label-md font-label-md">Completed {completed}</span>
          </div>
        )}
      </div>
      <button className={`${
        submitted ? 'text-on-surface-variant' : 'bg-primary text-on-primary shadow-md shadow-primary/20'
      } px-4 py-2 rounded-lg text-label-md font-bold transition-transform active:scale-95`}>
        {submitted ? 'Review' : 'Open'}
      </button>
    </div>
  </div>
);

const DesktopHomeworkCard = ({ subject, title, due, priority, desc }) => (
  <div className="bg-white p-8 rounded-3xl shadow-soft border border-surface-container flex gap-6 hover:border-primary transition-colors cursor-pointer group">
    <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${
      priority === 'High' ? 'bg-error/10 text-error' : priority === 'Medium' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
    }`}>
      <span className="material-symbols-outlined text-[32px]">assignment</span>
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-label-md font-bold text-secondary uppercase tracking-widest">{subject}</span>
          <h3 className="text-title-lg font-bold text-on-surface group-hover:text-primary transition-colors">{title}</h3>
        </div>
        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
          priority === 'High' ? 'bg-error text-white' : priority === 'Medium' ? 'bg-primary text-white' : 'bg-secondary text-white'
        }`}>
          {priority} Priority
        </span>
      </div>
      <p className="text-body-md text-secondary line-clamp-2 mb-4">{desc}</p>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-label-md text-secondary font-medium">
          <span className="material-symbols-outlined text-[20px]">calendar_today</span>
          Deadline: {due}
        </div>
        <div className="flex items-center gap-2 text-label-md text-secondary font-medium">
          <span className="material-symbols-outlined text-[20px]">attach_file</span>
          3 Attachments
        </div>
      </div>
    </div>
    <div className="self-center">
      <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary transition-all">
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  </div>
);

export default Homework;
