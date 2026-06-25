import axios from 'axios';

// Always use the live backend (no local dependency).
const api = axios.create({
  baseURL: 'https://scoolg-backend.netlify.app/api',
  // Fail after 30s instead of hanging on a cold/slow serverless start, so the
  // cache layer can fall back to the last known data.
  timeout: 30000,
});

// Attach the teacher's token on EVERY request from localStorage. Without this, a
// hard refresh fired requests (timetable, attendance, classes…) before
// AuthContext had set the default header — they came back 401 and the screens
// showed blank / no data.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teacher_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a real auth failure (expired/invalid token), clear the session and send the
// teacher to login instead of leaving a broken screen with silent errors.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && !url.includes('login') && localStorage.getItem('teacher_token')) {
      localStorage.removeItem('teacher_token');
      localStorage.removeItem('teacher_profile');
      localStorage.removeItem('teacher_school_info');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
