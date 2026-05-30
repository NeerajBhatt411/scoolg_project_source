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
