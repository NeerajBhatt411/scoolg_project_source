import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ManageSchools from './pages/ManageSchools';
import PendingApprovals from './pages/PendingApprovals';
import SchoolProfile from './pages/SchoolProfile';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Clean, styled placeholder for sections not built out yet (so they aren't blank
// / dead links). Replace with real pages when those features are built.
const ComingSoon = ({ title, desc }) => (
  <div className="p-4 sm:p-8">
    <h2 className="text-2xl font-extrabold text-text">{title}</h2>
    <p className="text-sm text-text-muted font-medium mt-1">{desc}</p>
    <div className="mt-8 bg-surface-container-lowest rounded-xl premium-shadow border border-border p-12 flex flex-col items-center text-center">
      <span className="material-symbols-outlined text-5xl text-text-muted mb-3">construction</span>
      <p className="text-text font-bold">Coming soon</p>
      <p className="text-text-muted text-sm mt-1">This section is under construction.</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Everything below requires a super-admin session. */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schools" element={<ManageSchools />} />
          <Route path="schools/:id" element={<SchoolProfile />} />
          <Route path="approvals" element={<PendingApprovals />} />
          <Route path="notices" element={<ComingSoon title="Global Notices" desc="Broadcast announcements to every school on the platform." />} />
          <Route path="support" element={<ComingSoon title="Support Tickets" desc="Track and respond to school support requests." />} />
          <Route path="settings" element={<ComingSoon title="Settings" desc="Platform configuration and preferences." />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
