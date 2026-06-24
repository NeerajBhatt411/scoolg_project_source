import { Router } from 'express';
import * as c from './teacherApp.controller.js';

const router = Router();

// --- Teacher Diary (teacher app) ---
router.get('/api/teacher/diary', c.getTeacherDiary);

router.post('/api/teacher/diary', c.postTeacherDiary);

// Teacher locks own entry — after this it can't be edited/deleted.
router.post('/api/teacher/diary/:id/lock', c.postTeacherDiaryByIdLock);

// Teacher deletes own entry — only if not locked.
router.delete('/api/teacher/diary/:id', c.deleteTeacherDiaryById);

/**
 * @swagger
 * /api/teacher/login:
 *   post:
 *     summary: Teacher login (Teacher ID + Password)
 *     tags: [Teacher App]
 */
router.post('/api/teacher/login', c.postTeacherLogin);

/**
 * @swagger
 * /api/teacher/me:
 *   get:
 *     summary: Logged-in teacher profile + school branding
 *     tags: [Teacher App]
 */
router.get('/api/teacher/me', c.getTeacherMe);

/**
 * @swagger
 * /api/teacher/timetable:
 *   get:
 *     summary: Weekly schedule of periods this teacher teaches
 *     tags: [Teacher App]
 */
router.get('/api/teacher/timetable', c.getTeacherTimetable);

/**
 * @swagger
 * /api/teacher/my-classes:
 *   get:
 *     summary: Classes/sections this teacher handles (class-teacher of, or teaches)
 *     tags: [Teacher App]
 */
router.get('/api/teacher/my-classes', c.getTeacherMyclasses);

/**
 * @swagger
 * /api/teacher/students:
 *   get:
 *     summary: Students of a class/section (for attendance)
 *     tags: [Teacher App]
 */
router.get('/api/teacher/students', c.getTeacherStudents);

/**
 * @swagger
 * /api/teacher/events:
 *   get:
 *     summary: Upcoming school-calendar events for the teacher's school
 *     tags: [Teacher App]
 */
router.get('/api/teacher/events', c.getTeacherEvents);

/**
 * @swagger
 * /api/teacher/attendance:
 *   get:
 *     summary: Fetch saved attendance for a section/date
 *     tags: [Teacher App]
 *   post:
 *     summary: Save attendance for a section/date
 *     tags: [Teacher App]
 */
router.get('/api/teacher/attendance', c.getTeacherAttendance);

router.post('/api/teacher/attendance', c.postTeacherAttendance);

/**
 * @swagger
 * /api/teacher/homework:
 *   get:
 *     summary: Homework created by this teacher
 *     tags: [Teacher App]
 *   post:
 *     summary: Assign homework to a class/section
 *     tags: [Teacher App]
 */
router.get('/api/teacher/homework', c.getTeacherHomework);

router.post('/api/teacher/homework', c.postTeacherHomework);

/**
 * @swagger
 * /api/teacher/change-password:
 *   post:
 *     summary: Change the logged-in teacher's password
 *     tags: [Teacher App]
 */
router.post('/api/teacher/change-password', c.postTeacherChangepassword);

// Teacher <-> parent chat
router.get('/api/teacher/chats', c.getTeacherChats);
router.get('/api/teacher/chats/:studentId', c.getTeacherChatThread);
router.post('/api/teacher/chats/:studentId', c.postTeacherChatMessage);

export default router;
