import React, { useState, useEffect } from 'react';
import { BellOff } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const timeAgo = (d) => {
  const t = new Date(d).getTime();
  if (!t) return '';
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24); if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
};

// icon + colour per notification type
const META = {
  attendance: { icon: 'fact_check', bg: 'bg-orange-50', fg: 'text-orange-500' },
  homework:   { icon: 'menu_book', bg: 'bg-blue-50', fg: 'text-blue-500' },
  event:      { icon: 'event', bg: 'bg-violet-50', fg: 'text-violet-500' },
  exam:       { icon: 'quiz', bg: 'bg-rose-50', fg: 'text-rose-500' },
  general:    { icon: 'notifications', bg: 'bg-slate-100', fg: 'text-slate-500' },
};

const Notifications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState(null); // null = loading

  useEffect(() => {
    if (!user?._id) return;
    let alive = true;
    (async () => {
      try {
        const res = await api.get('/notifications', { params: { role: 'student', userId: user._id } });
        if (!alive) return;
        setItems(res.data.items || []);
        // mark everything read in the background once the inbox is opened
        if ((res.data.unread || 0) > 0) {
          api.post('/notifications/read-all', { role: 'student', userId: user._id }).catch(() => {});
        }
      } catch (e) {
        if (alive) setItems([]);
      }
    })();
    return () => { alive = false; };
  }, [user]);

  // Loading
  if (items === null) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pb-24 p-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 animate-pulse flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3.5 bg-slate-100 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty
  if (!items.length) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pb-24 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 sm:p-12 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center max-w-sm w-full">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <BellOff strokeWidth={2} size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">No Notifications</h2>
            <p className="text-slate-500 font-medium leading-relaxed">You don't have any new notifications at the moment. We'll alert you when something important comes up!</p>
          </div>
        </div>
      </div>
    );
  }

  // List
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 p-4 space-y-3">
      {items.map((n) => {
        const m = META[n.type] || META.general;
        return (
          <div
            key={n._id}
            className={`bg-white rounded-3xl p-4 border flex gap-4 items-start shadow-[0_4px_20px_rgb(0,0,0,0.03)] ${n.read ? 'border-slate-100' : 'border-blue-100 ring-1 ring-blue-50'}`}
          >
            <div className={`w-12 h-12 rounded-2xl ${m.bg} ${m.fg} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-[22px]">{m.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className={`text-[15px] text-slate-900 ${n.read ? 'font-semibold' : 'font-black'}`}>{n.title}</h3>
                {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
              </div>
              {n.body && <p className="text-sm text-slate-500 font-medium leading-relaxed mt-0.5">{n.body}</p>}
              <span className="text-xs text-slate-400 font-medium mt-1 block">{timeAgo(n.createdAt)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Notifications;
