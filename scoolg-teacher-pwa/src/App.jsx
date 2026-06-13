import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import SplashScreen from './pages/SplashScreen';
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

// Full-screen loader while the saved session is being restored.
const BootLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background">
    <div className="animate-spin w-9 h-9 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

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
      <Route path="/" element={<SplashScreen />} />
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
