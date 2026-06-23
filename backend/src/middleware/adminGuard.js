import jwt from 'jsonwebtoken';

/*
 * School-admin access guard.
 * Owner / legacy tokens keep full access (non-breaking by design); only a valid
 * STAFF token is hard-restricted to its `allowedModules`.
 */
const ADMIN_PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];

// Map a request path (relative to /api/admin) to the module it belongs to.
const MODULE_BY_PREFIX = [
    ['/student-attendance', 'students'],
    ['/students', 'students'],
    ['/teachers', 'teachers'],
    ['/classes', 'classes'],
    ['/sections', 'classes'],
    ['/subjects', 'classes'],
    ['/timetable', 'timetable'],
    ['/homework', 'homework'],
    ['/attendance', 'attendance'],
    ['/staff', 'roles'],
    ['/exams', 'exams'],
    ['/notices', 'notices'],
    ['/calendar', 'calendar'],
];

// Paths every authenticated user may access regardless of modules
// (profile, dashboard, change-password, etc.).
const ADMIN_SHARED_PATHS = ['/profile', '/dashboard', '/change-password'];

const moduleForPath = (p) => {
    for (const [prefix, mod] of MODULE_BY_PREFIX) {
        if (p === prefix || p.startsWith(prefix + '/') || p.startsWith(prefix + '?')) return mod;
    }
    return null;
};

export const adminGuard = (req, res, next) => {
    // Normalize so this works whether or not Express strips the mount prefix.
    const p = req.path.replace(/^\/api\/admin/, '') || '/';

    if (ADMIN_PUBLIC_PATHS.includes(p)) return next();

    // Fail-CLOSED: every non-public /api/admin request requires a valid token.
    // (The admin panel always sends its Bearer token; this blocks anonymous
    // cross-tenant reads/writes that the old fail-open behaviour allowed.)
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Authentication required" });

    let decoded;
    try {
        decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'scoolg_secret_99');
    } catch (e) {
        return res.status(401).json({ error: "Session expired. Please log in again." });
    }
    req.user = decoded;

    // Owner / legacy token => full access.
    if (decoded.type !== 'staff') return next();

    // Staff: enforce module access.
    if (ADMIN_SHARED_PATHS.some(sp => p.startsWith(sp))) return next();
    const mod = moduleForPath(p);
    if (mod && Array.isArray(decoded.allowedModules) && decoded.allowedModules.includes(mod)) return next();
    if (!mod) return next(); // unmapped utility route -> allow

    return res.status(403).json({ error: "You don't have access to this section" });
};

export default adminGuard;
