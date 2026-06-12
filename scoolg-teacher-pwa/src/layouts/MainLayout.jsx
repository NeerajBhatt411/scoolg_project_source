import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, CalendarDays, Users, ClipboardCheck, BookOpen, NotebookPen, User, LogOut, Bell, GraduationCap } from 'lucide-react';

const MainLayout = () => {
  const { teacher, school, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Timetable', path: '/timetable', icon: CalendarDays },
    { name: 'My Classes', path: '/classes', icon: Users },
    { name: 'Attendance', path: '/attendance', icon: ClipboardCheck },
    { name: 'Homework', path: '/homework', icon: BookOpen },
    { name: 'Diary', path: '/diary', icon: NotebookPen },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };
  const avatar = teacher?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${teacher?.fullName || 'T'}`;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 bg-card border-r border-border flex-col py-5 px-3 z-50">
        <div className="mb-4 px-2 pb-4 flex items-center gap-3 border-b border-border">
          <Avatar src={school?.logo} alt={school?.name} className="h-10 w-10 rounded-md">
            <GraduationCap className="h-5 w-5 text-primary" />
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight leading-tight truncate">{school?.name || 'My School'}</h1>
            <p className="text-xs text-muted-foreground">Teacher Portal</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className="block">
              {({ isActive }) => (
                <div className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${isActive
                  ? 'bg-primary/10 text-primary font-semibold rounded-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground rounded-md'}`}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-4">
          <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3 shadow-sm">
            <Avatar src={avatar} alt={teacher?.fullName || 'Teacher'} className="h-9 w-9">
              {(teacher?.fullName || 'T').charAt(0)}
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight truncate">{teacher?.fullName || 'Teacher'}</p>
              <p className="text-xs text-muted-foreground truncate">{teacher?.teacherAppId}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="shrink-0">
              <LogOut className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </aside>

      {/* DESKTOP TOP BAR */}
      <header className="hidden lg:flex fixed top-0 left-0 w-full h-16 justify-between items-center pl-72 pr-8 bg-card/80 backdrop-blur-md border-b border-border z-40">
        <div>
          <h2 className="text-sm font-semibold tracking-tight leading-tight">{greeting}, {teacher?.fullName?.split(' ')[0] || 'Teacher'}</h2>
          <p className="text-xs text-muted-foreground leading-none mt-0.5">{todayStr}</p>
        </div>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary"></span>
        </Button>
      </header>

      {/* MOBILE HEADER */}
      <header className="lg:hidden flex justify-between items-center px-4 w-full h-14 bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={school?.logo} alt={school?.name} className="h-9 w-9 rounded-md">
            <GraduationCap className="h-4 w-4 text-primary" />
          </Avatar>
          <div className="min-w-0">
            <h1 className="font-semibold text-sm leading-none truncate">{school?.name || 'My School'}</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">Teacher Portal</p>
          </div>
        </div>
        <button onClick={() => navigate('/profile')} className="shrink-0 active:scale-90 transition-transform">
          <Avatar src={avatar} alt="Profile" className="h-9 w-9">
            {(teacher?.fullName || 'T').charAt(0)}
          </Avatar>
        </button>
      </header>

      {/* MAIN CONTENT */}
      <div className="lg:pl-64 lg:pt-16 min-h-screen">
        <main className="w-full">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border">
        <div className="flex items-stretch px-2 pt-1.5 pb-4">
          {[
            { name: 'Home', path: '/dashboard', icon: Home },
            { name: 'Attendance', path: '/attendance', icon: ClipboardCheck },
            { name: 'Diary', path: '/diary', icon: NotebookPen },
            { name: 'Homework', path: '/homework', icon: BookOpen },
            { name: 'Profile', path: '/profile', icon: User },
          ].map((item) => (
            <NavLink key={item.path} to={item.path} className="flex-1">
              {({ isActive }) => (
                <div className="flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform">
                  <div className={`flex items-center justify-center h-8 w-12 rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{item.name}</span>
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
