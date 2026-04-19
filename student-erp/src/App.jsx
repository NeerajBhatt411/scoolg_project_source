import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CampusVerify from './pages/CampusVerify';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('studentToken');
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col mx-auto max-w-md shadow-2xl overflow-hidden relative">
        <Routes>
          <Route path="/" element={<CampusVerify />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <StudentDashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
