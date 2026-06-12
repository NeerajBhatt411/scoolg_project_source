import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, BadgeCheck, Lock, AlertCircle, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import loginBg from '../assets/login-bg.png';

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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
        <Card className="overflow-hidden shadow-xl shadow-slate-900/5">
          <div className="grid lg:grid-cols-2">
            {/* Graphic side (same artwork as the admin panel login) */}
            <div className="hidden lg:flex items-center justify-center bg-muted/40 p-10">
              <img src={loginBg} alt="School management" className="w-full max-w-md object-contain" />
            </div>

            {/* Form side */}
            <CardContent className="p-7 sm:p-12 flex flex-col justify-center !pt-10 sm:!pt-12">
              <div className="mb-9">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[3px] text-muted-foreground">Teacher Portal</span>
                </div>
                <h1 className="text-[26px] sm:text-[28px] font-extrabold tracking-tight text-foreground">Welcome Back</h1>
                <p className="text-[15px] font-medium text-muted-foreground mt-1">Sign in to manage your classes</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 mb-5 bg-destructive/10 text-destructive rounded-xl text-sm font-semibold flex items-center gap-2 border border-destructive/10">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="relative">
                  <BadgeCheck className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    className="flex h-[54px] w-full rounded-xl border border-input bg-muted/40 pl-12 pr-4 text-sm font-semibold transition-colors placeholder:text-muted-foreground/70 placeholder:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-card"
                    placeholder="Teacher ID or Email" type="text" autoComplete="username"
                    value={teacherAppId} onChange={(e) => setTeacherAppId(e.target.value)} required />
                </div>

                <div className="relative">
                  <Lock className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    className="flex h-[54px] w-full rounded-xl border border-input bg-muted/40 pl-12 pr-12 text-sm font-semibold transition-colors placeholder:text-muted-foreground/70 placeholder:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-card"
                    placeholder="Password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>

                <Button disabled={loading} type="submit" size="lg" className="w-full !mt-7 text-[15px] font-bold h-[54px] shadow-lg shadow-primary/20">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login to Portal'}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-7">
                Don't have your Teacher ID? <span className="text-primary font-semibold">Ask your school admin.</span>
              </p>
              <p className="text-center text-xs text-muted-foreground/60 mt-2">You stay signed in on this device until you log out.</p>

              <p className="text-xs font-semibold text-muted-foreground/50 mt-10">© 2026 · School Teacher Portal</p>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
