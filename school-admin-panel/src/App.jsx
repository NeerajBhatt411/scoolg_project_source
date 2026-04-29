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
    const status = localStorage.getItem('scoolg_school_status');
    const location = useLocation();
    
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (status === 'INACTIVE') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50/50 flex-col">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-red-100">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl">block</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Admin Panel Frozen</h2>
                    <p className="text-slate-600 mb-8 font-medium leading-relaxed">Your school account has been suspended by the platform administrator. Please reach out to <span className="font-bold text-slate-800">scoolg.com</span> to reactivate your access.</p>
                    <div className="space-y-3">
                        <a href="mailto:support@scoolg.com" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl transition-all inline-block shadow-lg shadow-slate-200">
                            Contact Scoolg Support
                        </a>
                        <button 
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }}
                            className="w-full text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest pt-2"
                        >
                            Sign out of session
                        </button>
                    </div>
                </div>
            </div>
        );
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
