import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
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
                    element={<ProtectedRoute><div style={{ padding: '80px', textAlign: 'center' }}><h2>Teachers Module Coming Soon</h2></div></ProtectedRoute>}
                />
                <Route
                    path="/classes"
                    element={<ProtectedRoute><div style={{ padding: '80px', textAlign: 'center' }}><h2>Classes Module Coming Soon</h2></div></ProtectedRoute>}
                />
                <Route
                    path="/timetable"
                    element={<ProtectedRoute><div style={{ padding: '80px', textAlign: 'center' }}><h2>Timetable Module Coming Soon</h2></div></ProtectedRoute>}
                />
                <Route
                    path="/attendance"
                    element={<ProtectedRoute><div style={{ padding: '80px', textAlign: 'center' }}><h2>Attendance Module Coming Soon</h2></div></ProtectedRoute>}
                />
                <Route
                    path="/exams"
                    element={<ProtectedRoute><div style={{ padding: '80px', textAlign: 'center' }}><h2>Exams Module Coming Soon</h2></div></ProtectedRoute>}
                />
                <Route
                    path="/notices"
                    element={<ProtectedRoute><div style={{ padding: '80px', textAlign: 'center' }}><h2>Notices Module Coming Soon</h2></div></ProtectedRoute>}
                />
                <Route
                    path="/roles"
                    element={<ProtectedRoute><div style={{ padding: '80px', textAlign: 'center' }}><h2>Roles Module Coming Soon</h2></div></ProtectedRoute>}
                />
                <Route
                    path="/settings"
                    element={<ProtectedRoute><div style={{ padding: '80px', textAlign: 'center' }}><h2>Settings Coming Soon</h2></div></ProtectedRoute>}
                />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
