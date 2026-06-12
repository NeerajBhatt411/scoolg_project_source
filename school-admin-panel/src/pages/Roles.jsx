import React, { useState, useEffect } from 'react';
import ProfileButton from '../components/ProfileButton';
import MenuButton from '../components/MenuButton';
import Dropdown from '../components/Dropdown';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useToast } from '../context/ToastContext';

// Modules a staff user can be granted. Dashboard is always available.
const MODULES = [
    { key: 'students', label: 'Students', icon: 'group' },
    { key: 'teachers', label: 'Teachers', icon: 'school' },
    { key: 'classes', label: 'Classes', icon: 'class' },
    { key: 'timetable', label: 'Timetable', icon: 'calendar_today' },
    { key: 'homework', label: 'Homework', icon: 'assignment' },
    { key: 'attendance', label: 'Attendance', icon: 'fact_check' },
    { key: 'exams', label: 'Exams', icon: 'description' },
    { key: 'notices', label: 'Notices', icon: 'campaign' },
    { key: 'roles', label: 'Roles & Staff', icon: 'verified_user' },
];

// Ready-made role templates -> preset module access.
const ROLE_TEMPLATES = {
    'Class Teacher': ['attendance', 'homework', 'timetable', 'students'],
    'Receptionist': ['students', 'notices'],
    'Exam Coordinator': ['exams', 'classes'],
    'Academic Coordinator': ['timetable', 'homework', 'classes', 'teachers'],
    'Custom': [],
};

