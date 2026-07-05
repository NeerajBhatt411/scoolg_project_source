import jwt from 'jsonwebtoken';

/*
 * Super-admin access guard. Protects EVERY /api/superadmin/* route (including the
 * destructive DELETE-school). Only the login endpoint is public. Fail-closed:
 * no valid super-admin token => 401/403, so the panel can't be used anonymously.
 */
const SUPERADMIN_PUBLIC_PATHS = ['/login'];

export const superAdminGuard = (req, res, next) => {
    // Normalize whether or not Express strips the mount prefix.
    const p = req.path.replace(/^\/api\/superadmin/, '') || '/';
    if (SUPERADMIN_PUBLIC_PATHS.includes(p)) return next();

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Authentication required" });

    let decoded;
    try {
        decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'scoolg_secret_99');
    } catch (e) {
        return res.status(401).json({ error: "Session expired. Please log in again." });
    }
    if (decoded.type !== 'superadmin') {
        return res.status(403).json({ error: "Super-admin access only" });
    }
    req.superadmin = decoded;
    next();
};

export default superAdminGuard;
