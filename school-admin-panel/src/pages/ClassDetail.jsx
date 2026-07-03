import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';

const ClassDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { getSections, students, teachers, loadingStudents, refreshStudents, invalidateAcademic } = useAdmin();
    const { toast } = useToast();
    const schoolId = localStorage.getItem('scoolg_school_id');
    const cls = location.state?.cls;

    const [sections, setSections] = useState([]);
    const [activeSection, setActiveSection] = useState(null); // sectionName
    const [timetable, setTimetable] = useState(null);
    const [assigning, setAssigning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [savingName, setSavingName] = useState(false);
    const [diary, setDiary] = useState([]);
    const [diaryTeacher, setDiaryTeacher] = useState(null); // null = teacher list, else selected teacherId
    const [diaryMode, setDiaryMode] = useState(false);       // Teacher Diary tab active?
    const [classTimetables, setClassTimetables] = useState([]);
    const [loadingDiary, setLoadingDiary] = useState(false);

    const teacherById = useMemo(() => {
        const m = {}; (teachers || []).forEach((t) => { m[String(t._id)] = t; }); return m;
    }, [teachers]);

    useEffect(() => {
        if (!cls?._id) return;
        // force=true -> always fetch fresh sections (so a just-assigned class teacher
        // shows up on re-open instead of a stale cached value).
        setLoading(true);
        getSections(cls._id, true).then((secs) => {
            const list = secs || [];
            setSections(list);
            setActiveSection((prev) => prev || (list[0]?.sectionName ?? null));
        }).finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cls?._id]);

    // Subject -> teacher mapping comes from the class-section timetable.
    useEffect(() => {
        if (!cls?.className || !activeSection) { setTimetable(null); return; }
        let cancelled = false;
        axios.get(`${ADMIN_API_BASE}/timetable?schoolId=${schoolId}&className=${encodeURIComponent(cls.className)}&sectionName=${encodeURIComponent(activeSection)}`)
            .then((r) => { if (!cancelled) setTimetable(r.data && r.data.schedule ? r.data : null); })
            .catch(() => { if (!cancelled) setTimetable(null); });
        return () => { cancelled = true; };
    }, [cls?.className, activeSection, schoolId]);

    // Teacher diary for the whole class (all sections), newest first.
    useEffect(() => {
        if (!cls?.className) return;
        let cancelled = false;
        setLoadingDiary(true);
        axios.get(`${ADMIN_API_BASE}/teacher-diary?schoolId=${schoolId}&className=${encodeURIComponent(cls.className)}`)
            .then((r) => { if (!cancelled) setDiary(Array.isArray(r.data) ? r.data : []); })
            .catch(() => { if (!cancelled) setDiary([]); })
            .finally(() => { if (!cancelled) setLoadingDiary(false); });
        return () => { cancelled = true; };
    }, [cls?.className, schoolId]);

    // Class timetables (all sections) — used to list every teacher who teaches this class.
    useEffect(() => {
        if (!cls?.className) return;
        let cancelled = false;
        axios.get(`${ADMIN_API_BASE}/timetables?schoolId=${schoolId}`)
            .then((r) => { if (!cancelled) setClassTimetables((Array.isArray(r.data) ? r.data : []).filter((tt) => tt.className === cls.className)); })
            .catch(() => { if (!cancelled) setClassTimetables([]); });
        return () => { cancelled = true; };
    }, [cls?.className, schoolId]);

    if (!cls) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-500 font-bold">
                No class selected. <button onClick={() => navigate('/classes')} className="ml-2 text-blue-600 underline">Go to Classes</button>
            </div>
        );
    }

    const currentSection = sections.find((s) => s.sectionName === activeSection);
    // The sections API returns classTeacherId POPULATED (a full teacher object); fall
    // back to a raw-id lookup just in case.
    const _ct = currentSection?.classTeacherId;
    const classTeacher = _ct ? (typeof _ct === 'object' ? _ct : teacherById[String(_ct)]) : null;
    const classTeacherIdStr = _ct ? String(typeof _ct === 'object' ? _ct._id : _ct) : '';

    const assignClassTeacher = async (teacherId) => {
        if (!currentSection?._id) return;
        setAssigning(true);
        try {
            await axios.patch(`${ADMIN_API_BASE}/sections/${currentSection._id}`, { classTeacherId: teacherId || null });
            // refresh the shared sections cache so the assignment persists on re-open/refresh
            const fresh = await getSections(cls._id, true);
            setSections(fresh || []);
            toast.success(teacherId ? 'Class teacher assigned' : 'Class teacher removed');
        } catch (e) {
            toast.error('Could not update class teacher');
        } finally {
            setAssigning(false);
        }
    };

    const saveName = async () => {
        const name = nameInput.trim();
        if (!name || name === cls.className) { setEditingName(false); return; }
        setSavingName(true);
        try {
            await axios.patch(`${ADMIN_API_BASE}/classes/${cls._id}/rename`, { className: name });
            // Update navigation state so cls.className reflects the new name here, then
            // refresh students so the list re-matches the renamed class.
            navigate(location.pathname, { replace: true, state: { ...(location.state || {}), cls: { ...cls, className: name } } });
            invalidateAcademic?.();
            refreshStudents?.(true);
            toast.success('Class renamed');
            setEditingName(false);
        } catch (e) {
            toast.error(e.response?.data?.error || 'Failed to rename class');
        } finally {
            setSavingName(false);
        }
    };

    const sectionStudents = (students || [])
        .filter((s) => s.class === cls.className && s.section === activeSection)
        .sort((a, b) => (parseInt(a.rollNumber, 10) || 0) - (parseInt(b.rollNumber, 10) || 0));
    const classTotal = (students || []).filter((s) => s.class === cls.className).length;

    // subject -> Set(teacher names) from the timetable periods
    const subjectTeacherMap = new Map();
    if (timetable?.schedule) {
        timetable.schedule.forEach((day) => (day.periods || []).forEach((p) => {
            if (!p.subject) return;
            if (!subjectTeacherMap.has(p.subject)) subjectTeacherMap.set(p.subject, new Set());
            const tName = p.teacherName || teacherById[String(p.teacherId)]?.fullName;
            if (tName) subjectTeacherMap.get(p.subject).add(tName);
        }));
    }
    // Curriculum subjects (from the class) + any extra subjects seen in the timetable.
    const subjects = Array.from(new Set([...(cls.subjects || []), ...subjectTeacherMap.keys()]));

    const initials = (n) => (n || '?').trim().charAt(0).toUpperCase();
    const showSkeleton = loading || loadingStudents;

    const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; } };
    // Every teacher who teaches this class: class-teacher assignments + timetable + diary.
    const classTeacherIds = new Set();
    sections.forEach((s) => { const ct = s.classTeacherId; if (ct) classTeacherIds.add(String(typeof ct === 'object' ? ct._id : ct)); });
    diary.forEach((d) => { if (d.teacherId?._id) classTeacherIds.add(String(d.teacherId._id)); });
    classTimetables.forEach((tt) => (tt.schedule || []).forEach((day) => (day.periods || []).forEach((p) => { if (p.teacherId) classTeacherIds.add(String(p.teacherId)); })));
    const classTeachersList = Array.from(classTeacherIds).map((id) => teacherById[id]).filter(Boolean).sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    const diaryCountFor = (id) => diary.filter((d) => String(d.teacherId?._id) === String(id)).length;
    const selectedTeacher = diaryTeacher ? teacherById[String(diaryTeacher)] : null;
    const selectedEntries = diaryTeacher ? diary.filter((d) => String(d.teacherId?._id) === String(diaryTeacher)) : [];

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-[1200px] mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <button onClick={() => navigate('/classes')} aria-label="Back" className="shrink-0 -ml-1 w-9 h-9 grid place-items-center rounded-lg text-slate-700 hover:bg-slate-100 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                {editingName ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                            className="flex-1 min-w-0 h-10 px-3 rounded-xl border border-blue-300 bg-blue-50/40 text-lg sm:text-2xl font-black text-blue-700 outline-none focus:ring-2 focus:ring-blue-500/30" />
                        <button onClick={saveName} disabled={savingName} className="px-3 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-50">{savingName ? '…' : 'Save'}</button>
                        <button onClick={() => setEditingName(false)} className="px-3 h-10 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm">Cancel</button>
                    </div>
                ) : (
                    <>
                        <h1 className="text-xl sm:text-3xl font-black text-blue-700 tracking-tight truncate">{cls.className}</h1>
                        <button onClick={() => { setNameInput(cls.className); setEditingName(true); }} title="Rename class" className="shrink-0 w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                    </>
                )}
            </div>

            {showSkeleton ? <ClassDetailSkeleton /> : (<>
            {/* Top summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <SummaryCard icon="group" label="Total students" value={classTotal} />
                <SummaryCard icon="layers" label="Sections" value={sections.length} />
                <SummaryCard icon="menu_book" label="Subjects" value={subjects.length} />
                <SummaryCard icon="badge" label="In this section" value={sectionStudents.length} />
            </div>

            {/* Tabs: sections + Teacher Diary */}
            <div className="flex flex-wrap gap-2">
                {sections.map((s) => (
                    <button key={s._id} onClick={() => { setActiveSection(s.sectionName); setDiaryMode(false); }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${!diaryMode && activeSection === s.sectionName ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'}`}>
                        Section {s.sectionName}
                    </button>
                ))}
                <button onClick={() => setDiaryMode(true)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-1.5 ${diaryMode ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'}`}>
                    <span className="material-symbols-outlined text-[18px]">menu_book</span> Teacher Diary
                </button>
            </div>

            {!diaryMode && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: students */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-800 flex items-center gap-2"><span className="material-symbols-outlined text-blue-600">group</span> Students {activeSection ? `· Sec ${activeSection}` : ''}</h3>
                        <span className="text-sm font-bold text-slate-400">{sectionStudents.length}</span>
                    </div>
                    {sectionStudents.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <span className="material-symbols-outlined text-5xl text-slate-200 mb-2">person_off</span>
                            <p className="font-bold text-slate-500">No students in this section yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {sectionStudents.map((s, i) => (
                                <button key={s._id} onClick={() => navigate('/students/profile', { state: { student: s } })}
                                    className="w-full text-left px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                    <span className="w-7 text-sm font-bold text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                                    <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-500 overflow-hidden shrink-0">
                                        {s.profileImageUrl ? <img src={s.profileImageUrl} alt="" className="w-full h-full object-cover" /> : initials(s.firstName)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{s.firstName} {s.lastName}</p>
                                        <p className="text-[11px] font-medium text-slate-400">ID: {s.studentAppId}</p>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600 shrink-0">#{s.rollNumber || 'NA'}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: class teacher + subject teachers */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-extrabold text-slate-800 mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-blue-600">co_present</span> Class Teacher</h3>
                        {classTeacher ? (
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold overflow-hidden shrink-0">
                                    {classTeacher.profileImageUrl ? <img src={classTeacher.profileImageUrl} alt="" className="w-full h-full object-cover" /> : initials(classTeacher.fullName)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">{classTeacher.fullName}</p>
                                    <p className="text-[11px] font-medium text-slate-400 truncate">{classTeacher.email || classTeacher.phone || 'Teacher'}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No class teacher assigned for Section {activeSection}.</p>
                        )}

                        {/* Assign / change the class teacher right here */}
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-1.5">
                            {classTeacher ? 'Change class teacher' : 'Assign class teacher'}
                        </label>
                        <select
                            value={classTeacherIdStr}
                            onChange={(e) => assignClassTeacher(e.target.value)}
                            disabled={assigning || !currentSection}
                            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50">
                            <option value="">— Not assigned —</option>
                            {(teachers || []).map((t) => <option key={t._id} value={t._id}>{t.fullName}</option>)}
                        </select>
                        {!currentSection && <p className="text-[11px] text-slate-400 mt-2">Pick a section first.</p>}
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-extrabold text-slate-800 mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-blue-600">menu_book</span> Subjects &amp; Teachers</h3>
                        {subjects.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No subjects added yet.</p>
                        ) : (
                            <div className="space-y-2.5">
                                {subjects.map((sub) => {
                                    const tset = subjectTeacherMap.get(sub);
                                    const tNames = tset ? Array.from(tset) : [];
                                    return (
                                        <div key={sub} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                                            <span className="text-sm font-bold text-slate-700">{sub}</span>
                                            <span className={`text-xs font-semibold text-right ${tNames.length ? 'text-slate-500' : 'text-slate-300 italic'}`}>
                                                {tNames.length ? tNames.join(', ') : 'Not assigned'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">Subject teachers are derived from this section's timetable. Set them up in the Timetable section.</p>
                    </div>
                </div>
            </div>
            )}

            {/* Teacher Diary tab — list of teachers who teach this class -> click for their diary */}
            {diaryMode && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    {diaryTeacher && (
                        <button onClick={() => setDiaryTeacher(null)} title="Back to teachers" className="shrink-0 w-8 h-8 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"><span className="material-symbols-outlined text-[20px]">arrow_back</span></button>
                    )}
                    <h3 className="font-extrabold text-slate-800 flex items-center gap-2 flex-1 min-w-0">
                        <span className="material-symbols-outlined text-blue-600">menu_book</span>
                        <span className="truncate">{selectedTeacher ? `${selectedTeacher.fullName} — Diary` : 'Teacher Diary'}</span>
                    </h3>
                </div>

                {loadingDiary ? (
                    <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-16" />)}</div>
                ) : !diaryTeacher ? (
                    classTeachersList.length === 0 ? (
                        <div className="py-12 text-center text-slate-400"><span className="material-symbols-outlined text-5xl text-slate-200 mb-2">group_off</span><p className="font-bold text-slate-500">No teachers linked to this class yet</p></div>
                    ) : (
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {classTeachersList.map((t) => {
                                const cnt = diaryCountFor(t._id);
                                return (
                                    <button key={t._id} onClick={() => setDiaryTeacher(String(t._id))} className="text-left flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 transition-colors">
                                        <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold overflow-hidden shrink-0">{t.profileImageUrl ? <img src={t.profileImageUrl} className="w-full h-full object-cover" alt="" /> : initials(t.fullName)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 truncate">{t.fullName}</p>
                                            <p className="text-[11px] font-semibold text-slate-400">{cnt} diary {cnt === 1 ? 'entry' : 'entries'}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-300 shrink-0">chevron_right</span>
                                    </button>
                                );
                            })}
                        </div>
                    )
                ) : (
                    <div className="p-6 space-y-3">
                        {selectedEntries.length === 0 ? (
                            <div className="py-10 text-center text-slate-400"><span className="material-symbols-outlined text-5xl text-slate-200 mb-2">edit_note</span><p className="font-bold text-slate-500">No diary entries from this teacher yet</p></div>
                        ) : selectedEntries.map((entry) => (
                            <div key={entry._id} className="border border-slate-100 rounded-2xl p-4">
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <span className="text-xs font-bold text-blue-600 inline-flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">calendar_today</span>{fmtDate(entry.date)}</span>
                                    <div className="flex flex-wrap gap-2 justify-end">
                                        {entry.subject && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded">{entry.subject}</span>}
                                        {entry.sectionName && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[11px] font-bold rounded">Sec {entry.sectionName}</span>}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{entry.note}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            )}
            </>)}
        </div>
    );
};

// Loading shimmer shown while sections/students load.
const Bar = ({ className = '' }) => <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
const ClassDetailSkeleton = () => (
    <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                    <Bar className="h-7 w-7 rounded-lg" />
                    <Bar className="h-6 w-12" />
                    <Bar className="h-2.5 w-20" />
                </div>
            ))}
        </div>
        <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, i) => <Bar key={i} className="h-9 w-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
                <Bar className="h-5 w-40" />
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Bar className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2"><Bar className="h-3.5 w-40" /><Bar className="h-2.5 w-24" /></div>
                        <Bar className="h-3.5 w-10" />
                    </div>
                ))}
            </div>
            <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
                    <Bar className="h-5 w-32" />
                    <div className="flex items-center gap-3"><Bar className="h-12 w-12 rounded-full" /><div className="flex-1 space-y-2"><Bar className="h-3.5 w-28" /><Bar className="h-2.5 w-20" /></div></div>
                    <Bar className="h-11 w-full" />
                </div>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-3">
                    <Bar className="h-5 w-40" />
                    {[...Array(4)].map((_, i) => <div key={i} className="flex justify-between"><Bar className="h-3.5 w-20" /><Bar className="h-3.5 w-24" /></div>)}
                </div>
            </div>
        </div>
    </>
);

const SummaryCard = ({ icon, label, value }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2">
        <span className="material-symbols-outlined text-blue-600 text-2xl">{icon}</span>
        <div>
            <p className="text-2xl font-extrabold text-slate-800 leading-none">{value}</p>
            <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wide mt-1">{label}</p>
        </div>
    </div>
);

export default ClassDetail;
