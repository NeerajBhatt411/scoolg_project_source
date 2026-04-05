import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Key, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }
        if (newPassword.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            const schoolId = localStorage.getItem('scoolg_school_id');
            await axios.post('https://scoolg-backend.netlify.app/api/admin/change-password', {

                schoolId,
                newPassword
            });
            // Update the locally cached isPasswordChanged status if necessary (not really used in app now but good for consistency)
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-minimal-container">
            <div className="login-premium-card" style={{ maxWidth: '500px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'inline-flex', padding: '16px', background: '#fef3c7', borderRadius: '50%', marginBottom: '24px' }}>
                        <ShieldAlert size={32} color="#d97706" />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px' }}>Verify Your Account</h1>
                    <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px', fontWeight: '500' }}>
                        Since this is your first login, please set a new secure password for your school's dashboard.
                    </p>
                </div>

                {error && (
                    <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleChangePassword}>
                    <div className="input-container-premium" style={{ marginBottom: '20px' }}>
                        <Key size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                        <input 
                            type={showNewPassword ? "text" : "password"} 
                            className="form-input-minimal" 
                            style={{ paddingLeft: '48px', height: '56px' }}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="input-container-premium" style={{ marginBottom: '32px' }}>
                        <Key size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                        <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            className="form-input-minimal" 
                            style={{ paddingLeft: '48px', height: '56px' }}
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-premium-login"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>Set Password & Enter Dashboard <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
