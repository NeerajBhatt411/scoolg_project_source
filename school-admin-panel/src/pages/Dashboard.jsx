import React from 'react';
import { LayoutDashboard, Users, CheckCircle2, TrendingUp, Bell, Search, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const schoolName = localStorage.getItem('scoolg_school_name') || 'School Admin';

    const stats = [
        { name: 'Total Students', value: '2,450', icon: <Users color="#2563eb" />, bg: '#eff6ff' },
        { name: 'Application Status', value: 'Approved', icon: <CheckCircle2 color="#22c55e" />, bg: '#f0fdf4' },
        { name: 'Monthly Reach', value: '12.5k', icon: <TrendingUp color="#f59e0b" />, bg: '#fffbeb' },
    ];

    return (
        <div style={{ padding: '60px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
            <motion.div
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: 'center', maxWidth: '700px' }}
            >
                <div style={{ display: 'inline-flex', padding: '24px', background: '#eff6ff', borderRadius: '50%', marginBottom: '32px' }}>
                    <LayoutDashboard size={64} color="#2563eb" />
                </div>
                <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', letterSpacing: '-1.5px' }}>
                    We are working on school dashboard
                </h1>
                <p style={{ fontSize: '18px', color: '#64748b', fontWeight: '500', lineHeight: '1.6' }}>
                    Hello <span style={{ color: '#2563eb', fontWeight: '700' }}>{schoolName}</span>! We are currently building a powerful,
                    all-in-one management experience for your school.
                    Very soon you'll be able to manage students, staff, and events right from this console.
                </p>
                <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px 24px', background: '#f8fafc', borderRadius: '14px', fontSize: '14px', fontWeight: '700', color: '#64748b' }}>
                        Version 1.0.2 (Beta)
                    </div>
                    <button className="btn btn-primary" style={{ padding: '12px 24px' }}>
                        Notify Me on Update
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
