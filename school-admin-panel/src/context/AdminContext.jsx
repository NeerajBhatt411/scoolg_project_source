import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [schoolId, setSchoolId] = useState(localStorage.getItem('scoolg_school_id'));
    const [status, setStatus] = useState(localStorage.getItem('scoolg_school_status'));
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('scoolg_cached_stats');
        try { return saved ? JSON.parse(saved) : null; } catch(e) { return null; }
    });
    const [students, setStudents] = useState(() => {
        const saved = localStorage.getItem('scoolg_cached_students');
        try { return saved ? JSON.parse(saved) : []; } catch(e) { return []; }
    });
    const [loadingStats, setLoadingStats] = useState(!stats);
    const [loadingStudents, setLoadingStudents] = useState(students.length === 0);

    const API_BASE = 'http://localhost:5001/api/admin';

    const checkCurrentStatus = async () => {
        if (!schoolId) return;
        try {
            const res = await axios.get(`${API_BASE}/profile/${schoolId}`);
            if (res.data) {
                const newStatus = res.data.status || 'COMPLETED';
                if (newStatus !== status) {
                    setStatus(newStatus);
                    localStorage.setItem('scoolg_school_status', newStatus);
                }
            }
        } catch (err) { console.error("Status sync failed", err); }
    };

    const refreshStats = async (force = false) => {
        if (!schoolId) return;
        if (!stats || force) setLoadingStats(true);
        try {
            const res = await axios.get(`${API_BASE}/dashboard/stats?schoolId=${schoolId}`);
            if (res.data) {
                setStats(res.data);
                localStorage.setItem('scoolg_cached_stats', JSON.stringify(res.data));
            }
        } catch (err) {
            console.error("Stats fetch error:", err);
        } finally {
            setLoadingStats(false);
        }
    };

    const refreshStudents = async (force = false) => {
        if (!schoolId) return;
        if (students.length === 0 || force) setLoadingStudents(true);
        try {
            const res = await axios.get(`${API_BASE}/students?schoolId=${schoolId}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setStudents(data);
            localStorage.setItem('scoolg_cached_students', JSON.stringify(data));
        } catch (err) {
            console.error("Students fetch error:", err);
        } finally {
            setLoadingStudents(false);
        }
    };

    const logout = () => {
        localStorage.clear();
        setSchoolId(null);
        setStatus(null);
        setStats(null);
        setStudents([]);
    };

    useEffect(() => {
        if (schoolId) {
            checkCurrentStatus();
            refreshStats(true);
            refreshStudents(true);
        }
    }, [schoolId]);

    return (
        <AdminContext.Provider value={{
            schoolId, setSchoolId,
            status, setStatus,
            stats, students,
            loadingStats, loadingStudents,
            refreshStats, refreshStudents,
            checkCurrentStatus,
            logout
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
