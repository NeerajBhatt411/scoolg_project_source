import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mobileOpen = false, onClose = () => { } }) => {
    const navigate = useNavigate();
    const { user, school, logout } = useAuth();
    const [logoReady, setLogoReady] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
        { name: 'Timetable', icon: 'calendar_today', path: '/timetable' },
        { name: 'Homework', icon: 'assignment', path: '/homework' },
        { name: 'Attendance', icon: 'fact_check', path: '/attendance' },
        { name: 'Calendar', icon: 'calendar_month', path: '/calendar' },
        { name: 'Exams', icon: 'description', path: '/exams' },
        { name: 'Results', icon: 'assessment', path: '/results' },
        { name: 'Subjects', icon: 'import_contacts', path: '/subjects' },
        { name: 'Notices', icon: 'campaign', path: '/notices' },
        { name: 'Fees', icon: 'payments', path: '/fees' },
    ];

    const schoolLogo = school?.logo || null;
    const schoolName = school?.name || 'ScoolG';

    return (
        <aside className={`w-[280px] h-screen fixed left-0 top-0 overflow-y-auto bg-[#f7f9fb] border-r-[1.5px] border-[#e0e7ff] flex flex-col pt-3 pb-6 px-4 z-50 transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between gap-2">
                <div className="mb-3 px-2 flex items-center justify-start gap-3 flex-1 min-w-0">
                    <div className="h-12 shrink-0 relative flex items-center justify-center">
                        {schoolLogo ? (
                            <>
                                {!logoReady && <span className="absolute inset-0 animate-pulse bg-slate-200 rounded-lg w-12"></span>}
                                <img
                                    src={schoolLogo}
                                    alt="School logo"
                                    onLoad={() => setLogoReady(true)}
                                    onError={() => setLogoReady(false)}
                                    className={`max-h-full max-w-[140px] object-contain transition-opacity duration-300 ${logoReady ? 'opacity-100' : 'opacity-0'}`}
                                />
                            </>
                        ) : (
                            <span className="text-3xl font-black text-blue-600">
                                {schoolName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col text-left">
                        <p className="text-[15px] font-extrabold text-[#191c1e] leading-tight line-clamp-1 capitalize">{user?.firstName || 'Student'}</p>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Class {user?.class} - {user?.section}</p>
                    </div>
                </div>
                <button onClick={onClose} className="lg:hidden w-9 h-9 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-500 shrink-0 mb-3 hover:bg-slate-50 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
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
                <button onClick={handleLogout} className="w-full flex items-center justify-start gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 transition-colors rounded-xl active:scale-95">
                    <span className="material-symbols-outlined text-[22px]">logout</span>
                    <span className="text-[0.9rem]">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
