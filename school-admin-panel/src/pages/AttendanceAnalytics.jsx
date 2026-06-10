import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';
import Dropdown from '../components/Dropdown';
import AttendanceTrendChart from '../components/AttendanceTrendChart';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const RANGES = [
    { k: 'daily', label: 'Daily' },
    { k: 'weekly', label: 'Weekly' },
    { k: 'monthly', label: 'Monthly' },
    { k: 'yearly', label: 'Yearly' },
];

const barColor = (pct) => (pct >= 90 ? '#10b981' : pct >= 80 ? '#84cc16' : pct >= 75 ? '#2563eb' : '#f43f5e');

const AttendanceAnalytics = () => {
    const navigate = useNavigate();
    const { classes } = useAdmin();
    const schoolId = localStorage.getItem('scoolg_school_id');

    const [range, setRange] = useState('monthly');
    const [classId, setClassId] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!schoolId) return;
        setLoading(true);
        const params = new URLSearchParams({ schoolId, range });
        if (classId) params.append('classId', classId);
        axios.get(`${ADMIN_API_BASE}/attendance/analytics?${params.toString()}`)
            .then((r) => setData(r.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [schoolId, range, classId]);

    const trend = data?.trend || [];
    const byClass = data?.byClass || [];
    const avg = data?.avg ?? 0;
    const hasData = !loading && trend.length > 0;

    const classOptions = [{ value: '', label: 'All classes' }, ...classes.map((c) => ({ value: c._id, label: c.className }))];

    const barData = {
        labels: byClass.map((c) => c.className),
        datasets: [{
            data: byClass.map((c) => c.pct),
            backgroundColor: byClass.map((c) => barColor(c.pct)),
            borderRadius: 8,
            maxBarThickness: 46,
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
        <div className="p-4 sm:p-8 space-y-6 max-w-[1100px] mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <button onClick={() => navigate('/attendance')} aria-label="Back to attendance" className="shrink-0 -ml-1 w-9 h-9 grid place-items-center rounded-lg text-slate-700 hover:bg-slate-100 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight truncate leading-tight">Attendance Analytics</h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-500">Present-rate trends from real attendance records.</p>
                </div>
            </div>

            {/* Controls: range toggle + class filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="inline-flex bg-slate-100 rounded-xl p-1 w-full sm:w-auto">
                    {RANGES.map((r) => (
                        <button
                            key={r.k}
                            onClick={() => setRange(r.k)}
                            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${range === r.k ? 'bg-white text-[#2563eb] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
                <Dropdown
                    value={classId}
                    onChange={(v) => setClassId(v)}
                    options={classOptions}
                    placeholder="All classes"
                    icon="class"
                    className="w-full sm:w-52"
                    buttonClassName="h-10"
                />
            </div>

            {loading ? (
                <div className="space-y-6">
                    <div className="h-72 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse"></div>
                    <div className="h-64 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse"></div>
                </div>
            ) : !hasData ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-300 py-20 text-center text-slate-400">
                    <span className="material-symbols-outlined text-6xl text-slate-200 mb-3">monitoring</span>
                    <h3 className="text-lg font-bold text-slate-600">No attendance data yet</h3>
                    <p className="text-sm text-slate-500 mt-1">Mark attendance for a few days and the trends will appear here.</p>
                </div>
            ) : (
                <>
                    {/* Avg + trend chart */}
                    <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Average present rate</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">{avg}%</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full ${avg >= 85 ? 'text-emerald-600 bg-emerald-50' : avg >= 75 ? 'text-blue-600 bg-blue-50' : 'text-rose-600 bg-rose-50'}`}>
                                <span className="material-symbols-outlined text-[14px]">{avg >= 85 ? 'trending_up' : avg >= 75 ? 'trending_flat' : 'trending_down'}</span>
                                {avg >= 85 ? 'Healthy' : avg >= 75 ? 'Average' : 'Low'}
                            </span>
                        </div>
                        <AttendanceTrendChart labels={trend.map((t) => t.label)} values={trend.map((t) => t.pct)} height="h-72" />
                    </div>

                    {/* Class-wise */}
                    {byClass.length > 0 && (
                        <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
                                Class-wise present rate
                            </h3>
                            <div className="h-64">
                                <Bar data={barData} options={barOptions} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AttendanceAnalytics;
