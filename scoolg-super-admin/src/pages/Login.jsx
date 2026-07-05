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

    // border-0 + focus:ring-0 + p-0 removes the @tailwindcss/forms default input
    // border/ring so the field's single outer border is the only box.
    const inputCls = 'flex-1 min-w-0 bg-transparent border-0 p-0 text-sm font-semibold outline-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/60';
    const fieldCls = 'flex items-center gap-2.5 h-12 mt-1.5 rounded-xl border border-outline-variant/60 bg-surface-container/40 px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all';

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0f172a] p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#111827] to-black" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.13),transparent_55%)]" />

            <div className="relative w-full max-w-[420px] bg-surface-container-lowest rounded-2xl premium-shadow border border-white/5 p-8 sm:p-10">
                <div className="flex flex-col items-center text-center mb-8">
                    <img src={logo} alt="Scoolg" className="h-14 w-14 rounded-2xl object-contain mb-4" />
                    <h1 className="text-2xl font-extrabold text-on-surface">Super Admin</h1>
                    <p className="text-sm text-on-surface-variant font-medium mt-1">Sign in to the Scoolg control panel</p>
                </div>

                {error && (
                    <div className="mb-5 p-3.5 rounded-xl bg-error-container/50 text-error text-sm font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span> {error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Email</label>
                        <div className={fieldCls}>
                            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">mail</span>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus placeholder="you@scoolg.dev" className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Password</label>
                        <div className={fieldCls}>
                            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">lock</span>
                            <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className={inputCls} />
                            <button type="button" onClick={() => setShow((s) => !s)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                                <span className="material-symbols-outlined text-[20px]">{show ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full !mt-6 h-12 rounded-xl primary-gradient text-white font-bold shadow-lg shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
