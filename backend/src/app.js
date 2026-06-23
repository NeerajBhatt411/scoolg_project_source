import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import './config/cloudinary.js';            // configure Cloudinary (side-effect)
import { connectToDB } from './config/db.js';
import { mountSwagger } from './config/swagger.js';
import { corsMiddleware } from './middleware/cors.js';
import { adminGuard } from './middleware/adminGuard.js';

// Feature routers (each feature = its own folder with routes + controller)
import onboardingRoutes from './features/onboarding/onboarding.routes.js';
import authRoutes from './features/auth/auth.routes.js';
import adminCoreRoutes from './features/adminCore/adminCore.routes.js';
import academicsRoutes from './features/academics/academics.routes.js';
import calendarRoutes from './features/calendar/calendar.routes.js';
import teachersRoutes from './features/teachers/teachers.routes.js';
import studentsRoutes from './features/students/students.routes.js';
import superadminRoutes from './features/superadmin/superadmin.routes.js';
import timetableRoutes from './features/timetable/timetable.routes.js';
import uploadRoutes from './features/upload/upload.routes.js';
import homeworkRoutes from './features/homework/homework.routes.js';
import staffRoutes from './features/staff/staff.routes.js';
import attendanceRoutes from './features/attendance/attendance.routes.js';
import studentAppRoutes from './features/studentApp/studentApp.routes.js';
import teacherAppRoutes from './features/teacherApp/teacherApp.routes.js';
import notificationsRoutes from './features/notifications/notifications.routes.js';
import publicSiteRoutes from './features/publicSite/publicSite.routes.js';

const app = express();

// --- Global middleware (order preserved from the original monolith) ---
app.use(corsMiddleware);   // manual CORS + preflight (Netlify-safe)
app.use(cors());
app.use(express.json({ limit: '15mb' }));   // base64 image/file uploads exceed the 100kb default

// Swagger UI at /docs and /api-docs
mountSwagger(app);

// --- Health Check & Test ---
app.get('/api/health', (req, res) => res.json({ status: "Scoolg Local Backend Online! ✨" }));
app.get('/api/test', (req, res) => res.json({ message: "Local Test Success! 🚀" }));

// Ensure DB is connected before handling any /api request (skips health/test).
app.use('/api', async (req, res, next) => {
    if (req.path === '/health' || req.path === '/test') {
        return next();
    }
    try {
        await connectToDB();
        next();
    } catch (err) {
        console.error("❌ Request blocked: database unavailable", err);
        res.status(500).json({ error: "Database connection failed" });
    }
});

// School-admin role/module access guard (must run before admin routers).
app.use('/api/admin', adminGuard);

// --- Mount domain routers ---
app.use(onboardingRoutes);
app.use(authRoutes);
app.use(adminCoreRoutes);
app.use(academicsRoutes);
app.use(calendarRoutes);
app.use(teachersRoutes);
app.use(studentsRoutes);
app.use(superadminRoutes);
app.use(timetableRoutes);
app.use(uploadRoutes);
app.use(homeworkRoutes);
app.use(staffRoutes);
app.use(attendanceRoutes);
app.use(studentAppRoutes);
app.use(teacherAppRoutes);
app.use(notificationsRoutes);
app.use(publicSiteRoutes);

export default app;
export { app };
