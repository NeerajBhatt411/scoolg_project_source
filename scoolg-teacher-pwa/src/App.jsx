import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import SplashScreen from './pages/SplashScreen';
import Onboarding from './pages/Onboarding';
import CampusCode from './pages/CampusCode';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import MyClasses from './pages/MyClasses';
import Attendance from './pages/Attendance';
import Homework from './pages/Homework';
import Diary from './pages/Diary';
import Profile from './pages/Profile';
import InstallPrompt from './components/InstallPrompt';

const App = () => {
  return (
    <>
    <InstallPrompt />
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/onboarding/:step" element={<Onboarding />} />
      <Route path="/campus-code" element={<CampusCode />} />
      <Route path="/login" element={<Login />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/classes" element={<MyClasses />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/homework" element={<Homework />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  );
};

export default App;
