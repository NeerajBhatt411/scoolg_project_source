import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, ShieldCheck, AlertCircle, Loader2, CheckCircle2, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/**
 * Change-password screen for teachers. Reached automatically (forced) when the
 * account is still on the default password (isPasswordChanged === false), or
 * manually for a voluntary change.
 */
const ChangePassword = () => {
  const { teacher, fetchProfile, logout } = useAuth();
  const navigate = useNavigate();
  const forced = teacher?.isPasswordChanged === false;

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 4) return setError('Password must be at least 4 characters.');
    if (newPassword !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await api.post('/teacher/change-password', { newPassword });
      await fetchProfile();
      setDone(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 1100);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update password. Please try again.');
      setLoading(false);
    }
  };

  const inputCls = 'flex h-[54px] w-full rounded-xl border border-input bg-muted/40 pl-12 pr-12 text-sm font-semibold transition-colors placeholder:text-muted-foreground/70 placeholder:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-card text-foreground';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-5 sm:p-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[460px]">
        <div className="bg-card rounded-[32px] border shadow-[0_25px_50px_-12px_rgba(15,23,42,0.08)] p-8 sm:p-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
            {done ? <CheckCircle2 className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
          </div>

          {done ? (
            <>
              <h1 className="text-[24px] font-extrabold tracking-tight text-foreground">All set!</h1>
              <p className="text-[15px] font-medium text-muted-foreground mt-1.5">Your password has been updated. Taking you in…</p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-primary mb-2">
                {forced ? 'Secure your account' : 'Account security'}
              </p>
              <h1 className="text-[24px] font-extrabold tracking-tight text-foreground leading-tight">
                {forced ? 'Set a new password' : 'Change your password'}
              </h1>
              <p className="text-[15px] font-medium text-muted-foreground mt-1.5 mb-6">
                {forced
                  ? "You're signed in with a default password. Please set your own password to continue."
                  : 'Choose a new password for your account.'}
              </p>

              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 mb-5 bg-destructive/10 text-destructive rounded-xl text-sm font-semibold flex items-center gap-2 border border-destructive/10">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </motion.div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div className="relative">
                  <Lock className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input className={inputCls} type={show ? 'text' : 'password'} placeholder="New password"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" autoFocus />
                  <button type="button" onClick={() => setShow(s => !s)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                    {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input className={inputCls} type={show ? 'text' : 'password'} placeholder="Confirm new password"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
                </div>

                <button disabled={loading} type="submit"
                  className="w-full !mt-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-[15px] font-bold h-[54px] shadow-lg shadow-primary/20 active:scale-[0.98]">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (forced ? 'Set password & continue' : 'Update password')}
                </button>
              </form>

              <div className="mt-5 text-center">
                {forced ? (
                  <button onClick={logout}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-semibold hover:text-foreground transition-colors">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                ) : (
                  <button onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-semibold hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
