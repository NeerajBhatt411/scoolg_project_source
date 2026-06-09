import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';
import ProfileButton from '../components/ProfileButton';
import MenuButton from '../components/MenuButton';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const CATEGORIES = [
    { key: 'Holiday', color: '#e11d48', bg: '#fff1f2', icon: 'beach_access' },
    { key: 'Annual Function', color: '#7c3aed', bg: '#f5f3ff', icon: 'celebration' },
    { key: 'Sports Day', color: '#059669', bg: '#ecfdf5', icon: 'sports_soccer' },
    { key: 'Exam', color: '#d97706', bg: '#fffbeb', icon: 'history_edu' },
    { key: 'Meeting', color: '#2563eb', bg: '#eff6ff', icon: 'groups' },
    { key: 'Event', color: '#0891b2', bg: '#ecfeff', icon: 'event' },
    { key: 'Other', color: '#64748b', bg: '#f1f5f9', icon: 'push_pin' },
];
const catOf = (k) => CATEGORIES.find((c) => c.key === k) || CATEGORIES[CATEGORIES.length - 1];

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstWeekday = (y, m) => new Date(y, m, 1).getDay();
const pad = (n) => String(n).padStart(2, '0');
const dateStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayStr = () => new Date().toISOString().split('T')[0];
const prettyDate = (s) => {
    const d = new Date(s + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const Calendar = () => {
    const { schoolId } = useAdmin();
    const [year, setYear] = useState(new Date().getFullYear());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openMonth, setOpenMonth] = useState(null); // 0-11 or null
    const [selectedDate, setSelectedDate] = useState(null);
    const [form, setForm] = useState({ title: '', category: 'Event', description: '' });
    const [otherType, setOtherType] = useState(''); // custom label when category = Other
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [justAdded, setJustAdded] = useState(false); // brief "scheduled" confirmation

    const TITLE_MAX = 60;
    const OTHER_MAX = 20;

    const load = async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            // _ cache-buster so a freshly added/deleted event is never served stale.
            const res = await axios.get(`${ADMIN_API_BASE}/calendar?schoolId=${schoolId}&year=${year}&_=${Date.now()}`);
            setEvents(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('Calendar load failed', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [schoolId, year]);

    // events grouped by date string and by month
    const byDate = useMemo(() => {
        const m = {};
        for (const ev of events) (m[ev.date] ||= []).push(ev);
        return m;
    }, [events]);
    const byMonth = useMemo(() => {
        const m = {};
        for (const ev of events) (m[ev.month] ||= []).push(ev);
        Object.values(m).forEach((arr) => arr.sort((a, b) => a.date.localeCompare(b.date)));
        return m;
    }, [events]);

    const openMonthModal = (mIdx) => {
        setOpenMonth(mIdx);
        setError('');
        const now = new Date();
        if (now.getFullYear() === year && now.getMonth() === mIdx) setSelectedDate(todayStr());
        else setSelectedDate(dateStr(year, mIdx, 1));
        setForm({ title: '', category: 'Event', description: '' });
        setOtherType('');
        setJustAdded(false);
    };
    const closeModal = () => { setOpenMonth(null); setSelectedDate(null); };

    const addEvent = async () => {
        if (!selectedDate) { setError('Please pick a day.'); return; }
        if (!form.title.trim()) { setError('Please enter an event title.'); return; }
        // When "Other" is chosen, use the custom type the user typed (falls back to "Other").
        const category = form.category === 'Other' && otherType.trim() ? otherType.trim() : form.category;
        setSaving(true); setError('');
        try {
            const res = await axios.post(`${ADMIN_API_BASE}/calendar`, {
                schoolId,
                title: form.title.trim(),
                category,
                date: selectedDate,
                description: form.description.trim(),
            });
            // Optimistic: drop the saved event straight into state so it shows
            // immediately (and reliably) — then refresh from the server.
            if (res.data && res.data._id) {
                setEvents((prev) => [...prev.filter((e) => e._id !== res.data._id), res.data]);
            }
            setForm({ title: '', category: 'Event', description: '' });
            setOtherType('');
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 2200);
            load();
        } catch (e) {
            setError(e.response?.data?.error || 'Could not add event.');
        } finally {
            setSaving(false);
        }
    };

    const deleteEvent = async (id) => {
        try {
            await axios.delete(`${ADMIN_API_BASE}/calendar/${id}`);
            setEvents((prev) => prev.filter((e) => e._id !== id));
        } catch (e) {
            console.error('Delete failed', e);
        }
    };

    const CUR_YEAR = new Date().getFullYear();
    const yearLocked = year < CUR_YEAR; // whole past years are locked; current + future are open
    const totalEvents = events.length;
    const selectedDayEvents = (selectedDate && byDate[selectedDate]) || [];

    return (
        <>
            {/* Top bar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <MenuButton />
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-on-surface tracking-tight">School Calendar</h2>
                </div>
                <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
                    <button onClick={() => setYear((y) => y - 1)} className="w-9 h-9 grid place-items-center rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <span className="font-black text-slate-900 text-lg tabular-nums w-16 text-center">{year}</span>
                    <button onClick={() => setYear((y) => y + 1)} className="w-9 h-9 grid place-items-center rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                    {year !== CUR_YEAR && (
                        <button onClick={() => setYear(CUR_YEAR)} className="ml-1 px-3 h-9 rounded-xl bg-blue-50 text-blue-600 text-[12px] font-bold hover:bg-blue-100 transition-colors whitespace-nowrap">Go to {CUR_YEAR}</button>
                    )}
                </div>
                    <ProfileButton size={40} />
                </div>
            </header>

            <div className="min-h-[calc(100vh-72px)] bg-slate-50/50 p-4 sm:p-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <p className="text-on-surface-variant font-medium text-sm">
                        Plan holidays, functions & special days. Scheduled events show on the dashboard as school-calendar notices.
                    </p>
                    <span className="inline-flex items-center gap-2 text-[12px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>{totalEvents} event{totalEvents === 1 ? '' : 's'} in {year}
                    </span>
                </div>

                {/* category legend */}
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                        <span key={c.key} className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: c.bg, color: c.color }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }}></span>{c.key}
                        </span>
                    ))}
                </div>

                {/* 3 x 4 month grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {(loading && events.length === 0) ? (
                        Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-4 w-24 bg-slate-200 rounded-full animate-pulse"></div>
                                    <div className="h-4 w-6 bg-slate-100 rounded-full animate-pulse"></div>
                                </div>
                                <div className="space-y-2.5 min-h-[84px]">
                                    <div className="h-3 w-full bg-slate-100 rounded-full animate-pulse"></div>
                                    <div className="h-3 w-4/5 bg-slate-100 rounded-full animate-pulse"></div>
                                    <div className="h-3 w-3/5 bg-slate-100 rounded-full animate-pulse"></div>
                                </div>
                                <div className="mt-4 h-10 w-full bg-slate-100 rounded-xl animate-pulse"></div>
                            </div>
                        ))
                    ) : MONTHS.map((name, mIdx) => {
                        const list = byMonth[mIdx] || [];
                        const isCurrent = new Date().getFullYear() === year && new Date().getMonth() === mIdx;
                        return (
                            <div
                                key={name}
                                onClick={() => { if (!yearLocked) openMonthModal(mIdx); }}
                                className={`group bg-white rounded-[28px] p-5 border transition-all duration-300 ${yearLocked ? 'border-slate-100 opacity-75 cursor-default' : `cursor-pointer active:scale-[0.98] ${isCurrent ? 'border-blue-200 shadow-[0_20px_45px_rgba(37,99,235,0.10)]' : 'border-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_55px_rgba(37,99,235,0.10)] hover:border-blue-100'}`}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-slate-900 tracking-tight text-[17px]">{name}</h3>
                                        {isCurrent && <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Now</span>}
                                    </div>
                                    {yearLocked
                                        ? <span className="material-symbols-outlined text-[18px] text-slate-300">lock</span>
                                        : (list.length > 0 && <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">{list.length}</span>)}
                                </div>

                                <div className="min-h-[84px]">
                                    {list.length === 0 ? (
                                        <div className="h-[84px] grid place-items-center text-slate-300">
                                            <span className="text-[12px] font-semibold">No events</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                            {list.slice(0, 4).map((ev) => {
                                                const c = catOf(ev.category);
                                                const day = Number(ev.date.split('-')[2]);
                                                return (
                                                    <div key={ev._id} className="flex items-center gap-1.5 min-w-0">
                                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }}></span>
                                                        <span className="text-[10.5px] font-black text-slate-400 tabular-nums shrink-0">{pad(day)}</span>
                                                        <span className="text-[11.5px] font-semibold text-slate-700 truncate">{ev.title}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {list.length > 4 && <p className="text-[11px] font-bold text-blue-600 mt-1.5">+{list.length - 4} more</p>}
                                </div>

                                <button
                                    disabled={yearLocked}
                                    onClick={(e) => { e.stopPropagation(); if (!yearLocked) openMonthModal(mIdx); }}
                                    className={`mt-4 w-full h-10 rounded-xl border border-dashed text-[13px] font-bold inline-flex items-center justify-center gap-1.5 transition-all ${yearLocked ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-500 group-hover:border-blue-300 group-hover:text-blue-600 group-hover:bg-blue-50/50'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{yearLocked ? 'lock' : 'add'}</span>{yearLocked ? 'Locked' : 'Add event'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add-event modal — clean vertical form */}
            {openMonth !== null && (
                <div onClick={closeModal} className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:max-w-lg rounded-t-[28px] sm:rounded-[28px] shadow-2xl max-h-[94vh] flex flex-col overflow-hidden">
                        {/* header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                            <div>
                                <h3 className="font-black text-slate-900 text-xl tracking-tight">Add an event</h3>
                                <p className="text-[13px] font-bold text-blue-600 mt-0.5">{MONTHS[openMonth]} {year}</p>
                            </div>
                            <button onClick={closeModal} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 grid place-items-center text-slate-600 transition-colors shrink-0">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {/* scrollable form body */}
                        <div className="overflow-y-auto px-6 py-4 space-y-4">
                            {/* 1. Title */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-wider">
                                        <span className="text-blue-600">1.</span> Event name <span className="text-rose-500">*</span>
                                    </label>
                                    <span className={`text-[11px] font-bold tabular-nums ${form.title.length >= TITLE_MAX ? 'text-rose-500' : 'text-slate-400'}`}>{form.title.length}/{TITLE_MAX}</span>
                                </div>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    maxLength={TITLE_MAX}
                                    placeholder="e.g. Annual Function, Diwali Holiday"
                                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-[15px] outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                                />
                            </div>

                            {/* 2. Date */}
                            <div>
                                <label className="block text-[12px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                    <span className="text-blue-600">2.</span> Which day? <span className="text-rose-500">*</span>
                                    {selectedDate && <span className="ml-2 text-blue-600 normal-case tracking-normal">{prettyDate(selectedDate)}</span>}
                                </label>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                                    <div className="grid grid-cols-7 gap-1 mb-1">
                                        {WEEKDAYS.map((w, i) => <div key={i} className="text-center text-[10px] font-black text-slate-400">{w}</div>)}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {Array.from({ length: firstWeekday(year, openMonth) }).map((_, i) => <div key={`b${i}`} />)}
                                        {Array.from({ length: daysInMonth(year, openMonth) }).map((_, i) => {
                                            const day = i + 1;
                                            const ds = dateStr(year, openMonth, day);
                                            const dayEvents = byDate[ds] || [];
                                            const isSel = selectedDate === ds;
                                            const isToday = ds === todayStr();
                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => { setSelectedDate(ds); setError(''); }}
                                                    className={`h-9 rounded-lg flex items-center justify-center text-[13px] font-bold transition-all relative ${isSel ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' : isToday ? 'bg-blue-100 text-blue-700' : 'bg-white text-slate-700 hover:bg-blue-50'}`}
                                                >
                                                    <span className="tabular-nums">{day}</span>
                                                    {dayEvents.length > 0 && (
                                                        <span className="absolute bottom-1 flex gap-0.5">
                                                            {dayEvents.slice(0, 3).map((ev, k) => (
                                                                <span key={k} className="w-1 h-1 rounded-full" style={{ background: isSel ? '#fff' : catOf(ev.category).color }}></span>
                                                            ))}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Category */}
                            <div>
                                <label className="block text-[12px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                    <span className="text-blue-600">3.</span> Type of event
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {CATEGORIES.map((c) => {
                                        const active = form.category === c.key;
                                        return (
                                            <button
                                                key={c.key}
                                                onClick={() => setForm({ ...form, category: c.key })}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-bold border transition-all"
                                                style={active
                                                    ? { background: c.color, color: '#fff', borderColor: c.color }
                                                    : { background: c.bg, color: c.color, borderColor: 'transparent' }}
                                            >
                                                <span className="material-symbols-outlined text-[15px]">{c.icon}</span>{c.key}
                                            </button>
                                        );
                                    })}
                                </div>
                                {form.category === 'Other' && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] font-bold text-slate-500">Name this type</span>
                                            <span className={`text-[11px] font-bold tabular-nums ${otherType.length >= OTHER_MAX ? 'text-rose-500' : 'text-slate-400'}`}>{otherType.length}/{OTHER_MAX}</span>
                                        </div>
                                        <input
                                            value={otherType}
                                            onChange={(e) => setOtherType(e.target.value)}
                                            maxLength={OTHER_MAX}
                                            placeholder="e.g. PTM, Workshop, Trip"
                                            className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-[14px] outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[12px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                                    Description <span className="text-slate-400">(optional)</span>
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Add a note for this event…"
                                    className="w-full h-16 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-[14px] outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all resize-none"
                                />
                            </div>

                            {error && <p className="text-[13px] font-bold text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">{error}</p>}

                            {/* already scheduled on this day (multiple events supported, scrolls if many) */}
                            {selectedDayEvents.length > 0 && (
                                <div>
                                    <p className="text-[12px] font-black text-slate-500 uppercase tracking-wider mb-2">
                                        Already on this day <span className="text-blue-600">({selectedDayEvents.length})</span>
                                    </p>
                                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                        {selectedDayEvents.map((ev) => {
                                            const c = catOf(ev.category);
                                            return (
                                                <div key={ev._id} className="flex items-start gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                                    <div className="w-9 h-9 rounded-xl grid place-items-center shrink-0" style={{ background: c.bg, color: c.color }}>
                                                        <span className="material-symbols-outlined text-[18px]">{c.icon}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-900 text-[14px] leading-tight">{ev.title}</p>
                                                        <p className="text-[11px] font-bold mt-0.5" style={{ color: c.color }}>{ev.category}</p>
                                                        {ev.description && <p className="text-[12px] text-slate-500 mt-1 leading-snug">{ev.description}</p>}
                                                    </div>
                                                    <button onClick={() => deleteEvent(ev._id)} className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 grid place-items-center transition-colors shrink-0">
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* sticky footer action */}
                        <div className="px-6 py-4 border-t border-slate-100 shrink-0">
                            {justAdded && (
                                <p className="mb-2.5 flex items-center justify-center gap-1.5 text-[13px] font-bold text-emerald-600 bg-emerald-50 rounded-xl py-2">
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    Event scheduled — add another or close
                                </p>
                            )}
                            <button
                                onClick={addEvent}
                                disabled={saving || !selectedDate}
                                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25"
                            >
                                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                {saving ? 'Scheduling…' : 'Schedule event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Calendar;
