import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon, Avatar, Logo } from '@/components/designkit';

const NAV = [
  { name: 'Dashboard', path: '/dashboard', icon: 'layout-dashboard' },
  { name: 'Timetable', path: '/timetable', icon: 'calendar-days' },
  { name: 'My Classes', path: '/classes', icon: 'users' },
  { name: 'Attendance', path: '/attendance', icon: 'clipboard-check' },
  { name: 'Homework', path: '/homework', icon: 'book-open' },
  { name: 'Diary', path: '/diary', icon: 'notebook-pen' },
];

const BOTTOM_NAV = [
  { name: 'Home', path: '/dashboard', icon: 'layout-dashboard' },
  { name: 'Schedule', path: '/timetable', icon: 'calendar-days' },
  { name: 'Attendance', path: '/attendance', icon: 'clipboard-check' },
  { name: 'Homework', path: '/homework', icon: 'book-open' },
  { name: 'Profile', path: '/profile', icon: 'user' },
];

const MainLayout = () => {
  const { teacher, school, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-[236px] bg-white border-r border-line flex-col px-3.5 py-5">
        <div className="flex items-center gap-2.5 px-2 mb-7">
          <Logo size={38} src={school?.logo} />
          <div className="min-w-0 leading-tight">
            <p className="font-700 text-ink text-[15px] tracking-[-0.01em] truncate">{school?.name || 'My School'}</p>
            <p className="text-[10.5px] font-600 text-ink-faint">Teacher Portal</p>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((n) => (
            <NavLink key={n.path} to={n.path}>
              {({ isActive }) => (
                <span className={`group relative flex items-center gap-3 h-10 px-3 rounded-lg text-[13.5px] font-600 transition-colors ${isActive ? 'text-blue-700 bg-blue-50' : 'text-ink-soft hover:bg-line-soft hover:text-ink'}`}>
                  <Icon name={n.icon} size={19} strokeWidth={isActive ? 2.1 : 1.85} />
                  {n.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 pt-4 border-t border-line flex flex-col gap-0.5">
          <NavLink to="/profile">
            {({ isActive }) => (
              <span className={`flex items-center gap-3 h-10 px-3 rounded-lg text-[13.5px] font-600 transition-colors ${isActive ? 'text-blue-700 bg-blue-50' : 'text-ink-soft hover:bg-line-soft hover:text-ink'}`}>
                <Icon name="user" size={19} strokeWidth={isActive ? 2.1 : 1.85} />
                Profile
              </span>
            )}
          </NavLink>
        </div>
        <div className="mt-auto pt-4">
          <div className="w-full flex items-center gap-1 rounded-xl hover:bg-line-soft transition-colors">
            <button onClick={() => navigate('/profile')} className="min-w-0 flex-1 flex items-center gap-2.5 p-2 text-left">
              <Avatar src={teacher?.profileImageUrl} name={teacher?.fullName} size={36} className="rounded-full" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-700 text-ink truncate leading-tight">{teacher?.fullName || 'Teacher'}</p>
                <p className="text-[11px] text-ink-faint tnum truncate">{teacher?.teacherAppId}</p>
              </div>
              <Icon name="chevron-right" size={16} className="text-ink-faint" />
            </button>
            <button onClick={handleLogout} title="Logout" className="shrink-0 w-8 h-8 mr-1.5 rounded-lg grid place-items-center text-ink-faint hover:text-red-600 hover:bg-white transition-colors">
              <Icon name="log-out" size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[236px] min-h-screen flex flex-col">
        {/* DESKTOP TOP BAR */}
        <header className="hidden lg:flex h-16 shrink-0 px-6 items-center justify-between border-b border-line bg-white sticky top-0 z-20">
          <div className="leading-tight">
            <h2 className="font-700 text-ink text-[15px] tracking-[-0.01em]">{greeting}, {teacher?.fullName?.split(' ')[0] || 'Teacher'}</h2>
            <p className="text-[12px] text-ink-faint leading-none mt-0.5">{todayStr}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="relative w-9 h-9 rounded-[10px] border border-line bg-white grid place-items-center text-ink-soft hover:text-ink transition-colors">
              <Icon name="bell" size={18} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-blue-600 ring-2 ring-white"></span>
            </button>
            <div className="w-px h-6 bg-line mx-1"></div>
            <Avatar src={teacher?.profileImageUrl} name={teacher?.fullName} size={34} className="rounded-full" />
          </div>
        </header>

        {/* MOBILE HEADER */}
        <header className="lg:hidden h-[56px] shrink-0 px-4 flex items-center justify-between bg-white border-b border-line sticky top-0 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo size={32} src={school?.logo} />
            <div className="min-w-0 leading-tight">
              <p className="font-700 text-ink text-[14.5px] truncate">{school?.name || 'My School'}</p>
              <p className="text-[10px] font-600 text-ink-faint">Teacher Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-9 h-9 rounded-[10px] border border-line grid place-items-center text-ink-soft">
              <Icon name="bell" size={18} />
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-blue-600 ring-2 ring-white"></span>
            </button>
            <button onClick={() => navigate('/profile')} className="shrink-0 active:scale-90 transition-transform">
              <Avatar src={teacher?.profileImageUrl} name={teacher?.fullName} size={34} className="rounded-full" />
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="w-full flex-1">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-line px-2 pt-2 pb-3 flex items-stretch">
        {BOTTOM_NAV.map((it) => (
          <NavLink key={it.path} to={it.path} className="flex-1">
            {({ isActive }) => (
              <span className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                <span className={`grid place-items-center h-7 w-[50px] rounded-lg transition-colors ${isActive ? 'bg-blue-50' : ''}`}>
                  <Icon name={it.icon} size={21} strokeWidth={isActive ? 2.1 : 1.85} className={isActive ? 'text-blue-700' : 'text-ink-faint'} />
                </span>
                <span className={`text-[10.5px] font-600 ${isActive ? 'text-blue-700' : 'text-ink-faint'}`}>{it.name}</span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default MainLayout;
