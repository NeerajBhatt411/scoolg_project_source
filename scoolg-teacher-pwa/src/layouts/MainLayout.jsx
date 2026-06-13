import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  const { teacher, school, logout, mobileNavOpen, setMobileNavOpen } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const avatar = teacher?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${teacher?.fullName || 'T'}`;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* MOBILE OVERLAY */}
      {mobileNavOpen && (
        <div 
          onClick={() => setMobileNavOpen(false)} 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
        ></div>
      )}

      {/* SIDEBAR */}
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* MAIN CONTENT */}
      <div className="w-full lg:pl-[280px] min-h-screen">
        <main className="w-full">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border pb-safe">
        <div className="flex items-center justify-around px-2 pt-2 pb-2">
          {[
            { name: 'Home', path: '/dashboard', icon: 'dashboard' },
            { name: 'Classes', path: '/classes', icon: 'class' },
            { name: 'Attendance', path: '/attendance', icon: 'fact_check' },
            { name: 'Homework', path: '/homework', icon: 'assignment' },
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
