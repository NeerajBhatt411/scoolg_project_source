import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const api = axios.create({
  baseURL: 'https://scoolg-backend.netlify.app/api',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('student_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/student/profile');
      setUser(response.data);
      const storedSchool = localStorage.getItem('school_info');
      if (storedSchool) setSchool(JSON.parse(storedSchool));
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (campusCode, studentId, password) => {
    try {
      // Step 1: Verify Campus
      const campusRes = await api.get(`/student/verify-campus/${campusCode}`);
      const schoolInfo = campusRes.data;

      // Step 2: Login
      const loginRes = await api.post('/student/login', {
        studentId,
        password,
        campusId: schoolInfo._id
      });

      const { token: newToken, student } = loginRes.data;

      localStorage.setItem('student_token', newToken);
      localStorage.setItem('school_info', JSON.stringify(schoolInfo));

      setToken(newToken);
      setUser(student);
      setSchool(schoolInfo);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('school_info');
    setToken(null);
    setUser(null);
    setSchool(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, school, token, loading, login, logout, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
