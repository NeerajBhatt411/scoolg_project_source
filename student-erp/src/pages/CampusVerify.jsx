import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { School, ArrowRight, Loader2 } from 'lucide-react';

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
            const res = await axios.get(`https://scoolg-backend.netlify.app/api/student/verify-campus/${code}`);
            // Save school info logic for next screen
            localStorage.setItem('scoolg_school', JSON.stringify({
                schoolId: res.data.schoolId,
                name: res.data.schoolName,
                logo: res.data.logo
            }));
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid Campus Code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white animate-fade-in relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center mb-8 shadow-xl shadow-blue-200">
                <School size={32} />
            </div>
            
            <h1 className="text-3xl font-black text-slate-800 text-center mb-2 tracking-tight">Scoolg ERP</h1>
            <p className="text-slate-500 text-center mb-10 font-medium">Enter your School Code to continue</p>

            <form onSubmit={handleVerify} className="w-full max-w-sm space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">School Code</label>
                    <input 
                        type="text" 
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="e.g. SCH"
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-center text-xl font-black tracking-widest text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all uppercase placeholder:text-slate-300 placeholder:font-medium"
                    />
                </div>

                {error && <p className="text-red-500 text-sm font-bold text-center animate-fade-in bg-red-50 py-2 rounded-xl border border-red-100">{error}</p>}

                <button 
                    disabled={loading || !code.trim()}
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-2xl px-5 py-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (
                        <>Continue <ArrowRight size={20} /></>
                    )}
                </button>
            </form>

            <div className="absolute bottom-8 text-center text-xs font-bold text-slate-400">
                Powered by Scoolg OS
            </div>
        </div>
    );
};

export default CampusVerify;
