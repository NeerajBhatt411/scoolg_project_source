import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, KeyRound, X, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { ADMIN_API_BASE, setAuthToken } from '../lib/api';
import logo from '../assets/logo.png';
import loginBg from '../assets/login-bg.png';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setSchoolId, setAuth } = useAdmin();

    // --- Forgot password flow ---
    const [fpOpen, setFpOpen] = useState(false);
    const [fpStep, setFpStep] = useState('email'); // 'email' | 'reset' | 'done'
    const [fpEmail, setFpEmail] = useState('');
    const [fpOtp, setFpOtp] = useState('');
    const [fpNewPwd, setFpNewPwd] = useState('');
    const [fpShowPwd, setFpShowPwd] = useState(false);
    const [fpLoading, setFpLoading] = useState(false);
    const [fpError, setFpError] = useState('');
    const [fpInfo, setFpInfo] = useState('');

    const openForgot = () => {
        setFpOpen(true);
        setFpStep('email');
        setFpEmail(email); // carry over whatever they typed in the login box
        setFpOtp('');
        setFpNewPwd('');
        setFpError('');
        setFpInfo('');
    };
    const closeForgot = () => setFpOpen(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${ADMIN_API_BASE}/login`, { email, password });
            const { token, schoolId, schoolName, isPasswordChanged, status, role, allowedModules } = res.data;

            localStorage.setItem('scoolg_token', token);
            localStorage.setItem('scoolg_school_id', schoolId);
            localStorage.setItem('scoolg_school_name', schoolName);
            if (status) localStorage.setItem('scoolg_school_status', status);
            localStorage.setItem('scoolg_role', role || 'Owner');
            localStorage.setItem('scoolg_modules', JSON.stringify(allowedModules ?? 'ALL'));

            // Attach token for all subsequent API calls + sync context.
            setAuthToken(token);
            setAuth({ role: role || 'Owner', allowedModules: allowedModules ?? 'ALL' });
            setSchoolId(schoolId);

            if (isPasswordChanged === false) {
                navigate('/change-password');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        setFpError('');
        setFpInfo('');
        if (!fpEmail.trim()) return setFpError('Please enter your email.');
        setFpLoading(true);
        try {
            const res = await axios.post(`${ADMIN_API_BASE}/forgot-password`, { email: fpEmail.trim() });
            setFpInfo(res.data?.message || 'If an account exists, a reset code has been sent.');
            setFpStep('reset');
        } catch (err) {
            setFpError(err.response?.data?.error || 'Could not send reset code. Try again.');
        } finally {
            setFpLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setFpError('');
        if (!fpOtp.trim()) return setFpError('Enter the 6-digit code from your email.');
        if (fpNewPwd.length < 6) return setFpError('Password must be at least 6 characters.');
        setFpLoading(true);
        try {
            await axios.post(`${ADMIN_API_BASE}/reset-password`, {
                email: fpEmail.trim(),
                otp: fpOtp.trim(),
                newPassword: fpNewPwd,
            });
            setFpStep('done');
            setEmail(fpEmail.trim()); // prefill login email for convenience
        } catch (err) {
            setFpError(err.response?.data?.error || 'Could not reset password.');
        } finally {
            setFpLoading(false);
        }
    };

    return (
        <div className="login-minimal-container">
            <div className="login-wide-card">
                {/* Properly adjusted 3D Graphic side */}
                <div className="login-card-graphic">
                    <img src={loginBg} alt="School Management" />

                </div>

                {/* Clean, Simple Login side */}
                <div className="login-card-form">
                    <div style={{ marginBottom: '40px' }}>
                        <img
                            src={logo}

                            alt="ScoolG Logo"
                            style={{ height: '42px', width: 'auto', marginBottom: '24px' }}
                        />
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                            Welcome Back
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
                            Sign in to your admin console
                        </p>
                    </div>

                    {error && (
                        <div style={{ padding: '12px 16px', background: '#fff1f2', color: '#e11d48', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: '600', border: '1px solid #ffe4e6' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="input-container-premium">
                            <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                            <input
                                type="email"
                                className="form-input-premium"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ paddingLeft: '56px' }}
                            />
                        </div>

                        <div className="input-container-premium" style={{ marginBottom: '32px' }}>
                            <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-input-premium"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingLeft: '56px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-slate-400 flex items-center hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn-premium-login"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login to Dashboard'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <button
                            type="button"
                            onClick={openForgot}
                            style={{ fontSize: '14px', color: '#2563eb', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                        <p style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '600' }}>
                            © 2026 SCOOLG PLATFORM
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== Forgot Password Modal ===== */}
            {fpOpen && (
                <div
                    onClick={closeForgot}
                    style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '24px', padding: '28px', boxShadow: '0 30px 60px -20px rgba(15,23,42,0.4)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <KeyRound size={22} />
                            </div>
                            <button type="button" onClick={closeForgot} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {fpStep === 'done' ? (
                            <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <CheckCircle2 size={30} />
                                </div>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Password reset</h2>
                                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, marginTop: '6px' }}>
                                    Your password has been updated. You can now sign in with your new password.
                                </p>
                                <button type="button" onClick={closeForgot} className="btn-premium-login" style={{ marginTop: '24px' }}>
                                    Back to login
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '12px' }}>
                                    {fpStep === 'email' ? 'Forgot password?' : 'Enter reset code'}
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, marginTop: '4px', marginBottom: '20px' }}>
                                    {fpStep === 'email'
                                        ? "Enter your admin email and we'll send you a 6-digit reset code."
                                        : `We've sent a code to ${fpEmail}. Enter it below with your new password.`}
                                </p>

                                {fpError && (
                                    <div style={{ padding: '10px 14px', background: '#fff1f2', color: '#e11d48', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', fontWeight: 600, border: '1px solid #ffe4e6' }}>
                                        {fpError}
                                    </div>
                                )}
                                {fpStep === 'reset' && fpInfo && (
                                    <div style={{ padding: '10px 14px', background: '#eff6ff', color: '#2563eb', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', fontWeight: 600, border: '1px solid #dbeafe' }}>
                                        {fpInfo}
                                    </div>
                                )}

                                {fpStep === 'email' ? (
                                    <form onSubmit={handleSendCode}>
                                        <div className="input-container-premium">
                                            <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                                            <input
                                                type="email"
                                                className="form-input-premium"
                                                placeholder="Email Address"
                                                value={fpEmail}
                                                onChange={(e) => setFpEmail(e.target.value)}
                                                required
                                                autoFocus
                                                style={{ paddingLeft: '56px' }}
                                            />
                                        </div>
                                        <button type="submit" className="btn-premium-login" style={{ marginTop: '8px' }} disabled={fpLoading}>
                                            {fpLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send reset code'}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleResetPassword}>
                                        <div className="input-container-premium">
                                            <KeyRound size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                className="form-input-premium"
                                                placeholder="6-digit code"
                                                value={fpOtp}
                                                onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, ''))}
                                                required
                                                autoFocus
                                                style={{ paddingLeft: '56px', letterSpacing: '4px', fontWeight: 700 }}
                                            />
                                        </div>
                                        <div className="input-container-premium">
                                            <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                                            <input
                                                type={fpShowPwd ? 'text' : 'password'}
                                                className="form-input-premium"
                                                placeholder="New password (min 6 chars)"
                                                value={fpNewPwd}
                                                onChange={(e) => setFpNewPwd(e.target.value)}
                                                required
                                                style={{ paddingLeft: '56px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFpShowPwd(!fpShowPwd)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-slate-400 flex items-center hover:text-slate-600 transition-colors"
                                            >
                                                {fpShowPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <button type="submit" className="btn-premium-login" style={{ marginTop: '8px' }} disabled={fpLoading}>
                                            {fpLoading ? <Loader2 className="animate-spin" size={20} /> : 'Reset password'}
                                        </button>
                                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                            <button
                                                type="button"
                                                onClick={() => { setFpStep('email'); setFpError(''); }}
                                                style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                Use a different email
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
