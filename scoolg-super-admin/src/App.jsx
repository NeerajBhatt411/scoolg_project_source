import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ManageSchools from './pages/ManageSchools';
import PendingApprovals from './pages/PendingApprovals';
import SchoolProfile from './pages/SchoolProfile';

// Placeholder for other pages
const GlobalNotices = () => <div className="p-8"><h1 className="text-2xl font-bold">Global Notices</h1></div>;
const Settings = () => <div className="p-8"><h1 className="text-2xl font-bold">Settings</h1></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schools" element={<ManageSchools />} />
          <Route path="schools/:id" element={<SchoolProfile />} />
          <Route path="approvals" element={<PendingApprovals />} />
          <Route path="notices" element={<GlobalNotices />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
