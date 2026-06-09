import React, { useState, useEffect } from 'react';
import ProfileButton from '../components/ProfileButton';
import MenuButton from '../components/MenuButton';
import Dropdown from '../components/Dropdown';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';

// /api/admin -> /api/upload
const UPLOAD_URL = `${ADMIN_API_BASE.replace('/admin', '')}/upload`;

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const formatDate = (d) => {
    if (!d) return null;
    try {
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return null; }
};

const dueMeta = (dueDate) => {
    if (!dueDate) return { label: 'No due date', tone: 'text-slate-400 bg-slate-50 border-slate-200' };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
    const diff = Math.round((due - today) / 86400000);
    if (diff < 0) return { label: `Overdue (${formatDate(dueDate)})`, tone: 'text-red-600 bg-red-50 border-red-200' };
    if (diff === 0) return { label: 'Due Today', tone: 'text-orange-600 bg-orange-50 border-orange-200' };
    if (diff === 1) return { label: 'Due Tomorrow', tone: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: `Due ${formatDate(dueDate)}`, tone: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
};

const Homework = () => {
    const schoolId = localStorage.getItem('scoolg_school_id');
    const schoolName = localStorage.getItem('scoolg_school_name') || 'General';

    // Classes come from the shared cache (loaded once at app start), so this
    // page renders instantly instead of re-fetching on every visit.
    const { classes, getSections } = useAdmin();
    const { toast } = useToast();
    const [sections, setSections] = useState([]);
    const [selectedClassObj, setSelectedClassObj] = useState(null);
    const [selectedSectionName, setSelectedSectionName] = useState('All');

    const [homeworkList, setHomeworkList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const emptyForm = { subject: '', title: '', description: '', dueDate: '', sectionName: 'All', attachments: [] };
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [allTimetables, setAllTimetables] = useState([]);

    // Pick a default class once the shared classes list is available.
    useEffect(() => {
        setSelectedClassObj((prev) => prev || (classes.length > 0 ? classes[0] : null));
    }, [classes]);

    // Load all timetables once — used to auto-resolve the subject teacher.
    useEffect(() => {
        if (!schoolId) return;
        axios.get(`${ADMIN_API_BASE}/timetables?schoolId=${schoolId}`)
            .then(r => setAllTimetables(Array.isArray(r.data) ? r.data : []))
            .catch(() => { });
    }, [schoolId]);

    // Find the teacher who teaches a subject in a class/section (from the timetable).
    const resolveTeacher = (className, sectionName, subject) => {
        if (!subject || !className) return '';
        const sub = subject.trim().toLowerCase();
        for (const tt of allTimetables) {
            if (tt.className !== className) continue;
            if (sectionName && sectionName !== 'All' && tt.sectionName !== sectionName) continue;
            for (const day of tt.schedule || []) {
                for (const p of day.periods || []) {
                    if (p.subject && p.subject.trim().toLowerCase() === sub && p.teacherName) return p.teacherName;
                }
            }
        }
        return '';
    };

    // Subjects for the selected class: from Manage Class + whatever is in its timetable.
    const classSubjects = [...new Set([
        ...((selectedClassObj?.subjects) || []),
        ...allTimetables
            .filter(tt => tt.className === selectedClassObj?.className)
            .flatMap(tt => (tt.schedule || []).flatMap(d => (d.periods || []).map(p => p.subject)))
            .filter(Boolean),
    ])];

    // Load sections when class changes (cached per class in context).
    useEffect(() => {
        let active = true;
        if (!selectedClassObj) { setSections([]); return; }
        getSections(selectedClassObj._id).then((data) => {
            if (active) setSections(data || []);
        });
        setSelectedSectionName('All');
        return () => { active = false; };
    }, [selectedClassObj, getSections]);

    const fetchHomework = async () => {
        if (!selectedClassObj) { setHomeworkList([]); setIsLoading(false); return; }
        setIsLoading(true);
        try {
            let url = `${ADMIN_API_BASE}/homework?schoolId=${schoolId}&className=${encodeURIComponent(selectedClassObj.className)}`;
            if (selectedSectionName && selectedSectionName !== 'All') {
                url += `&sectionName=${encodeURIComponent(selectedSectionName)}`;
            }
            const res = await axios.get(url);
            setHomeworkList(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('Error fetching homework', e);
            setHomeworkList([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (schoolId && selectedClassObj) fetchHomework();
    }, [selectedClassObj, selectedSectionName, schoolId]);

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm, sectionName: selectedSectionName || 'All' });
        setShowModal(true);
    };

    const openEdit = (hw) => {
        setEditingId(hw._id);
        setForm({
            subject: hw.subject || '',
            title: hw.title || '',
            description: hw.description || '',
            dueDate: hw.dueDate ? new Date(hw.dueDate).toISOString().slice(0, 10) : '',
            sectionName: hw.sectionName || 'All',
            attachments: hw.attachments || []
        });
        setShowModal(true);
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setIsUploading(true);
        try {
            const uploaded = [];
            for (const file of files) {
                const base64 = await fileToBase64(file);
                const res = await axios.post(UPLOAD_URL, { file: base64, folder: 'Homework', schoolName });
                if (res.data?.url) {
                    uploaded.push({ url: res.data.url, fileName: file.name, type: res.data.type || 'file' });
                }
            }
            setForm((f) => ({ ...f, attachments: [...f.attachments, ...uploaded] }));
        } catch (err) {
            console.error('Upload failed', err);
            toast.error('File upload failed. File too large ya invalid ho sakti hai.');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const removeAttachment = (idx) => {
        setForm((f) => ({ ...f, attachments: f.attachments.filter((_, i) => i !== idx) }));
    };

    const handleSave = async () => {
        if (!form.title.trim()) { toast.warning('Title is required'); return; }
        if (!selectedClassObj) { toast.warning('Please select a class'); return; }
        if (!form.dueDate) { toast.warning('Due date is required'); return; }
        setIsSaving(true);
        try {
            const payload = {
                schoolId,
                className: selectedClassObj.className,
                sectionName: form.sectionName || 'All',
                subject: form.subject,
                title: form.title,
                description: form.description,
                dueDate: form.dueDate || null,
                attachments: form.attachments,
                createdByRole: 'admin',
                createdByName: schoolName
            };
            if (editingId) {
                await axios.patch(`${ADMIN_API_BASE}/homework/${editingId}`, payload);
            } else {
                await axios.post(`${ADMIN_API_BASE}/homework`, payload);
            }
            setShowModal(false);
            setForm(emptyForm);
            setEditingId(null);
            fetchHomework();
        } catch (err) {
            console.error('Save error', err.response?.data || err.message);
            toast.error('Failed to save homework: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await axios.delete(`${ADMIN_API_BASE}/homework/${deleteTarget._id}`);
            setDeleteTarget(null);
            fetchHomework();
        } catch (err) {
            console.error('Delete error', err);
            toast.error('Failed to delete homework');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-10 relative">
            <div className="p-4 sm:p-8 space-y-6 max-w-full w-full">
                {/* Header */}
                <div className="flex justify-between items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                        <MenuButton />
                        <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight truncate">Homework & Assignments</h2>
                            <p className="text-slate-500 text-xs font-bold">Academic Session 2024-25</p>
                        </div>
                    </div>
                    <ProfileButton size={40} />
                </div>

                {/* Controls */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
                        <div className="flex flex-col min-w-[120px]">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Class</label>
                            <Dropdown
                                value={selectedClassObj?._id || ''}
                                onChange={(v) => setSelectedClassObj(classes.find(c => c._id === v))}
                                options={classes.length === 0 ? [{ value: '', label: 'No Classes' }] : classes.map(c => ({ value: c._id, label: c.className }))}
                                placeholder="Class"
                                className="w-full min-w-[120px]"
                                buttonClassName="h-10"
                            />
                        </div>
                        <div className="flex flex-col min-w-[120px]">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Section</label>
                            <Dropdown
                                value={selectedSectionName}
                                onChange={(v) => setSelectedSectionName(v)}
                                options={[{ value: 'All', label: 'All Sections' }, ...sections.map(s => ({ value: s.sectionName, label: s.sectionName }))]}
                                placeholder="All Sections"
                                className="w-full min-w-[120px]"
                                buttonClassName="h-10"
                            />
                        </div>
                    </div>

                    <button
                        onClick={openCreate}
                        disabled={!selectedClassObj}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#2563eb] text-white font-bold text-sm rounded-xl shadow-sm shadow-blue-500/30 hover:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Assign Homework
                    </button>
                </div>

                {/* List — shimmer cards */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <div className="flex gap-2 mb-3">
                                    <div className="h-5 w-16 bg-slate-100 rounded-lg animate-pulse"></div>
                                    <div className="h-5 w-24 bg-slate-100 rounded-lg animate-pulse"></div>
                                </div>
                                <div className="h-5 w-3/4 bg-slate-100 rounded-lg animate-pulse mb-3"></div>
                                <div className="h-3 w-full bg-slate-100 rounded-lg animate-pulse mb-1.5"></div>
                                <div className="h-3 w-5/6 bg-slate-100 rounded-lg animate-pulse mb-4"></div>
                                <div className="h-8 w-full bg-slate-100 rounded-lg animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                ) : homeworkList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300">
                        <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">assignment</span>
                        <h3 className="text-xl font-bold text-slate-600 mb-1">No Homework Yet</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            {classes.length === 0
                                ? `You haven't added any classes yet.`
                                : `No homework assigned for ${selectedClassObj?.className}${selectedSectionName !== 'All' ? ` - ${selectedSectionName}` : ''} yet.`}
                        </p>
                        {selectedClassObj && (
                            <button onClick={openCreate} className="px-6 py-3 bg-[#2563eb] text-white font-bold text-sm rounded-xl shadow-sm shadow-blue-500/30 hover:scale-95 transition-all">
                                Assign First Homework
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {homeworkList.map((hw) => {
                            const meta = dueMeta(hw.dueDate);
                            return (
                                <div key={hw._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col">
                                    <div className="flex justify-between items-start mb-3 gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {hw.subject && (
                                                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">{hw.subject}</span>
                                            )}
                                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                                                {hw.sectionName === 'All' ? 'All Sections' : `Sec ${hw.sectionName}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => openEdit(hw)} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-colors" title="Edit">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button onClick={() => setDeleteTarget(hw)} className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors" title="Delete">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="font-black text-slate-800 text-base leading-tight mb-1">{hw.title}</h3>
                                    {hw.description && <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-3">{hw.description}</p>}

                                    {hw.attachments?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {hw.attachments.map((a, i) => (
                                                <a key={i} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 transition-colors max-w-[160px]">
                                                    <span className="material-symbols-outlined text-[14px] text-blue-500">attach_file</span>
                                                    <span className="truncate">{a.fileName || 'Attachment'}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-50">
                                        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${meta.tone}`}>{meta.label}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{hw.createdByName || 'Admin'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-fade-in max-h-[92vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h3 className="text-xl font-[900] text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">{editingId ? 'edit' : 'assignment_add'}</span>
                                {editingId ? 'Edit Homework' : 'Assign Homework'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
                            <div className="bg-blue-50/60 border border-blue-100 rounded-xl px-4 py-2.5 text-xs font-bold text-blue-700 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">class</span>
                                Class {selectedClassObj?.className}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Section</label>
                                    <select
                                        value={form.sectionName}
                                        onChange={(e) => setForm({ ...form, sectionName: e.target.value })}
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="All">All Sections</option>
                                        {sections.map(s => <option key={s._id} value={s.sectionName}>{s.sectionName}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Subject</label>
                                    <select
                                        value={form.subject}
                                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    >
                                        <option value="">Select subject</option>
                                        {classSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    {selectedClassObj && classSubjects.length === 0 && (
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 ml-1">No subjects for this class yet — add them in Classes → Manage Class (or set them in the timetable).</p>
                                    )}
                                    {form.subject && (
                                        <p className="text-[11px] font-bold text-blue-600 mt-1.5 ml-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">person</span>
                                            Assigned by: {resolveTeacher(selectedClassObj?.className, form.sectionName, form.subject) || 'subject teacher (set in timetable)'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Algebra Worksheet Ch-4"
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Instructions for students..."
                                    className="w-full h-24 p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Due Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    required
                                    value={form.dueDate}
                                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                />
                            </div>

                            {/* Attachments */}
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Attachments</label>
                                <label className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed cursor-pointer transition-all ${isUploading ? 'border-blue-300 bg-blue-50 text-blue-500' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-400 hover:bg-blue-50'}`}>
                                    <span className="material-symbols-outlined text-[18px]">{isUploading ? 'progress_activity' : 'upload_file'}</span>
                                    <span className="text-xs font-bold">{isUploading ? 'Uploading...' : 'Add files (PDF, images)'}</span>
                                    <input type="file" multiple accept="image/*,application/pdf" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
                                </label>
                                {form.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {form.attachments.map((a, i) => (
                                            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 max-w-[180px]">
                                                <span className="material-symbols-outlined text-[14px] text-blue-500">description</span>
                                                <span className="truncate">{a.fileName || 'File'}</span>
                                                <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500">
                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 shrink-0">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                            <button onClick={handleSave} disabled={isSaving || isUploading} className="flex-1 py-3 bg-blue-600 text-white font-black text-sm rounded-xl shadow-md hover:bg-blue-700 hover:scale-[0.98] transition-all disabled:opacity-50">
                                {isSaving ? 'Saving...' : editingId ? 'Update' : 'Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation with preview */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-fade-in">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">delete</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 text-center mb-1">Delete this homework?</h3>
                        <p className="text-xs text-slate-500 text-center mb-5 font-medium">This action cannot be undone.</p>

                        {/* Preview */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {deleteTarget.subject && <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[9px] font-black uppercase">{deleteTarget.subject}</span>}
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase">
                                    {deleteTarget.sectionName === 'All' ? 'All Sections' : `Sec ${deleteTarget.sectionName}`}
                                </span>
                            </div>
                            <p className="font-black text-slate-800 text-sm leading-tight">{deleteTarget.title}</p>
                            {deleteTarget.dueDate && <p className="text-[11px] font-bold text-slate-400 mt-1">{dueMeta(deleteTarget.dueDate).label}</p>}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white font-black text-sm rounded-xl shadow-md hover:bg-red-700 hover:scale-[0.98] transition-all">Delete</button>
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

export default Homework;
