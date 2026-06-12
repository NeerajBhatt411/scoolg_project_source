import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import AttendanceTrendChart from './AttendanceTrendChart';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// Interactive attendance chart for the dashboard (shadcn ChartAreaInteractive
// style): segmented Day/Week/Month/Class toggle, area-line trend, class bars.
// Pulls real data from /attendance/analytics; falls back to sample data so the
// card never renders empty.

const TABS = [
    { k: 'daily', label: 'Day' },
    { k: 'weekly', label: 'Week' },
    { k: 'monthly', label: 'Month' },
    { k: 'class', label: 'Class' },
];

const DEMO_TREND = {
    daily: [['Mon', 95], ['Tue', 92], ['Wed', 96], ['Thu', 90], ['Fri', 93], ['Sat', 88]],
    weekly: [['Wk 1', 91], ['Wk 2', 93], ['Wk 3', 89], ['Wk 4', 94], ['Wk 5', 92], ['Wk 6', 95], ['Wk 7', 90], ['Wk 8', 93]],
    monthly: [['Jan', 90], ['Feb', 93], ['Mar', 88], ['Apr', 95], ['May', 91], ['Jun', 94], ['Jul', 89], ['Aug', 92], ['Sep', 96], ['Oct', 90], ['Nov', 93], ['Dec', 91]],
};
const DEMO_BYCLASS = [
    { className: 'Grade 1', pct: 96 },
    { className: 'Grade 2', pct: 88 },
    { className: 'Grade 3', pct: 92 },
    { className: 'Grade 4', pct: 79 },
    { className: 'Grade 5', pct: 90 },
];

const barColor = (pct) => (pct >= 90 ? '#10b981' : pct >= 80 ? '#84cc16' : pct >= 75 ? '#2563eb' : '#f43f5e');

