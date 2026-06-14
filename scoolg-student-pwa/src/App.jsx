import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Homework from './pages/Homework';
import Attendance from './pages/Attendance';
import Results from './pages/Results';
import Fees from './pages/Fees';
import Profile from './pages/Profile';
import Notices from './pages/Notices';
import Calendar from './pages/Calendar';
import Exams from './pages/Exams';
import Subjects from './pages/Subjects';
import Notifications from './pages/Notifications';
import { useAuth } from './context/AuthContext';

const BootLoader = () => {
  let schoolLogo = null;
  let schoolName = 'S';
  try {
    const schoolInfo = JSON.parse(localStorage.getItem('school_info'));
    if (schoolInfo) {
      schoolLogo = schoolInfo.logo || schoolInfo.formData?.logo;
      const name = schoolInfo.name || schoolInfo.formData?.schoolName;
      if (name && !schoolLogo) schoolName = name.charAt(0).toUpperCase();
    }
  } catch (e) {
    // ignore
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-xl shadow-blue-600/10 mb-8 overflow-hidden relative">
        {schoolLogo ? (
          <img src={schoolLogo} alt="School Logo" className="w-full h-full object-contain p-2 animate-pulse" />
        ) : (
          <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-3xl font-black animate-pulse">
            {schoolName}
          </div>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce shadow-sm" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce shadow-sm" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce shadow-sm" style={{ animationDelay: '300ms' }}></div>
      </div>
      <p className="mt-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Loading Workspace</p>
    </div>
  );
};

const Protected = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <BootLoader />;
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const GuestOnly = ({ children }) => {
  const { token, loading } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const addAccount = searchParams.get('addAccount');

  if (loading) return <BootLoader />;
  if (token && !addAccount) return <Navigate to="/dashboard" replace />;
  return children;
};

const App = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />


      <Route element={<Protected><MainLayout /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/homework" element={<Homework />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/results" element={<Results />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  );
};

export default App;
