import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { School, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const CampusVerify = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError('');
        
        try {
            // Updated to use the correct API endpoint
            const res = await axios.get(`http://localhost:5001/api/student/verify-campus/${code}`);
            localStorage.setItem('scoolg_school', JSON.stringify({
                schoolId: res.data.schoolId,
                name: res.data.schoolName,
                logo: res.data.logo
            }));
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid School Code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-white selection:bg-blue-100">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[30%] bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 animate-fade-in">
                {/* Branding Icon */}
                <div className="relative mb-10 group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[32px] blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-2xl relative">
                        <School size={40} strokeWidth={1.5} />
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                            <Sparkles size={16} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Scoolg<span className="text-blue-600">OS</span></h1>
                    <p className="text-slate-500 font-bold text-sm max-w-[240px] mx-auto leading-relaxed">Connect with your school campus using your unique code</p>
                </div>

                <form onSubmit={handleVerify} className="w-full space-y-8">
                    <div className="relative">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-2">Campus Verification Code</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="E.G. SC-001"
                                className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-[24px] px-6 py-5 text-center text-2xl font-black tracking-[0.2em] text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-8 focus:ring-blue-50/50 transition-all uppercase placeholder:text-slate-200 placeholder:font-black"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs font-black p-4 rounded-[20px] border border-red-100 flex items-center gap-3 animate-fade-in">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            {error}
                        </div>
                    )}

                    <button 
                        disabled={loading || !code.trim()}
                        type="submit"
                        className="w-full h-16 bg-slate-950 hover:bg-blue-600 disabled:bg-slate-200 text-white font-black rounded-[24px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                <span className="uppercase tracking-[0.2em] text-xs">Verify Campus</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Footer Attribution */}
            <div className="pb-10 pt-4 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Next-Gen Schooling OS</p>
            </div>
        </div>
    );
};

export default CampusVerify;
