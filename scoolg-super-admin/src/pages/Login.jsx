import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { SA_API, setToken, getToken } from '../lib/api';
import logo from '../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Already signed in -> skip the login screen.
  if (getToken()) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError('Please enter your email and password.');
    setLoading(true);
    try {
      const res = await fetch(`${SA_API}/superadmin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Login failed. Please try again.');
      setToken(data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full bg-surface-container/50 border border-border rounded-xl pl-11 pr-11 h-12 text-sm font-semibold text-text focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-5">
      <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-3xl premium-shadow border border-border p-8 sm:p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <img src={logo} alt="Scoolg" className="h-12 w-auto rounded-xl mb-4" />
          <h1 className="text-2xl font-extrabold text-text">Super Admin</h1>
          <p className="text-sm text-text-muted font-medium mt-1">Sign in to the Scoolg control panel</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold flex items-center gap-2 border border-red-100">
            <span className="material-symbols-outlined text-[18px]">error</span> {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Email</label>
            <div className="relative mt-1.5">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">mail</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@scoolg.dev" autoFocus className={inputCls} />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Password</label>
            <div className="relative mt-1.5">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">lock</span>
              <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                <span className="material-symbols-outlined text-[20px]">{show ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full !mt-6 primary-gradient text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
