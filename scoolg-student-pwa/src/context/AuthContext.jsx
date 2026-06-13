import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api';

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('student_token'));
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      const response = await api.get('/student/me');
      setUser(response.data.student);
      setSchool(response.data.school);
      localStorage.setItem('school_info', JSON.stringify(response.data.school));
    } catch (error) {

      console.error('Failed to fetch profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (campusCode, studentAppId, password) => {
    try {
      // Step 1: Login
      const loginRes = await api.post('/student/login', {
        studentAppId,
        password
      });

      const { accessToken, refreshToken, studentId } = loginRes.data;

      localStorage.setItem('student_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      setToken(accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // Fetch profile to get user and school info
      await fetchUserProfile();

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
    <AuthContext.Provider value={{ user, school, token, loading, login, logout, fetchUserProfile, mobileNavOpen, setMobileNavOpen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
