import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, AlertCircle, Loader2, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import loginBg from '../assets/login-bg.png';

const Login = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(null, studentId.trim(), password);
    
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-5 sm:p-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[1000px]">
        <div className="overflow-hidden rounded-[40px] border border-slate-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.04),0_10px_15px_-3px_rgba(0,0,0,0.02)] bg-white">
          <div className="grid lg:grid-cols-[1.2fr,1fr] xl:grid-cols-[1.2fr,1fr]">
            {/* Graphic side */}
            <div className="hidden lg:flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-12 border-r border-slate-50">
              <img src={loginBg} alt="School management" className="w-full max-w-[400px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)]" />
            </div>

            {/* Form side */}
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
              {/* Mobile artwork */}
              <img src={loginBg} alt="" className="lg:hidden w-4/5 max-w-[280px] object-contain mx-auto mb-8 drop-shadow-xl" />

              <div className="mb-8 text-center lg:text-left">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-blue-600 mb-2">Student Portal</p>
                <h1 className="text-[27px] sm:text-[30px] font-extrabold tracking-tight text-slate-900 leading-tight">Welcome Back</h1>
                <p className="text-[15px] font-medium text-slate-500 mt-1.5">Sign in to manage your coursework</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 mb-5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2 border border-red-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="relative">
                  <BadgeCheck className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    className="flex h-[54px] w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-white text-slate-900"
                    placeholder="Student ID (e.g. STU101)" type="text" autoComplete="username"
                    value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
                </div>

                <div className="relative">
                  <Lock className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    className="flex h-[54px] w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm font-semibold transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-white text-slate-900"
                    placeholder="Password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors">
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>

                <button disabled={loading} type="submit" className="w-full mt-7 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-[15px] font-bold h-[54px] shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login to Portal'}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-7">
                Don't have your Student ID? <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Ask your teacher.</span>
              </p>
              <p className="text-center text-xs text-slate-400 mt-2">You stay signed in on this device until you log out.</p>
            </div>
          </div>
        </div>
        <p className="text-center text-xs font-semibold text-slate-400 mt-6 tracking-wide">© 2026 Scoolg · All rights reserved</p>
      </motion.div>
    </div>
  );
};

export default Login;
