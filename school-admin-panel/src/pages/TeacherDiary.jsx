import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import ProfileButton from '../components/ProfileButton';

const fmt = (d) => { try { return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; } };

const TeacherDiary = () => {
    const schoolId = localStorage.getItem('scoolg_school_id');
    const [entries, setEntries] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fTeacher, setFTeacher] = useState('');
    const [fDate, setFDate] = useState('');

    useEffect(() => {
        if (!schoolId) return;
        setLoading(true);
        Promise.all([
            axios.get(`${ADMIN_API_BASE}/teacher-diary?schoolId=${schoolId}&_=${Date.now()}`),
            axios.get(`${ADMIN_API_BASE}/teachers?schoolId=${schoolId}`),
        ]).then(([d, t]) => {
            setEntries(Array.isArray(d.data) ? d.data : []);
            setTeachers(Array.isArray(t.data) ? t.data : []);
        }).catch((e) => console.error('Diary load failed', e)).finally(() => setLoading(false));
    }, [schoolId]);

    const filtered = useMemo(() => entries.filter((e) => {
        if (fTeacher && String(e.teacherId?._id || e.teacherId) !== fTeacher) return false;
        if (fDate && e.date !== fDate) return false;
        return true;
    }), [entries, fTeacher, fDate]);

    return (
        <>
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-on-surface tracking-tight w-full md:w-auto">Teacher Diary</h2>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <ProfileButton size={40} />
                </div>
            </header>

            <div className="min-h-[calc(100vh-72px)] bg-slate-50/50 p-4 sm:p-8 space-y-6">
                <p className="text-on-surface-variant font-medium text-sm -mt-2">Record of what every teacher has taught — class, subject & date.</p>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <select value={fTeacher} onChange={(e) => setFTeacher(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-blue-500">
                        <option value="">All teachers</option>
                        {teachers.map((t) => <option key={t._id} value={t._id}>{t.fullName}</option>)}
                    </select>
                    <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-blue-500" />
                    {(fTeacher || fDate) && (
                        <button onClick={() => { setFTeacher(''); setFDate(''); }} className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors">Clear</button>
                    )}
                    <span className="ml-auto inline-flex items-center gap-2 text-[12px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>{filtered.length} record{filtered.length === 1 ? '' : 's'}
                    </span>
                </div>

                {loading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-200 rounded-3xl py-16 text-center text-slate-400">
                        <span className="material-symbols-outlined text-5xl opacity-30 mb-2">menu_book</span>
                        <p className="text-base font-bold text-slate-600">No diary records yet.</p>
                        <p className="text-sm">Teachers can log entries from the teacher app, or add them from a teacher's profile.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="hidden sm:grid grid-cols-[110px_1fr_120px_120px_2fr] gap-3 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <span>Date</span><span>Teacher</span><span>Class</span><span>Subject</span><span>What was taught</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {filtered.map((e) => (
                                <div key={e._id} className="grid grid-cols-1 sm:grid-cols-[110px_1fr_120px_120px_2fr] gap-1 sm:gap-3 px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                                    <span className="text-sm font-bold text-blue-600">{fmt(e.date)}</span>
                                    <span className="text-sm font-bold text-slate-800">{e.teacherId?.fullName || 'Teacher'}{e.createdByRole === 'teacher' ? '' : ' '}<span className="text-[10px] font-bold text-slate-400">{e.createdByRole === 'admin' ? '(admin)' : ''}</span></span>
                                    <span className="text-sm font-semibold text-slate-600">{e.className}-{e.sectionName}</span>
                                    <span className="text-sm font-semibold text-slate-600">{e.subject || '—'}</span>
                                    <span className="text-sm font-medium text-slate-800">{e.note}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default TeacherDiary;
