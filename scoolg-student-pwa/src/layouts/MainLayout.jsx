import React, { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';

const MainLayout = () => {
  const { mobileNavOpen, setMobileNavOpen } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const getPageTitle = (path) => {
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('timetable')) return 'Schedule';
    if (path.includes('attendance')) return 'Tracking';
    if (path.includes('homework')) return 'Homework';
    if (path.includes('chat')) return 'Chat';
    if (path.includes('results')) return 'Results';
    if (path.includes('subjects')) return 'Subjects';
    if (path.includes('exams')) return 'Exams';
    if (path.includes('calendar')) return 'Calendar';
    if (path.includes('fees')) return 'Fees & Dues';
    if (path.includes('notices')) return 'Notices';
    if (path.includes('profile')) return 'My Profile';
    if (path.includes('notifications')) return 'Notifications';
    return 'ScoolG';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* MOBILE OVERLAY */}
      {mobileNavOpen && (
        <div 
          onClick={() => setMobileNavOpen(false)} 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
        ></div>
      )}

      {/* SIDEBAR (Responsive, handles both Desktop and Mobile) */}
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* MAIN CONTENT AREA */}
      <div className="w-full lg:pl-[280px] min-h-screen flex flex-col pb-20 lg:pb-0">
        
        {/* TOP HEADER (Consistent across Desktop & Mobile) */}
        <TopHeader title={getPageTitle(location.pathname)} showSearch={false} />

        <main className="w-full flex-1">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAV (Teacher PWA Style) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 pb-safe">
        <div className="flex items-center justify-around px-2 pt-2 pb-2">
          {[
            { name: 'Home', path: '/dashboard', icon: 'dashboard' },
            { name: 'Timetable', path: '/timetable', icon: 'calendar_today' },
            { name: 'Chat', path: '/chat', icon: 'chat' },
            { name: 'Attendance', path: '/attendance', icon: 'fact_check' },
          ].map((item) => (
            <NavLink key={item.path} to={item.path} className="flex-1 flex justify-center">
              {({ isActive }) => (
                <div className="flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
                  <div className={`flex items-center justify-center h-8 w-14 rounded-full transition-colors ${isActive ? 'bg-blue-100/80 text-blue-600' : 'text-slate-500'}`}>
                    <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                  </div>
                  <span className={`text-[10px] font-semibold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{item.name}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
