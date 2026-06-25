import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, User, Users, Phone, MapPin, Globe, Mail, BadgeCheck, Lock, Pencil, X, Camera, Image as ImageIcon, Images, Plus } from 'lucide-react';
import { ADMIN_API_BASE, API_BASE } from '../lib/api';
import MenuButton from '../components/MenuButton';

// Only these fields are editable; everything else is identity/system data.
const EDITABLE_KEYS = ['schoolDescription', 'phone', 'address', 'city', 'vision', 'mission'];

const Profile = () => {
    const [formData, setFormData] = useState(null); // server truth
    const [draft, setDraft] = useState({});         // working copy while editing
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [leaderUploading, setLeaderUploading] = useState(null); // index being uploaded
    const [coverUploading, setCoverUploading] = useState(false);
    const [galleryAdding, setGalleryAdding] = useState(false);
    const [message, setMessage] = useState(null);   // { type: 'ok'|'err', text }

    const schoolId = localStorage.getItem('scoolg_school_id');

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(file);
    });

    // Upload a new school logo -> Cloudinary -> save it on the profile.
    const handleLogoChange = async (file) => {
        if (!file) return;
        if (!file.type?.startsWith('image/')) { setMessage({ type: 'err', text: 'Please choose an image file (PNG/JPG).' }); return; }
        setUploadingLogo(true); setMessage(null);
        try {
            const base64 = await fileToBase64(file);
            const up = await axios.post(`${API_BASE}/upload`, { file: base64, folder: 'Logos', schoolName: formData?.schoolName || 'School' });
            const url = up.data?.url;
            if (!url) throw new Error('Upload failed');
            await axios.patch(`${ADMIN_API_BASE}/profile/${schoolId}`, { logo: url });
            setFormData((prev) => ({ ...prev, logo: url, schoolLogo: url }));
            // Keep the sidebar in sync (cache + live event) so it updates immediately.
            localStorage.setItem('scoolg_school_logo', url);
            window.dispatchEvent(new CustomEvent('school-logo-updated', { detail: url }));
            setMessage({ type: 'ok', text: 'Logo updated! It will show on your website shortly.' });
            setTimeout(() => setMessage(null), 4000);
        } catch (err) {
            setMessage({ type: 'err', text: err.response?.data?.error || 'Logo upload failed — try a smaller image (under ~2MB).' });
        } finally {
            setUploadingLogo(false);
        }
    };

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

    // --- Leadership editing (in the draft) ---
    const setLeader = (i, key, val) => setDraft((p) => {
        const list = [...(p.leadership || [])];
        list[i] = { ...list[i], [key]: val };
        return { ...p, leadership: list };
    });
    const addLeader = () => setDraft((p) => ({ ...p, leadership: [...(p.leadership || []), { name: '', role: '', message: '', photo: '' }] }));
    const removeLeader = (i) => setDraft((p) => ({ ...p, leadership: (p.leadership || []).filter((_, idx) => idx !== i) }));
    const handleLeaderPhoto = async (i, file) => {
        if (!file) return;
        if (!file.type?.startsWith('image/')) { setMessage({ type: 'err', text: 'Please choose an image file.' }); return; }
        setLeaderUploading(i);
        try {
            const base64 = await fileToBase64(file);
            const up = await axios.post(`${API_BASE}/upload`, { file: base64, folder: 'Leadership', schoolName: formData?.schoolName || 'School' });
            if (up.data?.url) setLeader(i, 'photo', up.data.url);
            else throw new Error('Upload failed');
        } catch (err) {
            setMessage({ type: 'err', text: 'Photo upload failed — try a smaller image.' });
        } finally {
            setLeaderUploading(null);
        }
    };

    // --- Cover (feature) image + Gallery (edited in the draft, saved on Save) ---
    const handleCoverChange = async (file) => {
        if (!file) return;
        if (!file.type?.startsWith('image/')) { setMessage({ type: 'err', text: 'Please choose an image file.' }); return; }
        setCoverUploading(true);
        try {
            const base64 = await fileToBase64(file);
            const up = await axios.post(`${API_BASE}/upload`, { file: base64, folder: 'Cover', schoolName: formData?.schoolName || 'School' });
            if (up.data?.url) setDraft((p) => ({ ...p, coverImage: up.data.url }));
            else throw new Error('Upload failed');
        } catch (err) {
            setMessage({ type: 'err', text: 'Cover upload failed — try a smaller image.' });
        } finally { setCoverUploading(false); }
    };
    const addGalleryImage = async (file) => {
        if (!file) return;
        if (!file.type?.startsWith('image/')) { setMessage({ type: 'err', text: 'Please choose an image file.' }); return; }
        setGalleryAdding(true);
        try {
            const base64 = await fileToBase64(file);
            const up = await axios.post(`${API_BASE}/upload`, { file: base64, folder: 'Gallery', schoolName: formData?.schoolName || 'School' });
            if (up.data?.url) setDraft((p) => ({ ...p, gallery: [...(p.gallery || []), up.data.url] }));
            else throw new Error('Upload failed');
        } catch (err) {
            setMessage({ type: 'err', text: 'Image upload failed — try a smaller image.' });
        } finally { setGalleryAdding(false); }
    };
    const removeGalleryImage = (i) => setDraft((p) => {
        const g = p.gallery || [];
        if (g.length <= 1) { setMessage({ type: 'err', text: 'At least 1 gallery image is required.' }); setTimeout(() => setMessage(null), 3000); return p; }
        return { ...p, gallery: g.filter((_, idx) => idx !== i) };
    });

    const handleSave = async () => {
        setSaving(true); setMessage(null);
        try {
            const payload = {};
            EDITABLE_KEYS.forEach((k) => { payload[k] = draft[k] ?? ''; });
            payload.coverImage = draft.coverImage || '';
            payload.gallery = Array.isArray(draft.gallery) ? draft.gallery : [];
            payload.leadership = (Array.isArray(draft.leadership) ? draft.leadership : [])
                .filter((m) => (m.name || '').trim() || (m.role || '').trim() || (m.message || '').trim() || m.photo);
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
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 min-w-0">
                    <MenuButton />
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">My Profile</h1>
                        <p className="text-slate-500 font-medium text-sm hidden sm:block">{editing ? 'Update your school information.' : 'Your school information at a glance.'}</p>
                    </div>
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
                <div className="relative h-24 w-24 shrink-0 group">
                    {logo ? (
                        <div className="h-24 w-24 rounded-3xl flex items-center justify-center overflow-hidden bg-slate-50 border border-slate-100">
                            <img src={logo} alt="School logo" className="max-h-full max-w-full object-contain" />
                        </div>
                    ) : (
                        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center text-4xl font-black shadow-lg shadow-blue-600/20">
                            {(formData.schoolName?.charAt(0) || 'S').toUpperCase()}
                        </div>
                    )}
                    {/* Change-logo overlay (always available) */}
                    <label title="Change logo" className="absolute inset-0 rounded-3xl bg-slate-900/55 text-white flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {uploadingLogo
                            ? <Loader2 size={20} className="animate-spin" />
                            : <><Camera size={20} /><span className="text-[10px] font-bold">Change</span></>}
                        <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo} onChange={(e) => handleLogoChange(e.target.files?.[0])} />
                    </label>
                    {/* always-visible hint so it's discoverable on touch devices too */}
                    <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-blue-600 text-white grid place-items-center shadow-md ring-2 ring-white pointer-events-none">
                        <Camera size={13} />
                    </span>
                </div>
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

                <SectionCard icon={<Users />} iconBg="#f5f3ff" iconColor="#7c3aed" title="Leadership Team" full>
                    <div className="space-y-4">
                        {(src.leadership || []).length === 0 && !editing && (
                            <p className="text-sm text-slate-300">No leadership added yet. Click “Edit Profile” to add your Principal, Vice Principal etc.</p>
                        )}
                        {(src.leadership || []).map((m, i) => (
                            <div key={i} className="flex gap-4 items-start p-4 rounded-2xl border border-slate-100 bg-slate-50/40">
                                <div className="relative h-16 w-16 shrink-0">
                                    {m.photo
                                        ? <img src={m.photo} alt="" className="h-16 w-16 rounded-2xl object-cover border border-slate-200" />
                                        : <div className="h-16 w-16 rounded-2xl bg-violet-100 text-violet-600 grid place-items-center font-black text-xl">{(m.name?.charAt(0) || '?').toUpperCase()}</div>}
                                    {editing && (
                                        <label title="Upload photo" className="absolute inset-0 rounded-2xl bg-slate-900/35 text-white grid place-items-center cursor-pointer">
                                            {leaderUploading === i ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLeaderPhoto(i, e.target.files?.[0])} />
                                        </label>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-2">
                                    {editing ? (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <input value={m.name || ''} onChange={(e) => setLeader(i, 'name', e.target.value)} placeholder="Full name" className={inputCls} />
                                                <input value={m.role || ''} onChange={(e) => setLeader(i, 'role', e.target.value)} placeholder="Role (e.g. Principal)" className={inputCls} />
                                            </div>
                                            <textarea value={m.message || ''} onChange={(e) => setLeader(i, 'message', e.target.value)} placeholder="Message / vision…" className={inputCls + ' h-20 py-2 resize-none'} />
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-bold text-slate-800">{m.name || '—'}{m.role && <span className="text-xs font-semibold text-violet-600"> · {m.role}</span>}</p>
                                            {m.message && <p className="text-sm text-slate-500 leading-relaxed">{m.message}</p>}
                                        </>
                                    )}
                                </div>
                                {editing && (
                                    <button onClick={() => removeLeader(i)} className="text-red-500 hover:bg-red-50 rounded-lg p-1.5 shrink-0" title="Remove"><X size={16} /></button>
                                )}
                            </div>
                        ))}
                        {editing && (
                            <button onClick={addLeader} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-violet-600 font-bold text-sm hover:border-violet-300 hover:bg-violet-50 transition-colors">+ Add Member</button>
                        )}
                    </div>
                </SectionCard>

                <SectionCard icon={<ImageIcon />} iconBg="#ecfeff" iconColor="#0891b2" title="Cover / Feature Image" full>
                    {/* Same crop/proportion as the website hero (object-cover), just smaller. */}
                    <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50" style={{ maxWidth: '460px', height: '360px' }}>
                        {src.coverImage
                            ? <img src={src.coverImage} alt="Cover" className="w-full h-full object-cover" />
                            : <div className="w-full h-full grid place-items-center text-slate-300 text-sm font-semibold">No cover image yet</div>}
                    </div>
                    {editing && (
                        <label className="mt-3 inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer transition-colors">
                            {coverUploading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />} Change cover image
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverChange(e.target.files?.[0])} />
                        </label>
                    )}
                </SectionCard>

                <SectionCard icon={<Images />} iconBg="#fdf4ff" iconColor="#c026d3" title="Gallery" full>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {(src.gallery || []).map((url, i) => (
                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                {editing && (
                                    <button onClick={() => removeGalleryImage(i)} title="Delete" className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-red-500 hover:bg-red-600 text-white grid place-items-center shadow-md ring-2 ring-white">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {editing && (
                            <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 grid place-items-center text-slate-400 hover:border-fuchsia-300 hover:bg-fuchsia-50 cursor-pointer transition-colors">
                                {galleryAdding
                                    ? <Loader2 size={20} className="animate-spin" />
                                    : <div className="flex flex-col items-center gap-1"><Plus size={22} /><span className="text-[11px] font-bold">Add image</span></div>}
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => addGalleryImage(e.target.files?.[0])} />
                            </label>
                        )}
                    </div>
                    {(src.gallery || []).length === 0 && !editing && <p className="text-sm text-slate-300">No gallery images yet.</p>}
                    {editing && <p className="text-xs text-slate-400 mt-3">Tap an image's ✕ to delete · at least 1 image required.</p>}
                </SectionCard>
            </div>
        </div>
    );
};

export default Profile;
