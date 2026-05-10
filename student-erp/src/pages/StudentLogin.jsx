import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, Loader2, User, Lock, ChevronLeft, ShieldCheck } from 'lucide-react';

const StudentLogin = () => {
    const [appId, setAppId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('scoolg_school');
        if (stored) {
            setSchoolInfo(JSON.parse(stored));
        } else {
            navigate('/');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5001/api/student/login', {
                studentAppId: appId,
                password: password
            });
            
            localStorage.setItem('studentToken', res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    if (!schoolInfo) return null;

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-white relative z-10 overflow-auto animate-fade-in">
            {/* Header / Back Navigation */}
            <div className="p-6 flex items-center justify-between">
                <button 
                    onClick={() => navigate('/')} 
                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="px-3 py-1 bg-blue-50 rounded-full border border-blue-100 flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-blue-600" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Secure Portal</span>
                </div>
            </div>
            
            {/* School Branding Section */}
            <div className="px-8 pt-4 pb-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-10 rounded-full"></div>
                    {schoolInfo.logo ? (
                        <img src={schoolInfo.logo} alt="School Logo" className="h-20 w-20 object-contain relative rounded-2xl p-2 bg-white border border-slate-100 shadow-sm" />
                    ) : (
                        <div className="w-20 h-20 rounded-[24px] bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-xl relative">
                            {schoolInfo.name.charAt(0)}
                        </div>
                    )}
                </div>
                
                <h1 className="text-2xl font-black text-slate-900 text-center tracking-tight leading-tight max-w-[280px]">
                    {schoolInfo.name}
                </h1>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-3">Authentication Required</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="px-8 space-y-6 flex-1">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Student App ID</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input 
                            type="text" 
                            required
                            value={appId}
                            onChange={(e) => setAppId(e.target.value)}
                            placeholder="gaj15611001"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[20px] pl-12 pr-4 py-4 text-slate-900 font-black focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-50 transition-all placeholder:font-bold placeholder:text-slate-200"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password (DOB)</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="DDMMYYYY"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[20px] pl-12 pr-4 py-4 text-slate-900 font-black focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-50 transition-all placeholder:font-bold placeholder:text-slate-200"
                        />
                    </div>
                    <div className="flex items-center gap-2 mt-3 ml-1">
                        <div className="p-1 bg-amber-50 rounded-md">
                            <ShieldCheck size={10} className="text-amber-600" />
                        </div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                            Use your Date of Birth in DDMMYYYY format
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-xs font-black p-4 rounded-[16px] border border-red-100 flex items-center gap-3 animate-fade-in">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                        {error}
                    </div>
                )}

                <div className="pt-6">
                    <button 
                        disabled={loading}
                        type="submit"
                        className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black rounded-[24px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/10 active:scale-[0.98] group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                <span className="uppercase tracking-[0.15em] text-xs">Access Account</span>
                                <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="p-10 text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Scoolg Identity Services</p>
            </div>
        </div>
    );
};

export default StudentLogin;
