import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [schoolId, setSchoolId] = useState(localStorage.getItem('scoolg_school_id'));
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('scoolg_cached_stats');
        return saved ? JSON.parse(saved) : null;
    });
    const [students, setStudents] = useState(() => {
        const saved = localStorage.getItem('scoolg_cached_students');
        return saved ? JSON.parse(saved) : [];
    });
    const [loadingStats, setLoadingStats] = useState(!stats);
    const [loadingStudents, setLoadingStudents] = useState(students.length === 0);

    const refreshStats = async (force = false) => {
        if (!schoolId) return;
        
        // Show loading only if we have NO data yet or if forced
        if (!stats || force) setLoadingStats(true);
        
        try {
            const res = await axios.get(`https://scoolg-backend.netlify.app/api/admin/dashboard-stats/${schoolId}`);
            if (res.data) {
                setStats(res.data);
                localStorage.setItem('scoolg_cached_stats', JSON.stringify(res.data));
            }
        } catch (err) {
            console.error("Stats fetch error:", err);
            if (!stats) setStats({ total: 0, male: 0, female: 0, students: 0 });
        } finally {
            setLoadingStats(false);
        }
    };

    const refreshStudents = async (force = false) => {
        if (!schoolId) return;

        // Show loading only if we have NO data yet or if forced
        if (students.length === 0 || force) setLoadingStudents(true);

        try {
            const res = await axios.get(`https://scoolg-backend.netlify.app/api/admin/students?schoolId=${schoolId}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setStudents(data);
            localStorage.setItem('scoolg_cached_students', JSON.stringify(data));
        } catch (err) {
            console.error("Students fetch error:", err);
            if (students.length === 0) setStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    };

    const logout = () => {
        localStorage.clear();
        setSchoolId(null);
        setStats(null);
        setStudents([]);
        setLoadingStats(false);
        setLoadingStudents(false);
    };

    // Initial fetch and fetch on schoolId change
    useEffect(() => {
        if (schoolId) {
            refreshStats();
            refreshStudents();
        } else {
            setStats(null);
            setStudents([]);
            setLoadingStats(false);
            setLoadingStudents(false);
        }
    }, [schoolId]);

    return (
        <AdminContext.Provider value={{ 
            schoolId,
            setSchoolId,
            stats, 
            students, 
            loadingStats, 
            loadingStudents, 
            refreshStats, 
            refreshStudents,
            logout
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
