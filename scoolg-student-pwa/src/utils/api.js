import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.scoolg.com/api',
  // Don't hang forever on a cold/slow serverless start — fail after 30s so the
  // cache layer can fall back to the last known data instead of a stuck screen.
  timeout: 30000,
});

// Always attach the current access token from localStorage on EVERY request.
// This removes the hard-refresh race where a page (e.g. Dashboard) fired its
// fetches before AuthContext had set the default header — which made the
// requests 401 and the whole screen show blank / 0 values after a refresh.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('student_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, use the 30-day refresh token to silently get a new access token and
// retry the request once — so students aren't shown empty data / kicked to login
// every ~24h when the 1-day access token expires.
let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const isRefreshCall = (original.url || '').includes('/auth/refresh');

    if (status === 401 && !original._retry && !isRefreshCall) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return Promise.reject(error);
      original._retry = true;
      try {
        // Dedupe concurrent refreshes into a single network call.
        refreshing = refreshing || axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
        const { data } = await refreshing;
        refreshing = null;

        const newToken = data?.accessToken;
        if (!newToken) return Promise.reject(error);

        localStorage.setItem('student_token', newToken);
        // Keep the matching saved-account entry in sync so a future reload uses the fresh token.
        try {
          const accts = JSON.parse(localStorage.getItem('saved_accounts')) || [];
          localStorage.setItem('saved_accounts', JSON.stringify(
            accts.map((a) => (a.refreshToken === refreshToken ? { ...a, token: newToken } : a))
          ));
        } catch { /* ignore */ }

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        refreshing = null;
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
