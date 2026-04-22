import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, User, Phone, MapPin, Globe, Award, Briefcase, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const schoolId = localStorage.getItem('scoolg_school_id');
    const API_BASE_URL = 'https://scoolg-backend.netlify.app/api/admin';


    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/profile/${schoolId}`);
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
            await axios.patch(`${API_BASE_URL}/profile/${schoolId}`, formData);
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

    if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={48} color="#2563eb" /></div>;

    if (!formData) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Profile Not Found</h1>
            <p style={{ color: '#64748b' }}>We couldn't load your school profile. Please try again later.</p>
        </div>
    );

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Manage Profile</h1>
                    <p style={{ color: '#64748b', fontWeight: '500' }}>Review and edit your school public information.</p>
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
