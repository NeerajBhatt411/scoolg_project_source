import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { ToastProvider } from './context/ToastContext';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const AddStudent = lazy(() => import('./pages/AddStudent'));
const Teachers = lazy(() => import('./pages/Teachers'));
const AddTeacher = lazy(() => import('./pages/AddTeacher'));
const TeacherProfile = lazy(() => import('./pages/TeacherProfile'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Homework = lazy(() => import('./pages/Homework'));
const Roles = lazy(() => import('./pages/Roles'));
const Classes = lazy(() => import('./pages/Classes'));
const ClassDetail = lazy(() => import('./pages/ClassDetail'));
const Attendance = lazy(() => import('./pages/Attendance'));
const AttendanceAnalytics = lazy(() => import('./pages/AttendanceAnalytics'));
const Exams = lazy(() => import('./pages/Exams'));
const Notices = lazy(() => import('./pages/Notices'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const Support = lazy(() => import('./pages/Support'));
const Notifications = lazy(() => import('./pages/Notifications'));
const TeacherDiary = lazy(() => import('./pages/TeacherDiary'));

// Loading Fallback
const PageLoading = () => (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
);

const ProtectedRoute = ({ children }) => {
    const { schoolId, status, checkCurrentStatus, mobileNavOpen, setMobileNavOpen } = useAdmin();
    const token = localStorage.getItem('scoolg_token');
    const location = useLocation();

    // Close the mobile nav drawer whenever the route changes.
    useEffect(() => { setMobileNavOpen(false); }, [location.pathname]);

    // Sync status on navigation, but throttled (context limits to once / 60s)
    // so moving between pages doesn't fire an API call on every click.
    useEffect(() => {
        if (schoolId) {
            checkCurrentStatus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname, schoolId]);

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (status === 'INACTIVE' || status === 'SUSPENDED') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white flex-col z-[999] fixed inset-0">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md text-center border border-red-100 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">ac_unit</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Admin Panel Frozen</h2>
                    <p className="text-slate-500 mb-8 font-medium leading-relaxed text-sm">Your school account has been suspended by the platform administrator. Please reach out to <span className="font-bold text-slate-900">support@scoolg.com</span> to reactivate your access.</p>
                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/admin/login';
                            }}
                            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-slate-200"
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
            <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

            {/* Mobile drawer overlay */}
            {mobileNavOpen && (
                <div onClick={() => setMobileNavOpen(false)} className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"></div>
            )}

            <main className="w-full pl-0 md:pl-[280px] min-h-screen bg-surface-container-low overflow-x-hidden">
                {children}
            </main>
        </div>
    );
};

// Blocks staff users from opening a module they don't have access to.
const ModuleRoute = ({ module, children }) => {
    const { can } = useAdmin();
    if (module && !can(module)) {
        return <Navigate to="/dashboard" replace />;
    }
    return <ProtectedRoute>{children}</ProtectedRoute>;
};

function App() {
    return (
        <ToastProvider>
            <AdminProvider>
                <Router basename={import.meta.env.BASE_URL}>
                    <Suspense fallback={<PageLoading />}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/change-password" element={<ChangePassword />} />

                            <Route
                                path="/support"
                                element={<ProtectedRoute><Support /></ProtectedRoute>}
                            />
                            <Route
                                path="/dashboard"
                                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
                            />
                            <Route
                                path="/profile"
                                element={<ProtectedRoute><Profile /></ProtectedRoute>}
                            />
                            <Route
                                path="/notifications"
                                element={<ProtectedRoute><Notifications /></ProtectedRoute>}
                            />
                            <Route
                                path="/gallery"
                                element={<ProtectedRoute><div style={{ padding: '80px', textAlign: 'center' }}><h2>Gallery Coming Soon</h2></div></ProtectedRoute>}
                            />
                            <Route
                                path="/students"
                                element={<ModuleRoute module="students"><Students /></ModuleRoute>}
                            />
                            <Route
                                path="/students/add"
                                element={<ModuleRoute module="students"><AddStudent /></ModuleRoute>}
                            />
                            <Route
                                path="/students/profile"
                                element={<ModuleRoute module="students"><StudentProfile /></ModuleRoute>}
                            />
                            <Route
                                path="/teachers"
                                element={<ModuleRoute module="teachers"><Teachers /></ModuleRoute>}
                            />
                            <Route
                                path="/teachers/add"
                                element={<ModuleRoute module="teachers"><AddTeacher /></ModuleRoute>}
                            />
                            <Route
                                path="/teachers/profile"
                                element={<ModuleRoute module="teachers"><TeacherProfile /></ModuleRoute>}
                            />
                            <Route
                                path="/teacher-diary"
                                element={<ModuleRoute module="teachers"><TeacherDiary /></ModuleRoute>}
                            />
                            <Route
                                path="/timetable"
                                element={<ModuleRoute module="timetable"><Timetable /></ModuleRoute>}
                            />
                            <Route
                                path="/calendar"
                                element={<ModuleRoute module="calendar"><Calendar /></ModuleRoute>}
                            />
                            <Route
                                path="/homework"
                                element={<ModuleRoute module="homework"><Homework /></ModuleRoute>}
                            />
                            <Route
                                path="/classes"
                                element={<ModuleRoute module="classes"><Classes /></ModuleRoute>}
                            />
                            <Route
                                path="/classes/detail"
                                element={<ModuleRoute module="classes"><ClassDetail /></ModuleRoute>}
                            />
                            <Route
                                path="/attendance"
                                element={<ModuleRoute module="attendance"><Attendance /></ModuleRoute>}
                            />
                            <Route
                                path="/attendance/analytics"
                                element={<ModuleRoute module="attendance"><AttendanceAnalytics /></ModuleRoute>}
                            />
                            <Route
                                path="/exams"
                                element={<ModuleRoute module="exams"><Exams /></ModuleRoute>}
                            />
                            <Route
                                path="/notices"
                                element={<ModuleRoute module="notices"><Notices /></ModuleRoute>}
                            />
                            <Route
                                path="/roles"
                                element={<ModuleRoute module="roles"><Roles /></ModuleRoute>}
                            />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </Suspense>
                </Router>
            </AdminProvider>
        </ToastProvider>
    );
}

export default App;