const AttendanceOverviewCard = () => {
    const navigate = useNavigate();
    const schoolId = localStorage.getItem('scoolg_school_id');
    const [tab, setTab] = useState('weekly');
    const [loading, setLoading] = useState(true);
    const [byTab, setByTab] = useState({});
    const cache = useRef({});

    const apiRange = tab === 'class' ? 'monthly' : tab;
    // Cache keyed by school + range so a school switch never serves stale data.
    const cacheKey = `${schoolId}:${apiRange}`;

    useEffect(() => {
        let active = true;
        if (cacheKey in cache.current) { setByTab({ ...cache.current }); setLoading(false); return; }
        setLoading(true);
        axios.get(`${ADMIN_API_BASE}/attendance/analytics?schoolId=${schoolId}&range=${apiRange}`)
            .then((r) => { cache.current = { ...cache.current, [cacheKey]: r.data }; })
            .catch(() => { cache.current = { ...cache.current, [cacheKey]: null }; })
            .finally(() => { if (active) { setByTab({ ...cache.current }); setLoading(false); } });
        return () => { active = false; };
    }, [cacheKey, apiRange, schoolId]);

    const data = byTab[cacheKey];
    const realTrend = data?.trend || [];
    const realByClass = data?.byClass || [];
    const isDemo = tab === 'class' ? realByClass.length === 0 : realTrend.length === 0;

    const trend = realTrend.length
        ? realTrend
        : (DEMO_TREND[apiRange] || DEMO_TREND.monthly).map(([label, pct]) => ({ label, pct }));
    const byClass = realByClass.length ? realByClass : DEMO_BYCLASS;

    const avg = tab === 'class'
        ? Math.round(byClass.reduce((a, c) => a + c.pct, 0) / byClass.length)
        : (realTrend.length ? (data?.avg ?? 0) : Math.round(trend.reduce((a, t) => a + t.pct, 0) / trend.length));

    // Footer: shadcn-style "Trending up by X% ..." from the last two points.
    const last = trend[trend.length - 1]?.pct ?? 0;
    const prev = trend[trend.length - 2]?.pct ?? last;
    const delta = last - prev;
    const periodWord = { daily: 'day', weekly: 'week', monthly: 'month' }[apiRange] || 'period';

    const barData = {
        labels: byClass.map((c) => c.className),
        datasets: [{
            data: byClass.map((c) => c.pct),
            backgroundColor: byClass.map((c) => barColor(c.pct)),
            borderRadius: 10,
            maxBarThickness: 52,
        }],
    };
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#0f172a', padding: 10, cornerRadius: 10, displayColors: false, callbacks: { label: (i) => `${i.formattedValue}% present` } },
        },
        scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { color: '#64748b', font: { size: 11, weight: '700' } } },
            y: { min: 0, max: 100, grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { color: '#cbd5e1', font: { size: 10, weight: '700' }, stepSize: 25, callback: (v) => `${v}%` } },
        },
    };

    return (
        <div className="bg-white rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden">
            {/* Card header */}
            <div className="p-6 sm:p-8 pb-0 sm:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h5 className="text-xl text-slate-900 font-black flex items-center gap-3 tracking-tight">
                            <span className="w-1.5 h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></span>
                            Attendance Overview
                        </h5>
                        <p className="text-[12px] font-medium text-slate-400 mt-1 ml-[18px]">
                            {tab === 'class' ? 'Average present rate per class' : 'Present rate over time'}
                            {isDemo && <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Sample</span>}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="inline-flex bg-slate-100 rounded-xl p-1 w-full sm:w-auto">
                            {TABS.map((t) => (
                                <button
                                    key={t.k}
                                    onClick={() => setTab(t.k)}
                                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t.k ? 'bg-white text-[#2563eb] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => navigate('/attendance/analytics')} title="Open full analytics" className="hidden sm:grid w-9 h-9 place-items-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all">
                            <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                        </button>
                    </div>
                </div>

                {/* Big number row */}
                <div className="flex items-end justify-between mt-6 mb-4">
                    <div>
                        <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">{loading ? '—' : `${avg}%`}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                            {tab === 'class' ? 'All-class average' : `Average per ${periodWord}`}
                        </p>
                    </div>
                    {!loading && (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full ${avg >= 85 ? 'text-emerald-600 bg-emerald-50' : avg >= 75 ? 'text-blue-600 bg-blue-50' : 'text-rose-600 bg-rose-50'}`}>
                            <span className="material-symbols-outlined text-[14px]">{avg >= 85 ? 'trending_up' : avg >= 75 ? 'trending_flat' : 'trending_down'}</span>
                            {avg >= 85 ? 'Healthy' : avg >= 75 ? 'Average' : 'Low'}
                        </span>
                    )}
                </div>
            </div>

            {/* Chart area */}
            <div className="px-4 sm:px-8 pb-2">
                {loading ? (
                    <div className="h-56 sm:h-72 bg-slate-50 rounded-2xl animate-pulse"></div>
                ) : tab === 'class' ? (
                    <div className="h-56 sm:h-72"><Bar data={barData} options={barOptions} /></div>
                ) : (
                    <AttendanceTrendChart labels={trend.map((t) => t.label)} values={trend.map((t) => t.pct)} height="h-56 sm:h-72" />
                )}
            </div>

            {/* Card footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-slate-50 flex flex-wrap items-center justify-between gap-2">
                {tab === 'class' ? (
                    <p className="text-[12px] font-bold text-slate-500">
                        Best: <span className="text-emerald-600">{[...byClass].sort((a, b) => b.pct - a.pct)[0]?.className}</span>
                        <span className="mx-2 text-slate-200">|</span>
                        Needs attention: <span className="text-rose-500">{[...byClass].sort((a, b) => a.pct - b.pct)[0]?.className}</span>
                    </p>
                ) : (
                    <p className="text-[12px] font-bold text-slate-500 flex items-center gap-1.5">
                        {delta === 0 ? `Steady at ${last}% this ${periodWord}` : `Trending ${delta > 0 ? 'up' : 'down'} by ${Math.abs(delta)}% this ${periodWord}`}
                        <span className={`material-symbols-outlined text-[16px] ${delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{delta >= 0 ? 'trending_up' : 'trending_down'}</span>
                    </p>
                )}
                <button onClick={() => navigate('/attendance/analytics')} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                    View full analytics →
                </button>
            </div>
        </div>
    );
};

export default AttendanceOverviewCard;
