import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
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

    const schoolId = localStorage.getItem('scoolg_school_id');

    const refreshStats = async (force = false) => {
        if (!schoolId) return;
        if (!force && stats) {
            setLoadingStats(false);
            return;
        }
        
        try {
            const res = await axios.get(`https://scoolg-backend.netlify.app/api/admin/dashboard-stats/${schoolId}`);
            if (res.data) {
                setStats(res.data);
                localStorage.setItem('scoolg_cached_stats', JSON.stringify(res.data));
            }
        } catch (err) {
            console.error("Stats fetch error:", err);
            // Ensure stats is at least an object to prevent crashes
            if (!stats) setStats({ total: 0, male: 0, female: 0, students: 0 });
        } finally {
            setLoadingStats(false);
        }
    };

    const refreshStudents = async (force = false) => {
        if (!schoolId) return;
        if (!force && students.length > 0) {
            setLoadingStudents(false);
            return;
        }

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

    // Initial fetch
    useEffect(() => {
        if (schoolId) {
            refreshStats();
            refreshStudents();
        }
    }, [schoolId]);

    return (
        <AdminContext.Provider value={{ 
            stats, 
            students, 
            loadingStats, 
            loadingStudents, 
            refreshStats, 
            refreshStudents 
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
