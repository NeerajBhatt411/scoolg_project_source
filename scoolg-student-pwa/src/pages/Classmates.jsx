import React, { useState, useEffect } from 'react';
import { Cake, Users } from 'lucide-react';
import api from '../utils/api';
import { getCached, peekCache } from '../utils/cache';

const CACHE_KEY = 'student:classmates';
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const bday = (dob) => { if (!dob) return null; const d = new Date(dob); return isNaN(d) ? null : { day: d.getDate(), month: d.getMonth() }; };
const bdayLabel = (dob) => { const b = bday(dob); return b ? `${b.day} ${MON[b.month]}` : ''; };

const avatarBg = (gender) => (gender === 'Female' ? 'from-pink-500 to-rose-500' : gender === 'Male' ? 'from-blue-500 to-indigo-500' : 'from-slate-400 to-slate-500');

const Avatar = ({ c, size = 'w-16 h-16' }) => (
    c.photo
        ? <img src={c.photo} alt={c.name} className={`${size} rounded-2xl object-cover bg-slate-100`} loading="lazy" />
        : <div className={`${size} rounded-2xl bg-gradient-to-br ${avatarBg(c.gender)} text-white grid place-items-center font-black text-xl`}>{(c.name || '?')[0]?.toUpperCase()}</div>
);

const Classmates = () => {
    const [data, setData] = useState(() => peekCache(CACHE_KEY) || null);
    const [loading, setLoading] = useState(() => !peekCache(CACHE_KEY));

    useEffect(() => {
        let alive = true;
        getCached(CACHE_KEY, () => api.get('/student/classmates').then((r) => r.data))
            .then((d) => { if (alive) setData(d); })
            .catch(() => { if (alive) setData(null); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, []);

    const list = data?.classmates || [];
    const thisMonth = new Date().getMonth();
    const birthdays = list.filter((c) => bday(c.dob)?.month === thisMonth)
        .sort((a, b) => (bday(a.dob).day - bday(b.dob).day));

    return (
        <div className="min-h-full bg-[#f8fafc] pb-28">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
                <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Classmates</h2>
                    <p className="text-sm text-slate-500 font-medium">
                        {data ? `Class ${data.className}${data.section ? ` - ${data.section}` : ''} · ${list.length} students` : 'Your class roster'}
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-40 bg-white rounded-[24px] border border-slate-100 animate-pulse" />)}
                    </div>
                ) : list.length === 0 ? (
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full grid place-items-center mb-5"><Users size={36} /></div>
                        <h3 className="text-xl font-black text-slate-900 mb-1">No classmates yet</h3>
                        <p className="text-slate-500 font-medium text-sm">Your class list will show up here.</p>
                    </div>
                ) : (
                    <>
                        {/* Birthdays this month */}
                        {birthdays.length > 0 && (
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[28px] p-5 text-white shadow-lg shadow-blue-600/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <Cake size={18} /><h3 className="font-black text-sm uppercase tracking-widest">Birthdays this month</h3>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                                    {birthdays.map((c) => (
                                        <div key={c.id} className="shrink-0 flex flex-col items-center gap-1.5 w-16">
                                            <div className="ring-2 ring-white/40 rounded-2xl"><Avatar c={c} size="w-14 h-14" /></div>
                                            <p className="text-[11px] font-black text-center leading-tight truncate w-full">{c.name.split(' ')[0]}</p>
                                            <p className="text-[10px] font-bold text-white/70 -mt-1">{bdayLabel(c.dob)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Full roster */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {list.map((c) => (
                                <div key={c.id} className={`bg-white rounded-[24px] border shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 flex flex-col items-center text-center ${c.isMe ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-100'}`}>
                                    <Avatar c={c} />
                                    <p className="font-black text-slate-900 text-sm mt-3 leading-tight line-clamp-2">{c.name}{c.isMe && <span className="text-blue-600"> (You)</span>}</p>
                                    <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold text-slate-400">
                                        {c.rollNumber && <span>Roll {c.rollNumber}</span>}
                                        {c.rollNumber && bdayLabel(c.dob) && <span>·</span>}
                                        {bdayLabel(c.dob) && <span className="flex items-center gap-0.5 text-blue-500"><Cake size={11} /> {bdayLabel(c.dob)}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Classmates;
