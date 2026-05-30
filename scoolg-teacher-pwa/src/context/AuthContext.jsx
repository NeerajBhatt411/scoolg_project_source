import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [teacher, setTeacher] = useState(null);
  const [school, setSchool] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('teacher_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/teacher/me');
      setTeacher(res.data.teacher);
      setSchool(res.data.school);
      if (res.data.school) localStorage.setItem('teacher_school_info', JSON.stringify(res.data.school));
    } catch (error) {
      console.error('Failed to fetch teacher profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (teacherAppId, password) => {
    try {
      const res = await api.post('/teacher/login', { teacherAppId, password });
      const { accessToken } = res.data;
      localStorage.setItem('teacher_token', accessToken);
      setToken(accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      await fetchProfile();
      return { success: true, isPasswordChanged: res.data.isPasswordChanged };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Login failed. Please check your credentials.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('teacher_token');
    localStorage.removeItem('teacher_school_info');
    setToken(null);
    setTeacher(null);
    setSchool(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ teacher, school, token, loading, login, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
