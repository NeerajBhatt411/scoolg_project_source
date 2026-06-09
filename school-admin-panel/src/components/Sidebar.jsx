import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdmin } from '../context/AdminContext';
import { ADMIN_API_BASE } from '../lib/api';


const Sidebar = ({ mobileOpen = false, onClose = () => { } }) => {
    const navigate = useNavigate();
    const { logout, can, schoolId } = useAdmin();
    const schoolName = localStorage.getItem('scoolg_school_name') || 'My School';
    const [logo, setLogo] = useState(localStorage.getItem('scoolg_school_logo') || '/logo.png');

    useEffect(() => {
        if (!schoolId) return;
        axios.get(`${ADMIN_API_BASE}/profile/${schoolId}`)
            .then((res) => {
                const l = res.data?.logo || res.data?.schoolLogo || '';
                if (l) { setLogo(l); localStorage.setItem('scoolg_school_logo', l); }
            })
            .catch(() => {});
    }, [schoolId]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const allNavItems = [
        { name: 'Dashboard', icon: 'dashboard', path: '/dashboard', module: 'dashboard' },
        { name: 'Students', icon: 'group', path: '/students', module: 'students' },
        { name: 'Teachers', icon: 'school', path: '/teachers', module: 'teachers' },
        { name: 'Teacher Diary', icon: 'menu_book', path: '/teacher-diary', module: 'teachers' },
        { name: 'Classes', icon: 'class', path: '/classes', module: 'classes' },
        { name: 'Timetable', icon: 'calendar_today', path: '/timetable', module: 'timetable' },
        { name: 'School Calendar', icon: 'calendar_month', path: '/calendar', module: 'calendar' },
        { name: 'Homework', icon: 'assignment', path: '/homework', module: 'homework' },
        { name: 'Attendance', icon: 'fact_check', path: '/attendance', module: 'attendance' },
        { name: 'Exams', icon: 'description', path: '/exams', module: 'exams' },
        { name: 'Notices', icon: 'campaign', path: '/notices', module: 'notices' },
        { name: 'Roles', icon: 'verified_user', path: '/roles', module: 'roles' },
    ];

    // Dashboard + Settings are always visible; other modules respect permissions.
    const navItems = allNavItems.filter(i => i.module === 'dashboard' || i.module === 'settings' || can(i.module));

    return (
        <aside className={`w-[280px] h-screen fixed left-0 top-0 overflow-y-auto bg-[#f7f9fb] border-r-[1.5px] border-[#e0e7ff] flex flex-col pt-3 pb-6 px-4 z-50 transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between gap-2">
                <button onClick={() => { navigate('/dashboard'); onClose(); }} title={schoolName} className="mb-3 px-2 flex items-center justify-start gap-3 flex-1 min-w-0">
                    {logo
                        ? <div className="h-16 w-16 shrink-0 flex items-center justify-center overflow-hidden"><img src={logo} alt="School logo" onError={() => setLogo('')} className="max-h-full max-w-full object-contain" /></div>
                        : <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-2xl font-black flex items-center justify-center shadow-sm shrink-0">{schoolName.charAt(0).toUpperCase()}</div>}
                    <p className="text-[15px] font-extrabold text-[#191c1e] leading-tight">Admin Panel</p>
                </button>
                <button onClick={onClose} className="md:hidden w-9 h-9 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-500 shrink-0 mb-3"><span className="material-symbols-outlined text-[20px]">close</span></button>
            </div>
            <div className="border-b border-slate-200/70 mb-4"></div>
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center justify-start gap-3 px-4 py-3 rounded-xl active:scale-95 transition-all duration-200 ${isActive
                                ? 'bg-[#eff6ff] text-[#2563eb] font-bold'
                                : 'text-[#64748b] font-medium hover:bg-[#f2f4f6]'}`
                        }
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="text-[0.875rem]">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-[#e0e7ff] space-y-1">
                <NavLink
                    to="/support"
                    onClick={onClose}
                    className={({ isActive }) =>
                        `w-full flex items-center justify-start gap-3 px-4 py-3 transition-all rounded-xl ${isActive
                            ? 'bg-[#eff6ff] text-[#2563eb] font-bold'
                            : 'text-[#64748b] font-medium hover:bg-[#f2f4f6]'}`
                    }
                >
                    <span className="material-symbols-outlined">help</span>
                    <span className="text-[0.875rem]">Support</span>
                </NavLink>
                <button
                    className="w-full flex items-center justify-start gap-3 px-4 py-3 text-error font-bold hover:bg-error-container/20 transition-colors rounded-xl mt-2"
                    onClick={handleLogout}
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-[0.875rem]">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
