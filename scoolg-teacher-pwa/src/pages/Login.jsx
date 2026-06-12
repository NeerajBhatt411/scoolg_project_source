import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Icon, Logo } from '@/components/designkit';

const fieldCls = 'w-full h-[52px] pl-11 pr-4 rounded-[12px] bg-white border border-line text-ink font-600 text-[14.5px] outline-none focus:ring-2 focus:ring-blue-600/25 focus:border-blue-400 transition-all placeholder:text-ink-faint placeholder:font-500';

const FEATURES = [
  { icon: 'zap', text: 'Mark attendance in seconds' },
  { icon: 'book-open', text: 'Assign homework with attachments' },
  { icon: 'calendar-days', text: 'Your timetable, always handy' },
];

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

  const form = (
    <div className="w-full max-w-[380px] mx-auto">
      <div className="flex flex-col items-center text-center mb-7">
        <Logo size={52} />
        <h1 className="font-700 text-ink text-[22px] tracking-[-0.01em] mt-4">Welcome back</h1>
        <p className="text-ink-soft text-[13.5px] mt-1">Sign in to your teacher portal</p>
      </div>

      <Card className="p-6 shadow-card-lg space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-[13px] font-600 text-rose-600">
            <Icon name="alert-circle" size={17} className="shrink-0" />
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="text-[12.5px] font-600 text-ink-soft mb-1.5 block">Teacher ID</label>
            <div className="relative">
              <Icon name="id-card" size={19} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
              <input
                className={fieldCls}
                placeholder="e.g. TCH101" type="text" autoComplete="username"
                value={teacherAppId} onChange={(e) => setTeacherAppId(e.target.value)} required
              />
            </div>
          </div>

          <div>
            <label className="text-[12.5px] font-600 text-ink-soft mb-1.5 block">Password</label>
            <div className="relative">
              <Icon name="lock" size={19} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
              <input
                className={`${fieldCls} pr-11`}
                placeholder="Your password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)} required
              />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-blue-600 transition-colors">
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={19} />
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full mt-1" disabled={loading} iconRight={loading ? undefined : 'arrow-right'}>
            {loading
              ? (<><Icon name="loader" size={19} strokeWidth={2} className="animate-spin" />Signing in…</>)
              : 'Sign in'}
          </Button>
        </form>
      </Card>

      <p className="text-center text-[13px] text-ink-soft mt-5">
        No Teacher ID? <span className="text-blue-600 font-600">Ask your school admin.</span>
      </p>
      <p className="text-center text-[12px] font-600 text-ink-faint mt-8 tracking-wide">© 2026 Scoolg · All rights reserved</p>
    </div>
  );

  return (
    <div className="min-h-screen flex fade-up">
      {/* Desktop brand panel */}
      <section className="hidden lg:flex w-1/2 bg-blue-600 p-12 flex-col justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 grid place-items-center"><Icon name="graduation-cap" size={24} className="text-white" /></div>
          <div>
            <p className="font-700 text-[19px] leading-none">Scoolg</p>
            <p className="text-[10px] font-600 tracking-[0.18em] uppercase opacity-75 mt-1">Teacher Portal</p>
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="font-700 text-[38px] leading-[1.1] tracking-[-0.02em]">Run your classroom from your pocket.</h2>
          <div className="space-y-3 mt-8">
            {FEATURES.map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.12] grid place-items-center"><Icon name={f.icon} size={19} className="text-white" /></div>
                <span className="text-[14.5px] font-500 opacity-95">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[12px] opacity-70">© Scoolg · Precision school management</p>
      </section>

      {/* Form side */}
      <section className="flex-1 bg-white lg:bg-paper flex flex-col justify-center px-5 py-10 lg:p-10">
        {form}
      </section>
    </div>
  );
};

export default Login;
