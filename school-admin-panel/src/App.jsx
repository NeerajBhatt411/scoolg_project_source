import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import ComingSoon from './components/ComingSoon';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('scoolg_token');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <div className="bg-background text-on-surface min-h-screen flex">
            <Sidebar />
            <main className="flex-1 ml-[280px] min-h-screen bg-surface-container-low">
                {children}
            </main>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<ChangePassword />} />

                {/* Dashboard & Profile Routes */}
                <Route
                    path="/dashboard"
                    element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
                />
                <Route
                    path="/profile"
                    element={<ProtectedRoute><Profile /></ProtectedRoute>}
                />
                <Route
                    path="/gallery"
                    element={<ProtectedRoute><div style={{ padding: '80px', textAlign: 'center' }}><h2>Gallery Coming Soon</h2></div></ProtectedRoute>}
                />
                <Route
                    path="/students"
                    element={<ProtectedRoute><Students /></ProtectedRoute>}
                />
                <Route
                    path="/teachers"
                    element={<ProtectedRoute><ComingSoon title="Teachers" subtitle="We are working on the teacher module." /></ProtectedRoute>}
                />
                <Route
                    path="/classes"
                    element={<ProtectedRoute><ComingSoon title="Classes" subtitle="We are working on the classes module." /></ProtectedRoute>}
                />
                <Route
                    path="/timetable"
                    element={<ProtectedRoute><ComingSoon title="Timetable" subtitle="We are working on the timetable module." /></ProtectedRoute>}
                />
                <Route
                    path="/attendance"
                    element={<ProtectedRoute><ComingSoon title="Attendance" subtitle="We are working on attendance insights." /></ProtectedRoute>}
                />
                <Route
                    path="/exams"
                    element={<ProtectedRoute><ComingSoon title="Exams" subtitle="We are working on the exams module." /></ProtectedRoute>}
                />
                <Route
                    path="/notices"
                    element={<ProtectedRoute><ComingSoon title="Notices" subtitle="We are working on notices and announcements." /></ProtectedRoute>}
                />
                <Route
                    path="/roles"
                    element={<ProtectedRoute><ComingSoon title="Roles" subtitle="We are working on roles & permissions." /></ProtectedRoute>}
                />
                <Route
                    path="/settings"
                    element={<ProtectedRoute><ComingSoon title="Settings" subtitle="We are working on settings." /></ProtectedRoute>}
                />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
