const API_ORIGIN = window.location.hostname === 'localhost'
    ? 'http://localhost:5001'
    : 'https://scoolg-backend.netlify.app';

export const ADMIN_API_BASE = `${API_ORIGIN}/api/admin`;
