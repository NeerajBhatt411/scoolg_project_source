import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import logo from '../assets/logo.png';


const Sidebar = () => {
    const navigate = useNavigate();
    const { logout, can } = useAdmin();

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
            <div className="mb-10 px-2 md:px-4 flex items-center justify-center md:justify-start gap-2">
                <img src={logo} alt="Scoolg" className="h-8 w-auto rounded-lg" />

                <div className="hidden md:block">
                    <h1 className="text-xl font-extrabold text-[#191c1e] flex items-center gap-2">SCOOLG</h1>
                    <p className="text-[11px] uppercase font-semibold text-on-surface-variant tracking-wider mt-1">School ERP</p>
                </div>
            </div>
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
