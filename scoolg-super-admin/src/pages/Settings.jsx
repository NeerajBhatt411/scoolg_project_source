import React, { useState, useEffect } from 'react';
import { saFetch, clearToken } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const StatusRow = ({ label, ok, okText = 'Connected', offText = 'Not configured' }) => (
    <div className="flex items-center justify-between py-3 border-b border-surface-container last:border-0">
        <span className="text-sm font-semibold text-on-surface">{label}</span>
        <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${ok ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-slate-400'}`} /> {ok ? okText : offText}
        </span>
    </div>
);

const Settings = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [busy, setBusy] = useState(false);
    const [toast, setToast] = useState('');
    const [err, setErr] = useState('');

    const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await saFetch('/superadmin/settings');
            setData(await res.json());
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const changePassword = async (e) => {
        e.preventDefault();
        setErr('');
        if (!pw.currentPassword || !pw.newPassword) return setErr('Fill all fields');
        if (pw.newPassword.length < 6) return setErr('New password must be at least 6 characters');
        if (pw.newPassword !== pw.confirm) return setErr('New passwords do not match');
        setBusy(true);
        try {
            const res = await saFetch('/superadmin/change-password', { method: 'POST', body: JSON.stringify({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }) });
            const d = await res.json().catch(() => ({}));
            if (res.ok) {
                setPw({ currentPassword: '', newPassword: '', confirm: '' });
                flash('Password updated');
                fetchData();
            } else {
                setErr(d.error || 'Failed to update password');
            }
        } catch (e) { setErr('Failed to update password'); } finally { setBusy(false); }
    };

    const logout = () => { clearToken(); navigate('/login'); };

    const inputCls = 'w-full rounded-xl border border-outline-variant/60 bg-surface-container/40 px-3 h-11 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-full">
            <div>
                <h2 className="text-2xl font-extrabold text-on-surface">Settings</h2>
                <p className="text-sm text-on-surface-variant font-medium mt-1">Your account and platform configuration.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Account */}
                <div className="bg-surface-container-lowest rounded-xl premium-shadow p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl primary-gradient grid place-items-center text-white shrink-0">
                            <span className="material-symbols-outlined text-[28px]">shield_person</span>
                        </div>
                        <div className="min-w-0">
                            <p className="font-extrabold text-on-surface truncate">{loading ? '…' : data?.email}</p>
                            <p className="text-sm text-on-surface-variant font-medium">{data?.role || 'Super Administrator'}</p>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button onClick={logout} className="w-full bg-surface-container-high hover:bg-surface-container text-red-500 font-bold h-11 rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">logout</span> Sign out
                        </button>
                    </div>
                </div>

                {/* Platform status */}
                <div className="bg-surface-container-lowest rounded-xl premium-shadow p-6">
                    <h3 className="font-extrabold text-on-surface mb-3">Platform</h3>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[['Schools', data?.platform?.schools], ['Students', data?.platform?.students], ['Pending', data?.platform?.pending]].map(([l, v]) => (
                            <div key={l} className="rounded-xl bg-surface-container-low p-3 text-center">
                                <p className="text-2xl font-extrabold text-on-surface">{loading ? '—' : (v ?? 0)}</p>
                                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{l}</p>
                            </div>
                        ))}
                    </div>
                    <StatusRow label="Database" ok={!!data?.config?.database} />
                    <StatusRow label="Email (SMTP)" ok={!!data?.config?.email} />
                    <StatusRow label="Image storage (S3)" ok={!!data?.config?.storage} />
                </div>

                {/* Change password */}
                <form onSubmit={changePassword} className="lg:col-span-2 bg-surface-container-lowest rounded-xl premium-shadow p-6 space-y-4">
                    <div>
                        <h3 className="font-extrabold text-on-surface">Security</h3>
                        <p className="text-sm text-on-surface-variant font-medium">Change your super-admin password.{data?.passwordSource === 'env' ? ' (Currently using the bootstrap password.)' : ''}</p>
                    </div>
                    {err && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold">{err}</div>}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Current</label>
                            <input type="password" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} className={`mt-1.5 ${inputCls}`} />
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">New</label>
                            <input type="password" value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} className={`mt-1.5 ${inputCls}`} />
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Confirm new</label>
                            <input type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} className={`mt-1.5 ${inputCls}`} />
                        </div>
                    </div>
                    <button type="submit" disabled={busy} className="primary-gradient text-white font-bold h-11 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
                        <span className="material-symbols-outlined text-[20px]">lock_reset</span> {busy ? 'Updating…' : 'Update password'}
                    </button>
                </form>
            </div>

            {toast && (
                <div className="fixed bottom-6 right-6 z-[200] bg-on-surface text-white text-sm font-bold px-5 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2">{toast}</div>
            )}
        </div>
    );
};

export default Settings;
