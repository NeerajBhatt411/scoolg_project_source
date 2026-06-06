import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdmin } from '../context/AdminContext';
import { ADMIN_API_BASE } from '../lib/api';


const Sidebar = () => {
    const navigate = useNavigate();
    const { logout, can, schoolId } = useAdmin();
    const schoolName = localStorage.getItem('scoolg_school_name') || 'My School';
    const [logo, setLogo] = useState(localStorage.getItem('scoolg_school_logo') || '');

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
        { name: 'Classes', icon: 'class', path: '/classes', module: 'classes' },
        { name: 'Timetable', icon: 'calendar_today', path: '/timetable', module: 'timetable' },
        { name: 'School Calendar', icon: 'calendar_month', path: '/calendar', module: 'calendar' },
        { name: 'Homework', icon: 'assignment', path: '/homework', module: 'homework' },
        { name: 'Attendance', icon: 'fact_check', path: '/attendance', module: 'attendance' },
        { name: 'Exams', icon: 'description', path: '/exams', module: 'exams' },
        { name: 'Notices', icon: 'campaign', path: '/notices', module: 'notices' },
        { name: 'Roles', icon: 'verified_user', path: '/roles', module: 'roles' },
        { name: 'Settings', icon: 'settings', path: '/settings', module: 'settings' },
    ];

    // Dashboard + Settings are always visible; other modules respect permissions.
    const navItems = allNavItems.filter(i => i.module === 'dashboard' || i.module === 'settings' || can(i.module));

    return (
        <aside className="w-16 md:w-[280px] h-screen fixed left-0 overflow-y-auto bg-[#f7f9fb] border-r-[1.5px] border-[#e0e7ff] flex flex-col py-6 px-2 md:px-4 z-50">
            <button onClick={() => navigate('/dashboard')} title={schoolName} className="mb-10 px-2 md:px-4 flex items-center justify-center md:justify-start gap-2.5 w-full">
                {logo
                    ? <img src={logo} alt="School logo" onError={() => setLogo('')} className="h-16 w-16 rounded-xl object-contain bg-white border border-slate-200 shadow-sm shrink-0 p-0.5" />
                    : <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-2xl font-black flex items-center justify-center shadow-sm shrink-0">{schoolName.charAt(0).toUpperCase()}</div>}
                <div className="hidden md:block">
                    <p className="text-[15px] font-extrabold text-[#191c1e] leading-tight">Admin Panel</p>
                </div>
            </button>
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-3 rounded-xl scale-98 active:scale-95 transition-all duration-200 ${isActive
                                ? 'bg-[#eff6ff] text-[#2563eb] font-bold'
                                : 'text-[#64748b] font-medium hover:bg-[#f2f4f6]'}`
                        }
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="text-[0.875rem] hidden md:inline">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-[#e0e7ff] space-y-1">
                <NavLink
                    to="/support"
                    className={({ isActive }) =>
                        `w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-3 transition-all rounded-xl ${isActive
                            ? 'bg-[#eff6ff] text-[#2563eb] font-bold'
                            : 'text-[#64748b] font-medium hover:bg-[#f2f4f6]'}`
                    }
                >
                    <span className="material-symbols-outlined">help</span>
                    <span className="text-[0.875rem] hidden md:inline">Support</span>
                </NavLink>
                <button
                    className="w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-3 text-error font-bold hover:bg-error-container/20 transition-colors rounded-xl mt-2"
                    onClick={handleLogout}
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-[0.875rem] hidden md:inline">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
