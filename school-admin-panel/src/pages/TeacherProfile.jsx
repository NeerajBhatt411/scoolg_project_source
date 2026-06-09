import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useToast } from '../context/ToastContext';

const TeacherProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    // Store original teacher to fallback/init
    const [teacher, setTeacher] = useState(location.state?.teacher);
    
    // Editing states
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(teacher || {});
    const [isSaving, setIsSaving] = useState(false);

    const [activeTab, setActiveTab] = useState('Personal');
    const [schedule, setSchedule] = useState(null);
    const [classTeacherOf, setClassTeacherOf] = useState([]);

    // Teacher diary state
    const [diary, setDiary] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [sectionsList, setSectionsList] = useState([]);
    const todayISO = new Date().toISOString().split('T')[0];
    const [diaryForm, setDiaryForm] = useState({ date: todayISO, className: '', sectionName: '', subject: '', note: '' });
    const [savingDiary, setSavingDiary] = useState(false);
    const [showDiaryAdd, setShowDiaryAdd] = useState(false);
    const adminSchoolId = localStorage.getItem('scoolg_school_id');

    useEffect(() => {
        if (!teacher?._id) return;
        axios.get(`${ADMIN_API_BASE}/teachers/${teacher._id}/schedule`)
            .then((res) => { setSchedule(res.data?.schedule || []); setClassTeacherOf(res.data?.classTeacherOf || []); })
            .catch(() => setSchedule([]));
        axios.get(`${ADMIN_API_BASE}/teacher-diary?teacherId=${teacher._id}`)
            .then((res) => setDiary(Array.isArray(res.data) ? res.data : []))
            .catch(() => { });
        axios.get(`${ADMIN_API_BASE}/classes?schoolId=${adminSchoolId}`)
            .then((res) => setClassesList(Array.isArray(res.data) ? res.data : []))
            .catch(() => { });
        axios.get(`${ADMIN_API_BASE}/sections?schoolId=${adminSchoolId}`)
            .then((res) => setSectionsList(Array.isArray(res.data) ? res.data : []))
            .catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teacher?._id]);

    const diaryClassObj = classesList.find(c => c.className === diaryForm.className);
    const diarySections = diaryClassObj ? sectionsList.filter(s => String(s.classId?._id || s.classId) === String(diaryClassObj._id)) : [];
    // Subjects strictly from the selected class (set via Manage Class).
    const diarySubjects = diaryClassObj?.subjects || [];
    const addDiary = async () => {
        if (!diaryForm.className || !diaryForm.note.trim()) { toast.warning('Class and note are required.'); return; }
        setSavingDiary(true);
        try {
            const res = await axios.post(`${ADMIN_API_BASE}/teacher-diary`, { schoolId: adminSchoolId, teacherId: teacher._id, ...diaryForm });
            setDiary(prev => [res.data, ...prev]);
            setDiaryForm({ date: todayISO, className: '', sectionName: '', subject: '', note: '' });
        } catch (e) {
            toast.error(e.response?.data?.error || 'Failed to add entry');
        } finally { setSavingDiary(false); }
    };
    const deleteDiary = async (id) => {
        if (!window.confirm('Delete this diary entry?')) return;
        try { await axios.delete(`${ADMIN_API_BASE}/teacher-diary/${id}`); setDiary(prev => prev.filter(e => e._id !== id)); }
        catch (e) { toast.error('Failed to delete'); }
    };
    const fmtDiaryDate = (d) => { try { return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); } catch { return d; } };

    if (!teacher) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-500 font-bold">
                No teacher data found. <button onClick={() => navigate('/teachers')} className="ml-2 text-blue-500 underline">Go Back</button>
            </div>
        );
    }

    const tabs = ['Personal', 'Professional', 'Schedule', 'Diary', 'Documents'];
    const isFrozen = teacher.status === 'Inactive';

    const handleStatusChange = async () => {
        const newStatus = isFrozen ? 'Active' : 'Inactive';
        if (!window.confirm(`Are you sure you want to mark this teacher as ${newStatus}?`)) return;
        try {
            const res = await axios.patch(`${ADMIN_API_BASE}/teachers/${teacher._id}`, { status: newStatus });
            setTeacher(res.data);
            setEditData(res.data);
        } catch (e) {
            toast.error(e.response?.data?.error || 'Failed to update status');
        }
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const res = await axios.patch(`${ADMIN_API_BASE}/teachers/${teacher._id}`, editData);
            setTeacher(res.data);
            setEditData(res.data);
            setIsEditing(false);
        } catch (e) {
            toast.error(e.response?.data?.error || 'Failed to update teacher');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-[1200px] mx-auto pb-20 relative">
            {/* Header: back + title */}
            <div className="flex items-center gap-2 mb-4">
                <button onClick={() => navigate('/teachers')} aria-label="Back to faculty" className="shrink-0 -ml-1 w-9 h-9 grid place-items-center rounded-lg text-slate-700 hover:bg-slate-100 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <h1 className="text-xl sm:text-3xl font-black text-blue-700 tracking-tight truncate">Faculty Profile</h1>
            </div>

            {/* Top Identity Card */}
            <div className={`bg-white rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 shadow-sm border ${isFrozen ? 'border-red-200 bg-red-50/20' : 'border-slate-100'}`}>
                <div className="flex items-start gap-4 sm:gap-6 min-w-0">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-md flex-shrink-0 bg-slate-100 border-4 border-white flex items-center justify-center text-3xl font-bold text-slate-400">
                        {teacher.profileImageUrl ? (
                            <img src={teacher.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : teacher.fullName.charAt(0)}
                    </div>
                    <div className="space-y-1 mt-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-800">{teacher.fullName}</h2>
                            {isFrozen ? (
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full tracking-wider flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Inactive
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full tracking-wider flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Active
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500 mt-2">
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">school</span>
                                {teacher.specialization || 'General Faculty'}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                Joined: {teacher.dateOfJoining ? new Date(teacher.dateOfJoining).getFullYear() : 'N/A'}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 mt-2">
                            <span className="material-symbols-outlined text-[18px]">badge</span>
                            App ID: <span className="font-mono text-slate-700">{teacher.teacherAppId}</span>
                        </div>
                        {classTeacherOf.length > 0 && (
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 mt-2">
                                <span className="material-symbols-outlined text-[18px]">supervisor_account</span>
                                Class Teacher of: <span className="text-blue-700 font-bold">{classTeacherOf.map(c => `${c.className || '?'}-${c.sectionName}`).join(', ')}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 w-full sm:w-auto shrink-0">
                    {isEditing ? (
                        <>
                            <button onClick={handleSaveEdit} disabled={isSaving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                                <span className="material-symbols-outlined text-[18px]">save</span> {isSaving ? 'Saving...' : 'Save Details'}
                            </button>
                            <button onClick={() => { setIsEditing(false); setEditData(teacher); }} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} disabled={isFrozen} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                            </button>
                            <button onClick={handleStatusChange} className={`px-5 py-2.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm ${isFrozen ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}>
                                <span className="material-symbols-outlined text-[18px]">sync_alt</span> {isFrozen ? 'Mark Active' : 'Mark Inactive'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
                
                {/* Tabs */}
                <div className="flex items-center gap-5 sm:gap-8 px-4 sm:px-8 border-b border-slate-100 pt-2 overflow-x-auto custom-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 pt-4 px-2 font-bold text-sm tracking-wide transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row flex-1">
                    {/* Left Detail Form Canvas */}
                    <div className="flex-1 p-4 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-100">
                        {activeTab === 'Personal' && (
                            <div className="space-y-10 animate-fade-in">
                                <div>
                                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-800 mb-6">
                                        <span className="material-symbols-outlined text-blue-600">person</span>
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</span>
                                            {isEditing ? (
                                                <input name="fullName" value={editData.fullName} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{teacher.fullName}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</span>
                                            {isEditing ? (
                                                <select name="gender" value={editData.gender} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800">
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{teacher.gender || 'Not Provided'}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Birth</span>
                                            <span className="font-bold text-slate-800 px-2 py-1">{teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Number</span>
                                            {isEditing ? (
                                                <input name="phone" value={editData.phone} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{teacher.phone}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</span>
                                            {isEditing ? (
                                                <input name="email" value={editData.email} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" placeholder="Optional" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{teacher.email || 'Not Provided'}</span>
                                            )}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Residential Address</span>
                                            {isEditing ? (
                                                <textarea name="residentialAddress" value={editData.residentialAddress} onChange={handleInputChange} rows="2" className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-medium text-slate-800 resize-none" />
                                            ) : (
                                                <span className="font-medium text-slate-600 px-2 py-1">{teacher.residentialAddress}</span>
                                            )}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description <span className="text-slate-300 normal-case tracking-normal">(optional)</span></span>
                                            {isEditing ? (
                                                <textarea name="description" value={editData.description || ''} onChange={handleInputChange} rows="3" placeholder="Short bio / notes about this teacher" className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-medium text-slate-800 resize-none" />
                                            ) : (
                                                <span className="font-medium text-slate-600 px-2 py-1">{teacher.description || 'Not Provided'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Professional' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-800 mb-6 border-b border-slate-100 pb-4">
                                    <span className="material-symbols-outlined text-blue-600">work</span>
                                    Professional Background
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Highest Qualification</span>
                                        {isEditing ? (
                                            <input name="highestQualification" value={editData.highestQualification} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                        ) : (
                                            <span className="font-bold text-slate-800 px-2 py-1">{teacher.highestQualification}</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Specialization</span>
                                        {isEditing ? (
                                            <input name="specialization" value={editData.specialization} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                        ) : (
                                            <span className="font-bold text-slate-800 px-2 py-1">{teacher.specialization}</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Experience (Years)</span>
                                        {isEditing ? (
                                            <input type="number" name="experienceYears" value={editData.experienceYears} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                        ) : (
                                            <span className="font-bold text-slate-800 px-2 py-1">{teacher.experienceYears} Years</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Joining</span>
                                        <span className="font-bold text-slate-800 px-2 py-1">{teacher.dateOfJoining ? new Date(teacher.dateOfJoining).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Diary' && (
                            <div className="animate-fade-in space-y-5">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
                                        <span className="material-symbols-outlined text-blue-600">menu_book</span>
                                        Teaching Record <span className="text-sm font-bold text-slate-400">({diary.length})</span>
                                    </h3>
                                    <button onClick={() => setShowDiaryAdd(s => !s)} className="px-4 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm inline-flex items-center gap-1.5 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">{showDiaryAdd ? 'close' : 'add'}</span>{showDiaryAdd ? 'Close' : 'Add entry'}
                                    </button>
                                </div>

                                {/* Add entry (admin) — collapsible */}
                                {showDiaryAdd && (
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <input type="date" value={diaryForm.date} onChange={(e) => setDiaryForm({ ...diaryForm, date: e.target.value })} className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-blue-500" />
                                        <select value={diaryForm.className} onChange={(e) => setDiaryForm({ ...diaryForm, className: e.target.value, subject: '', sectionName: '' })} className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-blue-500">
                                            <option value="">Class</option>
                                            {classesList.map(c => <option key={c._id} value={c.className}>{c.className}</option>)}
                                        </select>
                                        <select value={diaryForm.sectionName} onChange={(e) => setDiaryForm({ ...diaryForm, sectionName: e.target.value })} disabled={!diaryForm.className} className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50">
                                            <option value="">Section</option>
                                            {diarySections.map(s => <option key={s._id} value={s.sectionName}>{s.sectionName}</option>)}
                                        </select>
                                        <select value={diaryForm.subject} onChange={(e) => setDiaryForm({ ...diaryForm, subject: e.target.value })} className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-blue-500">
                                            <option value="">Subject</option>
                                            {diarySubjects.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <input value={diaryForm.note} onChange={(e) => setDiaryForm({ ...diaryForm, note: e.target.value })} placeholder="What was taught? (one-liner)" className="w-full h-11 px-4 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500" />
                                    <button onClick={addDiary} disabled={savingDiary} className="px-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm inline-flex items-center gap-2 transition-colors disabled:opacity-60">
                                        <span className="material-symbols-outlined text-[18px]">add</span>{savingDiary ? 'Saving…' : 'Add to diary'}
                                    </button>
                                </div>
                                )}

                                {/* Teaching record list */}
                                <div className="space-y-2">
                                    {diary.length === 0 ? (
                                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-10 text-center text-slate-400">
                                            <span className="material-symbols-outlined text-4xl opacity-40">menu_book</span>
                                            <p className="text-sm font-bold text-slate-500 mt-2">No teaching records yet.</p>
                                            <p className="text-xs px-6">Entries the teacher adds (from the app) or you add here will appear with class, section &amp; subject.</p>
                                        </div>
                                    ) : diary.map((e) => (
                                        <div key={e._id} className="flex items-start gap-3 bg-white border border-slate-100 rounded-2xl p-3">
                                            <div className="w-14 shrink-0 text-center">
                                                <p className="text-[11px] font-black text-blue-600 leading-tight">{fmtDiaryDate(e.date)}</p>
                                            </div>
                                            <div className="w-px self-stretch bg-slate-100"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 text-sm">{e.note}</p>
                                                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                                                    Class {e.className}-{e.sectionName}{e.subject ? ` · ${e.subject}` : ''}{e.createdByRole === 'teacher' ? ' · by teacher' : ''}{e.locked ? ' · 🔒 locked' : ''}
                                                </p>
                                            </div>
                                            <button onClick={() => deleteDiary(e._id)} className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 grid place-items-center transition-colors shrink-0"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'Documents' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-4">Required Documents</h3>
                                
                                <div className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                                            <span className="material-symbols-outlined">description</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">Faculty Resume</h4>
                                            <p className="text-sm font-medium text-slate-500">
                                                Uploaded on Registration
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Weekly schedule (derived from timetables) */}
                        {activeTab === 'Schedule' && (
                            <div className="animate-fade-in">
                                <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-800 mb-6">
                                    <span className="material-symbols-outlined text-blue-600">calendar_month</span>
                                    Weekly Schedule
                                </h3>
                                {schedule === null ? (
                                    <div className="space-y-3">{[0, 1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>)}</div>
                                ) : schedule.every(d => d.periods.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                        <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">event_available</span>
                                        <h3 className="text-lg font-bold text-slate-600 mb-1">No Schedule Assigned</h3>
                                        <p className="text-sm text-slate-400">This teacher isn't mapped to any timetable periods yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {schedule.filter(d => d.periods.length > 0).map(d => (
                                            <div key={d.dayOfWeek}>
                                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">{d.dayOfWeek}</p>
                                                <div className="space-y-2">
                                                    {d.periods.map((p, i) => (
                                                        <div key={i} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
                                                            <div className="text-center w-16 shrink-0">
                                                                <p className="text-xs font-black text-blue-600">{p.startTime || '--'}</p>
                                                                <p className="text-[10px] font-bold text-slate-400">Period {p.periodNumber}</p>
                                                            </div>
                                                            <div className="w-px h-9 bg-slate-200"></div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-slate-800 text-sm">{p.subject || '—'}</p>
                                                                <p className="text-xs font-semibold text-slate-500">Class {p.className}-{p.sectionName}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar Widget Canvas — attendance & performance hidden for now */}
                    <div className="hidden">
                        {/* Fake Calendar Widget */}
                        <div className="bg-[#f8fafc] border border-slate-100 rounded-3xl p-6 shadow-sm">
                            <h4 className="font-extrabold text-slate-800 mb-4 flex items-center justify-between">
                                Attendance Overview <span className="text-blue-600 text-sm">Oct 2023</span>
                            </h4>
                            <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center mb-6">
                                {['M','T','W','T','F','S','S'].map(d=><div key={d} className="text-[10px] font-bold text-slate-400">{d}</div>)}
                                {/* Fake Days */}
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">1</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">2</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">3</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">4</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">5</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">6</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">7</div>
                                
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">8</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">9</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">10</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">11</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">12</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">13</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">14</div>

                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">15</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">16</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">17</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">18</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">19</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">20</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">21</div>
                            </div>

                            <div className="flex justify-between items-center text-sm font-bold text-slate-500 mb-2">
                                <span>Working Days</span>
                                <span className="text-slate-800">24</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-500 mb-6 border-b border-dashed border-slate-200 pb-4">
                                <span>Present</span>
                                <span className="text-emerald-500">24</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Percentage</span>
                                <span className="text-2xl font-black text-blue-600">100%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                                <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
                            </div>
                        </div>

                        {/* Performance Standing */}
                        <div className="bg-[#f0f5ff] rounded-3xl p-6 shadow-sm border border-blue-100">
                            <h4 className="font-extrabold text-blue-700 mb-4 text-sm">Performance Rating</h4>
                            <div className="flex items-end gap-2 mb-3">
                                <span className="text-4xl font-black text-slate-800">4.8</span>
                                <span className="text-sm font-bold text-slate-500 mb-1">/ 5.0</span>
                            </div>
                            <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                {teacher.fullName} has excellent student feedback and consistent attendance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default TeacherProfile;
