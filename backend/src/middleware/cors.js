// --- CRITICAL: Manual CORS & Preflight Handling for Netlify ---
// Mirrors the original inline middleware so behaviour is identical.
export const corsMiddleware = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
};

export default corsMiddleware;
