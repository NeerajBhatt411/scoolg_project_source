import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { clearToken } from '../lib/api';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearToken();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
        { name: 'Schools', icon: 'account_balance', path: '/schools' },
        { name: 'Approvals', icon: 'verified', path: '/approvals' },
        { name: 'Notices', icon: 'campaign', path: '/notices' },
        { name: 'Support Tickets', icon: 'support_agent', path: '/support' },
        { name: 'Settings', icon: 'settings', path: '/settings' },
    ];

    return (
        <aside className="w-16 md:w-[280px] h-screen fixed left-0 overflow-y-auto bg-[#f7f9fb] border-r-[1.5px] border-[#e0e7ff] flex flex-col py-6 px-2 md:px-4 z-50">
            <div className="mb-10 px-2 md:px-4 flex items-center justify-center md:justify-start gap-2">
                <img src={logo} alt="Scoolg" className="h-8 w-auto rounded-lg" />
                <div className="hidden md:block">
                    <h1 className="text-xl font-extrabold text-[#191c1e] flex items-center gap-2">SCOOLG</h1>
                    <p className="text-[11px] uppercase font-semibold text-on-surface-variant tracking-wider mt-1">Super Admin</p>
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
                <button
                    className="w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-3 text-error font-bold hover:bg-error-container/20 transition-colors rounded-xl mt-2 text-red-500"
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
