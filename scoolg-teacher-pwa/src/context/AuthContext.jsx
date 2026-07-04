import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { initPush } from '../firebase';
import { clearCache } from '../utils/cache';

const AuthContext = createContext();

const readJSON = (key) => { try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; } };

export const AuthProvider = ({ children }) => {
  // Hydrate from localStorage for an instant paint; /teacher/me only revalidates
  // in the background, so a hard refresh doesn't block on the network every time.
  const [teacher, setTeacher] = useState(() => readJSON('teacher_profile'));
  const [school, setSchool] = useState(() => readJSON('teacher_school_info'));
  const [token, setToken] = useState(localStorage.getItem('teacher_token'));
  const [loading, setLoading] = useState(() => !!localStorage.getItem('teacher_token') && !readJSON('teacher_profile'));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pushInitedRef = useRef(false);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Register for web push once the teacher is authenticated. Fire-and-forget:
  // never awaited here so it can't block login/render. Guarded to run once.
  useEffect(() => {
    if (!teacher || !token || pushInitedRef.current) return;
    pushInitedRef.current = true;
    initPush({
      role: 'teacher',
      userId: teacher._id,
      schoolId: school?.id,
      onToken: (t) => api.post('/notifications/token', {
        role: 'teacher',
        userId: teacher._id,
        schoolId: school?.id,
        token: t,
      }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher, token]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/teacher/me');
      setTeacher(res.data.teacher);
      setSchool(res.data.school);
      if (res.data.teacher) localStorage.setItem('teacher_profile', JSON.stringify(res.data.teacher));
      if (res.data.school) localStorage.setItem('teacher_school_info', JSON.stringify(res.data.school));
    } catch (error) {
      console.error('Failed to fetch teacher profile:', error);
      // Only a real auth failure (expired/invalid token) should end the session.
      // A network error or a slow serverless cold start must NOT log the teacher
      // out — keep the hydrated profile so the app stays usable and the next
      // request revalidates. (This was the #1 "randomly logged out" cause.)
      if (error?.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (teacherAppId, password) => {
    try {
      const res = await api.post('/teacher/login', { teacherAppId, password });
      const { accessToken } = res.data;
      clearCache(); // start clean so a previous teacher's cached data can't leak
      localStorage.setItem('teacher_token', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setToken(accessToken); // triggers the token effect -> fetchProfile()
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
    localStorage.removeItem('teacher_profile');
    clearCache(); // drop all cached data so the next user starts clean
    setToken(null);
    setTeacher(null);
    setSchool(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ teacher, school, token, loading, login, logout, fetchProfile, setTeacher, mobileNavOpen, setMobileNavOpen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
