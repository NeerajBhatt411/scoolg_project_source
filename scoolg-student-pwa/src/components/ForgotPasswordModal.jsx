import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, BadgeCheck, ArrowRight } from 'lucide-react';
import api from '../utils/api';

/**
 * Forgot-password flow for the student app.
 *  Step 'id'    -> student enters their Student ID; a 6-digit code is emailed to
 *                  the parent email on file (POST /student/forgot-password).
 *  Step 'reset' -> enter code + new password (POST /student/reset-password).
 *  Step 'done'  -> success.
 */
const ForgotPasswordModal = ({ open, onClose }) => {
  const [step, setStep] = useState('id'); // 'id' | 'reset' | 'done'
  const [studentAppId, setStudentAppId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const resetState = () => {
    setStep('id'); setStudentAppId(''); setOtp(''); setNewPassword('');
    setConfirm(''); setShow(false); setError(''); setInfo(''); setLoading(false);
  };
  const close = () => { resetState(); onClose(); };

  const sendCode = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!studentAppId.trim()) return setError('Please enter your Student ID.');
    setLoading(true);
    try {
      const res = await api.post('/student/forgot-password', { studentAppId: studentAppId.trim() });
      if (res.data?.needsAdmin) { setError(res.data.message); return; }
      setInfo(res.data?.sentTo
        ? `We've sent a 6-digit code to ${res.data.sentTo}.`
        : (res.data?.message || 'If a parent email is on file, a reset code has been sent.'));
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) return setError('Enter the 6-digit code from the email.');
    if (newPassword.length < 4) return setError('Password must be at least 4 characters.');
    if (newPassword !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await api.post('/student/reset-password', { studentAppId: studentAppId.trim(), otp: otp.trim(), newPassword });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset password. Check the code and try again.');
    } finally { setLoading(false); }
  };

  const inputCls = 'flex h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm font-semibold transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-white text-slate-900';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[420px] bg-white rounded-[28px] border border-slate-100 shadow-2xl p-7 sm:p-8">

            <button onClick={close} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              {step === 'done' ? <CheckCircle2 className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
            </div>

            {step === 'id' && (
              <>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Forgot password?</h2>
                <p className="text-sm text-slate-500 font-medium mt-1.5 mb-5">
                  Enter your Student ID and we'll email a reset code to your registered parent email.
                </p>
                {error && <ErrorBox msg={error} />}
                <form onSubmit={sendCode} className="space-y-4">
                  <div className="relative">
                    <BadgeCheck className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input className={inputCls} placeholder="Student ID (e.g. STU101)" value={studentAppId}
                      onChange={(e) => setStudentAppId(e.target.value)} autoFocus />
                  </div>
                  <button disabled={loading} type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-[15px] font-bold h-[52px] shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send reset code <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>
              </>
            )}

            {step === 'reset' && (
              <>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Enter the code</h2>
                <p className="text-sm text-slate-500 font-medium mt-1.5 mb-5">{info}</p>
                {error && <ErrorBox msg={error} />}
                <form onSubmit={resetPassword} className="space-y-4">
                  <input
                    className="flex h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-lg font-bold tracking-[0.5em] transition-colors placeholder:tracking-normal placeholder:text-slate-400 placeholder:text-sm placeholder:font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-white text-slate-900"
                    placeholder="6-digit code" value={otp} inputMode="numeric" maxLength={6} autoFocus
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
                  <div className="relative">
                    <Lock className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input className={inputCls} type={show ? 'text' : 'password'} placeholder="New password"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <button type="button" onClick={() => setShow(s => !s)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors">
                      {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input className={inputCls} type={show ? 'text' : 'password'} placeholder="Confirm new password"
                      value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                  </div>
                  <button disabled={loading} type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-[15px] font-bold h-[52px] shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset password'}
                  </button>
                  <button type="button" onClick={() => { setStep('id'); setError(''); }}
                    className="w-full text-center text-sm text-slate-500 font-semibold hover:text-slate-700 transition-colors">
                    Use a different Student ID
                  </button>
                </form>
              </>
            )}

            {step === 'done' && (
              <>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Password updated</h2>
                <p className="text-sm text-slate-500 font-medium mt-1.5 mb-6">
                  Your password has been reset. You can now sign in with your new password.
                </p>
                <button onClick={close}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors text-[15px] font-bold h-[52px] shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                  Back to login
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ErrorBox = ({ msg }) => (
  <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2 border border-red-100">
    <AlertCircle className="h-4 w-4 shrink-0" /> {msg}
  </div>
);

export default ForgotPasswordModal;
