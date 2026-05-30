import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const fmtDate = (d, opts) => {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-GB', opts || { day: '2-digit', month: 'short' }); }
  catch { return ''; }
};

// Returns due context: { text, urgent, priority }
const dueInfo = (dueDate) => {
  if (!dueDate) return { text: 'No due date', urgent: false, priority: 'Low' };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / 86400000);
  if (diff < 0) return { text: `Overdue · ${fmtDate(dueDate)}`, urgent: true, priority: 'High' };
  if (diff === 0) return { text: 'Due Today', urgent: true, priority: 'High' };
  if (diff === 1) return { text: 'Due Tomorrow', urgent: true, priority: 'Medium' };
  if (diff <= 3) return { text: `Due ${fmtDate(dueDate)}`, urgent: false, priority: 'Medium' };
  return { text: `Due ${fmtDate(dueDate)}`, urgent: false, priority: 'Low' };
};

const Homework = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const res = await api.get('/student/homework');
        setList(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch homework:', err);
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHomework();
  }, []);

  const Spinner = () => (
    <div className="flex items-center justify-center py-20 text-primary">
      <div className="animate-spin w-9 h-9 border-4 border-current border-t-transparent rounded-full"></div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant text-center">
      <span className="material-symbols-outlined text-6xl mb-3 opacity-30">assignment</span>
      <h3 className="text-title-lg font-bold text-on-surface mb-1">No Homework</h3>
      <p className="text-body-md">You're all caught up! New assignments will appear here.</p>
    </div>
  );

  return (
    <div className="min-h-full">
      {/* MOBILE VIEW */}
      <div className="lg:hidden px-container-margin pt-6 pb-32 space-y-stack-gap">
        <div className="space-y-1">
          <h2 className="text-display-lg font-display-lg text-on-surface">Homework</h2>
          <p className="text-body-md font-body-md text-on-surface-variant">Stay updated with your weekly assignments</p>
        </div>

        {/* Filter Chips (visual for now) */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <FilterChip label="All" active />
          <FilterChip label="Pending" />
          <FilterChip label="Submitted" />
          <FilterChip label="Archived" />
        </div>

        {loading ? <Spinner /> : list.length === 0 ? <EmptyState /> : (
          <div className="space-y-4">
            {list.map((hw) => <MobileHomeworkCard key={hw._id} hw={hw} />)}
          </div>
        )}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:block p-8 space-y-stack-gap max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-display-lg font-display-lg text-on-surface">Assignments & Tasks</h2>
            <p className="text-body-lg text-secondary">Your academic submissions and deadlines</p>
          </div>
        </div>

        {loading ? <Spinner /> : list.length === 0 ? <EmptyState /> : (
          <div className="grid grid-cols-12 gap-8">
            {/* Left: Task List */}
            <div className="col-span-8 space-y-4">
              {list.map((hw) => <DesktopHomeworkCard key={hw._id} hw={hw} />)}
            </div>

            {/* Right: Summary */}
            <div className="col-span-4 space-y-6">
              <div className="bg-primary text-on-primary p-8 rounded-3xl shadow-soft">
                <h3 className="text-title-lg font-bold mb-4">This Week</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-body-md opacity-80">Total Assignments</span>
                    <span className="text-title-lg font-bold">{list.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-md opacity-80">Due Soon</span>
                    <span className="text-title-lg font-bold">
                      {list.filter(h => dueInfo(h.dueDate).urgent).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-soft border border-surface-container">
                <h3 className="text-title-lg font-bold text-on-surface mb-4">Important Notes</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-body-md text-secondary">
                    <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                    Open each task to view attachments & instructions.
                  </li>
                  <li className="flex gap-3 text-body-md text-secondary">
                    <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                    Submit before the deadline to avoid penalties.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
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

const MobileHomeworkCard = ({ hw }) => {
  const info = dueInfo(hw.dueDate);
  const color = info.priority === 'High' ? 'bg-error' : info.priority === 'Medium' ? 'bg-tertiary' : 'bg-primary';
  return (
    <div className="bg-white p-card-internal-padding rounded-xl shadow-sm border border-surface-container-high relative overflow-hidden active:scale-[0.98] transition-transform">
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1">
          {hw.subject && <span className="text-label-md font-label-md px-2 py-0.5 rounded text-primary bg-primary/5">{hw.subject}</span>}
          <h3 className="text-title-lg font-title-lg text-on-surface">{hw.title}</h3>
        </div>
        <div className="bg-secondary/5 text-secondary px-3 py-1 rounded-full text-label-md font-label-md whitespace-nowrap">
          {hw.sectionName === 'All' ? 'All Sec' : `Sec ${hw.sectionName}`}
        </div>
      </div>

      {hw.description && <p className="text-body-md text-on-surface-variant line-clamp-2 mb-3">{hw.description}</p>}

      {hw.attachments?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {hw.attachments.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 bg-surface-container rounded-lg text-label-md font-medium text-secondary max-w-[160px]">
              <span className="material-symbols-outlined text-[16px] text-primary">attach_file</span>
              <span className="truncate">{a.fileName || 'File'}</span>
            </a>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className={`flex items-center gap-1.5 ${info.urgent ? 'text-error' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined text-[18px]">{info.urgent ? 'schedule' : 'calendar_month'}</span>
          <span className="text-label-md font-label-md">{info.text}</span>
        </div>
        {hw.attachments?.length > 0 && (
          <a href={hw.attachments[0].url} target="_blank" rel="noreferrer" className="bg-primary text-on-primary shadow-md shadow-primary/20 px-4 py-2 rounded-lg text-label-md font-bold transition-transform active:scale-95">
            Open
          </a>
        )}
      </div>
    </div>
  );
};

const DesktopHomeworkCard = ({ hw }) => {
  const info = dueInfo(hw.dueDate);
  const priority = info.priority;
  return (
    <div className="bg-white p-8 rounded-3xl shadow-soft border border-surface-container flex gap-6 hover:border-primary transition-colors group">
      <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${
        priority === 'High' ? 'bg-error/10 text-error' : priority === 'Medium' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
      }`}>
        <span className="material-symbols-outlined text-[32px]">assignment</span>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-label-md font-bold text-secondary uppercase tracking-widest">
              {hw.subject || (hw.sectionName === 'All' ? 'All Sections' : `Section ${hw.sectionName}`)}
            </span>
            <h3 className="text-title-lg font-bold text-on-surface group-hover:text-primary transition-colors">{hw.title}</h3>
          </div>
          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap ${
            priority === 'High' ? 'bg-error text-white' : priority === 'Medium' ? 'bg-primary text-white' : 'bg-secondary text-white'
          }`}>
            {priority} Priority
          </span>
        </div>
        {hw.description && <p className="text-body-md text-secondary line-clamp-2 mb-4">{hw.description}</p>}
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-label-md text-secondary font-medium">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            {info.text}
          </div>
          {hw.attachments?.length > 0 && (
            <div className="flex items-center gap-2 text-label-md text-secondary font-medium">
              <span className="material-symbols-outlined text-[20px]">attach_file</span>
              {hw.attachments.length} Attachment{hw.attachments.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
      {hw.attachments?.length > 0 && (
        <div className="self-center">
          <a href={hw.attachments[0].url} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary transition-all">
            <span className="material-symbols-outlined">chevron_right</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default Homework;
