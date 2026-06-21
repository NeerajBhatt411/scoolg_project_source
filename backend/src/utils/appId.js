import { School } from '../../models/School.js';
import { Student } from '../../models/Student.js';
import { Teacher } from '../../models/Teacher.js';

// School codes are LETTERS ONLY. On a base collision we append a LETTER suffix
// (GAJ -> GAJA -> GAJB ...), never a digit, so the numeric counter is the only
// digit run in an id. That makes CODE + number unambiguous: "GAJ001" (code GAJ)
// can never equal "GAJA001" (code GAJA), so two schools can never mint the same
// student/teacher id even as their counters grow.
const SUFFIXES = ['', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

const maxSuffixNum = (ids, prefix) => {
    let max = 0;
    const re = new RegExp(`^${prefix}(\\d+)$`);
    for (const id of ids) {
        const m = re.exec(id);
        if (m) { const n = parseInt(m[1], 10); if (n > max) max = n; }
    }
    return max;
};

// Assign a unique, letters-only CODE to the school (once) and seed the student/
// teacher counters from any ids that already match that code. Uniqueness is
// arbitrated by the DB unique index on School.code (race-safe): if another school
// grabbed a candidate concurrently, the save throws E11000 and we try the next
// letter suffix.
export const ensureSchoolCode = async (school) => {
    if (school.code) return school.code;

    const letters = (school.formData?.schoolName || '').replace(/[^A-Za-z]/g, '');
    const base = (letters.substring(0, 3).toUpperCase() || 'SCH').padEnd(3, 'X');

    for (const suf of SUFFIXES) {
        const candidate = base + suf;

        // Skip codes already held by another school.
        const taken = await School.findOne({ code: candidate, _id: { $ne: school._id } }).lean();
        if (taken) continue;

        try {
            // Seed counters from any pre-existing ids that already match this code
            // (defensive — normally none, so seeds are 0).
            const sIds = await Student.find({ schoolId: school._id, studentAppId: { $regex: `^${candidate}\\d+$` } }).select('studentAppId').lean();
            const tIds = await Teacher.find({ schoolId: school._id, teacherAppId: { $regex: `^${candidate}T\\d+$` } }).select('teacherAppId').lean();
            const studentSeq = maxSuffixNum(sIds.map((s) => s.studentAppId), candidate);
            const teacherSeq = maxSuffixNum(tIds.map((t) => t.teacherAppId), candidate + 'T');

            // Atomic claim: only set if this school has no code yet. The unique
            // index on `code` blocks two schools from taking the same candidate.
            const updated = await School.findOneAndUpdate(
                { _id: school._id, code: null },
                { $set: { code: candidate, studentSeq, teacherSeq } },
                { new: true }
            );
            if (updated && updated.code) { school.code = updated.code; return updated.code; }

            // Another concurrent request already set THIS school's code.
            const fresh = await School.findById(school._id).lean();
            if (fresh && fresh.code) { school.code = fresh.code; return fresh.code; }
        } catch (e) {
            if (e && e.code === 11000) continue; // candidate taken by another school in a race → next suffix
            throw e;
        }
    }
    throw new Error('Could not assign a unique school code');
};

// Atomically reserve the next `count` STUDENT ids for a school, e.g.
// ["GAJ001", "GAJ002", ...]. The $inc is atomic, so concurrent / bulk requests
// never get overlapping ranges. Deleting a student never rolls the counter back,
// so an id is never reused.
export const nextStudentIds = async (school, count = 1) => {
    if (count < 1) return [];
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
    if (count < 1) return [];
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
