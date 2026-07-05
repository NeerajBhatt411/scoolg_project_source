import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, AlertCircle, Loader2, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import InstallPrompt from '../components/InstallPrompt';
import loginBg from '../assets/scoolg_teacher.jpeg';

const Login = () => {
  const [teacherAppId, setTeacherAppId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(teacherAppId.trim(), password);
    if (result.success) navigate(result.isPasswordChanged !== true ? '/change-password' : '/dashboard', { replace: true });
    else { setError(result.message); setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-5 sm:p-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
        <Card className="overflow-hidden rounded-3xl border shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)] bg-card">
          <div className="grid lg:grid-cols-2">
            {/* Graphic side (same artwork as the admin panel login) */}
            <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50/60 to-background p-10">
              <img src={loginBg} alt="School management" className="w-full max-w-md object-contain drop-shadow-xl" />
            </div>

            {/* Form side */}
            <CardContent className="p-6 sm:p-12 flex flex-col justify-center !pt-8 sm:!pt-12">
              {/* Mobile artwork */}
              <img src={loginBg} alt="" className="lg:hidden h-40 sm:h-52 object-contain mx-auto mb-5" />

              <div className="mb-8 text-center lg:text-left">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-primary mb-2">Teacher Portal</p>
                <h1 className="text-[27px] sm:text-[30px] font-manrope font-extrabold tracking-tight text-foreground leading-tight">Welcome Back</h1>
                <p className="text-[15px] font-medium text-muted-foreground mt-1.5">Sign in to manage your classes</p>
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
                    placeholder="Teacher ID (e.g. TCH101)" type="text" autoComplete="username"
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
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login'}
                </Button>

                <button type="button" onClick={() => setForgotOpen(true)}
                  className="w-full text-center text-sm text-primary font-semibold hover:underline mt-1">
                  Forgot password?
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have your Teacher ID? <span className="text-primary font-semibold">Ask your school admin.</span>
              </p>
              <p className="text-center text-xs text-muted-foreground/60 mt-2">You stay signed in on this device until you log out.</p>
            </CardContent>
          </div>
        </Card>
        <p className="text-center text-xs font-semibold text-muted-foreground/60 mt-6 tracking-wide">© 2026 Scoolg · All rights reserved</p>
      </motion.div>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
      <InstallPrompt />
    </div>
  );
};

export default Login;
