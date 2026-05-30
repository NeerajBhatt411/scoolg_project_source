import axios from 'axios';

// In dev (npm run dev) talk to the local backend so the new teacher routes work
// even before they're deployed. Production builds use the live backend.
const baseURL = import.meta.env.DEV
  ? 'http://localhost:5001/api'
  : 'https://scoolg-backend.netlify.app/api';

const api = axios.create({ baseURL });

export default api;
