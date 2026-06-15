import jwt from 'jsonwebtoken';
import { Teacher } from '../../models/Teacher.js';

// Resolve the logged-in teacher from the Authorization header (throws on any
// problem so callers can return 401).
export const teacherFromToken = async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('No token');
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'scoolg_secret_99');
    if (decoded.type !== 'teacher') throw new Error('Not a teacher token');
    const teacher = await Teacher.findById(decoded.id);
    if (!teacher) throw new Error('Teacher not found');
    return teacher;
};

export default teacherFromToken;
