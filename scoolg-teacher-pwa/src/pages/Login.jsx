import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [teacherAppId, setTeacherAppId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const campusCode = sessionStorage.getItem('verified_campus_code');
  let schoolInfo = null;
  try { schoolInfo = JSON.parse(sessionStorage.getItem('temp_school_info') || 'null'); } catch { schoolInfo = null; }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(teacherAppId.trim(), password);
    if (result.success) navigate('/dashboard');
    else { setError(result.message); setLoading(false); }
  };

  const features = [
    { icon: 'fact_check', text: 'Mark attendance in seconds' },
    { icon: 'assignment', text: 'Assign homework with attachments' },
    { icon: 'calendar_today', text: 'Your timetable, always handy' },
  ];

  return (
    <div className="min-h-screen w-full flex bg-background font-body-md text-on-surface">
      {/* ===== DESKTOP BRANDING PANEL ===== */}
      <section className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#4f46e5]">
        {/* decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] bg-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white/40 rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-white/20 rounded-full"></div>

        <div className="relative z-10 flex flex-col justify-between p-14 w-full text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <div>
              <h1 className="text-2xl font-manrope font-extrabold tracking-tight leading-none">SchoolG</h1>
              <p className="text-[11px] font-bold uppercase tracking-[3px] opacity-75 mt-1">Teacher Portal</p>
            </div>
          </div>

          <div className="max-w-md">
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-[40px] leading-[1.1] font-manrope font-extrabold tracking-tight mb-8">
              Run your classroom<br />from your pocket.
            </motion.h2>
            <div className="space-y-3.5">
              {features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.1 }}
                  className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <span className="material-symbols-outlined text-[18px]">{f.icon}</span>
                  </div>
                  <span className="text-[15px] font-medium opacity-95">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-[12px] font-medium opacity-60">© ScoolG · Precision school management</p>
        </div>
      </section>

      {/* ===== FORM PANEL ===== */}
      <section className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10 bg-surface relative">
        {/* subtle bg on mobile */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-56 bg-gradient-to-br from-[#2563eb] to-[#4f46e5]"></div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10">
          {/* School identity card */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 rounded-[28px] bg-white shadow-xl shadow-primary/10 border border-surface-container flex items-center justify-center mb-4 overflow-hidden">
              {schoolInfo?.logo ? (
                <img src={schoolInfo.logo} alt="School" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[44px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              )}
            </div>
            <h3 className="text-[26px] font-manrope font-extrabold text-on-surface leading-tight">{schoolInfo?.schoolName || 'Welcome, Teacher'}</h3>
            <p className="text-body-md text-on-surface-variant mt-1">Sign in to continue to your portal</p>
          </div>

          <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_40px_rgba(15,23,42,0.06)] border border-surface-container">
            <form className="space-y-5" onSubmit={handleLogin}>
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 bg-error/10 text-error rounded-2xl text-label-md font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  {error}
                </motion.div>
              )}

              {campusCode && (
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Campus</p>
                      <p className="text-[14px] font-extrabold text-on-surface leading-none">{campusCode}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => navigate('/campus-code')} className="text-[12px] font-bold text-primary hover:underline">Change</button>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-label-md font-bold text-on-surface-variant ml-1">Teacher ID</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">badge</span>
                  <input
                    className="w-full h-[54px] pl-12 pr-4 bg-surface-container-low rounded-2xl font-bold text-on-surface focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-outline/50 placeholder:font-medium outline-none transition-all"
                    placeholder="e.g. TCH101" type="text" value={teacherAppId} onChange={(e) => setTeacherAppId(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-label-md font-bold text-on-surface-variant ml-1">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">lock</span>
                  <input
                    className="w-full h-[54px] pl-12 pr-12 bg-surface-container-low rounded-2xl font-bold text-on-surface focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-outline/50 outline-none transition-all"
                    placeholder="••••••••" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button disabled={loading} type="submit"
                className="w-full h-[54px] bg-gradient-to-r from-[#2563eb] to-[#4f46e5] text-white font-manrope font-bold text-[16px] rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:active:scale-100">
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> Logging in...</>
                ) : (
                  <>Sign In <span className="material-symbols-outlined text-[20px]">arrow_forward</span></>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-label-md text-on-surface-variant mt-6">
            Don't have your Teacher ID? <span className="text-primary font-bold">Ask your school admin.</span>
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default Login;
