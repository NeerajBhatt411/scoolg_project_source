import axios from 'axios';

const API_ORIGIN = 'https://scoolg-backend.netlify.app';

export const ADMIN_API_BASE = `${API_ORIGIN}/api/admin`;
export const API_BASE = `${API_ORIGIN}/api`;

// Attach / clear the JWT on the global axios instance used across all pages.
export const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

// Restore the token on app load so requests after a refresh stay authenticated.
const savedToken = localStorage.getItem('scoolg_token');
if (savedToken) setAuthToken(savedToken);

// Belt-and-suspenders: attach the token from localStorage on EVERY request so a
// request can never fire without auth (no blank/0 data on a hard refresh).
axios.interceptors.request.use((config) => {
    const t = localStorage.getItem('scoolg_token');
    if (t && !config.headers?.Authorization) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${t}`;
    }
    return config;
});
