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
const hexToRgba = (hex, alpha) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
};

const AttendanceTrendChart = ({ labels, values, height = 'h-56', color = '#2563eb' }) => {
    const data = {
        labels,
        datasets: [
            {
                data: values,
                borderColor: color,
                borderWidth: 2.5,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: color,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                // Vertical gradient fill under the curve.
                backgroundColor: (ctx) => {
                    const { chart } = ctx;
                    const { ctx: c, chartArea } = chart;
                    if (!chartArea) return hexToRgba(color, 0.12);
                    const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    g.addColorStop(0, hexToRgba(color, 0.25));
                    g.addColorStop(1, hexToRgba(color, 0));
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
                callbacks: { label: (item) => `${item.formattedValue} classes` },
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
                max: Math.max(...values, 10) + 2,
                grid: { color: '#f1f5f9' },
                border: { display: false },
                ticks: {
                    color: '#cbd5e1',
                    font: { size: 10, weight: '700' },
                    stepSize: 2,
                    callback: (v) => `${v}`,
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
