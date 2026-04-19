import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import Teachers from './pages/Teachers';
import AddTeacher from './pages/AddTeacher';
import Timetable from './pages/Timetable';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Exams from './pages/Exams';
import Notices from './pages/Notices';
import ComingSoon from './components/ComingSoon';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import StudentProfile from './pages/StudentProfile';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('scoolg_token');
    const location = useLocation();
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <div className="bg-background text-on-surface min-h-screen flex">
            <Sidebar />
            <main className="w-full pl-16 md:pl-[280px] min-h-screen bg-surface-container-low overflow-x-hidden">
                {children}
            </main>


        </div>
    );
};

function App() {
    return (
        <Router basename="/admin">
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
                    path="/students/add"
                    element={<ProtectedRoute><AddStudent /></ProtectedRoute>}
                />
                <Route
                    path="/students/profile"
                    element={<ProtectedRoute><StudentProfile /></ProtectedRoute>}
                />
                <Route
                    path="/teachers"
                    element={<ProtectedRoute><Teachers /></ProtectedRoute>}
                />
                <Route
                    path="/teachers/add"
                    element={<ProtectedRoute><AddTeacher /></ProtectedRoute>}
                />
                <Route
                    path="/classes"
                    element={<ProtectedRoute><Classes /></ProtectedRoute>}
                />
                <Route
                    path="/timetable"
                    element={<ProtectedRoute><Timetable /></ProtectedRoute>}
                />
                <Route
                    path="/attendance"
                    element={<ProtectedRoute><Attendance /></ProtectedRoute>}
                />
                <Route
                    path="/exams"
                    element={<ProtectedRoute><Exams /></ProtectedRoute>}
                />
                <Route
                    path="/notices"
                    element={<ProtectedRoute><Notices /></ProtectedRoute>}
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
