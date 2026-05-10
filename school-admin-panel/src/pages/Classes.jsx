import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add Class Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [newSectionName, setNewSectionName] = useState('');
    const [newClassSubjects, setNewClassSubjects] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const schoolId = localStorage.getItem('scoolg_school_id');
    const API_BASE = 'http://localhost:5001/api/admin';

    useEffect(() => {
        fetchClasses();
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const res = await axios.get(`${API_BASE}/sections?schoolId=${schoolId}`);
            setSections(res.data);
        } catch (err) {
            console.error("Failed to fetch sections", err);
        }
    };

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/classes?schoolId=${schoolId}`);
            setClasses(res.data);
        } catch (err) {
            console.error("Failed to fetch classes", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        if (!newClassName.trim() || !newClassSubjects.trim()) {
            return alert("Class Name and Subjects are compulsory");
        }

        const sectionToCreate = newSectionName.trim() || "General";

        try {
            setIsSubmitting(true);
            const subjectList = newClassSubjects.split(',').map(s => s.trim()).filter(s => s !== "");

            // 1. Create/Find Class
            const classRes = await axios.post(`${API_BASE}/classes`, {
                schoolId,
                className: newClassName.trim(),
                subjects: subjectList,
                order: classes.length + 1
            });
            const classDoc = classRes.data;

            // 2. Create Section
            await axios.post(`${API_BASE}/sections`, {
                schoolId,
                classId: classDoc._id,
                sectionName: sectionToCreate,
                maxCapacity: 40
            });

            await fetchClasses();
            setIsAddModalOpen(false);
            setNewClassName('');
            setNewSectionName('');
            setNewClassSubjects('');
        } catch (err) {
            console.error("Failed to add class", err);
            alert("Error adding class: " + (err.response?.data?.error || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-10 relative">
            {/* TopNavBar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex flex-col w-full md:w-auto">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Console</p>
                    <h2 className="text-[1.3rem] md:text-[1.6rem] font-[900] text-[#2563eb] tracking-tight leading-tight">Class & Section Management</h2>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <div className="relative group hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            className="w-48 xl:w-64 h-10 pl-10 pr-4 rounded-xl border-none bg-slate-100 focus:ring-2 focus:ring-[#2563eb]/40 focus:bg-white transition-all text-xs font-semibold placeholder-slate-400"
                            placeholder="Search classes..."
                            type="text"
                        />
                    </div>
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

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-[#2563eb] rounded-full animate-spin"></div>
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
                                                    <span className="text-[13px] font-semibold">0 Students</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <span className="material-symbols-outlined text-[16px]">layers</span>
                                                    <span className="text-[13px] font-semibold">{sections.filter(s => String(s.classId) === String(cls._id)).length} Sections</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#2563eb]">
                                        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors">
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

                                    <div className="flex items-center gap-4 pt-2 md:pt-0 justify-end md:justify-start">
                                        <button className="text-sm font-bold text-[#2563eb] hover:text-blue-700 transition-colors">
                                            Manage Subjects
                                        </button>
                                        <button className="px-5 py-2.5 bg-[#eff6ff] text-[#2563eb] font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors">
                                            Manage Sections
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
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
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
        </div>
    );
};

export default Classes;
