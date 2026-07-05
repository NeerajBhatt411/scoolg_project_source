// Central API base + super-admin auth. Every super-admin request goes through
// saFetch so the Bearer token is attached and an expired/invalid session
// (401/403) cleanly bounces back to the login screen.
export const SA_API = 'https://api.scoolg.com/api';

export const getToken = () => localStorage.getItem('sa_token');
export const setToken = (t) => localStorage.setItem('sa_token', t);
export const clearToken = () => localStorage.removeItem('sa_token');

export async function saFetch(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${SA_API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (res.status === 401 || res.status === 403) {
    clearToken();
    if (!window.location.pathname.endsWith('/login')) window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return res;
}
