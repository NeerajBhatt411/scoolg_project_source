import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ManageSchools from './pages/ManageSchools';
import PendingApprovals from './pages/PendingApprovals';
import SchoolProfile from './pages/SchoolProfile';
import Support from './pages/Support';
import Notices from './pages/Notices';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

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
          <Route path="notices" element={<Notices />} />
          <Route path="support" element={<Support />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
