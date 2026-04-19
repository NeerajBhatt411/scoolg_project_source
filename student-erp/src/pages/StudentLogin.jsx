import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, Loader2, User, Lock } from 'lucide-react';

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
            const res = await axios.post('https://scoolg-backend.netlify.app/api/student/login', {
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
        <div className="flex-1 flex flex-col p-8 bg-white animate-fade-in relative z-10 overflow-auto">
            <button onClick={() => navigate('/')} className="text-sm font-bold text-slate-400 mb-8 w-fit hover:text-slate-600 truncate">
                ← Change School
            </button>
            
            <div className="flex flex-col items-center mb-10">
                {schoolInfo.logo ? (
                    <img src={schoolInfo.logo} alt="School Logo" className="h-16 mb-4 object-contain" />
                ) : (
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-2xl mb-4">
                        {schoolInfo.name.charAt(0)}
                    </div>
                )}
                <h1 className="text-2xl font-black text-slate-800 text-center tracking-tight leading-tight">
                    {schoolInfo.name}
                </h1>
                <p className="text-slate-500 font-medium mt-1">Student Portal</p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4 flex-1">
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">App ID</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            required
                            value={appId}
                            onChange={(e) => setAppId(e.target.value)}
                            placeholder="e.g. gaj15611001"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-800 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors placeholder:font-medium placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password / DOB</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="DDMMYYYY"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-800 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors placeholder:font-medium placeholder:text-slate-300"
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 ml-1 italic flex items-center gap-1">
                        💡 Hint: Use your Date of Birth in DDMMYYYY format
                    </p>
                </div>

                {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-xl border border-red-100">{error}</p>}

                <div className="pt-4">
                    <button 
                        disabled={loading}
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-2xl px-5 py-4 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>Log In securely <LogIn size={20} /></>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentLogin;
