import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import './config/cloudinary.js';            // configure Cloudinary (side-effect)
import { connectToDB } from './config/db.js';
import { mountSwagger } from './config/swagger.js';
import { corsMiddleware } from './middleware/cors.js';
import { adminGuard } from './middleware/adminGuard.js';

// Domain routers (each registers full /api/... paths)
import onboardingRoutes from './routes/onboarding.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminCoreRoutes from './routes/adminCore.routes.js';
import academicsRoutes from './routes/academics.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import teachersRoutes from './routes/teachers.routes.js';
import studentsRoutes from './routes/students.routes.js';
import superadminRoutes from './routes/superadmin.routes.js';
import timetableRoutes from './routes/timetable.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import homeworkRoutes from './routes/homework.routes.js';
import staffRoutes from './routes/staff.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import studentAppRoutes from './routes/studentApp.routes.js';
import teacherAppRoutes from './routes/teacherApp.routes.js';

const app = express();

// --- Global middleware (order preserved from the original monolith) ---
app.use(corsMiddleware);   // manual CORS + preflight (Netlify-safe)
app.use(cors());
app.use(express.json());

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

export default app;
export { app };
