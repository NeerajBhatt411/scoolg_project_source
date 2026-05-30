import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { user, school } = useAuth();
  const location = useLocation();


  const navItems = [
    { name: 'Home', path: '/dashboard', icon: 'dashboard' },
    { name: 'Timetable', path: '/timetable', icon: 'calendar_today' },
    { name: 'Attendance', path: '/attendance', icon: 'fact_check' },
    { name: 'Homework', path: '/homework', icon: 'menu_book' },
    { name: 'Results', path: '/results', icon: 'assessment' },
    { name: 'Fees', path: '/fees', icon: 'payments' },
    { name: 'Profile', path: '/profile', icon: 'account_circle' },
  ];

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex-col py-6 px-4 shadow-sm z-50">
        <div className="mb-10 px-4">
          <h1 className="text-display-lg font-display-lg font-bold text-primary">SchoolG</h1>
          <p className="text-label-md font-label-md text-secondary opacity-70">{school?.name || 'Premium Academy'}</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out active:scale-95 ${isActive
                  ? 'bg-secondary-container text-on-secondary-container font-bold'
                  : 'text-secondary hover:bg-surface-container-high'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-label-md font-label-md">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto px-4 pt-4 border-t border-outline-variant/30">
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-xl font-label-md transition-all duration-200 ease-in-out hover:opacity-90 active:scale-95">
            <span className="material-symbols-outlined text-[18px]">help_outline</span>
            Support
          </button>
        </div>
      </aside>

      {/* DESKTOP TOP BAR */}
      <header className="hidden lg:flex fixed top-0 left-0 w-full h-16 justify-between items-center pl-72 pr-8 bg-surface shadow-sm z-40">
        <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full w-96 transition-all duration-150 hover:opacity-80">
          <span className="material-symbols-outlined text-outline mr-2">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-body-md w-full placeholder-outline outline-none"
            placeholder="Search for results, attendance..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-opacity duration-150">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-opacity duration-150">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <div className="h-8 w-px bg-outline-variant mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-body-md font-bold text-on-surface leading-none">{user?.firstName} {user?.lastName}</p>
              <p className="text-label-md text-secondary leading-none mt-1">Grade {user?.class}-{user?.section}</p>
            </div>

            <img
              alt="User"
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-container"
              src={user?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName}`}
            />

          </div>
        </div>
      </header>

      {/* MOBILE HEADER */}
      <header className="lg:hidden flex justify-between items-center px-container-margin w-full h-16 bg-surface shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed">
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src={user?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName}`}
            />
          </div>

          <div>
            <h1 className="text-title-lg font-title-lg font-bold text-primary">SchoolG</h1>
            <p className="text-label-md font-label-md text-on-surface-variant">Grade {user?.class}-{user?.section}</p>
          </div>

        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors relative">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="lg:pl-64 lg:pt-16 min-h-screen">
        <main className="w-full">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-8 bg-surface-container-highest/90 backdrop-blur-md rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {[
          { name: 'Home', path: '/dashboard', icon: 'home' },
          { name: 'Schedule', path: '/timetable', icon: 'calendar_month' },
          { name: 'Tracking', path: '/attendance', icon: 'fact_check' },
          { name: 'Profile', path: '/profile', icon: 'person' },
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 rounded-xl ${isActive
                ? 'bg-primary-container text-on-primary-container scale-90'
                : 'text-on-surface-variant hover:bg-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined" style={location.pathname === item.path ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
            <span className="text-label-md font-label-md">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default MainLayout;
