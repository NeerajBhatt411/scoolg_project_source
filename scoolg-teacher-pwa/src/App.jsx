import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import MyClasses from './pages/MyClasses';
import ClassDetail from './pages/ClassDetail';
import Attendance from './pages/Attendance';
import Homework from './pages/Homework';
import Diary from './pages/Diary';
import Profile from './pages/Profile';
import Exams from './pages/Exams';
import Notices from './pages/Notices';
import Students from './pages/Students';
import Calendar from './pages/Calendar';
import Notifications from './pages/Notifications';
import InstallPrompt from './components/InstallPrompt';
import { useAuth } from './context/AuthContext';

// Cool, premium loading animation using the School's Logo
const BootLoader = () => {
    let logoUrl = null;
    try {
        const info = JSON.parse(localStorage.getItem('teacher_school_info'));
        if (info && info.logo) logoUrl = info.logo;
    } catch(e) {}

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center">
            {logoUrl ? (
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
                    <img src={logoUrl} alt="School Logo" className="relative h-20 sm:h-24 w-auto object-contain drop-shadow-md animate-pulse" />
                </div>
            ) : (
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-600/20 animate-pulse mb-8">
                    S
                </div>
            )}
            
            {/* Sleek bouncing dots animation */}
            <div className="flex gap-2 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce shadow-sm" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce shadow-sm" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce shadow-sm" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="mt-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Loading Workspace</p>
        </div>
    );
};

// Logged-out users go to /login; the saved token keeps teachers signed in.
const Protected = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <BootLoader />;
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Already signed in? Skip the login screen entirely.
const GuestOnly = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <BootLoader />;
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

const App = () => {
  return (
    <>
    <InstallPrompt />
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />

      <Route element={<Protected><MainLayout /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/classes" element={<MyClasses />} />
        <Route path="/classes/detail" element={<ClassDetail />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/homework" element={<Homework />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/students" element={<Students />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  );
};

export default App;
