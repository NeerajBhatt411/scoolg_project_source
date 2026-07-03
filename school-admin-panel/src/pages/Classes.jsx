import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileButton from '../components/ProfileButton';
import MenuButton from '../components/MenuButton';
import Dropdown from '../components/Dropdown';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';

const Classes = () => {
    // classes & teachers come from the shared AdminContext cache (loaded once at
    // app start) so visiting this page doesn't refetch them every time.
    const { classes, teachers, students, invalidateAcademic, refreshClasses } = useAdmin();
    const teachersList = teachers;
    const { toast } = useToast();
    const navigate = useNavigate();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(classes.length === 0);

    // Add Class Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [newSectionName, setNewSectionName] = useState('');
    const [newClassSubjects, setNewClassSubjects] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Manage Class modal state (sections + subjects together)
    const [manageClass, setManageClass] = useState(null);
    const [renameVal, setRenameVal] = useState('');
    const [renaming, setRenaming] = useState(false);
    const [deletingClass, setDeletingClass] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editSubjects, setEditSubjects] = useState([]);
    const [subjectInput, setSubjectInput] = useState('');
    const [newSecName, setNewSecName] = useState('');
    const [savingManage, setSavingManage] = useState(false);
    const [subjectsSaved, setSubjectsSaved] = useState(false);

    const schoolId = localStorage.getItem('scoolg_school_id');
    useEffect(() => {
        fetchSections();
        // classes already come from context; only fetch if the cache is empty.
        if (classes.length === 0) refreshClasses(true).finally(() => setLoading(false));
        else setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const assignClassTeacher = async (sectionId, teacherId) => {
        try {
            await axios.patch(`${ADMIN_API_BASE}/sections/${sectionId}`, { classTeacherId: teacherId || null });
            await fetchSections();
            invalidateAcademic();
        } catch (err) {
            toast.error('Failed to assign class teacher');
        }
    };

    const fetchSections = async () => {
        try {
            const res = await axios.get(`${ADMIN_API_BASE}/sections?schoolId=${schoolId}`);
            setSections(res.data);
        } catch (err) {
            console.error("Failed to fetch sections", err);
        }
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        if (!newClassName.trim() || !newClassSubjects.trim()) {
            toast.warning("Class Name and Subjects are compulsory");
            return;
        }

        const sectionToCreate = newSectionName.trim() || "General";

        try {
            setIsSubmitting(true);
            const subjectList = newClassSubjects.split(',').map(s => s.trim()).filter(s => s !== "");

            // 1. Create/Find Class
            const classRes = await axios.post(`${ADMIN_API_BASE}/classes`, {
                schoolId,
                className: newClassName.trim(),
                subjects: subjectList,
                order: classes.length + 1
            });
            const classDoc = classRes.data;

            // 2. Create Section
            await axios.post(`${ADMIN_API_BASE}/sections`, {
                schoolId,
                classId: classDoc._id,
                sectionName: sectionToCreate,
                maxCapacity: 40
            });

            invalidateAcademic(); // refreshes the shared classes/section caches
            setIsAddModalOpen(false);
            setNewClassName('');
            setNewSectionName('');
            setNewClassSubjects('');
        } catch (err) {
            console.error("Failed to add class", err);
            toast.error("Error adding class: " + (err.response?.data?.error || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Manage Class (sections + subjects in one place) ---
    const openManageClass = (cls) => { setManageClass(cls); setRenameVal(cls.className || ''); setEditSubjects([...(cls.subjects || [])]); setSubjectInput(''); setNewSecName(''); setSubjectsSaved(false); };

    const saveClassName = async () => {
        const name = renameVal.trim();
        if (!name || name === manageClass.className) return;
        setRenaming(true);
        try {
            const res = await axios.patch(`${ADMIN_API_BASE}/classes/${manageClass._id}/rename`, { className: name });
            setManageClass(c => c ? { ...c, className: name } : c);
            invalidateAcademic?.();
            await refreshClasses(true);
            const u = res.data?.updated || {};
            toast.success(`Class renamed to "${name}" (updated ${u.students || 0} students, ${u.timetables || 0} timetables)`);
        } catch (e) {
            toast.error(e.response?.data?.error || 'Failed to rename class');
        } finally { setRenaming(false); }
    };

    const confirmDeleteClass = async () => {
        setDeletingClass(true);
        try {
            await axios.delete(`${ADMIN_API_BASE}/classes/${manageClass._id}`);
            toast.success('Class deleted');
            setShowDeleteConfirm(false);
            setManageClass(null);
            invalidateAcademic?.();
            await refreshClasses(true);
            await fetchSections();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Failed to delete class');
        } finally { setDeletingClass(false); }
    };
    const addSubjectChip = () => {
        const v = subjectInput.trim();
        if (v && !editSubjects.includes(v)) setEditSubjects([...editSubjects, v]);
        setSubjectInput('');
        setSubjectsSaved(false);
    };
    const removeSubjectChip = (s) => { setEditSubjects(editSubjects.filter(x => x !== s)); setSubjectsSaved(false); };
    const saveSubjects = async () => {
        setSavingManage(true);
        try {
            await axios.patch(`${ADMIN_API_BASE}/classes/${manageClass._id}`, { subjects: editSubjects });
            invalidateAcademic();
            setManageClass(c => c ? { ...c, subjects: editSubjects } : c);
            setSubjectsSaved(true);
            setTimeout(() => setSubjectsSaved(false), 2000);
        } catch (err) {
            toast.error('Failed to save subjects: ' + (err.response?.data?.error || err.message));
        } finally { setSavingManage(false); }
    };

    const addSection = async () => {
        const name = newSecName.trim();
        if (!name) return;
        setSavingManage(true);
        try {
            await axios.post(`${ADMIN_API_BASE}/sections`, { schoolId, classId: manageClass._id, sectionName: name, maxCapacity: 40 });
            await fetchSections();
            invalidateAcademic();
            setNewSecName('');
        } catch (err) {
            toast.error('Failed to add section: ' + (err.response?.data?.error || err.message));
        } finally { setSavingManage(false); }
    };
    const deleteSection = async (id) => {
        if (!window.confirm('Delete this section?')) return;
        try {
            await axios.delete(`${ADMIN_API_BASE}/sections/${id}`);
            await fetchSections();
            invalidateAcademic();
        } catch (err) {
            toast.error('Failed to delete section');
        }
    };

    const sectionsOf = (clsId) => sections.filter(s => String(s.classId?._id || s.classId) === String(clsId));

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-10 relative">
            {/* TopNavBar */}
            <header className="h-16 md:h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-row justify-between items-center gap-4 px-4 md:px-8">
                <div className="flex items-center gap-2 min-w-0">
                    <MenuButton />
                    <h2 className="text-lg sm:text-[1.6rem] font-[900] text-[#2563eb] tracking-tight leading-tight truncate">
                        <span className="sm:hidden">Classes</span>
                        <span className="hidden sm:inline">Class & Section Management</span>
                    </h2>
                </div>
                <div className="flex items-center gap-3 md:gap-4 shrink-0 justify-end">
                    <div className="relative group hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            className="w-48 xl:w-64 h-10 pl-10 pr-4 rounded-xl border-none bg-slate-100 focus:ring-2 focus:ring-[#2563eb]/40 focus:bg-white transition-all text-xs font-semibold placeholder-slate-400"
                            placeholder="Search classes..."
                            type="text"
                        />
                    </div>
                    <ProfileButton size={40} />
                </div>
            </header>

            {/* Content Canvas */}
            <div className="p-4 sm:p-8 space-y-6 max-w-full w-full">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
                    <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">OVERVIEW</p>
                        <h3 className="text-2xl font-black text-slate-800">Active Classes ({classes.length})</h3>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#2563eb] text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Add Class
                    </button>
                </div>

                {/* Loading State — shimmer cards */}
                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-[24px] p-6 premium-shadow">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 animate-pulse shrink-0"></div>
                                        <div className="flex flex-col justify-center gap-2">
                                            <div className="h-5 w-32 bg-slate-100 rounded-lg animate-pulse"></div>
                                            <div className="h-3 w-44 bg-slate-100 rounded-lg animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse"></div>
                                </div>
                                <div className="h-[1px] w-full bg-slate-100 my-4"></div>
                                <div className="flex flex-wrap gap-2">
                                    <div className="h-6 w-16 bg-slate-100 rounded-lg animate-pulse"></div>
                                    <div className="h-6 w-20 bg-slate-100 rounded-lg animate-pulse"></div>
                                    <div className="h-6 w-14 bg-slate-100 rounded-lg animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : classes.length === 0 ? (
                    <div className="bg-white rounded-[24px] p-10 text-center text-slate-500 premium-shadow">
                        <span className="material-symbols-outlined text-[48px] text-slate-300 mb-4">school</span>
                        <h4 className="text-lg font-bold text-slate-700">No classes found</h4>
                        <p className="text-sm">Click the 'Add Class' button above to create your first class.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {classes.map((cls, idx) => (
                            <div key={cls._id || idx} className="bg-white rounded-[24px] p-6 premium-shadow hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0 border border-blue-100 text-2xl font-black font-mono">
                                            {cls.className.charAt(0)}
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="text-xl font-bold text-slate-800">{cls.className}</h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <span className="material-symbols-outlined text-[16px]">group</span>
                                                    <span className="text-[13px] font-semibold">{(students || []).filter(s => s.class === cls.className).length} Students</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <span className="material-symbols-outlined text-[16px]">layers</span>
                                                    <span className="text-[13px] font-semibold">{sections.filter(s => String(s.classId) === String(cls._id)).length} Sections</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#2563eb]">
                                        <button onClick={() => openManageClass(cls)} title="Edit class" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="h-[1px] w-full bg-slate-100 my-4"></div>

                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">CURRICULUM SUBJECTS</p>
                                        <div className="flex flex-wrap gap-2">
                                            {cls.subjects && cls.subjects.length > 0 ? (
                                                cls.subjects.map((sub, sIdx) => (
                                                    <span key={sIdx} className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-black rounded-lg border border-blue-100 uppercase tracking-wider">
                                                        {sub}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No subjects added yet</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2 md:pt-0 justify-end md:justify-start">
                                        <button onClick={() => navigate('/classes/detail', { state: { cls } })} className="px-5 py-2.5 bg-blue-50 text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors inline-flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            View Details
                                        </button>
                                        <button onClick={() => openManageClass(cls)} className="px-5 py-2.5 bg-[#2563eb] text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">tune</span>
                                            Manage Class
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Class Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Add New Class</h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddClass}>
                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                        Class Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                        placeholder="e.g. Class 1, Nursery, LKG"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all font-semibold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Section Name (Optional)</label>
                                    <input
                                        type="text"
                                        value={newSectionName}
                                        onChange={(e) => setNewSectionName(e.target.value)}
                                        placeholder="e.g. A, B (Defaults to General)"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all font-semibold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                        Subjects (Comma separated) <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        required
                                        value={newClassSubjects}
                                        onChange={(e) => setNewClassSubjects(e.target.value)}
                                        placeholder="e.g. Math, English, Hindi"
                                        className="w-full h-24 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all font-semibold outline-none resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-[#2563eb] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Saving...' : 'Save Class'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Class Modal — sections + subjects in one place */}
            {manageClass && (
                <div onClick={() => setManageClass(null)} className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                            <div>
                                <h3 className="font-black text-slate-900 text-xl">Manage Class</h3>
                                <p className="text-[13px] font-bold text-blue-600 mt-0.5">{manageClass.className}</p>
                            </div>
                            <button onClick={() => setManageClass(null)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 grid place-items-center text-slate-600"><span className="material-symbols-outlined text-[20px]">close</span></button>
                        </div>

                        <div className="px-6 py-5 overflow-y-auto space-y-7">
                            {/* Class name (rename) */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-blue-600 text-[20px]">badge</span>
                                    <h4 className="font-black text-slate-800">Class Name</h4>
                                </div>
                                <div className="flex gap-2">
                                    <input value={renameVal} onChange={(e) => setRenameVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveClassName(); } }} className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all" />
                                    <button onClick={saveClassName} disabled={renaming || !renameVal.trim() || renameVal.trim() === manageClass.className} className="px-4 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors disabled:opacity-50">{renaming ? '…' : 'Rename'}</button>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1.5">Renaming also updates this class's students, timetables &amp; homework.</p>
                            </div>

                            {/* Sections */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-blue-600 text-[20px]">layers</span>
                                    <h4 className="font-black text-slate-800">Sections</h4>
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <input value={newSecName} onChange={(e) => setNewSecName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSection(); } }} placeholder="New section (e.g. A)" className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all" />
                                    <button onClick={addSection} disabled={savingManage} className="px-4 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors disabled:opacity-60">Add</button>
                                </div>
                                <div className="space-y-2">
                                    {sectionsOf(manageClass._id).length === 0 ? (
                                        <span className="text-sm text-slate-400 font-semibold">No sections yet — class works with just its subjects below.</span>
                                    ) : sectionsOf(manageClass._id).map((sec) => (
                                        <div key={sec._id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-100">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 grid place-items-center font-black shrink-0">{sec.sectionName?.charAt(0) || '?'}</div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 text-sm">Section {sec.sectionName}</p>
                                                    <Dropdown
                                                        value={sec.classTeacherId?._id || ''}
                                                        onChange={(v) => assignClassTeacher(sec._id, v)}
                                                        options={[{ value: '', label: 'No class teacher' }, ...teachersList.map(t => ({ value: t._id, label: t.fullName }))]}
                                                        className="mt-1 w-[170px] max-w-full"
                                                        buttonClassName="h-8"
                                                    />
                                                </div>
                                            </div>
                                            <button onClick={() => deleteSection(sec._id)} className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 grid place-items-center transition-colors shrink-0"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Subjects */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-blue-600 text-[20px]">menu_book</span>
                                    <h4 className="font-black text-slate-800">Subjects</h4>
                                    <span className="text-[11px] font-bold text-slate-400">(apply to the whole class)</span>
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <input value={subjectInput} onChange={(e) => setSubjectInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubjectChip(); } }} placeholder="Add a subject (e.g. Mathematics)" className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all" />
                                    <button onClick={addSubjectChip} className="px-4 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2 min-h-[36px]">
                                    {editSubjects.length === 0 ? (
                                        <span className="text-sm text-slate-400 font-semibold">No subjects yet. Add some above.</span>
                                    ) : editSubjects.map((s) => (
                                        <span key={s} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100">
                                            {s}
                                            <button onClick={() => removeSubjectChip(s)} className="w-5 h-5 grid place-items-center rounded text-blue-400 hover:text-rose-500 hover:bg-white"><span className="material-symbols-outlined text-[15px]">close</span></button>
                                        </span>
                                    ))}
                                </div>
                                <button onClick={saveSubjects} disabled={savingManage} className={`mt-3 h-10 px-5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 ${subjectsSaved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                                    {savingManage ? 'Saving…' : subjectsSaved ? '✓ Subjects saved' : 'Save Subjects'}
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(true)} className="h-11 px-5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm transition-colors inline-flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">delete</span> Delete Class
                            </button>
                            <button onClick={() => setManageClass(null)} className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors">Done</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete-class confirmation dialog */}
            {showDeleteConfirm && manageClass && (
                <div onClick={() => !deletingClass && setShowDeleteConfirm(false)} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-sm p-7 shadow-2xl animate-fade-in-up">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 mx-auto">
                            <span className="material-symbols-outlined text-3xl">delete</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center mb-2">Delete "{manageClass.className}"?</h3>
                        <p className="text-sm text-slate-500 text-center font-medium mb-1">
                            {(() => {
                                const n = (students || []).filter(s => s.class === manageClass.className).length;
                                return n > 0
                                    ? <>This class has <b className="text-slate-800">{n} student{n > 1 ? 's' : ''}</b> — they'll be left without a class.</>
                                    : 'This class has no students.';
                            })()}
                        </p>
                        <p className="text-xs text-slate-400 text-center mb-6">Its sections &amp; timetable will also be removed. This can't be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} disabled={deletingClass} className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors disabled:opacity-50">Cancel</button>
                            <button onClick={confirmDeleteClass} disabled={deletingClass} className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-colors disabled:opacity-50">{deletingClass ? 'Deleting…' : 'Delete'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classes;
