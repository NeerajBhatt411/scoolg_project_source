import axios from 'axios';

const API_ORIGIN = 'https://scoolg-backend.netlify.app';

export const ADMIN_API_BASE = `${API_ORIGIN}/api/admin`;
export const API_BASE = `${API_ORIGIN}/api`;

// Fail slow/cold serverless requests after 20s instead of leaving spinners
// hanging forever ("data kabhi load hi nahi hota").
axios.defaults.timeout = 20000;

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

// On a real auth failure (expired/invalid token) end the session cleanly and send
// the admin to /login, instead of leaving them on a "logged in" panel where every
// data call silently 401s and the screens sit empty (the "reopen ho to logout /
// data nahi aata" complaint). Auth calls (login / change / forgot / reset) are
// excluded — their own 401s (e.g. wrong password) must surface as form errors, not
// a logout — and we only act when a token was actually present.
const AUTH_CALLS = ['/login', '/change-password', '/forgot-password', '/reset-password'];
axios.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';
        const isAuthCall = AUTH_CALLS.some((p) => url.includes(p));
        if (status === 401 && !isAuthCall && localStorage.getItem('scoolg_token')) {
            localStorage.removeItem('scoolg_token');
            setAuthToken(null);
            if (!window.location.pathname.endsWith('/login')) {
                const base = import.meta.env.BASE_URL || '/';
                window.location.href = (base.endsWith('/') ? base : base + '/') + 'login';
            }
        }
        return Promise.reject(error);
    }
);
