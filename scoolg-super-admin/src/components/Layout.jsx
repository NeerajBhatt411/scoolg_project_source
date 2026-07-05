import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

// Same shell as the school-admin-panel: fixed 280px sidebar + a main column that
// clears it with `md:pl-[280px]` (padding, so it can never overflow). On phones
// the sidebar is a slide-in drawer opened from the mobile top bar.
const Layout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    return (
        <div className="bg-background text-on-surface min-h-screen flex">
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            {mobileOpen && (
                <div onClick={() => setMobileOpen(false)} className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"></div>
            )}

            <main className="w-full pl-0 md:pl-[280px] min-h-screen bg-surface-container-low overflow-x-hidden">
                {/* mobile top bar */}
                <div className="md:hidden sticky top-0 z-30 h-14 bg-surface-container-lowest border-b border-outline-variant/40 flex items-center px-4 gap-3">
                    <button onClick={() => setMobileOpen(true)} className="w-9 h-9 grid place-items-center rounded-xl hover:bg-surface-container text-on-surface">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <span className="font-extrabold text-on-surface">Super Admin</span>
                </div>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
