import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

// Smooth area-line chart (shadcn-style) for the dashboard attendance snapshot.
const AttendanceTrendChart = ({ labels, values, height = 'h-56' }) => {
    const data = {
        labels,
        datasets: [
            {
                data: values,
                borderColor: '#2563eb',
                borderWidth: 2.5,
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#2563eb',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                // Vertical gradient fill under the curve.
                backgroundColor: (ctx) => {
                    const { chart } = ctx;
                    const { ctx: c, chartArea } = chart;
                    if (!chartArea) return 'rgba(37,99,235,0.12)';
                    const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    g.addColorStop(0, 'rgba(37,99,235,0.25)');
                    g.addColorStop(1, 'rgba(37,99,235,0)');
                    return g;
                },
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                padding: 10,
                cornerRadius: 10,
                displayColors: false,
                titleFont: { size: 11, weight: '700' },
                bodyFont: { size: 12, weight: '700' },
                callbacks: { label: (item) => `${item.formattedValue}% present` },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: '#94a3b8', font: { size: 11, weight: '700' } },
            },
            y: {
                min: 0,
                max: 100,
                grid: { color: '#f1f5f9' },
                border: { display: false },
                ticks: {
                    color: '#cbd5e1',
                    font: { size: 10, weight: '700' },
                    stepSize: 25,
                    callback: (v) => `${v}%`,
                },
            },
        },
        interaction: { intersect: false, mode: 'index' },
    };

    return (
        <div className={height}>
            <Line data={data} options={options} />
        </div>
    );
};

export default AttendanceTrendChart;
