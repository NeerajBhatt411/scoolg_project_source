import { School } from '../../models/School.js';

// Ensure the school has a unique short CODE used as the prefix for app IDs
// (e.g. "GAJ"). Idempotent — assigns once then reuses. The code is unique across
// schools, which is what makes the resulting student/teacher IDs globally unique.
export const ensureSchoolCode = async (school) => {
    if (school.code) return school.code;
    const letters = (school.formData?.schoolName || '').replace(/[^A-Za-z]/g, '');
    const base = (letters.substring(0, 3).toUpperCase() || 'SCH').padEnd(3, 'X');
    let code = base, n = 1;
    while (await School.findOne({ code, _id: { $ne: school._id } }).lean()) {
        code = `${base}${n++}`;
    }
    school.code = code;
    await school.save();
    return code;
};

// Atomically reserve the next `count` STUDENT ids for a school, e.g.
// ["GAJ001", "GAJ002", ...]. The $inc is atomic, so concurrent / bulk requests
// never get overlapping ranges → no duplicates, ever. Deleting a student does
// not roll the counter back, so an id is never reused.
export const nextStudentIds = async (school, count = 1) => {
    const code = await ensureSchoolCode(school);
    const updated = await School.findOneAndUpdate(
        { _id: school._id },
        { $inc: { studentSeq: count } },
        { new: true }
    );
    const end = updated.studentSeq;
    const start = end - count + 1;
    const ids = [];
    for (let i = start; i <= end; i++) ids.push(`${code}${String(i).padStart(3, '0')}`);
    return ids;
};

// Same for TEACHERS, e.g. ["GAJT01", "GAJT02", ...]. The "T" infix keeps teacher
// ids visibly distinct from student ids and clash-free even within one school.
export const nextTeacherIds = async (school, count = 1) => {
    const code = await ensureSchoolCode(school);
    const updated = await School.findOneAndUpdate(
        { _id: school._id },
        { $inc: { teacherSeq: count } },
        { new: true }
    );
    const end = updated.teacherSeq;
    const start = end - count + 1;
    const ids = [];
    for (let i = start; i <= end; i++) ids.push(`${code}T${String(i).padStart(2, '0')}`);
    return ids;
};
