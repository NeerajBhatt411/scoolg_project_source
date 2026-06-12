import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { teacher, school, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: 'dashboard' },
    { name: 'Timetable', path: '/timetable', icon: 'calendar_today' },
    { name: 'My Classes', path: '/classes', icon: 'groups' },
    { name: 'Attendance', path: '/attendance', icon: 'fact_check' },
    { name: 'Homework', path: '/homework', icon: 'assignment' },
    { name: 'Diary', path: '/diary', icon: 'menu_book' },
    { name: 'Profile', path: '/profile', icon: 'account_circle' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };
  const avatar = teacher?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${teacher?.fullName || 'T'}`;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 bg-[#f7f9fb] border-r border-slate-200/70 flex-col py-6 px-4 z-50">
        <div className="mb-6 px-2 pb-5 flex items-center gap-3 border-b border-slate-200/70">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
            {school?.logo
              ? <img src={school.logo} alt={school?.name} className="w-full h-full object-cover" />
              : <span className="material-symbols-outlined text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-tight truncate">{school?.name || 'My School'}</h1>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Teacher Portal</p>
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Menu</p>
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className="block">
              {({ isActive }) => (
                <div className={`relative flex items-center gap-3 px-4 py-3 transition-all duration-200 active:scale-[0.98] ${isActive
                  ? 'bg-[#eff6ff] text-[#2563eb] font-bold rounded-xl'
                  : 'text-[#64748b] font-medium hover:bg-[#f2f4f6] rounded-xl'}`}>
                  <span className="material-symbols-outlined text-[22px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                  <span className="text-sm tracking-tight">{item.name}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-4 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-[20px] bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <img src={avatar} alt="" className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-100" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-900 tracking-tight leading-tight truncate">{teacher?.fullName || 'Teacher'}</p>
              <p className="text-[11px] font-bold text-slate-400">{teacher?.teacherAppId}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-all active:scale-90 shrink-0">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* DESKTOP TOP BAR */}
      <header className="hidden lg:flex fixed top-0 left-0 w-full h-16 justify-between items-center pl-72 pr-8 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">{greeting}, {teacher?.fullName?.split(' ')[0] || 'Teacher'} 👋</h2>
          <p className="text-[11px] font-bold text-slate-400 leading-none">{todayStr}</p>
        </div>
        <button className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 transition-colors relative">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
        </button>
      </header>

      {/* MOBILE HEADER */}
      <header className="lg:hidden flex justify-between items-center px-container-margin w-full h-16 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
            {school?.logo
              ? <img alt={school?.name} className="w-full h-full object-cover" src={school.logo} />
              : <span className="material-symbols-outlined text-blue-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none truncate">{school?.name || 'My School'}</h1>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-0.5">Teacher Portal</p>
          </div>
        </div>
        <button onClick={() => navigate('/profile')} className="shrink-0 active:scale-90 transition-transform">
          <img src={avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" />
        </button>
      </header>

      {/* MAIN CONTENT */}
      <div className="lg:pl-64 lg:pt-16 min-h-screen">
        <main className="w-full">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAV — floating pill, active tab expands with label */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-100 shadow-[0_-8px_26px_-14px_rgba(15,23,42,0.15)]">
        <div className="flex items-stretch px-2 pt-2 pb-5">
          {[
            { name: 'Home', path: '/dashboard', icon: 'home' },
            { name: 'Attendance', path: '/attendance', icon: 'fact_check' },
            { name: 'Diary', path: '/diary', icon: 'menu_book' },
            { name: 'Homework', path: '/homework', icon: 'assignment' },
            { name: 'Profile', path: '/profile', icon: 'person' },
          ].map((item) => (
            <NavLink key={item.path} to={item.path} className="flex-1">
              {({ isActive }) => (
                <div className="flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform">
                  <div className={`flex items-center justify-center h-9 w-16 rounded-full transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[24px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                  </div>
                  <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{item.name}</span>
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
