import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, User, Phone, MapPin, Globe, Mail, BadgeCheck, Lock, Pencil, X } from 'lucide-react';
import { ADMIN_API_BASE } from '../lib/api';

// Only these fields are editable; everything else is identity/system data.
const EDITABLE_KEYS = ['schoolDescription', 'phone', 'address', 'city', 'vision', 'mission'];

const Profile = () => {
    const [formData, setFormData] = useState(null); // server truth
    const [draft, setDraft] = useState({});         // working copy while editing
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);   // { type: 'ok'|'err', text }

    const schoolId = localStorage.getItem('scoolg_school_id');

    useEffect(() => { fetchProfile(); /* eslint-disable-next-line */ }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${ADMIN_API_BASE}/profile/${schoolId}`);
            setFormData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = () => { setDraft({ ...formData }); setEditing(true); setMessage(null); };
    const cancelEdit = () => { setEditing(false); setMessage(null); };
    const setField = (k, v) => setDraft((p) => ({ ...p, [k]: v }));

    const handleSave = async () => {
        setSaving(true); setMessage(null);
        try {
            const payload = {};
            EDITABLE_KEYS.forEach((k) => { payload[k] = draft[k] ?? ''; });
            await axios.patch(`${ADMIN_API_BASE}/profile/${schoolId}`, payload);
            setFormData((prev) => ({ ...prev, ...payload }));
            setEditing(false);
            setMessage({ type: 'ok', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'err', text: err.response?.data?.error || 'Could not update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="p-6 sm:p-10 max-w-[1000px] mx-auto">
            {/* title row */}
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <div className="h-7 w-44 bg-slate-200 rounded-lg animate-pulse"></div>
                    <div className="h-3.5 w-64 bg-slate-100 rounded-lg animate-pulse"></div>
                </div>
                <div className="h-11 w-32 bg-slate-100 rounded-xl animate-pulse"></div>
            </div>
            {/* identity header */}
            <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 sm:p-8 mb-6 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="h-24 w-24 rounded-3xl bg-slate-100 animate-pulse shrink-0"></div>
                <div className="flex-1 space-y-3">
                    <div className="h-6 w-56 bg-slate-100 rounded-lg animate-pulse"></div>
                    <div className="flex gap-4">
                        <div className="h-4 w-40 bg-slate-100 rounded animate-pulse"></div>
                        <div className="h-4 w-28 bg-slate-100 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-32 bg-slate-100 rounded-lg animate-pulse"></div>
                </div>
            </div>
            {/* section cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[0, 1].map((i) => (
                    <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse"></div>
                            <div className="h-5 w-36 bg-slate-100 rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-5">
                            {[0, 1, 2].map((j) => (
                                <div key={j} className="space-y-2">
                                    <div className="h-2.5 w-24 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="h-5 w-3/4 bg-slate-100 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (!formData) return (
        <div className="p-10 text-center">
            <h1 className="text-2xl font-extrabold text-slate-900">Profile Not Found</h1>
            <p className="text-slate-500">We couldn't load your school profile. Please try again later.</p>
        </div>
    );

    const src = editing ? draft : formData;
    const code = ((formData.schoolName || 'SCH').substring(0, 3) + (schoolId || '').slice(-4)).toUpperCase();
    const logo = formData.logo || formData.schoolLogo;
    const st = (formData.status || '').toUpperCase();
    const statusCls = (st === 'COMPLETED' || st === 'ACTIVE') ? 'bg-emerald-50 text-emerald-600'
        : st === 'PENDING' ? 'bg-amber-50 text-amber-600'
        : (st === 'SUSPENDED' || st === 'INACTIVE') ? 'bg-rose-50 text-rose-600'
        : 'bg-slate-100 text-slate-500';

    const inputCls = 'w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-[14px] outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all';

    const Field = ({ label, k, locked, textarea }) => {
        const val = src[k];
        return (
            <div>
                <label className="flex items-center gap-1 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    {label}{locked && <Lock size={11} className="text-slate-300" />}
                </label>
                {editing && !locked ? (
                    textarea
                        ? <textarea value={val || ''} onChange={(e) => setField(k, e.target.value)} className={inputCls + ' h-24 py-2.5 resize-none'} />
                        : <input value={val || ''} onChange={(e) => setField(k, e.target.value)} className={inputCls} />
                ) : (
                    <p className={`text-[14.5px] font-semibold ${val ? 'text-slate-800' : 'text-slate-300'} ${textarea ? 'leading-relaxed whitespace-pre-wrap' : ''}`}>{val || '—'}</p>
                )}
            </div>
        );
    };

    const SectionCard = ({ icon, iconBg, iconColor, title, children, full }) => (
        <div className={`bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 ${full ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: iconBg }}>{React.cloneElement(icon, { size: 18, color: iconColor })}</div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>
            {children}
        </div>
    );

    return (
        <div className="p-6 sm:p-10 max-w-[1000px] mx-auto">
            {/* title + actions */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Profile</h1>
                    <p className="text-slate-500 font-medium text-sm">{editing ? 'Update your school information.' : 'Your school information at a glance.'}</p>
                </div>
                {editing ? (
                    <div className="flex items-center gap-2">
                        <button onClick={cancelEdit} disabled={saving} className="px-4 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm inline-flex items-center gap-1.5 transition-colors disabled:opacity-50">
                            <X size={18} /> Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving} className="px-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm inline-flex items-center gap-1.5 transition-colors disabled:opacity-60 shadow-lg shadow-blue-600/25">
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                ) : (
                    <button onClick={startEdit} className="px-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm inline-flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-600/25">
                        <Pencil size={17} /> Edit Profile
                    </button>
                )}
            </div>

            {message && (
                <div className={`px-4 py-3 rounded-xl mb-6 text-sm font-bold ${message.type === 'ok' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {message.text}
                </div>
            )}

            {/* identity header (read-only) */}
            <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 sm:p-8 mb-6 flex flex-col sm:flex-row sm:items-center gap-6">
                {logo ? (
                    <div className="h-24 w-24 rounded-3xl shrink-0 flex items-center justify-center overflow-hidden">
                        <img src={logo} alt="School logo" className="max-h-full max-w-full object-contain" />
                    </div>
                ) : (
                    <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center text-4xl font-black shrink-0 shadow-lg shadow-blue-600/20">
                        {(formData.schoolName?.charAt(0) || 'S').toUpperCase()}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{formData.schoolName || 'Your School'}</h2>
                        {st && <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusCls}`}><BadgeCheck size={12} />{st}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
                        <span className="flex items-center gap-2 text-slate-600 text-sm font-semibold min-w-0"><Mail size={16} className="text-slate-400 shrink-0" /><span className="truncate">{formData.email || '—'}</span></span>
                        <span className="flex items-center gap-2 text-slate-600 text-sm font-semibold"><Phone size={16} className="text-slate-400 shrink-0" />{formData.phone || '—'}</span>
                        <span className="flex items-center gap-2 text-slate-600 text-sm font-semibold"><MapPin size={16} className="text-slate-400 shrink-0" />{formData.city || '—'}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">School Code</span>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-black tabular-nums">{code}</span>
                        {formData.establishedYear && <span className="ml-2 text-[12px] font-bold text-slate-400">Est. {formData.establishedYear}</span>}
                    </div>
                </div>
            </div>

            {/* editable sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard icon={<User />} iconBg="#eff6ff" iconColor="#2563eb" title="Basic Information">
                    <div className="space-y-5">
                        <Field label="School Name" k="schoolName" locked />
                        <Field label="Established Year" k="establishedYear" locked />
                        <Field label="Description" k="schoolDescription" textarea />
                    </div>
                </SectionCard>

                <SectionCard icon={<Phone />} iconBg="#fef2f2" iconColor="#ef4444" title="Contact Details">
                    <div className="space-y-5">
                        <Field label="Official Phone" k="phone" />
                        <Field label="Full Address" k="address" textarea />
                        <Field label="City" k="city" />
                    </div>
                </SectionCard>

                <SectionCard icon={<Globe />} iconBg="#fffbeb" iconColor="#f59e0b" title="Academic Overview" full>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="Vision Statement" k="vision" textarea />
                        <Field label="Mission Statement" k="mission" textarea />
                    </div>
                </SectionCard>
            </div>
        </div>
    );
};

export default Profile;
