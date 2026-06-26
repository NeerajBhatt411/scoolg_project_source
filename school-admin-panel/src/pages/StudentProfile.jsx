import React, { useState, useEffect, useRef } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_API_BASE, API_BASE } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAdmin } from '../context/AdminContext';
import { db, ensureChatAuth } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const ChatTypingDots = () => (
    <span className="inline-flex gap-1 items-center">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
);
const chatTyperName = (t) => (t.role === 'parent' ? 'Parent' : (t.name || (t.role === 'teacher' ? 'Teacher' : 'School Office')));

const StudentProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { refreshStudents } = useAdmin();

    // Store original student to fallback/init
    const [student, setStudent] = useState(location.state?.student);
    
    // Editing states
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(student || {});
    const [isSaving, setIsSaving] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [resetResult, setResetResult] = useState(null); // { password, emailed, parentEmail }

    const fileToBase64Img = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
    const handlePhotoChange = async (file) => {
        if (!file || !file.type?.startsWith('image/')) return;
        setPhotoUploading(true);
        try {
            const base64 = await fileToBase64Img(file);
            const up = await axios.post(`${API_BASE}/upload`, { file: base64, folder: 'Students', schoolName: 'School' });
            const url = up.data?.url;
            if (!url) throw new Error('Upload failed');
            await axios.put(`${ADMIN_API_BASE}/students/${student._id}`, { profileImageUrl: url });
            setStudent(prev => ({ ...prev, profileImageUrl: url }));
            setEditData(prev => ({ ...prev, profileImageUrl: url }));
            refreshStudents?.(true); // propagate the new avatar to the students list
            toast.success('Photo updated');
        } catch (e) { toast.error('Photo upload failed — try a smaller image'); }
        finally { setPhotoUploading(false); }
    };

    const [activeTab, setActiveTab] = useState('Personal');
    const [allAttendance, setAllAttendance] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attStats, setAttStats] = useState({ present: 0, absent: 0, percentage: 0, total: 0 });

    // --- Parent GROUP chat (realtime via Firestore; writes via /api/admin/messages/:id) ---
    const [chatMsgs, setChatMsgs] = useState([]);      // from Firestore
    const [chatPending, setChatPending] = useState([]); // optimistic admin messages
    const [chatText, setChatText] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatTypers, setChatTypers] = useState([]);
    const chatEndRef = useRef(null);
    const chatMeRef = useRef({ uid: null, name: 'School Office', schoolId: '' });
    const chatTypingDocRef = useRef(null);
    const chatPingRef = useRef(0);
    const chatStopTimerRef = useRef(null);
    const toDate = (v) => { try { return v?.toDate ? v.toDate() : (v ? new Date(v) : null); } catch { return null; } };
    const fmtChatTime = (d) => { const dt = toDate(d); try { return dt ? dt.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''; } catch { return ''; } };
    const chatAll = [...chatMsgs, ...chatPending];
    const stopChatTyping = () => {
        const d = chatTypingDocRef.current; if (!d) return;
        clearTimeout(chatStopTimerRef.current);
        setDoc(d, { name: chatMeRef.current.name, role: 'admin', schoolId: chatMeRef.current.schoolId, typing: false, at: serverTimestamp() }).catch(() => {});
    };
    const signalChatTyping = () => {
        const d = chatTypingDocRef.current; if (!d) return;
        const now = Date.now();
        if (now - chatPingRef.current > 1500) {
            chatPingRef.current = now;
            setDoc(d, { name: chatMeRef.current.name, role: 'admin', schoolId: chatMeRef.current.schoolId, typing: true, at: serverTimestamp() }).catch(() => {});
        }
        clearTimeout(chatStopTimerRef.current);
        chatStopTimerRef.current = setTimeout(stopChatTyping, 3000);
    };
    const onChatChange = (e) => { const v = e.target.value; setChatText(v); if (v.trim()) signalChatTyping(); else stopChatTyping(); };
    const sendChat = async (e) => {
        e?.preventDefault();
        const t = chatText.trim();
        if (!t || chatSending || !student?._id) return;
        setChatSending(true);
        setChatText(''); stopChatTyping();
        setChatPending((m) => [...m, { id: 'tmp-' + Date.now(), from: 'admin', senderName: 'School Office', text: t, createdAt: new Date().toISOString() }]);
        try { await axios.post(`${ADMIN_API_BASE}/messages/${student._id}`, { text: t }); }
        catch (e) { /* listener reconciles */ }
        finally { setChatSending(false); }
    };
    useEffect(() => {
        if (activeTab !== 'Parent Chat' || !student?._id) return;
        let unsub = () => {}, unsubT = () => {};
        let cancelled = false;
        setChatLoading(true); setChatTypers([]);
        const sid = String(student._id);
        (async () => {
            try {
                const td = (await axios.get(`${ADMIN_API_BASE}/firebase-token`)).data;
                const u = await ensureChatAuth(async () => td);
                if (cancelled) return;
                chatMeRef.current = { uid: u?.uid, name: td?.name || 'School Office', schoolId: String(td?.schoolId || '') };
                chatTypingDocRef.current = u?.uid ? doc(db, 'chats', sid, 'typing', u.uid) : null;
                const q = query(collection(db, 'chats', sid, 'messages'), orderBy('createdAt', 'asc'));
                unsub = onSnapshot(q, (snap) => {
                    const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                    setChatMsgs(arr);
                    setChatPending((p) => p.filter((pm) => !arr.some((s) => s.from === 'admin' && s.text === pm.text)));
                    setChatLoading(false);
                }, () => setChatLoading(false));
                unsubT = onSnapshot(collection(db, 'chats', sid, 'typing'), (snap) => {
                    const now = Date.now();
                    setChatTypers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))
                        .filter((t) => t.id !== chatMeRef.current.uid && t.typing && t.at?.toMillis && (now - t.at.toMillis() < 8000)));
                }, () => {});
                axios.post(`${ADMIN_API_BASE}/messages/${sid}/read`).catch(() => {});
            } catch (e) { setChatLoading(false); }
        })();
        return () => { cancelled = true; unsub(); unsubT(); stopChatTyping(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, student?._id]);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs.length, chatPending.length, chatTypers.length]);

    useEffect(() => {
        if (student?._id) {
            const fetchAttendance = async () => {
                try {
                    const res = await axios.get(`${ADMIN_API_BASE}/student-attendance/${student._id}`);
                    setAllAttendance(res.data || []);
                } catch (err) {
                    console.error("Failed to fetch attendance for profile:", err);
                }
            };
            fetchAttendance();
        }
    }, [student?._id]);

    useEffect(() => {
        const monthlyData = allAttendance.filter(r => {
            if (!r.date) return false;
            const [year, month] = r.date.includes('T') 
               ? [new Date(r.date).getFullYear(), new Date(r.date).getMonth()] 
               : [parseInt(r.date.split('-')[0], 10), parseInt(r.date.split('-')[1], 10) - 1];
            
            const isCorrectMonth = year === currentMonth.getFullYear() && month === currentMonth.getMonth();
            if (!isCorrectMonth) return false;

            const dayStr = r.date.includes('T') ? new Date(r.date).getDate() : parseInt(r.date.split('-')[2], 10);
            const isSun = new Date(year, month, dayStr).getDay() === 0;
            return !isSun; // Ignore Sundays
        });


        const present = monthlyData.filter(r => r.status === 'Present' || r.status === 'P').length;
        const absent = monthlyData.filter(r => r.status === 'Absent' || r.status === 'A').length;
        const total = monthlyData.length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        setAttStats({ present, absent, percentage, total, data: monthlyData });
    }, [allAttendance, currentMonth]);

    const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const monthName = currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' });



    if (!student) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-500 font-bold">
                No student data found. <button onClick={() => navigate('/students')} className="ml-2 text-blue-500 underline">Go Back</button>
            </div>
        );
    }

    const tabs = ['Personal', 'Parent Chat', 'Academic', 'Attendance', 'Exams', 'Documents'];
    const isFrozen = student.status === 'Inactive';

    // App password shown to the admin: stored first-time password if present, else
    // the DOB default for legacy accounts that never changed it, else "Set by student".
    const _dob = student.dateOfBirth ? new Date(student.dateOfBirth) : null;
    const _dobPw = _dob ? `${String(_dob.getDate()).padStart(2, '0')}${String(_dob.getMonth() + 1).padStart(2, '0')}${_dob.getFullYear()}` : '';
    const shownAppPw = student.tempPassword || (!student.isPasswordChanged ? _dobPw : '');
    const appPwCaption = student.tempPassword ? 'until student changes it' : 'date of birth';

    const handleStatusChange = async () => {
        const newStatus = isFrozen ? 'Active' : 'Inactive';
        if (!window.confirm(`Are you sure you want to mark this student as ${newStatus}?`)) return;

        try {
            const res = await axios.put(`${ADMIN_API_BASE}/students/${student._id}`, { status: newStatus });
            setStudent(res.data.student);
            setEditData(res.data.student);
        } catch (err) {
            toast.error('Failed to update status.');
        }
    };

    const handleResetPassword = async () => {
        if (!window.confirm("Reset this student's password to a fresh temporary one? They'll be asked to set a new password on their next login.")) return;
        setResetting(true);
        try {
            const res = await axios.post(`${ADMIN_API_BASE}/students/${student._id}/reset-password`);
            const newTemp = res.data?.appCredentials?.password;
            setResetResult({
                password: newTemp,
                emailed: !!res.data?.emailed,
                parentEmail: res.data?.parentEmail || null,
            });
            setStudent(prev => ({ ...prev, tempPassword: newTemp, isPasswordChanged: false }));
            refreshStudents?.(true);
        } catch (err) {
            toast.error('Failed to reset password. Please try again.');
        } finally {
            setResetting(false);
        }
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const res = await axios.put(`${ADMIN_API_BASE}/students/${student._id}`, editData);
            setStudent(res.data.student);
            setIsEditing(false);
        } catch (err) {
            toast.error('Failed to update details. Check console.');
            console.error(err);
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
                <button onClick={() => navigate('/students')} aria-label="Back to students" className="shrink-0 -ml-1 w-9 h-9 grid place-items-center rounded-lg text-slate-700 hover:bg-slate-100 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <h1 className="text-xl sm:text-3xl font-black text-blue-700 tracking-tight truncate">Student Profile</h1>
            </div>

            {/* Top Identity Card */}
            <div className={`bg-white rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 shadow-sm border ${isFrozen ? 'border-red-200 bg-red-50/20' : 'border-slate-100'}`}>
                <div className="flex items-start gap-4 sm:gap-6 min-w-0">
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 group">
                        <div className="w-full h-full rounded-3xl overflow-hidden shadow-md bg-slate-100 border-4 border-white flex items-center justify-center text-3xl font-bold text-slate-400">
                            {student.profileImageUrl ? (
                                <img src={student.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : student.firstName.charAt(0)}
                        </div>
                        <label title="Change photo" className="absolute inset-0 rounded-3xl bg-slate-900/55 text-white flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="material-symbols-outlined text-[20px]">{photoUploading ? 'hourglass_top' : 'photo_camera'}</span>
                            <span className="text-[10px] font-bold">{photoUploading ? '...' : 'Change'}</span>
                            <input type="file" accept="image/*" className="hidden" disabled={photoUploading} onChange={(e) => handlePhotoChange(e.target.files?.[0])} />
                        </label>
                        <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-blue-600 text-white grid place-items-center shadow-md ring-2 ring-white pointer-events-none">
                            <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                        </span>
                    </div>
                    <div className="space-y-1 mt-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-800">{student.firstName} {student.lastName}</h2>
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
                                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                                Class {student.class}-{student.section}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                Admission: {student.dateOfAdmission ? new Date(student.dateOfAdmission).getFullYear() : '2024'}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 mt-2">
                            <span className="material-symbols-outlined text-[18px]">badge</span>
                            ID: {student.studentAppId} <span className="mx-2 text-slate-300">|</span> Roll: {student.rollNumber}
                        </div>
                        {/* App login credentials — copy ID + password (password only while still default) */}
                        <div className="mt-3 w-full sm:max-w-sm bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2.5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Login ID</p>
                                    <p className="font-mono font-extrabold text-slate-800 text-sm truncate">{student.studentAppId}</p>
                                </div>
                                <button onClick={() => { navigator.clipboard?.writeText(student.studentAppId); toast.success('Login ID copied'); }} className="shrink-0 w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-colors" title="Copy login ID">
                                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                </button>
                            </div>
                            <div className="h-px bg-slate-200"></div>
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Password{shownAppPw ? ` · ${appPwCaption}` : ''}</p>
                                    {shownAppPw ? (
                                        <p className="font-mono font-extrabold text-blue-700 text-sm truncate tracking-wide">{shownAppPw}</p>
                                    ) : (
                                        <p className="text-emerald-600 text-sm font-bold inline-flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">check_circle</span>Changed by student</p>
                                    )}
                                </div>
                                {shownAppPw && (
                                    <button onClick={() => { navigator.clipboard?.writeText(shownAppPw); toast.success('Password copied'); }} className="shrink-0 w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-colors" title="Copy password">
                                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 w-full sm:w-auto shrink-0">
                    {isEditing ? (
                        <>
                            <button onClick={handleSaveEdit} disabled={isSaving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                                <span className="material-symbols-outlined text-[18px]">save</span> {isSaving ? 'Saving...' : 'Save Details'}
                            </button>
                            <button onClick={() => { setIsEditing(false); setEditData(student); }} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} disabled={isFrozen} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                            </button>
                            <button onClick={handleResetPassword} disabled={resetting} className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50">
                                <span className="material-symbols-outlined text-[18px]">lock_reset</span> {resetting ? 'Resetting…' : 'Reset Password'}
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
                                        Student Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                        {/* FIRST NAME */}
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">First Name</span>
                                            {isEditing ? (
                                                <input name="firstName" value={editData.firstName} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{student.firstName}</span>
                                            )}
                                        </div>
                                        {/* LAST NAME */}
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Name</span>
                                            {isEditing ? (
                                                <input name="lastName" value={editData.lastName} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{student.lastName}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Birth</span>
                                            <span className="font-bold text-slate-800 px-2 py-1">{new Date(student.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</span>
                                            <span className="font-bold text-slate-800 px-2 py-1">{student.gender}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Number</span>
                                            {isEditing ? (
                                                <input name="primaryContact" value={editData.primaryContact} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{student.primaryContact}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</span>
                                            {isEditing ? (
                                                <input name="parentEmail" value={editData.parentEmail} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" placeholder="Optional" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{student.parentEmail || 'Not Provided'}</span>
                                            )}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Address</span>
                                            {isEditing ? (
                                                <textarea name="currentAddress" value={editData.currentAddress} onChange={handleInputChange} rows="2" className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-medium text-slate-800 resize-none" />
                                            ) : (
                                                <span className="font-medium text-slate-600 px-2 py-1">{student.currentAddress}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-800 mb-6">
                                        <span className="material-symbols-outlined text-blue-600">family_restroom</span>
                                        Guardian Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Father's Name</span>
                                            {isEditing ? (
                                                <input name="fatherName" value={editData.fatherName} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{student.fatherName}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mother's Name</span>
                                            {isEditing ? (
                                                <input name="motherName" value={editData.motherName} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{student.motherName}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Occupation</span>
                                            <span className="font-bold text-slate-800 px-2 py-1">Not Provided</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Emergency Contact</span>
                                            <span className="font-bold text-slate-800 px-2 py-1">{student.primaryContact}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Academic' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-4">Academic History</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-6 rounded-2xl">
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Class</span>
                                        <span className="text-2xl font-black text-slate-800">{student.class} - {student.section}</span>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl">
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Date of Admission</span>
                                        <span className="text-2xl font-black text-slate-800">{student.dateOfAdmission ? new Date(student.dateOfAdmission).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">school</span>
                                    <p className="font-bold">No past academic records found.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Documents' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-4">Required Documents</h3>
                                
                                <div className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                                            <span className="material-symbols-outlined">fingerprint</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">Aadhaar Card</h4>
                                            <p className="text-sm font-medium text-slate-500">
                                                {student.aadhaarNumber ? `ID: ${student.aadhaarNumber}` : 'Not Available'}
                                            </p>
                                        </div>
                                    </div>
                                    {student.aadhaarNumber && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> Verified</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Stubs for empty sections */}
                        {(activeTab === 'Exams' || activeTab === 'Attendance') && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-fade-in">
                                <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">{activeTab === 'Exams' ? 'quiz' : 'event_available'}</span>
                                <h3 className="text-lg font-bold text-slate-600 mb-1">Not Enough Data</h3>
                                <p className="text-sm text-slate-400">There corresponds no records for this term yet.</p>
                            </div>
                        )}

                        {activeTab === 'Parent Chat' && (
                            <div className="animate-fade-in flex flex-col" style={{ height: '58vh' }}>
                                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                                    {chatLoading && chatAll.length === 0 ? (
                                        <p className="text-center text-slate-400 text-sm py-10">Loading…</p>
                                    ) : chatAll.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                            <span className="material-symbols-outlined text-5xl mb-3 text-slate-200">forum</span>
                                            <p className="text-sm font-medium">No messages yet with this parent.</p>
                                            <p className="text-xs text-slate-300 mt-1">Send a message — the parent sees it in their app.</p>
                                        </div>
                                    ) : (
                                        chatAll.map((m, i) => {
                                            const mine = m.from === 'admin';
                                            const prev = chatAll[i - 1];
                                            const showName = !mine && (!prev || prev.from !== m.from || prev.senderName !== m.senderName);
                                            const label = m.senderName || (m.from === 'teacher' ? 'Teacher' : 'Parent');
                                            return (
                                                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 shadow-sm ${mine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white text-slate-900 border border-slate-100 rounded-bl-md'}`}>
                                                        {showName && <p className={`text-[11px] font-extrabold mb-0.5 ${m.from === 'teacher' ? 'text-blue-600' : 'text-emerald-600'}`}>{label}</p>}
                                                        <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                                                        <span className={`block text-[10px] mt-1 text-right ${mine ? 'text-blue-100' : 'text-slate-400'}`}>{fmtChatTime(m.createdAt)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    {chatTypers.length > 0 && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-slate-500">{chatTypers.length > 1 ? 'Several people' : chatTyperName(chatTypers[0])}</span>
                                                <ChatTypingDots />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                                <form onSubmit={sendChat} className="mt-3 flex items-center gap-2">
                                    <input value={chatText} onChange={onChatChange} onBlur={stopChatTyping} placeholder="Message the parent…" className="flex-1 h-11 rounded-full bg-slate-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/40" />
                                    <button type="submit" disabled={!chatText.trim() || chatSending} className="h-11 px-5 rounded-full bg-blue-600 text-white font-bold text-sm disabled:opacity-40">Send</button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar Widget Canvas */}
                    <div className="w-full lg:w-[320px] p-6 sm:p-8 bg-slate-50/50 space-y-6 flex-shrink-0">
                        {/* Fake Calendar Widget */}
                        <div className="bg-[#f8fafc] border border-slate-100 rounded-3xl p-6 shadow-sm">
                            <h4 className="font-extrabold text-slate-800 mb-4 flex items-center justify-between">
                                Attendance Overview 
                                <div className="flex items-center gap-2">
                                    <button onClick={handlePrevMonth} className="material-symbols-outlined text-slate-400 hover:text-blue-600 text-sm">chevron_left</button>
                                    <span className="text-blue-600 text-sm w-16 text-center">{monthName}</span>
                                    <button onClick={handleNextMonth} className="material-symbols-outlined text-slate-400 hover:text-blue-600 text-sm">chevron_right</button>
                                </div>
                            </h4>
                            <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center mb-6">
                                {['M','T','W','T','F','S','S'].map(d=><div key={d} className="text-[10px] font-bold text-slate-400">{d}</div>)}
                                
                                {/* Offset empty blocks for first day alignment */}
                                {Array.from({ length: currentMonth.getDay() === 0 ? 6 : currentMonth.getDay() - 1 }).map((_, i) => (
                                    <div key={`empty-${i}`} className="w-6 h-6 mx-auto"></div>
                                ))}

                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNumber) => {
                                    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
                                    const isSunday = dateObj.getDay() === 0;

                                    const record = !isSunday ? (attStats.data || []).find(r => {
                                        if (!r.date) return false;
                                        const d = r.date.includes('T') ? new Date(r.date).getDate() : parseInt(r.date.split('-')[2], 10);
                                        return d === dayNumber;
                                    }) : null;

                                    const status = record?.status;
                                    const isP = status === 'Present' || status === 'P';
                                    const isA = status === 'Absent' || status === 'A';
                                    const isL = status === 'Leave' || status === 'L' || status === 'Late';
                                    
                                    const today = new Date();
                                    const isFuture = currentMonth.getFullYear() > today.getFullYear() || 
                                        (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() > today.getMonth()) ||
                                        (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth() && dayNumber > today.getDate());

                                    const showNM = !record && !isFuture && !isSunday;
                                    
                                    if (isSunday) return <div key={dayNumber} className="text-[10px] font-bold w-6 h-6 mx-auto rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">H</div>;
                                    if (isP) return <div key={dayNumber} className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">P</div>;
                                    if (isA) return <div key={dayNumber} className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-rose-500 text-white flex items-center justify-center">A</div>;
                                    if (isL) return <div key={dayNumber} className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-amber-400 text-white flex items-center justify-center">L</div>;
                                    if (showNM) return <div key={dayNumber} className="text-[8px] font-bold w-6 h-6 mx-auto rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">NM</div>;
                                    
                                    return <div key={dayNumber} className="text-xs font-bold w-6 h-6 mx-auto text-slate-500 border border-slate-100 rounded-full flex items-center justify-center shadow-sm">{dayNumber}</div>;
                                })}


                            </div>


                            <div className="flex justify-between items-center text-sm font-bold text-slate-500 mb-2">
                                <span>Total Days</span>

                                <span className="text-slate-800">{attStats.total}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-500 mb-6 border-b border-dashed border-slate-200 pb-4">
                                <span>Present</span>
                                <span className="text-emerald-500">{attStats.present}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Percentage</span>
                                <span className="text-2xl font-black text-blue-600">{attStats.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{width: `${attStats.percentage}%`}}></div>
                            </div>

                        </div>

                        {/* Academic Standing */}
                        <div className="bg-[#f0f5ff] rounded-3xl p-6 shadow-sm border border-blue-100">
                            <h4 className="font-extrabold text-blue-700 mb-4 text-sm">Academic standing</h4>
                            <div className="flex items-end gap-2 mb-3">
                                <span className="text-4xl font-black text-slate-800">A+</span>
                                <span className="text-sm font-bold text-slate-500 mb-1">Top 5%</span>
                            </div>
                            <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                {student.firstName} is currently leading the class in Mathematics and Science.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reset-password result modal */}
            {resetResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setResetResult(null)}>
                    <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-7" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined">lock_reset</span>
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Password reset</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1.5 mb-5">
                            {resetResult.emailed
                                ? `New login details were emailed to the parent (${resetResult.parentEmail}).`
                                : (resetResult.parentEmail
                                    ? "We couldn't email the parent right now — share the temporary password below."
                                    : 'No parent email is on file — share the temporary password below.')}
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 mb-4">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Temporary password</p>
                                <p className="font-mono font-extrabold text-lg text-blue-700 tracking-wide truncate">{resetResult.password}</p>
                            </div>
                            <button onClick={() => { navigator.clipboard?.writeText(resetResult.password); toast.success('Copied'); }} className="shrink-0 w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-[20px]">content_copy</span>
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mb-5">The student will be asked to set their own password the next time they sign in.</p>
                        <button onClick={() => setResetResult(null)} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">Done</button>
                    </div>
                </div>
            )}

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

export default StudentProfile;
