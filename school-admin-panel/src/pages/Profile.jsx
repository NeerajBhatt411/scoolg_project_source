import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, User, Phone, MapPin, Globe, Mail, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { ADMIN_API_BASE } from '../lib/api';

const Profile = () => {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const schoolId = localStorage.getItem('scoolg_school_id');
    useEffect(() => {
        fetchProfile();
    }, []);

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

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            await axios.patch(`${ADMIN_API_BASE}/profile/${schoolId}`, formData);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error updating profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="h-40 rounded-[28px] bg-slate-100 animate-pulse mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-64 rounded-3xl bg-slate-100 animate-pulse"></div>
                <div className="h-64 rounded-3xl bg-slate-100 animate-pulse"></div>
            </div>
        </div>
    );

    if (!formData) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Profile Not Found</h1>
            <p style={{ color: '#64748b' }}>We couldn't load your school profile. Please try again later.</p>
        </div>
    );

    const code = ((formData.schoolName || 'SCH').substring(0, 3) + (schoolId || '').slice(-4)).toUpperCase();
    const logo = formData.logo || formData.schoolLogo;
    const st = (formData.status || '').toUpperCase();
    const statusCls = (st === 'COMPLETED' || st === 'ACTIVE') ? 'bg-emerald-50 text-emerald-600'
        : st === 'PENDING' ? 'bg-amber-50 text-amber-600'
        : (st === 'SUSPENDED' || st === 'INACTIVE') ? 'bg-rose-50 text-rose-600'
        : 'bg-slate-100 text-slate-500';

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800' }}>My Profile</h1>
                    <p style={{ color: '#64748b', fontWeight: '500' }}>Review and edit your school information.</p>
                </div>
                <button
                    onClick={handleUpdate}
                    className="btn btn-primary"
                    style={{ padding: '14px 28px', fontSize: '16px' }}
                    disabled={saving}
                >
                    {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
                </button>
            </div>

            {/* Premium identity header — all key details at a glance */}
            <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center text-4xl font-black shrink-0 overflow-hidden shadow-lg shadow-blue-600/20">
                    {logo ? <img src={logo} alt="" className="w-full h-full object-cover" /> : (formData.schoolName?.charAt(0) || 'S').toUpperCase()}
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

            {message && (
                <div style={{ padding: '16px', background: message.includes('Error') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') ? '#ef4444' : '#16a34a', borderRadius: '12px', marginBottom: '32px', border: '1px solid currentColor', opacity: 0.8 }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                {/* Basic Info */}
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px' }}><User size={20} color="#2563eb" /></div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Basic Information</h3>
                    </div>

                    <div className="form-group">
                        <label className="form-label">School Name</label>
                        <input className="form-input" value={formData.schoolName} onChange={(e) => handleChange('schoolName', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Established Year</label>
                        <input className="form-input" value={formData.establishedYear} onChange={(e) => handleChange('establishedYear', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" style={{ height: '100px' }} value={formData.schoolDescription} onChange={(e) => handleChange('schoolDescription', e.target.value)} />
                    </div>
                </div>

                {/* Contact Info */}
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ background: '#fef2f2', padding: '8px', borderRadius: '8px' }}><Phone size={20} color="#ef4444" /></div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Contact Details</h3>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Official Phone</label>
                        <input className="form-input" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Full Address</label>
                        <textarea className="form-input" style={{ height: '80px' }} value={formData.address} onChange={(e) => handleChange('address', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">City</label>
                        <input className="form-input" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} />
                    </div>
                </div>

                {/* Vision & Mission */}
                <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ background: '#fffbeb', padding: '8px', borderRadius: '8px' }}><Globe size={20} color="#f59e0b" /></div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Academic Overview</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className="form-group">
                            <label className="form-label">Vision Statement</label>
                            <textarea className="form-input" style={{ height: '120px' }} value={formData.vision} onChange={(e) => handleChange('vision', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mission Statement</label>
                            <textarea className="form-input" style={{ height: '120px' }} value={formData.mission} onChange={(e) => handleChange('mission', e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
