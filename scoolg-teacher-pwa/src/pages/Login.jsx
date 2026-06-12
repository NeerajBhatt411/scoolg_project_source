import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, BadgeCheck, Lock, ArrowRight, AlertCircle, ClipboardCheck, BookOpen, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';

const Login = () => {
  const [teacherAppId, setTeacherAppId] = useState('');
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
    const result = await login(teacherAppId.trim(), password);
    if (result.success) navigate('/dashboard', { replace: true });
    else { setError(result.message); setLoading(false); }
  };

  const features = [
    { icon: ClipboardCheck, text: 'Mark attendance in seconds' },
    { icon: BookOpen, text: 'Assign homework with attachments' },
    { icon: CalendarDays, text: 'Your timetable, always handy' },
  ];

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      {/* ===== DESKTOP BRANDING PANEL ===== */}
      <section className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#4f46e5]">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] bg-indigo-300/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-between p-14 w-full text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg">
              <img src="/scoolg-logo.png" alt="Scoolg" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-manrope font-extrabold tracking-tight leading-none">Scoolg</h1>
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
                    <f.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[15px] font-medium opacity-95">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-[12px] font-medium opacity-60">© Scoolg · Precision school management</p>
        </div>
      </section>

      {/* ===== FORM PANEL ===== */}
      <section className="w-full lg:w-[45%] flex items-center justify-center p-5 sm:p-10 relative">
        {/* mobile gradient header */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-52 bg-gradient-to-br from-[#2563eb] to-[#4f46e5] rounded-b-[40px]"></div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10">
          {/* Brand identity */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-24 h-24 rounded-[28px] bg-white shadow-xl shadow-primary/15 border flex items-center justify-center mb-4 p-4">
              <img src="/scoolg-logo.png" alt="Scoolg" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-[26px] font-manrope font-extrabold leading-tight text-white lg:text-foreground">Welcome back</h3>
            <p className="text-sm mt-1 text-white/85 lg:text-muted-foreground">Sign in to your teacher portal</p>
          </div>

          <div className="bg-card rounded-2xl p-6 sm:p-7 shadow-[0_8px_40px_rgba(15,23,42,0.08)] border">
            <form className="space-y-5" onSubmit={handleLogin}>
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 bg-destructive/10 text-destructive rounded-xl text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-muted-foreground ml-1">Teacher ID or Email</label>
                <div className="relative">
                  <BadgeCheck className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    className="flex h-[52px] w-full rounded-xl border border-input bg-muted/50 pl-11 pr-4 text-sm font-semibold transition-colors placeholder:text-muted-foreground/60 placeholder:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-card"
                    placeholder="e.g. TCH101" type="text" autoComplete="username" value={teacherAppId} onChange={(e) => setTeacherAppId(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-muted-foreground ml-1">Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    className="flex h-[52px] w-full rounded-xl border border-input bg-muted/50 pl-11 pr-12 text-sm font-semibold transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-card"
                    placeholder="••••••••" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button disabled={loading} type="submit" size="lg" className="w-full text-[15px] font-bold shadow-lg shadow-primary/25">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> Signing in…</>
                ) : (
                  <>Sign In <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-1">
                You stay signed in on this device until you log out.
              </p>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have your Teacher ID? <span className="text-primary font-semibold">Ask your school admin.</span>
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default Login;
