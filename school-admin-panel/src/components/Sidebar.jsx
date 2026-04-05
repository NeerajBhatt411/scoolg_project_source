import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('scoolg_token');
        localStorage.removeItem('scoolg_school_id');
        localStorage.removeItem('scoolg_school_name');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
        { name: 'Students', icon: 'group', path: '/students' },
        { name: 'Teachers', icon: 'school', path: '/teachers' },
        { name: 'Classes', icon: 'class', path: '/classes' },
        { name: 'Timetable', icon: 'calendar_today', path: '/timetable' },
        { name: 'Attendance', icon: 'fact_check', path: '/attendance' },
        { name: 'Exams', icon: 'description', path: '/exams' },
        { name: 'Notices', icon: 'campaign', path: '/notices' },
        { name: 'Roles', icon: 'verified_user', path: '/roles' },
        { name: 'Settings', icon: 'settings', path: '/settings' },
    ];

    return (
        <aside className="w-[280px] h-screen fixed left-0 overflow-y-auto bg-[#f7f9fb] border-r-[1.5px] border-[#e0e7ff] flex flex-col py-6 px-4 z-50">
            <div className="mb-10 px-4">
                <h1 className="text-xl font-extrabold text-[#191c1e] flex items-center gap-2">
                    <img src="/logo.png" alt="Scoolg" className="h-8 w-auto rounded-lg" />
                    SCOOLG
                </h1>

                <p className="text-[11px] uppercase font-semibold text-on-surface-variant tracking-wider mt-1">School ERP</p>
            </div>
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl scale-98 active:scale-95 transition-all duration-200 ${isActive
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
                <button className="w-full flex items-center gap-3 px-4 py-3 text-[#64748b] font-medium hover:bg-[#f2f4f6] transition-colors rounded-xl">
                    <span className="material-symbols-outlined">help</span>
                    <span className="text-[0.875rem]">Support</span>
                </button>
                <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-error font-bold hover:bg-error-container/20 transition-colors rounded-xl mt-2"
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
