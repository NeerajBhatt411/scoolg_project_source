import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { ADMIN_API_BASE, setAuthToken } from '../lib/api';

const AdminContext = createContext();

const readCache = (key, fallback) => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch { return fallback; }
};

export const AdminProvider = ({ children }) => {
    const [schoolId, setSchoolId] = useState(localStorage.getItem('scoolg_school_id'));
    const [status, setStatus] = useState(localStorage.getItem('scoolg_school_status'));
    // Role/permissions. Missing (legacy session) => treat as Owner (full access).
    const [role, setRole] = useState(localStorage.getItem('scoolg_role') || 'Owner');
    const [allowedModules, setAllowedModules] = useState(() => readCache('scoolg_modules', 'ALL'));

    const setAuth = ({ role: r, allowedModules: mods }) => {
        setRole(r || 'Owner');
        setAllowedModules(mods ?? 'ALL');
    };

    // Module-level access check. Owner (or legacy/no-data) => everything.
    const can = useCallback((moduleKey) => {
        if (!moduleKey) return true;
        if (role === 'Owner' || allowedModules === 'ALL') return true;
        return Array.isArray(allowedModules) && allowedModules.includes(moduleKey);
    }, [role, allowedModules]);
    const [stats, setStats] = useState(() => readCache('scoolg_cached_stats', null));
    const [students, setStudents] = useState(() => readCache('scoolg_cached_students', []));
    const [classes, setClasses] = useState(() => readCache('scoolg_cached_classes', []));
    const [teachers, setTeachers] = useState(() => readCache('scoolg_cached_teachers', []));

    const [loadingStats, setLoadingStats] = useState(!stats);
    const [loadingStudents, setLoadingStudents] = useState(students.length === 0);
    const [loadingClasses, setLoadingClasses] = useState(classes.length === 0);

    // Mobile nav drawer open/close (controlled globally so any page header can open it).
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Throttle status checks so navigating between pages doesn't spam the API.
    const lastStatusCheck = useRef(0);
    // In-memory cache of sections keyed by classId (sections change rarely).
    const sectionsCache = useRef({});

    const checkCurrentStatus = async (force = false) => {
        if (!schoolId) return;
        const now = Date.now();
        if (!force && now - lastStatusCheck.current < 60000) return; // max once / 60s
        lastStatusCheck.current = now;
        try {
            const res = await axios.get(`${ADMIN_API_BASE}/profile/${schoolId}`);
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
        // Stale-while-revalidate: only show spinner when there's nothing cached.
        if (!stats || force) setLoadingStats(true);
        try {
            const res = await axios.get(`${ADMIN_API_BASE}/dashboard/stats?schoolId=${schoolId}`);
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
            const res = await axios.get(`${ADMIN_API_BASE}/students?schoolId=${schoolId}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setStudents(data);
            localStorage.setItem('scoolg_cached_students', JSON.stringify(data));
        } catch (err) {
            console.error("Students fetch error:", err);
        } finally {
            setLoadingStudents(false);
        }
    };

    const refreshClasses = async (force = false) => {
        if (!schoolId) return;
        if (classes.length === 0 || force) setLoadingClasses(true);
        try {
            const res = await axios.get(`${ADMIN_API_BASE}/classes?schoolId=${schoolId}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setClasses(data);
            localStorage.setItem('scoolg_cached_classes', JSON.stringify(data));
        } catch (err) {
            console.error("Classes fetch error:", err);
        } finally {
            setLoadingClasses(false);
        }
    };

    const refreshTeachers = async () => {
        if (!schoolId) return;
        try {
            const res = await axios.get(`${ADMIN_API_BASE}/teachers?schoolId=${schoolId}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setTeachers(data);
            localStorage.setItem('scoolg_cached_teachers', JSON.stringify(data));
        } catch (err) {
            console.error("Teachers fetch error:", err);
        }
    };

    // Fetch (and cache) sections for a class. Returns cached value instantly if present.
    // Memoized so consuming effects don't re-run on every render.
    const getSections = useCallback(async (classId, force = false) => {
        if (!classId) return [];
        if (!force && sectionsCache.current[classId]) return sectionsCache.current[classId];
        try {
            const res = await axios.get(`${ADMIN_API_BASE}/sections?classId=${classId}`);
            const data = Array.isArray(res.data) ? res.data : [];
            sectionsCache.current[classId] = data;
            return data;
        } catch (err) {
            console.error("Sections fetch error:", err);
            return sectionsCache.current[classId] || [];
        }
    }, []);

    const invalidateAcademic = () => {
        // Call after creating/editing a class or section so caches refresh.
        sectionsCache.current = {};
        refreshClasses(true);
    };

    const logout = () => {
        localStorage.clear();
        setAuthToken(null);
        setSchoolId(null);
        setStatus(null);
        setStats(null);
        setStudents([]);
        setClasses([]);
        setTeachers([]);
        setRole('Owner');
        setAllowedModules('ALL');
    };

    useEffect(() => {
        if (schoolId) {
            checkCurrentStatus(true);
            // Stale-while-revalidate: cached data renders instantly, these refresh in background.
            refreshStats();
            refreshStudents();
            refreshClasses();
            refreshTeachers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [schoolId]);

    return (
        <AdminContext.Provider value={{
            schoolId, setSchoolId,
            status, setStatus,
            role, allowedModules, setAuth, can,
            stats, students, classes, teachers,
            loadingStats, loadingStudents, loadingClasses,
            mobileNavOpen, setMobileNavOpen,
            refreshStats, refreshStudents, refreshClasses, refreshTeachers,
            getSections, invalidateAcademic,
            checkCurrentStatus,
            logout
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
