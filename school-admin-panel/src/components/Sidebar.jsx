import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  ClipboardCheck, 
  FileText, 
  Megaphone, 
  ShieldCheck, 
  Settings, 
  LogOut,
  HelpCircle
} from 'lucide-react';
import logo from '../assets/logo.png';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('scoolg_token');
        localStorage.removeItem('scoolg_school_id');
        localStorage.removeItem('scoolg_school_name');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Students', icon: Users, path: '/students' },
        { name: 'Teachers', icon: GraduationCap, path: '/teachers' },
        { name: 'Classes', icon: BookOpen, path: '/classes' },
        { name: 'Timetable', icon: Calendar, path: '/timetable' },
        { name: 'Attendance', icon: ClipboardCheck, path: '/attendance' },
        { name: 'Exams', icon: FileText, path: '/exams' },
        { name: 'Notices', icon: Megaphone, path: '/notices' },
        { name: 'Roles', icon: ShieldCheck, path: '/roles' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <aside className="w-16 md:w-[280px] h-screen fixed left-0 flex flex-col bg-white border-r border-slate-200/60 z-50 transition-all duration-300">
            {/* Brand Logo Area */}
            <div className="h-[72px] flex items-center px-4 md:px-7 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50 shadow-sm">
                        <img src={logo} alt="Scoolg" className="h-6 w-auto object-contain" />
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">SCOOLG</h1>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Admin Elite</p>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar pb-6">
                <div className="px-4 mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] hidden md:block">Main Menu</p>
                </div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `group flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`
                        }
                    >
                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0 transition-transform group-hover:scale-110" />
                        <span className={`text-[14px] font-bold hidden md:inline transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-600 group-hover:text-slate-800'}`}>
                            {item.name}
                        </span>
                        {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 hidden md:block" />
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto px-3 py-6 border-t border-slate-100 space-y-1">
                <button className="group w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 text-slate-500 font-bold hover:bg-slate-50 transition-all rounded-xl">
                    <HelpCircle size={20} className="shrink-0 group-hover:rotate-12 transition-transform" />
                    <span className="text-[14px] hidden md:inline">Support</span>
                </button>
                <button
                    className="group w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 text-rose-500 font-bold hover:bg-rose-50 transition-all rounded-xl"
                    onClick={handleLogout}
                >
                    <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[14px] hidden md:inline">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
