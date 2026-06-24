import React, { useState, useEffect } from 'react';

let cachedNotices = null;

const Notices = () => {
  const [notices, setNotices] = useState(cachedNotices || []);
  const [loading, setLoading] = useState(!cachedNotices);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    // No notices API yet — show the honest empty state instead of fake data.
    setLoading(false);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const tabs = ['All', 'General', 'Exams', 'Events'];
  const filteredNotices = activeTab === 'All' ? notices : notices.filter(n => n.type === activeTab);

  return (
    <div className="min-h-full pb-32 pt-stack-gap">
      <div className="max-w-7xl mx-auto px-container-margin lg:px-8 space-y-6">
        
        <div className="mb-2">
            <h1 className="text-display-lg font-display-lg font-bold text-on-surface tracking-tight">Notices</h1>
            <p className="text-body-lg text-on-surface-variant mt-1">Stay updated with the latest school news and announcements.</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex overflow-x-auto pb-2 -mx-container-margin px-container-margin lg:mx-0 lg:px-0 hide-scrollbar gap-2">
            {tabs.map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative whitespace-nowrap px-5 py-2.5 rounded-full text-label-md font-bold transition-all ${
                        activeTab === tab 
                        ? 'bg-primary text-on-primary shadow-sm shadow-primary/20' 
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-32 w-full rounded-2xl bg-surface-container-low shadow-sm animate-pulse" />
            ))
          ) : filteredNotices.length === 0 ? (
            <div className="py-16 text-center bg-surface-container-lowest rounded-[32px] border border-outline-variant/30 border-dashed">
              <div className="h-16 w-16 bg-surface-container text-on-surface-variant rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">campaign</span>
              </div>
              <h3 className="text-title-lg font-title-lg font-bold text-on-surface mb-1">No notices found</h3>
              <p className="text-body-md text-on-surface-variant">You're all caught up!</p>
            </div>
          ) : (
            filteredNotices.map((notice) => (
              <div key={notice.id} className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-outline-variant/30 transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer group">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="space-y-2 min-w-0 pr-4">
                    <h3 className="text-title-lg font-title-lg font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">{notice.title}</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1.5 text-label-md font-bold text-secondary uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                        {formatDate(notice.date)}
                      </span>
                      <span className="flex items-center gap-1.5 text-label-md font-bold text-secondary uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">edit_document</span>
                        {notice.author}
                      </span>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto shrink-0 px-3 py-1 rounded-md text-label-sm font-bold uppercase tracking-widest bg-secondary-container text-on-secondary-container">
                    {notice.type}
                  </span>
                </div>
                <div className="pt-3 border-t border-outline-variant/30">
                    <p className="text-body-md text-on-surface-variant leading-relaxed">
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