const Roles = () => {
    const { toast } = useToast();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [credentials, setCredentials] = useState(null);

    const emptyForm = { fullName: '', email: '', role: 'Class Teacher', allowedModules: ROLE_TEMPLATES['Class Teacher'] };
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${ADMIN_API_BASE}/staff`);
            setStaff(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('Error fetching staff', e);
            setStaff([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStaff(); }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    };

    const openEdit = (s) => {
        setEditingId(s._id);
        setForm({ fullName: s.fullName, email: s.email, role: s.role, allowedModules: s.allowedModules || [] });
        setError('');
        setShowModal(true);
    };

    const handleRoleChange = (role) => {
        // Switching to a template (other than Custom) replaces the module selection.
        if (role !== 'Custom' && ROLE_TEMPLATES[role]) {
            setForm((f) => ({ ...f, role, allowedModules: [...ROLE_TEMPLATES[role]] }));
        } else {
            setForm((f) => ({ ...f, role }));
        }
    };

    const toggleModule = (key) => {
        setForm((f) => {
            const has = f.allowedModules.includes(key);
            const mods = has ? f.allowedModules.filter(m => m !== key) : [...f.allowedModules, key];
            // Manual changes mean it's no longer a clean template.
            return { ...f, allowedModules: mods, role: f.role === 'Custom' ? 'Custom' : f.role };
        });
    };

    const handleSave = async () => {
        if (!form.fullName.trim()) return setError('Full name is required');
        if (!form.email.trim()) return setError('Email is required');
        setSaving(true);
        setError('');
        try {
            if (editingId) {
                await axios.patch(`${ADMIN_API_BASE}/staff/${editingId}`, {
                    fullName: form.fullName,
                    role: form.role,
                    allowedModules: form.allowedModules,
                });
                setShowModal(false);
                fetchStaff();
            } else {
                const res = await axios.post(`${ADMIN_API_BASE}/staff`, {
                    fullName: form.fullName,
                    email: form.email,
                    role: form.role,
                    allowedModules: form.allowedModules,
                });
                setShowModal(false);
                if (res.data?.credentials) setCredentials(res.data.credentials);
                fetchStaff();
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (s) => {
        try {
            await axios.patch(`${ADMIN_API_BASE}/staff/${s._id}`, { status: s.status === 'Active' ? 'Inactive' : 'Active' });
            fetchStaff();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await axios.delete(`${ADMIN_API_BASE}/staff/${deleteTarget._id}`);
            setDeleteTarget(null);
            fetchStaff();
        } catch (err) { console.error(err); toast.error('Failed to remove staff'); }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-10 relative">
            <div className="p-4 sm:p-8 space-y-6 max-w-full w-full">
                {/* Header */}
                <div className="flex justify-between items-center gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <MenuButton />
                        <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight truncate">Roles & Staff</h2>
                            <p className="text-slate-500 text-xs font-bold hidden sm:block">Manage staff access to your admin panel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button onClick={openCreate} className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-[#2563eb] text-white font-bold text-sm rounded-xl shadow-sm shadow-blue-500/30 hover:scale-95 transition-all">
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                            <span className="hidden sm:inline">Add Staff</span>
                        </button>
                        <ProfileButton size={40} />
                    </div>
                </div>

                {/* Owner note */}
                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl px-4 py-3 text-xs font-bold text-blue-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    You (the school account) are the Owner with full access. Staff below see only the sections you grant them.
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-slate-100 animate-pulse shrink-0"></div>
                                        <div className="space-y-2">
                                            <div className="h-3.5 w-28 bg-slate-100 rounded animate-pulse"></div>
                                            <div className="h-2.5 w-36 bg-slate-100 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="h-5 w-14 bg-slate-100 rounded-lg animate-pulse"></div>
                                </div>
                                <div className="h-5 w-20 bg-slate-100 rounded-lg animate-pulse mb-3"></div>
                                <div className="flex gap-1.5 mb-4">
                                    <div className="h-4 w-12 bg-slate-100 rounded-md animate-pulse"></div>
                                    <div className="h-4 w-16 bg-slate-100 rounded-md animate-pulse"></div>
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-slate-50">
                                    <div className="h-8 flex-1 bg-slate-100 rounded-lg animate-pulse"></div>
                                    <div className="h-8 flex-1 bg-slate-100 rounded-lg animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : staff.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300">
                        <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">group</span>
                        <h3 className="text-xl font-bold text-slate-600 mb-1">No Staff Members</h3>
                        <p className="text-sm text-slate-500 mb-6">Add accountants, teachers or receptionists with limited access.</p>
                        <button onClick={openCreate} className="px-6 py-3 bg-[#2563eb] text-white font-bold text-sm rounded-xl shadow-sm shadow-blue-500/30 hover:scale-95 transition-all">
                            Add First Staff
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {staff.map((s) => (
                            <div key={s._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-base uppercase">
                                            {s.fullName?.[0] || '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-sm leading-tight">{s.fullName}</h3>
                                            <p className="text-[11px] font-bold text-slate-400">{s.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {s.status}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">{s.role}</span>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-4 min-h-[24px]">
                                    {(s.allowedModules || []).length === 0 ? (
                                        <span className="text-[11px] font-bold text-slate-300">No modules granted</span>
                                    ) : (
                                        (s.allowedModules || []).map((m) => (
                                            <span key={m} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider">{m}</span>
                                        ))
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                                    <button onClick={() => openEdit(s)} className="flex-1 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                                    </button>
                                    <button onClick={() => toggleStatus(s)} className="flex-1 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">{s.status === 'Active' ? 'lock' : 'lock_open'}</span>
                                        {s.status === 'Active' ? 'Disable' : 'Enable'}
                                    </button>
                                    <button onClick={() => setDeleteTarget(s)} className="w-9 py-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center" title="Remove">
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-fade-in max-h-[92vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h3 className="text-xl font-[900] text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">{editingId ? 'manage_accounts' : 'person_add'}</span>
                                {editingId ? 'Edit Staff' : 'Add Staff'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name <span className="text-red-500">*</span></label>
                                    <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Rahul Sharma"
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email (login) <span className="text-red-500">*</span></label>
                                    <input type="email" value={form.email} disabled={!!editingId} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="staff@school.com"
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed" />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Role</label>
                                <Dropdown
                                    value={form.role}
                                    onChange={(v) => handleRoleChange(v)}
                                    options={Object.keys(ROLE_TEMPLATES)}
                                    className="w-full"
                                    buttonClassName="h-11 bg-slate-50"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1 block">Module Access</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {MODULES.map((m) => {
                                        const on = form.allowedModules.includes(m.key);
                                        return (
                                            <label key={m.key} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${on ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                                                <input type="checkbox" checked={on} onChange={() => toggleModule(m.key)} className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer" />
                                                <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
                                                <span className="text-xs font-bold">{m.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {error && <p className="text-xs font-bold text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                        </div>

                        <div className="flex gap-3 mt-6 shrink-0">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-blue-600 text-white font-black text-sm rounded-xl shadow-md hover:bg-blue-700 hover:scale-[0.98] transition-all disabled:opacity-50">
                                {saving ? 'Saving...' : editingId ? 'Update' : 'Create Staff'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Credentials modal (shown once after creating) */}
            {credentials && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-fade-in">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">key</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 text-center mb-1">Staff Account Created</h3>
                        <p className="text-xs text-slate-500 text-center mb-5 font-medium">Share these login details. The password is shown only once.</p>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 space-y-3">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                                <p className="font-black text-slate-800 text-sm break-all">{credentials.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Temporary Password</p>
                                <p className="font-black text-slate-800 text-sm">{credentials.password}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => { navigator.clipboard?.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`); }}
                            className="w-full py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all mb-2 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">content_copy</span> Copy Details
                        </button>
                        <button onClick={() => setCredentials(null)} className="w-full py-3 bg-blue-600 text-white font-black text-sm rounded-xl shadow-md hover:bg-blue-700 transition-all">Done</button>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-fade-in">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">person_remove</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 text-center mb-1">Remove this staff member?</h3>
                        <p className="text-xs text-slate-500 text-center mb-2 font-medium">They will no longer be able to log in.</p>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 text-center">
                            <p className="font-black text-slate-800 text-sm">{deleteTarget.fullName}</p>
                            <p className="text-[11px] font-bold text-slate-400">{deleteTarget.email}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white font-black text-sm rounded-xl shadow-md hover:bg-red-700 hover:scale-[0.98] transition-all">Remove</button>
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

export default Roles;
