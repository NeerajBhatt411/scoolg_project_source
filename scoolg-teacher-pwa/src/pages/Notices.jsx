import React, { useState, useEffect } from 'react';
import TopHeader from '@/components/TopHeader';
import { Calendar, FileText, Bell } from 'lucide-react';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const mockNotices = [
      {
        id: 1,
        title: 'Mid-Term Examinations Schedule',
        description: 'The mid-term examinations for classes 9 to 12 will commence from next Monday. Please ensure all question papers are submitted to the exam department by Wednesday.',
        type: 'Exams',
        date: new Date(Date.now() - 86400000).toISOString(),
        author: 'Exam Department',
      },
      {
        id: 2,
        title: 'Annual Sports Meet 2026',
        description: 'We are thrilled to announce our Annual Sports Meet next month. Teachers are requested to submit the list of participating students by the end of this week.',
        type: 'Events',
        date: new Date(Date.now() - 172800000).toISOString(),
        author: 'Principal',
      },
      {
        id: 3,
        title: 'Staff Meeting at 2 PM',
        description: 'An urgent staff meeting is scheduled today at 2 PM in the main auditorium regarding the upcoming inspection.',
        type: 'General',
        date: new Date().toISOString(),
        author: 'Admin Office',
      }
    ];

    setTimeout(() => {
      setNotices(mockNotices);
      setLoading(false);
    }, 800);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const tabs = ['All', 'General', 'Exams', 'Events'];
  const filteredNotices = activeTab === 'All' ? notices : notices.filter(n => n.type === activeTab);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32">
      <TopHeader title="Notices" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        <div className="mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Announcements</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Stay updated with the latest school news.</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-2">
            {tabs.map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative whitespace-nowrap px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                        activeTab === tab 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-32 w-full rounded-[24px] bg-white border border-slate-100 shadow-sm animate-pulse" />
            ))
          ) : filteredNotices.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-[32px] border border-slate-100 border-dashed">
              <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No notices found</h3>
              <p className="text-slate-500 text-sm">You're all caught up!</p>
            </div>
          ) : (
            filteredNotices.map((notice) => (
              <div key={notice.id} className="bg-[#faf9f6] rounded-[24px] p-5 sm:p-6 shadow-[0_8px_20px_rgba(120,113,108,0.06)] border border-stone-200/60 border-b-[4px] border-b-stone-300/60 transition-all hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(120,113,108,0.1)] hover:border-b-stone-400/50">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="space-y-1.5 min-w-0 pr-4">
                    <h3 className="text-[17px] font-black text-slate-900 leading-tight drop-shadow-sm">{notice.title}</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                        {formatDate(notice.date)}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <FileText className="h-3.5 w-3.5 text-orange-500" />
                        {notice.author}
                      </span>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto shrink-0 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-white text-slate-600 border border-slate-200 shadow-sm">
                    {notice.type}
                  </span>
                </div>
                <div className="pt-3 border-t border-stone-200/60">
                    <p className="text-[14px] font-medium text-slate-600 leading-relaxed">
                        {notice.description}
                    </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notices;
