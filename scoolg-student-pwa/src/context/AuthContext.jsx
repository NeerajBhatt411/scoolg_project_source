import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { initPush } from '../firebase';
import { clearCache } from '../utils/cache';

const AuthContext = createContext();


const loadSavedAccounts = () => {
  try {
    const raw = JSON.parse(localStorage.getItem('saved_accounts'));
    // Guard against a corrupt/legacy value that parses to a non-array (e.g. an
    // object) — .find() on it during render would white-screen the whole app.
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    return [];
  }
};

// The saved account that matches the active token — used to paint instantly on boot.
const activeAccount = () => {
  const tok = localStorage.getItem('student_token');
  return loadSavedAccounts().find(a => a.token === tok) || null;
};
const readJSON = (key) => { try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; } };

export const AuthProvider = ({ children }) => {
  // Hydrate from localStorage so a hard refresh paints instantly; /student/me only
  // revalidates in the background instead of blocking the boot screen every time.
  const [user, setUser] = useState(() => activeAccount()?.student || null);
  const [school, setSchool] = useState(() => activeAccount()?.school || readJSON('school_info'));
  const [token, setToken] = useState(localStorage.getItem('student_token'));
  const [loading, setLoading] = useState(() => !!localStorage.getItem('student_token') && !activeAccount()?.student);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pushInitedRef = useRef(false);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Register for web push once the student is authenticated. Fire-and-forget:
  // never awaited / never blocks render, and runs at most once per session.
  useEffect(() => {
    if (pushInitedRef.current) return;
    if (!token || !user?._id) return;
    pushInitedRef.current = true;
    initPush({
      role: 'student',
      userId: user._id,
      schoolId: user.schoolId,
      onToken: (t) => api.post('/notifications/token', {
        role: 'student',
        userId: user._id,
        schoolId: user.schoolId,
        token: t,
      }),
    });
  }, [token, user]);

  const fetchUserProfile = async (overrideToken) => {
    try {
      const currentToken = overrideToken || token;
      if (!currentToken) return;
      api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      const response = await api.get('/student/me');
      setUser(response.data.student);
      setSchool(response.data.school);
      localStorage.setItem('school_info', JSON.stringify(response.data.school));

      const accounts = loadSavedAccounts();
      const existingIdx = accounts.findIndex(a => a.student?.studentAppId === response.data.student.studentAppId);
      const newAccount = {
        token: currentToken,
        refreshToken: localStorage.getItem('refresh_token'),
        student: response.data.student,
        school: response.data.school
      };
      if (existingIdx >= 0) {
        accounts[existingIdx] = newAccount;
      } else {
        accounts.push(newAccount);
      }
      localStorage.setItem('saved_accounts', JSON.stringify(accounts));
    } catch (error) {

      console.error('Failed to fetch profile:', error);
      // Only log out on a real auth failure (401). Network/offline/5xx errors
      // keep the hydrated session so the app stays usable (no daily kick-out).
      const status = error.response?.status;
      if (!overrideToken && status === 401) {
        logout();
      }
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

      const { accessToken, refreshToken, studentId, isPasswordChanged } = loginRes.data;

      localStorage.setItem('student_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      setToken(accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // Fetch profile to get user and school info
      await fetchUserProfile(accessToken);

      // mustChange -> account is still on the default/generated password.
      // (!== true also catches legacy docs where the flag was never stored.)
      return { success: true, mustChange: isPasswordChanged !== true };
    } catch (error) {

      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  const logout = () => {
    const currentToken = localStorage.getItem('student_token');
    let accounts = loadSavedAccounts();
    accounts = accounts.filter(a => a.token !== currentToken);
    localStorage.setItem('saved_accounts', JSON.stringify(accounts));

    if (accounts.length > 0) {
      switchAccount(accounts[0].token);
    } else {
      localStorage.removeItem('student_token');
      localStorage.removeItem('school_info');
      localStorage.removeItem('refresh_token');
      clearCache(); // drop cached data so the next user starts clean
      setToken(null);
      setUser(null);
      setSchool(null);
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const switchAccount = (accountToken) => {
    const accounts = loadSavedAccounts();
    const account = accounts.find(a => a.token === accountToken);
    if (account) {
      localStorage.setItem('student_token', account.token);
      if (account.refreshToken) localStorage.setItem('refresh_token', account.refreshToken);
      if (account.school) localStorage.setItem('school_info', JSON.stringify(account.school));
      setToken(account.token);
      setUser(account.student);
      setSchool(account.school);
      api.defaults.headers.common['Authorization'] = `Bearer ${account.token}`;
      // reload to reset any page specific state
      window.location.href = '/dashboard';
    }
  };

  const getSavedAccounts = () => loadSavedAccounts();

  return (
    <AuthContext.Provider value={{ user, school, token, loading, login, logout, fetchUserProfile, setUser, mobileNavOpen, setMobileNavOpen, switchAccount, getSavedAccounts }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
