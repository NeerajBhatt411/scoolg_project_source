import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';

const ClassDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { getSections, students, teachers } = useAdmin();
    const schoolId = localStorage.getItem('scoolg_school_id');
    const cls = location.state?.cls;

    const [sections, setSections] = useState([]);
    const [activeSection, setActiveSection] = useState(null); // sectionName
    const [timetable, setTimetable] = useState(null);

    const teacherById = useMemo(() => {
        const m = {}; (teachers || []).forEach((t) => { m[String(t._id)] = t; }); return m;
    }, [teachers]);

    useEffect(() => {
        if (!cls?._id) return;
        getSections(cls._id).then((secs) => {
            const list = secs || [];
            setSections(list);
            setActiveSection((prev) => prev || (list[0]?.sectionName ?? null));
        });
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

    if (!cls) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-500 font-bold">
                No class selected. <button onClick={() => navigate('/classes')} className="ml-2 text-blue-600 underline">Go to Classes</button>
            </div>
        );
    }

    const currentSection = sections.find((s) => s.sectionName === activeSection);
    const classTeacher = currentSection?.classTeacherId ? teacherById[String(currentSection.classTeacherId)] : null;

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

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-[1200px] mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <button onClick={() => navigate('/classes')} aria-label="Back" className="shrink-0 -ml-1 w-9 h-9 grid place-items-center rounded-lg text-slate-700 hover:bg-slate-100 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <h1 className="text-xl sm:text-3xl font-black text-blue-700 tracking-tight truncate">{cls.className}</h1>
            </div>

            {/* Top summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <SummaryCard icon="group" label="Total students" value={classTotal} />
                <SummaryCard icon="layers" label="Sections" value={sections.length} />
                <SummaryCard icon="menu_book" label="Subjects" value={subjects.length} />
                <SummaryCard icon="badge" label="In this section" value={sectionStudents.length} />
            </div>

            {/* Section tabs */}
            {sections.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {sections.map((s) => (
                        <button key={s._id} onClick={() => setActiveSection(s.sectionName)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeSection === s.sectionName ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'}`}>
                            Section {s.sectionName}
                        </button>
                    ))}
                </div>
            )}

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
        </div>
    );
};

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
