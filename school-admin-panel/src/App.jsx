import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { AdminProvider } from './context/AdminContext';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const AddStudent = lazy(() => import('./pages/AddStudent'));
const Teachers = lazy(() => import('./pages/Teachers'));
const AddTeacher = lazy(() => import('./pages/AddTeacher'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Classes = lazy(() => import('./pages/Classes'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Exams = lazy(() => import('./pages/Exams'));
const Notices = lazy(() => import('./pages/Notices'));
const ComingSoon = lazy(() => import('./components/ComingSoon'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));

// Loading Fallback
const PageLoading = () => (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
);

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
        <AdminProvider>
            <Router basename="/admin">
                <Suspense fallback={<PageLoading />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/change-password" element={<ChangePassword />} />

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
                            element={<ProtectedRoute><ProtectedRoute><Timetable /></ProtectedRoute></ProtectedRoute>}
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

                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Suspense>
            </Router>
        </AdminProvider>
    );
}

export default App;
