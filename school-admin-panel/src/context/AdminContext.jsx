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
        if (!force && stats) setLoadingStats(false);
        
        try {
            const res = await axios.get(`https://scoolg-backend.netlify.app/api/admin/dashboard-stats/${schoolId}`);
            setStats(res.data);
            localStorage.setItem('scoolg_cached_stats', JSON.stringify(res.data));
        } catch (err) {
            console.error("Stats fetch error:", err);
        } finally {
            setLoadingStats(false);
        }
    };

    const refreshStudents = async (force = false) => {
        if (!schoolId) return;
        if (!force && students.length > 0) setLoadingStudents(false);

        try {
            const res = await axios.get(`https://scoolg-backend.netlify.app/api/admin/students?schoolId=${schoolId}`);
            setStudents(res.data);
            localStorage.setItem('scoolg_cached_students', JSON.stringify(res.data));
        } catch (err) {
            console.error("Students fetch error:", err);
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
