import React, { useState, useEffect } from 'react';
import ProfileButton from '../components/ProfileButton';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';

const Timetable = () => {
    const schoolId = localStorage.getItem('scoolg_school_id');
    // classes & teachers come from the shared cache; sections are cached per class.
    const { classes, teachers, getSections, invalidateAcademic } = useAdmin();
    const [sections, setSections] = useState([]);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [periodNumbers, setPeriodNumbers] = useState([1, 2, 3, 4, 5, 6]);

    const [selectedClassObj, setSelectedClassObj] = useState(null);
    const [selectedSectionObj, setSelectedSectionObj] = useState(null);
    const [showAddClassModal, setShowAddClassModal] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [newSectionName, setNewSectionName] = useState('');
    const [newClassSubjects, setNewClassSubjects] = useState(''); // Comma separated subjects
    const [showTimeModal, setShowTimeModal] = useState(false);

    // Auto-schedule states
    const [autoStartTime, setAutoStartTime] = useState('08:00');
    const [autoDuration, setAutoDuration] = useState('40');
    const [lunchAfterPeriod, setLunchAfterPeriod] = useState('4');
    const [lunchDuration, setLunchDuration] = useState('30');
    const [timetable, setTimetable] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editSchedule, setEditSchedule] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Copy Modal state
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copyToClass, setCopyToClass] = useState('');
    const [copyToSection, setCopyToSection] = useState('');
    const [copyToSections, setCopyToSections] = useState([]);

    // Copy Day Modal state
    const [showCopyDayModal, setShowCopyDayModal] = useState(false);
    const [copyDaySource, setCopyDaySource] = useState('Monday');
    const [copyDayTargets, setCopyDayTargets] = useState([]);

    // Pick a default class once the shared classes list is available.
    useEffect(() => {
        if (classes.length > 0) setSelectedClassObj((prev) => prev || classes[0]);
        else setSelectedClassObj(null);
    }, [classes]);

    // Fetch Sections when selectedClass changes (cached per class in context).
    useEffect(() => {
        let active = true;
        if (!selectedClassObj) {
            setSections([]);
            setSelectedSectionObj(null);
            return;
        }
        getSections(selectedClassObj._id).then((data) => {
            if (!active) return;
            setSections(data);
            setSelectedSectionObj(data && data.length > 0 ? data[0] : null);
        });
        return () => { active = false; };
    }, [selectedClassObj, getSections]);

    // Fetch Target Sections for Copy Modal
    useEffect(() => {
        let active = true;
        if (!showCopyModal) return;
        if (!copyToClass) {
            setCopyToSections([]);
            setCopyToSection('');
            return;
        }
        getSections(copyToClass).then((data) => {
            if (!active) return;
            setCopyToSections(data);
            setCopyToSection(data && data.length > 0 ? data[0]._id : '');
        });
        return () => { active = false; };
    }, [copyToClass, showCopyModal, getSections]);

    const fetchTimetable = async () => {
        if (!selectedClassObj || !selectedSectionObj) {
            setTimetable(null);
            initEmptySchedule();
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const res = await axios.get(`${ADMIN_API_BASE}/timetable?schoolId=${schoolId}&className=${selectedClassObj.className}&sectionName=${selectedSectionObj.sectionName}`);
            if (res.data && res.data.schedule) {
                const fetchedSchedule = res.data.schedule;
                setTimetable(res.data);
                setEditSchedule(fetchedSchedule);

                if (fetchedSchedule[0] && fetchedSchedule[0].periods) {
                    const maxPeriods = fetchedSchedule[0].periods.length || 6;
                    setPeriodNumbers(Array.from({ length: maxPeriods }, (_, i) => i + 1));
                }
            } else {
                setTimetable(null);
                initEmptySchedule();
            }
        } catch (error) {
            console.error(error);
            setTimetable(null);
            initEmptySchedule();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (schoolId && selectedClassObj && selectedSectionObj) fetchTimetable();
    }, [selectedClassObj, selectedSectionObj, schoolId]);

    const initEmptySchedule = () => {
        const empty = days.map(day => ({
            dayOfWeek: day,
            periods: periodNumbers.map(p => ({
                periodNumber: p,
                subject: '',
                teacherId: '',
                teacherName: '',
                startTime: '',
                endTime: ''
            }))
        }));
        setEditSchedule(empty);
    };

    const handleCellChange = (dayIndex, periodIndex, field, value) => {
        const newSchedule = [...editSchedule];
        if (field === 'teacherId') {
            const teacher = teachers.find(t => t._id === value);
            newSchedule[dayIndex].periods[periodIndex].teacherId = value;
            newSchedule[dayIndex].periods[periodIndex].teacherName = teacher ? teacher.fullName : '';
        } else {
            newSchedule[dayIndex].periods[periodIndex][field] = value;
        }
        setEditSchedule(newSchedule);
    };

    const addPeriod = () => {
        const nextPeriodNumber = periodNumbers.length + 1;
        setPeriodNumbers([...periodNumbers, nextPeriodNumber]);
        const newSchedule = [...editSchedule];
        newSchedule.forEach(day => {
            day.periods.push({
                periodNumber: nextPeriodNumber,
                subject: '',
                teacherId: '',
                teacherName: '',
                startTime: '',
                endTime: ''
            });
        });
        setEditSchedule(newSchedule);
    };

    const removePeriod = () => {
        if (periodNumbers.length <= 1) return;
        setPeriodNumbers(periodNumbers.slice(0, -1));
        const newSchedule = [...editSchedule];
        newSchedule.forEach(day => {
            day.periods.pop();
        });
        setEditSchedule(newSchedule);
    };

    const handleTimeChange = (periodIndex, field, value) => {
        const newSchedule = [...editSchedule];
        newSchedule.forEach(day => {
            if (day.periods[periodIndex]) {
                day.periods[periodIndex][field] = value;
            }
        });
        setEditSchedule(newSchedule);
    };

    const handleAutoGenerateTimes = () => {
        if (!autoStartTime || !autoDuration) return alert("Please set start time and duration.");
        const durationMins = parseInt(autoDuration);
        const lunchMins = parseInt(lunchDuration) || 0;
        const lunchAfter = parseInt(lunchAfterPeriod) || 0;

        if (isNaN(durationMins) || durationMins <= 0) return alert("Invalid duration");

        const newSchedule = [...editSchedule];
        let currentStartStr = autoStartTime;

        const addMinutes = (timeStr, mins) => {
            const [h, m] = timeStr.split(':').map(Number);
            const date = new Date();
            date.setHours(h, m, 0, 0);
            date.setMinutes(date.getMinutes() + mins);
            const newH = String(date.getHours()).padStart(2, '0');
            const newM = String(date.getMinutes()).padStart(2, '0');
            return `${newH}:${newM}`;
        };

        newSchedule.forEach(day => {
            let currentStartStr = autoStartTime;
            day.periods.forEach((period, idx) => {
                if (lunchMins > 0 && lunchAfter > 0 && idx === lunchAfter) {
                    currentStartStr = addMinutes(currentStartStr, lunchMins);
                }
                const endTimeStr = addMinutes(currentStartStr, durationMins);
                period.startTime = currentStartStr;
                period.endTime = endTimeStr;
                currentStartStr = endTimeStr;
            });
        });

        setEditSchedule(newSchedule);
        setShowTimeModal(false);
    };

    const handleCopyDaySubmit = () => {
        if (!copyDaySource || copyDayTargets.length === 0) return alert("Select source and at least one target day.");

        let newSchedule = [...editSchedule];
        const sourceDayObj = newSchedule.find(d => d.dayOfWeek === copyDaySource);
        if (!sourceDayObj) return;

        const sourcePeriods = JSON.parse(JSON.stringify(sourceDayObj.periods));

        newSchedule = newSchedule.map(day => {
            if (copyDayTargets.includes(day.dayOfWeek)) {
                return { ...day, periods: JSON.parse(JSON.stringify(sourcePeriods)) };
            }
            return day;
        });

        setEditSchedule(newSchedule);
        setShowCopyDayModal(false);
    };

    const handleCreateClassSection = async () => {
        if (!newClassName.trim() || !newClassSubjects.trim())
            return alert("Class Name and at least one Subject are compulsory");

        const sectionToCreate = newSectionName.trim() || "General";

        try {
            const subjectList = newClassSubjects.split(',').map(s => s.trim()).filter(s => s !== "");

            // Check if class exists
            let classDoc = classes.find(c => c.className.toLowerCase() === newClassName.trim().toLowerCase());
            if (!classDoc) {
                const classRes = await axios.post(`${ADMIN_API_BASE}/classes`, {
                    schoolId,
                    className: newClassName.trim(),
                    subjects: subjectList
                });
                classDoc = classRes.data;
            }

            // Create Section
            await axios.post(`${ADMIN_API_BASE}/sections`, {
                schoolId,
                classId: classDoc._id,
                sectionName: sectionToCreate,
                maxCapacity: 40
            });

            invalidateAcademic(); // refresh shared classes + section caches

            setShowAddClassModal(false);
            setNewClassName('');
            setNewSectionName('');
            setNewClassSubjects('');

            // Set the new class as selected
            setTimeout(() => {
                setSelectedClassObj(classDoc);
            }, 500);

            alert("Class and Section added successfully!");
        } catch (error) {
            console.error("Failed to add class/section", error);
            alert("Failed to create Class/Section");
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const cleanSchedule = editSchedule.map(day => ({
                ...day,
                periods: day.periods.map(p => ({
                    ...p,
                    teacherId: p.teacherId === '' ? null : p.teacherId
                }))
            }));

            await axios.post(`${ADMIN_API_BASE}/timetable`, {
                schoolId,
                className: selectedClassObj.className,
                sectionName: selectedSectionObj.sectionName,
                schedule: cleanSchedule
            });
            setIsEditing(false);
            fetchTimetable();
        } catch (error) {
            console.error("Save Error:", error.response?.data || error.message);
            alert("Failed to save timetable");
        } finally {
            setIsSaving(false);
        }
    };

    // Download the current class-section timetable as a print-to-PDF document.
    const downloadPDF = () => {
        if (!timetable?.schedule?.length) return;
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayMap = {};
        timetable.schedule.forEach(d => { dayMap[d.dayOfWeek] = d.periods || []; });
        const presentDays = days.filter(d => (dayMap[d] || []).length);
        const periodNums = [...new Set(timetable.schedule.flatMap(d => (d.periods || []).map(p => p.periodNumber)))].sort((a, b) => a - b);
        const timeByPeriod = {};
        timetable.schedule.forEach(d => (d.periods || []).forEach(p => {
            if (!timeByPeriod[p.periodNumber]) timeByPeriod[p.periodNumber] = `${p.startTime || ''}${p.endTime ? ' - ' + p.endTime : ''}`;
        }));
        const cell = (day, pn) => {
            const p = (dayMap[day] || []).find(x => x.periodNumber === pn);
            return p && p.subject ? `<div class="subj">${p.subject}</div><div class="tch">${p.teacherName || ''}</div>` : '<span class="free">—</span>';
        };
        const schoolName = localStorage.getItem('scoolg_school_name') || 'School';
        const title = `Timetable · Class ${selectedClassObj?.className || ''}-${selectedSectionObj?.sectionName || ''}`;
        const rows = periodNums.map(pn =>
            `<tr><td class="ph"><b>P${pn}</b><div class="tm">${timeByPeriod[pn] || ''}</div></td>${presentDays.map(d => `<td>${cell(d, pn)}</td>`).join('')}</tr>`
        ).join('');
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
            body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;padding:24px;}
            h1{font-size:20px;margin:0;} .sub{color:#64748b;font-size:13px;margin:2px 0 16px;}
            table{width:100%;border-collapse:collapse;} th,td{border:1px solid #e2e8f0;padding:8px;font-size:12px;text-align:center;vertical-align:middle;}
            th{background:#eff6ff;color:#1d4ed8;text-transform:uppercase;font-size:11px;letter-spacing:.5px;}
            .ph{background:#f8fafc;font-weight:700;white-space:nowrap;} .tm{font-size:10px;color:#64748b;font-weight:600;}
            .subj{font-weight:700;} .tch{font-size:10px;color:#64748b;} .free{color:#cbd5e1;}
            @media print{body{padding:0;} @page{size:landscape;}}
        </style></head><body>
            <h1>${schoolName}</h1><div class="sub">${title}</div>
            <table><thead><tr><th>Period</th>${presentDays.map(d => `<th>${d}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
            <script>window.onload=function(){setTimeout(function(){window.print();},250);}<\/script>
        </body></html>`;
        const w = window.open('', '_blank');
        if (!w) { alert('Please allow pop-ups to download the timetable PDF.'); return; }
        w.document.write(html);
        w.document.close();
    };

    const handleCopy = async () => {
        const targetClassObj = classes.find(c => c._id === copyToClass);
        const targetSectionObj = copyToSections.find(s => s._id === copyToSection);

        if (!targetClassObj || !targetSectionObj) {
            return alert("Please select a target Class and Section");
        }

        if (selectedClassObj?._id === copyToClass && selectedSectionObj?._id === copyToSection) {
            return alert("Source and Target cannot be the same!");
        }

        try {
            // Use current active schedule (either from DB or current edits)
            const scheduleToCopy = editSchedule.length > 0 ? editSchedule : (timetable?.schedule || []);

            if (scheduleToCopy.length === 0) {
                return alert("No schedule to copy!");
            }

            const cleanSchedule = scheduleToCopy.map(day => ({
                ...day,
                periods: day.periods.map(p => ({
                    ...p,
                    teacherId: p.teacherId === '' ? null : p.teacherId
                }))
            }));

            await axios.post(`${ADMIN_API_BASE}/timetable`, {
                schoolId,
                className: targetClassObj.className,
                sectionName: targetSectionObj.sectionName,
                schedule: cleanSchedule
            });

            alert(`Successfully cloned timetable to ${targetClassObj.className}-${targetSectionObj.sectionName}`);
            setShowCopyModal(false);
        } catch (error) {
            console.error("Copy Error:", error.response?.data || error.message);
            alert("Failed to copy timetable: " + (error.response?.data?.error || error.message));
        }
    };

    const getTimeGap = (end1, start2) => {
        if (!end1 || !start2) return 0;
        const [h1, m1] = end1.split(':').map(Number);
        const [h2, m2] = start2.split(':').map(Number);
        const date1 = new Date(); date1.setHours(h1, m1, 0, 0);
        const date2 = new Date(); date2.setHours(h2, m2, 0, 0);
        return (date2 - date1) / 60000;
    };

    const getSubjectStyle = (subject) => {
        if (!subject) return 'bg-slate-50 border-slate-200';
        const styles = {
            'Math': 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400 shadow-blue-500/30',
            'English': 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400 shadow-emerald-500/30',
            'Physics': 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400 shadow-orange-500/30',
            'Chemistry': 'bg-gradient-to-br from-teal-500 to-teal-600 text-white border-teal-400 shadow-teal-500/30',
            'Comp. Sc.': 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-indigo-400 shadow-indigo-500/30',
            'History': 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-400 shadow-purple-500/30',
            'Geography': 'bg-gradient-to-br from-amber-500 to-amber-600 text-white border-amber-400 shadow-amber-500/30',
            'Games': 'bg-gradient-to-br from-rose-500 to-rose-600 text-white border-rose-400 shadow-rose-500/30',
            'Lib': 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-cyan-400 shadow-cyan-500/30',
            'Art': 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white border-fuchsia-400 shadow-fuchsia-500/30',
            'Assembly': 'bg-gradient-to-br from-slate-700 to-slate-800 text-white border-slate-600 shadow-slate-800/30',
        };
        const defaultStyle = 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 border-slate-300';
        for (let key in styles) {
            if (subject.toLowerCase().includes(key.toLowerCase())) return styles[key];
        }
        return defaultStyle;
    };

    const getSubjectIcon = (subjectStr) => {
        const sub = (subjectStr || '').toLowerCase();
        if (sub.includes('math')) return 'calculate';
        if (sub.includes('sci')) return 'science';
        if (sub.includes('eng')) return 'import_contacts';
        if (sub.includes('hin')) return 'translate';
        if (sub.includes('com') || sub.includes('it')) return 'computer';
        if (sub.includes('sports') || sub.includes('pe')) return 'sports_soccer';
        if (sub.includes('art')) return 'palette';
        return 'menu_book';
    };

    const SubjectCard = ({ period }) => {
        const isDefault = !period?.subject || !getSubjectStyle(period.subject).includes('text-white');
        return (
            <div className={`p-4 rounded-2xl h-full flex flex-col justify-between min-w-[140px] shadow-sm hover:shadow-md transition-all relative overflow-hidden group border-2 ${getSubjectStyle(period?.subject)} ${!period?.subject ? 'border-dashed border-slate-300 bg-slate-50' : 'border-white/40'}`}>
                {period?.subject ? (
                    <>
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <div className={`px-2 py-0.5 rounded-lg backdrop-blur-md text-[9px] font-black shadow-sm border ${isDefault ? 'bg-white/60 border-slate-200/50 text-slate-500' : 'bg-white/20 border-white/30 text-white'}`}>
                                PERIOD {period.periodNumber}
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="font-black text-[14px] leading-tight tracking-tight drop-shadow-sm uppercase">{period.subject}</p>
                            <div className="h-px w-8 bg-current opacity-20 my-2"></div>
                            <p className={`text-[10px] font-extrabold flex items-center gap-1 ${isDefault ? 'text-slate-500' : 'text-white/90'}`}>
                                {period.teacherName || 'NOT ASSIGNED'}
                            </p>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-4 opacity-60">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Free Slot</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-10 relative">
            <div className="p-4 sm:p-8 space-y-6 max-w-full w-full">
                {/* Simplified Header */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Timetable Matrix</h2>
                        <p className="text-slate-500 text-xs font-bold">Academic Session 2024-25</p>
                    </div>
                    <ProfileButton size={40} />
                </div>

                {/* Top Controls */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
                        <div className="flex flex-col min-w-[120px]">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Class</label>
                            <select
                                value={selectedClassObj?._id || ''}
                                onChange={(e) => {
                                    const found = classes.find(c => c._id === e.target.value);
                                    setSelectedClassObj(found);
                                }}
                                className="w-full h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                            >
                                {classes.length === 0 && <option value="">No Classes</option>}
                                {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                            </select>
                        </div>
                        {sections.length > 1 ? (
                            <div className="flex flex-col min-w-[120px]">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Section</label>
                                <select
                                    value={selectedSectionObj?._id || ''}
                                    onChange={(e) => {
                                        const found = sections.find(s => s._id === e.target.value);
                                        setSelectedSectionObj(found);
                                    }}
                                    className="w-full h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                                >
                                    {sections.map(s => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
                                </select>
                            </div>
                        ) : selectedSectionObj && (
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Current Section</label>
                                <div className="h-10 px-4 flex items-center bg-blue-50 text-blue-600 font-black text-xs rounded-xl border border-blue-100 uppercase tracking-wider">
                                    {selectedSectionObj.sectionName}
                                </div>
                            </div>
                        )}

                        <button onClick={() => setShowAddClassModal(true)} className="mt-5 text-blue-600 hover:bg-blue-50 h-10 px-3 rounded-xl flex items-center gap-1 font-bold text-xs transition-colors border border-dashed border-blue-200">
                            <span className="material-symbols-outlined text-[16px]">add</span>
                            NEW CLASS
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="mr-4 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-sm">groups</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase">{sections.length} Sections</span>
                        </div>
                        {!isEditing ? (
                            <>
                                {timetable && (
                                    <>
                                        <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 font-bold text-sm rounded-xl hover:bg-rose-100 transition-all">
                                            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                                            Download PDF
                                        </button>
                                        <button onClick={() => setShowCopyModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-all">
                                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                            Copy to Class
                                        </button>
                                        <button onClick={() => { setIsEditing(true); setShowCopyDayModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-fuchsia-50 text-fuchsia-600 font-bold text-sm rounded-xl hover:bg-fuchsia-100 transition-all">
                                            <span className="material-symbols-outlined text-[18px]">file_copy</span>
                                            Copy Day
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#2563eb] text-white font-bold text-sm rounded-xl shadow-sm shadow-blue-500/30 hover:scale-95 transition-all">
                                    <span className="material-symbols-outlined text-[18px]">{timetable ? 'edit' : 'add'}</span>
                                    {timetable ? 'Edit Timetable' : 'Create Timetable'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setShowCopyDayModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-fuchsia-50 text-fuchsia-600 font-bold text-sm rounded-xl hover:bg-fuchsia-100 transition-all border border-fuchsia-100">
                                    <span className="material-symbols-outlined text-[18px]">file_copy</span>
                                    Copy Day
                                </button>
                                <button onClick={() => setShowTimeModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-600 font-bold text-sm rounded-xl hover:bg-orange-100 transition-all border border-orange-100">
                                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                                    Set School Timings
                                </button>
                                <button onClick={() => { setIsEditing(false); fetchTimetable(); }} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-sm shadow-emerald-500/30 hover:scale-95 transition-all">
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    {isSaving ? 'Saving...' : 'Save Timetable'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                                <div className="w-16 h-12 bg-slate-100 rounded-xl animate-pulse shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-1/3 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="h-3 w-1/4 bg-slate-100 rounded animate-pulse"></div>
                                </div>
                                <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                ) : !timetable && !isEditing ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300">
                        <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">event_busy</span>
                        <h3 className="text-xl font-bold text-slate-600 mb-1">No Timetable Configured</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            {classes.length === 0
                                ? `You haven't added any classes yet.`
                                : selectedClassObj && selectedSectionObj
                                    ? `${selectedClassObj.className}-${selectedSectionObj.sectionName} doesn't have an active schedule yet.`
                                    : `Please select a valid class and section first.`}
                        </p>
                        {classes.length === 0 ? (
                            <button onClick={() => setShowAddClassModal(true)} className="px-6 py-3 bg-[#2563eb] text-white font-bold text-sm rounded-xl shadow-sm shadow-blue-500/30 hover:scale-95 transition-all">
                                Add First Class
                            </button>
                        ) : selectedClassObj && selectedSectionObj && (
                            <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-[#2563eb] text-white font-bold text-sm rounded-xl shadow-sm shadow-blue-500/30 hover:scale-95 transition-all">
                                Create Schedule
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl premium-shadow overflow-x-auto w-full border border-slate-100 p-2 sm:p-4 lg:p-6">
                        <datalist id="subjectsList">
                            {selectedClassObj?.subjects?.map(s => (
                                <option key={s} value={s} />
                            ))}
                        </datalist>
                        <table className="w-full text-left border-separate border-spacing-y-2 border-spacing-x-2">
                            <thead>
                                <tr>
                                    <th className="p-3 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 rounded-xl w-24 align-middle">
                                        DAY
                                    </th>
                                    {periodNumbers.map((p, pIndex) => {
                                        const prevEnd = pIndex > 0 ? editSchedule[0]?.periods?.[pIndex - 1]?.endTime : null;
                                        const currStart = editSchedule[0]?.periods?.[pIndex]?.startTime;
                                        const gap = getTimeGap(prevEnd, currStart);
                                        return (
                                            <React.Fragment key={p}>
                                                {gap >= 20 && (
                                                    <th className="p-2 bg-orange-50/50 rounded-xl border border-orange-100 border-dashed w-12 align-middle">
                                                        <div className="flex justify-center">
                                                            <span className="material-symbols-outlined text-orange-400 text-lg">restaurant</span>
                                                        </div>
                                                    </th>
                                                )}
                                                <th className="p-3 bg-slate-50 rounded-xl min-w-[120px] align-top">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <div className="text-xs font-bold text-slate-800">Period {p}</div>
                                                        {isEditing && pIndex === periodNumbers.length - 1 && (
                                                            <button onClick={removePeriod} className="w-5 h-5 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors" title="Remove Period">
                                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className={`text-[10px] font-semibold flex items-center justify-center gap-1 ${isEditing ? 'text-blue-600 bg-blue-50 py-1 rounded-md cursor-pointer hover:bg-blue-100' : 'text-slate-500'}`} onClick={() => isEditing && setShowTimeModal(true)} title={isEditing ? "Click to configure timings" : ""}>
                                                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                        {editSchedule[0]?.periods?.[pIndex]?.startTime || '--:--'} - {editSchedule[0]?.periods?.[pIndex]?.endTime || '--:--'}
                                                    </div>
                                                </th>
                                            </React.Fragment>
                                        );
                                    })}
                                    {isEditing && (
                                        <th className="p-3 bg-slate-50/50 rounded-xl w-16 align-middle border border-dashed border-slate-200">
                                            <button onClick={addPeriod} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 flex items-center justify-center transition-all mx-auto" title="Add Period">
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                            </button>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {editSchedule.map((dayObj, dayIndex) => (
                                    <tr key={dayObj.dayOfWeek}>
                                        <td className="py-2 align-middle">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className="text-sm font-black text-slate-800 tracking-wide">{dayObj.dayOfWeek.substring(0, 3)}</span>
                                            </div>
                                        </td>
                                        {dayObj.periods.map((period, pIndex) => {
                                            const prevEnd = pIndex > 0 ? editSchedule[0]?.periods?.[pIndex - 1]?.endTime : null;
                                            const currStart = editSchedule[0]?.periods?.[pIndex]?.startTime;
                                            const gap = getTimeGap(prevEnd, currStart);
                                            return (
                                                <React.Fragment key={pIndex}>
                                                    {gap >= 20 && dayIndex === 0 && (
                                                        <td rowSpan={editSchedule.length} className="bg-orange-50/40 rounded-3xl border-2 border-orange-200 border-dashed align-middle p-4 pointer-events-none relative overflow-hidden group shadow-inner">
                                                            <div className="flex flex-col items-center justify-center h-full gap-10 text-orange-600">
                                                                <div className="flex flex-col items-center gap-6">
                                                                    <span style={{ writingMode: 'vertical-lr' }} className="rotate-180 font-black tracking-[0.6em] uppercase text-lg opacity-80">Lunch Break</span>
                                                                    <span style={{ writingMode: 'vertical-lr' }} className="rotate-180 font-black tracking-[0.4em] uppercase text-sm opacity-60">
                                                                        {gap} MINS
                                                                    </span>
                                                                    <span style={{ writingMode: 'vertical-lr' }} className="rotate-180 font-black text-[10px] opacity-40 tracking-widest mt-4">
                                                                        {prevEnd} - {currStart}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    )}
                                                    {gap >= 20 && dayIndex !== 0 && null}
                                                    <td className="py-2 align-top h-full">
                                                        {!isEditing ? (
                                                            <SubjectCard period={period} />
                                                        ) : (
                                                            <div className="flex flex-col gap-2 p-3 border-2 border-blue-100 bg-blue-50/30 rounded-2xl shadow-sm transition-all hover:bg-white hover:border-blue-400 group h-full min-w-[150px]">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">Subject</span>
                                                                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    list="subjectsList"
                                                                    value={period.subject}
                                                                    onChange={(e) => handleCellChange(dayIndex, pIndex, 'subject', e.target.value)}
                                                                    placeholder="Enter Subject"
                                                                    className="w-full h-10 px-3 text-xs font-black text-slate-800 bg-white rounded-xl border border-blue-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-400"
                                                                />
                                                                <div className="flex items-center justify-between mt-1 mb-1">
                                                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">Teacher</span>
                                                                </div>
                                                                <select
                                                                    value={period.teacherId || ''}
                                                                    onChange={(e) => handleCellChange(dayIndex, pIndex, 'teacherId', e.target.value)}
                                                                    className="w-full h-10 px-3 text-[11px] font-bold text-slate-600 bg-white rounded-xl border border-blue-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                                                                >
                                                                    <option value="">Assign Teacher</option>
                                                                    {teachers.map(t => (
                                                                        <option key={t._id} value={t._id}>{t.fullName}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Copy Modal */}
            {showCopyModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-fade-in border border-indigo-100">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined">content_copy</span>
                                </div>
                                <h3 className="text-xl font-[900] text-slate-800 tracking-tight">Clone Timetable</h3>
                            </div>
                            <button onClick={() => setShowCopyModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        {/* Source Preview */}
                        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                <span className="material-symbols-outlined text-4xl">history</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Source Schedule</p>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-black text-slate-700">{selectedClassObj?.className} - {selectedSectionObj?.sectionName}</span>
                                <div className="h-1 w-8 bg-slate-200 rounded-full"></div>
                            </div>
                        </div>

                        <div className="flex justify-center mb-6">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <span className="material-symbols-outlined text-[20px]">south</span>
                            </div>
                        </div>

                        {/* Target Selection */}
                        <div className="space-y-5 mb-8">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Target Class</label>
                                <select
                                    value={copyToClass}
                                    onChange={(e) => setCopyToClass(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Target Section</label>
                                <select
                                    value={copyToSection}
                                    onChange={(e) => setCopyToSection(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                                    disabled={!copyToClass || copyToSections.length === 0}
                                >
                                    {copyToSections.length === 0 && <option value="">No Sections</option>}
                                    {copyToSections.map(s => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setShowCopyModal(false)} className="flex-1 py-3.5 text-slate-500 font-black text-xs rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest">
                                Cancel
                            </button>
                            <button onClick={handleCopy} className="flex-1 py-3.5 bg-indigo-600 text-white font-black text-xs rounded-2xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-[0.98] transition-all uppercase tracking-widest">
                                Clone Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddClassModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in border border-blue-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-[900] text-[#1e293b] flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">add_circle</span>
                                Add New Class
                            </h3>
                            <button onClick={() => setShowAddClassModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        <div className="space-y-5 mb-8">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    Class Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 10 or Nursery"
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Section Name (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. A, B (Leave blank if no sections)"
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    Subjects (Comma separated) <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    placeholder="Math, English, Science, etc."
                                    value={newClassSubjects}
                                    onChange={(e) => setNewClassSubjects(e.target.value)}
                                    className="w-full h-24 p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm shadow-slate-100/50 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowAddClassModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all">
                                Cancel
                            </button>
                            <button onClick={handleCreateClassSection} className="flex-1 py-3 bg-blue-600 text-white font-black text-sm rounded-xl shadow-md hover:bg-blue-700 hover:scale-[0.98] transition-all">
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Time Configuration Modal */}
            {showTimeModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-500">schedule</span>
                                Set School Timings
                            </h3>
                            <button onClick={() => setShowTimeModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 shrink-0 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-sm">
                                Apply to All
                            </div>
                            <p className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-blue-500">auto_awesome</span>
                                Auto-Generate Schedule
                            </p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Start Time</label>
                                    <input type="time" value={autoStartTime} onChange={e => setAutoStartTime(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold outline-none focus:border-blue-500 bg-white" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Duration (Mins)</label>
                                    <input type="number" value={autoDuration} onChange={e => setAutoDuration(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold outline-none focus:border-blue-500 bg-white" placeholder="40" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Lunch Break After</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px] uppercase">Period</span>
                                        <input type="number" value={lunchAfterPeriod} onChange={e => setLunchAfterPeriod(e.target.value)} className="w-full h-10 pl-14 pr-3 rounded-xl border border-slate-200 text-slate-700 font-bold outline-none focus:border-blue-500 bg-white" placeholder="4" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Lunch Duration</label>
                                    <div className="relative">
                                        <input type="number" value={lunchDuration} onChange={e => setLunchDuration(e.target.value)} className="w-full h-10 px-3 pr-10 rounded-xl border border-slate-200 text-slate-700 font-bold outline-none focus:border-blue-500 bg-white" placeholder="30" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px] uppercase">Mins</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleAutoGenerateTimes} className="w-full h-10 bg-[#2563eb] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
                                Auto Calculate & Apply
                            </button>
                        </div>

                        <div className="overflow-y-auto pr-2 space-y-3 flex-1 mb-6 relative">
                            <div className="sticky top-0 bg-white z-10 pb-2 mb-2 flex items-center justify-between">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Apply to Specific Period</p>
                                <span className="text-[9px] font-bold text-slate-300 uppercase">Manual Tweak</span>
                            </div>
                            {periodNumbers.map((p, index) => (
                                <div key={p} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
                                    <div className="w-16 text-xs font-extrabold text-slate-700">Period {p}</div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <input
                                            type="time"
                                            value={editSchedule[0]?.periods?.[index]?.startTime || ''}
                                            onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                                            className="w-full h-9 px-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                        />
                                        <span className="text-slate-300">-</span>
                                        <input
                                            type="time"
                                            value={editSchedule[0]?.periods?.[index]?.endTime || ''}
                                            onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                                            className="w-full h-9 px-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="shrink-0">
                            <button onClick={() => setShowTimeModal(false)} className="w-full py-3 bg-[#2563eb] text-white font-bold text-sm rounded-xl shadow-md hover:bg-blue-700 transition-all">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Copy Day Modal */}
            {showCopyDayModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-[900] text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-fuchsia-500 text-[24px]">file_copy</span>
                                Copy Day Schedule
                            </h3>
                            <button onClick={() => setShowCopyDayModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1 block">Copy From (Source)</label>
                                <select
                                    value={copyDaySource}
                                    onChange={(e) => setCopyDaySource(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-fuchsia-500 focus:bg-white transition-all cursor-pointer"
                                >
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1 block">Apply To (Targets)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {days.map(d => {
                                        if (d === copyDaySource) return null;
                                        return (
                                            <label key={d} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${copyDayTargets.includes(d) ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={copyDayTargets.includes(d)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setCopyDayTargets([...copyDayTargets, d]);
                                                        else setCopyDayTargets(copyDayTargets.filter(t => t !== d));
                                                    }}
                                                    className="w-4 h-4 rounded text-fuchsia-600 border-slate-300 focus:ring-fuchsia-500 cursor-pointer"
                                                />
                                                <span className="text-xs font-bold">{d}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowCopyDayModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                            <button onClick={handleCopyDaySubmit} className="flex-1 py-3 bg-fuchsia-600 text-white font-bold text-sm rounded-xl shadow-md hover:bg-fuchsia-700 transition-all shadow-fuchsia-500/30">Apply Copy</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default Timetable;
