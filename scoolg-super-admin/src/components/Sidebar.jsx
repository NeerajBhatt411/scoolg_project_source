import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { clearToken } from '../lib/api';

const NAV = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Schools', icon: 'business', path: '/schools' },
    { name: 'Approvals', icon: 'how_to_reg', path: '/approvals' },
    { name: 'Notices', icon: 'campaign', path: '/notices' },
    { name: 'Support', icon: 'help', path: '/support' },
    { name: 'Settings', icon: 'settings', path: '/settings' },
];

const Sidebar = ({ mobileOpen = false, onClose = () => {} }) => {
    const navigate = useNavigate();
    const handleLogout = () => { clearToken(); onClose(); navigate('/login'); };

    return (
        <aside className={`w-[280px] h-screen fixed left-0 top-0 overflow-y-auto bg-[#0f172a] border-r border-white/5 flex flex-col pt-3 pb-6 px-4 z-50 transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between gap-2">
                <div className="mb-3 px-2 flex items-center justify-start gap-3 flex-1 min-w-0">
                    <div className="h-14 w-14 shrink-0 flex items-center justify-center overflow-hidden rounded-2xl bg-white/10 p-1.5">
                        <img src={logo} alt="Scoolg" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[15px] font-extrabold text-white leading-tight">Super Admin</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">Scoolg</p>
                    </div>
                </div>
                <button onClick={onClose} className="md:hidden w-9 h-9 rounded-xl bg-white/10 grid place-items-center text-slate-300 shrink-0 mb-3">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>
            <div className="border-b border-white/10 mb-4"></div>
            <nav className="flex-1 space-y-1">
                {NAV.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center justify-start gap-3 px-4 py-3 rounded-xl active:scale-95 transition-all duration-200 ${isActive
                                ? 'bg-primary text-white font-bold shadow-sm'
                                : 'text-slate-400 font-medium hover:bg-white/5 hover:text-white'}`
                        }
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="text-[0.875rem]">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-white/10">
                <button
                    className="w-full flex items-center justify-start gap-3 px-4 py-3 text-red-400 font-bold hover:bg-red-500/10 hover:text-red-300 transition-colors rounded-xl"
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
