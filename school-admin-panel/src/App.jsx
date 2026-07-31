import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

// Retry a lazy import once on failure (a stale chunk after a deploy, or a flaky
// network while fetching a lazy page). If it still fails, reload to fetch fresh
// assets — instead of leaving a blank white screen until a manual reload.
const retryLazy = (importFn) => lazy(async () => {
    try {
        const mod = await importFn();
        sessionStorage.removeItem('sg-lazy-retry');
        return mod;
    } catch (err) {
        if (sessionStorage.getItem('sg-lazy-retry') !== '1') {
            sessionStorage.setItem('sg-lazy-retry', '1');
            window.location.reload();
            return new Promise(() => {}); // never resolves; the page is reloading
        }
        throw err; // already retried -> let the ErrorBoundary show a friendly fallback
    }
});

// Lazy load components
const Dashboard = retryLazy(() => import('./pages/Dashboard'));
const Students = retryLazy(() => import('./pages/Students'));
const AddStudent = retryLazy(() => import('./pages/AddStudent'));
const Teachers = retryLazy(() => import('./pages/Teachers'));
const AddTeacher = retryLazy(() => import('./pages/AddTeacher'));
const TeacherProfile = retryLazy(() => import('./pages/TeacherProfile'));
const Timetable = retryLazy(() => import('./pages/Timetable'));
const Calendar = retryLazy(() => import('./pages/Calendar'));
const Homework = retryLazy(() => import('./pages/Homework'));
const Roles = retryLazy(() => import('./pages/Roles'));
const Classes = retryLazy(() => import('./pages/Classes'));
const ClassDetail = retryLazy(() => import('./pages/ClassDetail'));
const Attendance = retryLazy(() => import('./pages/Attendance'));
const AttendanceAnalytics = retryLazy(() => import('./pages/AttendanceAnalytics'));
const Exams = retryLazy(() => import('./pages/Exams'));
const Fees = retryLazy(() => import('./pages/Fees'));
const Notices = retryLazy(() => import('./pages/Notices'));
const Profile = retryLazy(() => import('./pages/Profile'));
const Login = retryLazy(() => import('./pages/Login'));
const ChangePassword = retryLazy(() => import('./pages/ChangePassword'));
const StudentProfile = retryLazy(() => import('./pages/StudentProfile'));
const IdCards = retryLazy(() => import('./pages/IdCards'));
const Support = retryLazy(() => import('./pages/Support'));
const ScoolgNotices = retryLazy(() => import('./pages/ScoolgNotices'));
const Notifications = retryLazy(() => import('./pages/Notifications'));
const TeacherDiary = retryLazy(() => import('./pages/TeacherDiary'));

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
                                const base = import.meta.env.BASE_URL || '/';
                                window.location.href = (base.endsWith('/') ? base : base + '/') + 'login';
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
                    <ErrorBoundary>
                    <Suspense fallback={<PageLoading />}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/change-password" element={<ChangePassword />} />

                            <Route
                                path="/support"
                                element={<ProtectedRoute><Support /></ProtectedRoute>}
                            />
                            <Route
                                path="/scoolg-notices"
                                element={<ProtectedRoute><ScoolgNotices /></ProtectedRoute>}
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
                                path="/id-cards"
                                element={<ModuleRoute module="students"><IdCards /></ModuleRoute>}
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
                                path="/fees"
                                element={<ModuleRoute module="fees"><Fees /></ModuleRoute>}
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
                    </ErrorBoundary>
                </Router>
            </AdminProvider>
        </ToastProvider>
    );
}

export default App;
