import axios from 'axios';

// Always use the live backend (no local dependency).
const api = axios.create({
  baseURL: 'https://scoolg-backend.netlify.app/api',
});

export default api;
