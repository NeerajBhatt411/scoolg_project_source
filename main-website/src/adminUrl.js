// Resolves the Scoolg Admin Panel URL.
//
// The admin panel is a separate Vite app served under "/admin/" (see its
// vite.config base). It owns its own auth: visiting the root auto-routes to
// /dashboard when a session token exists, otherwise to /login. So the main
// website only needs to point "Log In" at the panel root.
//
// - Production: same origin, served at /admin/
// - Local dev: the admin panel runs on its own dev server at :5174 under /admin/
// - Override anytime with VITE_ADMIN_PANEL_URL (e.g. https://admin.scoolg.com/)
const raw = import.meta.env.VITE_ADMIN_PANEL_URL?.trim();

export const ADMIN_PANEL_URL = raw
  ? (raw.endsWith('/') ? raw : `${raw}/`)
  : (import.meta.env.DEV ? 'http://localhost:5174/admin/' : '/admin/');

// Direct link to the login screen (used after onboarding).
export const ADMIN_LOGIN_URL = `${ADMIN_PANEL_URL}login`;
