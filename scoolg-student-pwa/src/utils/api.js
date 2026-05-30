import axios from 'axios';

const api = axios.create({
  baseURL: 'https://scoolg-backend.netlify.app/api',
});

export default api;
