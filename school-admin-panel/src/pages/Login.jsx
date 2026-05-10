import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, CheckCircle2, LayoutDashboard, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import { ADMIN_API_BASE } from '../lib/api';
import logo from '../assets/logo.png';
import loginBg from '../assets/login-bg.png';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setSchoolId } = useAdmin();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${ADMIN_API_BASE}/login`, { email, password });
            const { token, schoolId, schoolName, isPasswordChanged, status } = res.data;

            localStorage.setItem('scoolg_token', token);
            localStorage.setItem('scoolg_school_id', schoolId);
            localStorage.setItem('scoolg_school_name', schoolName);
            if (status) localStorage.setItem('scoolg_school_status', status);

            // Inform AdminContext about the new schoolId
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
                        <a href="#" style={{ fontSize: '14px', color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
                            Forgot Password?
                        </a>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                        <p style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '600' }}>
                            © 2026 SCOOLG PLATFORM
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
