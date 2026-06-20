import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getCached, peekCache } from '../utils/cache';
import { StudentListShimmer } from '../components/StudentShimmer';

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

const isImageAtt = (a) => a?.type === 'image' || /\.(png|jpe?g|gif|webp|bmp)(\?|$)/i.test(a?.url || '');
const isPdfAtt = (a) => a?.type === 'pdf' || /\.pdf(\?|$)/i.test(a?.url || '');

const AttachmentView = ({ a }) => {
  if (isImageAtt(a)) return <img src={a.url} alt={a.fileName || 'image'} className="w-full rounded-2xl border border-surface-container" />;
  if (isPdfAtt(a)) return <iframe src={a.url} title={a.fileName || 'pdf'} className="w-full h-[68vh] rounded-2xl border border-surface-container bg-white"></iframe>;
  return (
    <a href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl text-body-md font-bold text-primary border border-surface-container">
      <span className="material-symbols-outlined">description</span>{a.fileName || 'Open file'}
    </a>
  );
};

const Homework = () => {
  const [list, setList] = useState(() => peekCache('student:homework') || []);
  const [loading, setLoading] = useState(() => !peekCache('student:homework'));
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;
    getCached('student:homework', () => api.get('/student/homework').then(r => Array.isArray(r.data) ? r.data : []))
      .then(data => { if (alive) setList(data); })
      .catch(err => { console.error('Failed to fetch homework:', err); if (alive) setList([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);



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

        {loading ? <StudentListShimmer count={4} /> : list.length === 0 ? <EmptyState /> : (
          <div className="space-y-4">
            {list.map((hw) => <div key={hw._id} onClick={() => setSelected(hw)} className="cursor-pointer"><MobileHomeworkCard hw={hw} /></div>)}
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

        {loading ? <StudentListShimmer count={4} /> : list.length === 0 ? <EmptyState /> : (
          <div className="grid grid-cols-12 gap-8">
            {/* Left: Task List */}
            <div className="col-span-8 space-y-4">
              {list.map((hw) => <div key={hw._id} onClick={() => setSelected(hw)} className="cursor-pointer"><DesktopHomeworkCard hw={hw} /></div>)}
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

      {/* Detail modal — shows description + inline attachments (image/pdf) */}
      {selected && (
        <div onClick={() => setSelected(null)} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-surface-container shrink-0">
              <div className="min-w-0">
                {selected.subject && <span className="text-label-md font-bold px-2 py-0.5 rounded text-primary bg-primary/5">{selected.subject}</span>}
                <h3 className="text-title-lg font-bold text-on-surface mt-1">{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-xl bg-surface-container-low grid place-items-center text-on-surface-variant shrink-0"><span className="material-symbols-outlined text-[20px]">close</span></button>
            </div>
            <div className="px-6 py-5 overflow-y-auto space-y-4">
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-label-md font-semibold text-on-surface-variant">
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[17px]">groups</span>Class {selected.className}-{selected.sectionName}</span>
                {selected.createdByName && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[17px]">person</span>{selected.createdByName}</span>}
                {selected.createdAt && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[17px]">event_available</span>Given {fmtDate(selected.createdAt)}</span>}
                <span className={`flex items-center gap-1.5 ${dueInfo(selected.dueDate).urgent ? 'text-error' : ''}`}><span className="material-symbols-outlined text-[17px]">schedule</span>{dueInfo(selected.dueDate).text}</span>
              </div>
              {selected.description && <p className="text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">{selected.description}</p>}
              {selected.attachments?.length > 0 && (
                <div className="space-y-3 pt-1">
                  <p className="text-label-md font-bold text-on-surface-variant uppercase tracking-widest">Attachments</p>
                  {selected.attachments.map((a, i) => <AttachmentView key={i} a={a} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
        <div className="space-y-1 min-w-0">
          {hw.subject && <span className="text-label-md font-label-md px-2 py-0.5 rounded text-primary bg-primary/5">{hw.subject}</span>}
          <h3 className="text-title-lg font-title-lg text-on-surface">{hw.title}</h3>
          <p className="text-label-md text-on-surface-variant flex flex-wrap items-center gap-x-2">
            {hw.createdByName && <span>by {hw.createdByName}</span>}
            {hw.createdByName && hw.createdAt && <span className="opacity-40">·</span>}
            {hw.createdAt && <span>Given {fmtDate(hw.createdAt)}</span>}
          </p>
        </div>
        <div className="bg-secondary/5 text-secondary px-3 py-1 rounded-full text-label-md font-label-md whitespace-nowrap shrink-0">
          {hw.sectionName === 'All' ? 'All Sec' : `Sec ${hw.sectionName}`}
        </div>
      </div>

      {hw.description && <p className="text-body-md text-on-surface-variant line-clamp-2 mb-3">{hw.description}</p>}

      {hw.attachments?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {hw.attachments.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 px-2.5 py-1.5 bg-surface-container rounded-lg text-label-md font-medium text-secondary max-w-[160px]">
              <span className="material-symbols-outlined text-[16px] text-primary">{isImageAtt(a) ? 'image' : isPdfAtt(a) ? 'picture_as_pdf' : 'attach_file'}</span>
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
        <span className="bg-primary text-on-primary shadow-md shadow-primary/20 px-4 py-2 rounded-lg text-label-md font-bold">
          View
        </span>
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
          {hw.createdByName && (
            <div className="flex items-center gap-2 text-label-md text-secondary font-medium">
              <span className="material-symbols-outlined text-[20px]">person</span>
              {hw.createdByName}
            </div>
          )}
          {hw.createdAt && (
            <div className="flex items-center gap-2 text-label-md text-secondary font-medium">
              <span className="material-symbols-outlined text-[20px]">event_available</span>
              Given {fmtDate(hw.createdAt)}
            </div>
          )}
          {hw.attachments?.length > 0 && (
            <div className="flex items-center gap-2 text-label-md text-secondary font-medium">
              <span className="material-symbols-outlined text-[20px]">attach_file</span>
              {hw.attachments.length} Attachment{hw.attachments.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
      <div className="self-center">
        <span className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary transition-all">
          <span className="material-symbols-outlined">chevron_right</span>
        </span>
      </div>
    </div>
  );
};

export default Homework;
