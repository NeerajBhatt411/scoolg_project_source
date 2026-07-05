import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Clock, TrendingUp } from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { saFetch } from '../lib/api';

const BRAND = '#004ac6';
const GREEN = '#10b981';
const AMBER = '#f59e0b';
const GRAY = '#d1d5db';

// Branded tooltip for the charts.
const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
            {label ? <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p> : null}
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="size-2.5 rounded-full" style={{ background: p.color || p.payload?.color || p.fill }} />
                    <span className="text-foreground">{p.name}</span>
                    <span className="ml-auto font-semibold text-foreground">{p.value}</span>
                </div>
            ))}
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, iconBg, iconText, loading }) => (
    <div className="rounded-xl bg-card p-5 premium-shadow transition-shadow hover:shadow-md flex items-center gap-4">
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
            <Icon className={`size-6 ${iconText}`} />
        </div>
        <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            {loading
                ? <div className="mt-1 h-8 w-14 rounded bg-muted animate-pulse" />
                : <p className="text-3xl font-bold leading-tight text-foreground">{value}</p>}
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ schools: 0, students: 0, revenue: 0, pending: 0 });
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, schoolsRes] = await Promise.all([
                saFetch('/superadmin/dashboard'),
                saFetch('/superadmin/schools'),
            ]);
            setStats(await statsRes.json());
            setSchools(await schoolsRes.json());
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleApprove = async (id) => {
        try {
            const res = await saFetch(`/superadmin/schools/${id}/approve`, { method: 'POST' });
            if (res.ok) { fetchData(); }
        } catch (error) { console.error('Approval failed', error); }
    };

    // Schools registered per month (last 6 months) from createdAt.
    const monthly = useMemo(() => {
        const now = new Date();
        const buckets = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleString('en', { month: 'short' }), schools: 0 });
        }
        const idx = Object.fromEntries(buckets.map((b, i) => [b.key, i]));
        for (const s of schools) {
            if (!s.createdAt) continue;
            const d = new Date(s.createdAt);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (key in idx) buckets[idx[key]].schools += 1;
        }
        return buckets;
    }, [schools]);

    // Status breakdown for the donut.
    const statusData = useMemo(() => {
        const c = { active: 0, pending: 0, inactive: 0 };
        for (const s of schools) {
            if (s.status === 'PENDING') c.pending += 1;
            else if (s.status === 'INACTIVE' || s.status === 'SUSPENDED') c.inactive += 1;
            else c.active += 1;
        }
        return [
            { name: 'Active', value: c.active, color: GREEN },
            { name: 'Pending', value: c.pending, color: AMBER },
            { name: 'Inactive', value: c.inactive, color: GRAY },
        ].filter((d) => d.value > 0);
    }, [schools]);

    const recent = [...schools].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    return (
        <div className="p-4 sm:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">Platform growth and school onboarding at a glance.</p>
            </div>

            {/* stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard label="Total Schools" value={(stats.schools ?? 0).toLocaleString()} icon={Building2} iconBg="bg-blue-500/10" iconText="text-blue-600" loading={loading} />
                <StatCard label="Total Students" value={(stats.students ?? 0).toLocaleString()} icon={Users} iconBg="bg-emerald-500/10" iconText="text-emerald-600" loading={loading} />
                <StatCard label="Pending Approvals" value={stats.pending ?? 0} icon={Clock} iconBg="bg-amber-500/10" iconText="text-amber-600" loading={loading} />
            </div>

            {/* charts */}
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-xl bg-card p-5 premium-shadow min-w-0">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-foreground">School Registrations</h3>
                        <p className="text-xs text-muted-foreground">New schools — last 6 months</p>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={monthly} margin={{ left: -20, right: 8, top: 8 }}>
                            <defs>
                                <linearGradient id="gSchools" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={BRAND} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                            <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                            <Tooltip content={<ChartTip />} />
                            <Area type="monotone" dataKey="schools" name="Schools" stroke={BRAND} strokeWidth={2} fill="url(#gSchools)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-xl bg-card p-5 premium-shadow min-w-0">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-foreground">School Status</h3>
                        <p className="text-xs text-muted-foreground">Active vs pending vs inactive</p>
                    </div>
                    {statusData.length ? (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                                        {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                    </Pie>
                                    <Tooltip content={<ChartTip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs">
                                {statusData.map((d) => (
                                    <span key={d.name} className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="size-2.5 rounded-full" style={{ background: d.color }} /> {d.name} {d.value}
                                    </span>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">No schools yet.</div>
                    )}
                </div>
            </div>

            {/* recent registrations */}
            <div className="rounded-xl bg-card premium-shadow overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Recent Registrations</h3>
                    <button onClick={() => navigate('/schools')} className="text-xs font-semibold text-primary hover:underline">View all</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider border-b border-border">
                                <th className="px-5 py-3">School</th>
                                <th className="px-5 py-3">Campus Code</th>
                                <th className="px-5 py-3">Joined</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-8 text-muted-foreground">Loading…</td></tr>
                            ) : recent.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-8 text-muted-foreground">No schools registered yet.</td></tr>
                            ) : recent.map((s) => (
                                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                                                {s.formData?.schoolName ? s.formData.schoolName.substring(0, 2) : 'NA'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-foreground truncate">{s.formData?.schoolName || 'Unknown School'}</p>
                                                <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 font-semibold uppercase text-foreground">{s.campusCode || '—'}</td>
                                    <td className="px-5 py-3.5 text-muted-foreground">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                                    <td className="px-5 py-3.5">
                                        {s.status === 'PENDING' ? (
                                            <button onClick={() => handleApprove(s.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors">
                                                <span className="size-1.5 rounded-full bg-amber-500" /> Approve
                                            </button>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                                                <span className="size-1.5 rounded-full bg-emerald-500" /> {s.status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
