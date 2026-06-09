import React, { useState, useEffect } from 'react';
import ProfileButton from '../components/ProfileButton';
import MenuButton from '../components/MenuButton';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';

const Attendance = () => {
    const { classes, getSections } = useAdmin();
    const { toast } = useToast();
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [selectedClassObj, setSelectedClassObj] = useState(null);
    const [selectedSectionObj, setSelectedSectionObj] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(true);

    const schoolId = localStorage.getItem('scoolg_school_id') || "";
    const today = new Date().toISOString().split('T')[0];

    // Default class from the shared cache (no per-visit refetch).
    useEffect(() => {
        if (classes.length > 0) setSelectedClassObj((prev) => prev || classes[0]);
    }, [classes]);

    useEffect(() => {
        let active = true;
        if (!selectedClassObj?._id) return;
        getSections(selectedClassObj._id).then((data) => {
            if (!active) return;
            setSections(data);
            if (data.length > 0) setSelectedSectionObj(data[0]);
            else setSelectedSectionObj(null);
        });
        return () => { active = false; };
    }, [selectedClassObj, getSections]);

    useEffect(() => {
        if (!selectedSectionObj?._id || !selectedClassObj?.className || !selectedDate) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const stuRes = await axios.get(`${ADMIN_API_BASE}/students?schoolId=${schoolId}&className=${selectedClassObj.className}&sectionName=${selectedSectionObj.sectionName}`);
                const studentList = Array.isArray(stuRes.data) ? stuRes.data : [];
                setStudents(studentList);

                const attRes = await axios.get(`${ADMIN_API_BASE}/attendance?sectionId=${selectedSectionObj._id}&date=${selectedDate}`);

                if (attRes.data && attRes.data.records && attRes.data.records.length > 0) {
                    const newAttData = {};
                    attRes.data.records.forEach(r => {
                        if (r.studentId) newAttData[r.studentId] = r.status;
                    });
                    setAttendanceData(newAttData);
                    setIsLocked(true);
                } else {
                    const defaultAtt = {};
                    studentList.forEach(s => { if (s._id) defaultAtt[s._id] = 'P'; });
                    setAttendanceData(defaultAtt);
                    setIsLocked(false);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [selectedSectionObj, selectedClassObj, selectedDate, schoolId]);

    const handleStatusChange = (studentId, status) => {
        if (isLocked) return;
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const handleMarkAll = (status) => {
        if (isLocked) return;
        const newAttData = {};
        students.forEach(s => { if (s._id) newAttData[s._id] = status; });
        setAttendanceData(newAttData);
    };

    const handleSubmit = async () => {
        if (!selectedSectionObj?._id || !selectedClassObj?._id || !selectedDate || isLocked) return;
        try {
            setSaving(true);
            const records = students.map(s => ({
                studentId: s._id,
                status: attendanceData[s._id] || 'P'
            }));
            await axios.post(`${ADMIN_API_BASE}/attendance`, {
                schoolId, classId: selectedClassObj._id, sectionId: selectedSectionObj._id,
                date: selectedDate, records
            });
            setIsLocked(true);
            toast.success("Attendance Submitted Successfully!");
        } catch (err) { toast.error("Failed to submit"); }
        finally { setSaving(false); }
    };

    const stats = {
        P: Object.values(attendanceData || {}).filter(v => v === 'P').length,
        A: Object.values(attendanceData || {}).filter(v => v === 'A').length,
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col relative font-sans">
            <header className="h-[80px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 md:px-10">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <MenuButton />
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">Attendance</h2>
                        {isLocked && (
                            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-100">
                                <span className="material-symbols-outlined text-[14px] font-bold">lock</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Locked</span>
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Management Portal</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative group hidden lg:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            className="w-64 h-11 pl-10 pr-4 rounded-2xl bg-slate-100/50 border-none focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all text-xs font-semibold placeholder-slate-400"
                            placeholder="Find student..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                        <button className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-100/50 text-slate-600 hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                        </button>
                        <ProfileButton size={44} />
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-8 space-y-8 max-w-full w-full pb-32">
                {/* 3D-Styled Control Panel */}
                <section className="flex flex-col xl:flex-row gap-5">
                    {/* Filters & Actions Combined - 3D Feel */}
                    <div className="bg-white rounded-[28px] p-5 border border-slate-300 border-b-[5px] border-b-slate-200/80 shadow-md flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 flex-1">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.15em] ml-1">Classroom</label>
                                    <select
                                        value={selectedClassObj?._id || ''}
                                        onChange={(e) => setSelectedClassObj(classes.find(c => c._id === e.target.value))}
                                        className="w-full h-11 bg-slate-50 border-2 border-slate-200 hover:border-blue-400 transition-all rounded-xl px-4 text-[13px] font-black text-slate-900 outline-none cursor-pointer shadow-sm"
                                    >
                                        {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.15em] ml-1">Section</label>
                                    <select
                                        value={selectedSectionObj?._id || ''}
                                        onChange={(e) => setSelectedSectionObj(sections.find(s => s._id === e.target.value))}
                                        className="w-full h-11 bg-slate-50 border-2 border-slate-200 hover:border-blue-400 transition-all rounded-xl px-4 text-[13px] font-black text-slate-900 outline-none cursor-pointer shadow-sm"
                                    >
                                        {sections.length === 0 ? <option value="">None</option> : sections.map(s => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.15em] ml-1">Calendar Date</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        max={today}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full h-11 bg-slate-50 border-2 border-slate-200 hover:border-blue-400 transition-all rounded-xl px-4 text-[13px] font-black text-slate-900 outline-none cursor-pointer shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pb-0.5">
                                <button
                                    onClick={() => handleMarkAll('P')}
                                    disabled={isLocked}
                                    className="h-11 px-6 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-xl hover:shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-30 flex items-center gap-2 border-b-4 border-emerald-800"
                                >
                                    <span className="material-symbols-outlined text-[18px]">done_all</span>
                                    Mark All P
                                </button>
                                <button
                                    onClick={() => handleMarkAll('A')}
                                    disabled={isLocked}
                                    className="h-11 px-6 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-xl hover:shadow-red-600/30 active:scale-95 transition-all disabled:opacity-30 flex items-center gap-2 border-b-4 border-red-800"
                                >
                                    <span className="material-symbols-outlined text-[18px]">block</span>
                                    Mark All A
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Premium White Stats Panels with 3D Depth */}
                    <div className="flex gap-4 shrink-0">
                        <div className="bg-white min-w-[120px] rounded-[28px] border border-slate-300 border-b-[5px] border-b-emerald-600/30 shadow-md flex flex-col items-center justify-center py-4 relative overflow-hidden group">
                            <h3 className="text-3xl font-black text-emerald-600 leading-none tracking-tighter">{stats.P}</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Present</p>
                            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-emerald-600"></div>
                        </div>
                        <div className="bg-white min-w-[120px] rounded-[28px] border border-slate-300 border-b-[5px] border-b-red-600/30 shadow-md flex flex-col items-center justify-center py-4 relative overflow-hidden group">
                            <h3 className="text-3xl font-black text-red-600 leading-none tracking-tighter">{stats.A}</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Absent</p>
                            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-red-600"></div>
                        </div>
                    </div>
                </section>


                {/* High-Contrast Table Student List */}
                <section className="bg-white rounded-[32px] border border-slate-300 overflow-hidden shadow-md">
                    {/* Darker Table Header for Visibility */}
                    <div className="bg-slate-100 border-b-2 border-slate-200 px-6 py-4 grid grid-cols-[60px_1fr_150px_280px] gap-4 items-center">
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">#</span>
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Student Profile</span>
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Roll No</span>
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest text-center">Attendance Status</span>
                    </div>

                    {loading ? (
                        <div className="divide-y divide-slate-200">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="px-6 py-4 grid grid-cols-[60px_1fr_150px_280px] gap-4 items-center">
                                    <div className="h-4 w-6 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse shrink-0"></div>
                                        <div className="flex flex-col gap-2">
                                            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse"></div>
                                            <div className="h-2.5 w-20 bg-slate-100 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="h-7 w-24 bg-slate-100 rounded-lg animate-pulse"></div>
                                    <div className="h-9 w-full bg-slate-100 rounded-lg animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    ) : students.length === 0 ? (
                        <div className="py-32 text-center text-slate-500 font-black text-sm uppercase tracking-widest">
                            No students found in this section
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {students.map((s, idx) => (
                                <div key={s._id} className={`px-6 py-4 grid grid-cols-[60px_1fr_150px_280px] gap-4 items-center transition-colors ${isLocked ? 'bg-slate-50/80' : 'hover:bg-blue-50/50'}`}>
                                    {/* Index - Darker */}
                                    <div className="text-sm font-black text-slate-500">
                                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                    </div>

                                    {/* Student Info - Sharp Contrast */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0">
                                            {s.firstName ? s.firstName[0] : ''}
                                        </div>
                                        <div className="flex flex-col">
                                            <h5 className="text-[16px] font-black text-slate-950 leading-none">{s.firstName} {s.lastName}</h5>
                                            <p className="text-[10px] font-black text-slate-600 uppercase mt-1.5 tracking-tight">Grade {selectedClassObj?.className}</p>
                                        </div>
                                    </div>

                                    {/* Roll Number Column - Bold & Clear */}
                                    <div>
                                        <span className="px-4 py-1.5 bg-blue-100 text-blue-900 rounded-lg text-[12px] font-black border-2 border-blue-200 inline-block shadow-sm">
                                            ROLL: {s.rollNumber || '00'}
                                        </span>
                                    </div>

                                    {/* Action Buttons - High Contrast */}
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => handleStatusChange(s._id, 'P')}
                                            disabled={isLocked}
                                            className={`h-11 px-7 rounded-full flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${attendanceData[s._id] === 'P' ? 'bg-emerald-700 text-white shadow-lg' : 'bg-white text-emerald-800 border-2 border-emerald-200 hover:bg-emerald-50 disabled:opacity-50'}`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                            Present
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(s._id, 'A')}
                                            disabled={isLocked}
                                            className={`h-11 px-7 rounded-full flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${attendanceData[s._id] === 'A' ? 'bg-red-700 text-white shadow-lg' : 'bg-white text-red-800 border-2 border-red-200 hover:bg-red-50 disabled:opacity-50'}`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                                            Absent
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>



                <div className="fixed bottom-0 left-16 md:left-[280px] right-0 p-6 bg-white/80 backdrop-blur-2xl border-t border-slate-200 flex justify-end gap-5 z-50">
                    <div className="max-w-[1400px] mx-auto w-full flex justify-end gap-5">
                        {isLocked ? (
                            <button
                                onClick={() => setIsLocked(false)}
                                className="px-10 py-5 bg-[#2563eb] text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-[24px] shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all flex items-center gap-3 active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                Edit Attendance
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsLocked(true)}
                                    className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-500 font-black text-[12px] uppercase tracking-[0.2em] rounded-[24px] hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving || students.length === 0}
                                    className="px-12 py-5 bg-[#2563eb] text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-[24px] shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    {saving ? 'Processing...' : 'Submit Attendance'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Attendance;
