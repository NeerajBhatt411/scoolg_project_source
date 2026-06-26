import bcrypt from 'bcryptjs';
import { School } from '../../../models/School.js';
import { Student } from '../../../models/Student.js';
import { nextStudentIds } from '../../utils/appId.js';
import { sendCredentialsEmail } from '../../utils/email.js';

const STUDENT_APP_URL = process.env.STUDENT_APP_URL || '';

export const postAdminStudents = async (req, res) => {
    try {
        const { schoolId } = req.body; // In real app, get from JWT token middleware
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        // Parent email is required so login credentials can be emailed.
        const parentEmail = String(req.body.parentEmail || '').trim().toLowerCase();
        if (!parentEmail) return res.status(400).json({ error: "Parent email is required" });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) return res.status(400).json({ error: "Please enter a valid parent email" });

        // School-prefixed, globally-unique App ID (e.g. GAJ001)
        const [studentAppId] = await nextStudentIds(school, 1);
        const dobObj = new Date(req.body.dateOfBirth);
        const dd = String(dobObj.getDate()).padStart(2, '0');
        const mm = String(dobObj.getMonth() + 1).padStart(2, '0');
        const yyyy = dobObj.getFullYear();
        const plainPassword = `${dd}${mm}${yyyy}`; // Default password is DOB

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        const newStudent = new Student({
            ...req.body,
            schoolId: school._id,
            studentAppId,
            parentEmail,
            password: hashedPassword,
            tempPassword: plainPassword // visible to admin until the student changes it
        });

        await newStudent.save();

        // Auto-email login credentials to the parent (if a parent email is on file).
        let emailed = false;
        if (newStudent.parentEmail) {
            const r = await sendCredentialsEmail({
                to: newStudent.parentEmail,
                name: `${newStudent.firstName} ${newStudent.lastName}`.trim(),
                loginLabel: 'Student ID',
                loginId: studentAppId,
                password: plainPassword,
                roleLabel: 'student account',
                appName: 'Scoolg Student App',
                loginUrl: STUDENT_APP_URL,
            });
            emailed = !!r?.sent;
        }

        res.status(201).json({
            message: "Student added successfully",
            student: newStudent,
            emailed,
            appCredentials: {
                studentAppId,
                password: plainPassword // Send back once so admin can print/save it
            }
        });
    } catch (err) {
        console.error("❌ Add student error:", err);
        res.status(500).json({ error: "Failed to add student", details: err.message });
    }
};

export const postAdminStudentsBulk = async (req, res) => {
    try {
        const { schoolId, className, sectionName, students } = req.body;
        if (!schoolId || !className || !students || !Array.isArray(students)) {
            return res.status(400).json({ error: "schoolId, className, and students array are required" });
        }

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const createdStudents = [];
        const emailJobs = []; // { to, name, studentAppId, password } for parents with an email
        const salt = await bcrypt.genSalt(10);
        
        // School-prefixed, globally-unique App IDs (e.g. GAJ001, GAJ002 ...)
        const appIds = await nextStudentIds(school, students.length);

        let idx = 0;
        for (const studentData of students) {
            const studentAppId = appIds[idx++];

            // Use an admin-provided password if given, else derive from DOB.
            const dobStr = studentData.dateOfBirth;
            let plainPassword = (studentData.password && String(studentData.password).trim()) || "password123"; // override or fallback
            if (!studentData.password && dobStr && dobStr.includes('-')) {
                const parts = dobStr.split('-'); // [yyyy, mm, dd]
                if (parts.length === 3) {
                    // YYYY-MM-DD to DDMMYYYY
                    plainPassword = `${parts[2].substring(0,2)}${parts[1]}${parts[0]}`;
                }
            } else if (!studentData.password && dobStr) {
                // If it's a Date object
                const d = new Date(dobStr);
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const yyyy = d.getFullYear();
                plainPassword = `${dd}${mm}${yyyy}`;
            }

            const hashedPassword = await bcrypt.hash(plainPassword, salt);

            // Create new student object combining UI provided class/section and CSV data
            const studentObj = {
                firstName: studentData.firstName,
                lastName: studentData.lastName || '',
                gender: studentData.gender,
                bloodGroup: studentData.bloodGroup || '',
                aadhaarNumber: studentData.aadhaarNumber || '',
                fatherName: studentData.fatherName || '',
                motherName: studentData.motherName || '',
                primaryContact: studentData.primaryContact || studentData.contactNumber || '',
                parentEmail: studentData.parentEmail || '',
                currentAddress: studentData.currentAddress || '',
                admissionNumber: studentData.admissionNumber || '',
                rollNumber: studentData.rollNumber || '',
                class: className,
                section: sectionName || 'N/A', // Mongoose schema requires section
                schoolId: school._id,
                studentAppId,
                password: hashedPassword,
                tempPassword: plainPassword // visible to admin until the student changes it
            };

            if (studentData.dateOfBirth) studentObj.dateOfBirth = studentData.dateOfBirth;
            if (studentData.dateOfAdmission) studentObj.dateOfAdmission = studentData.dateOfAdmission;

            const newStudent = new Student(studentObj);


            await newStudent.save();

            createdStudents.push({
                firstName: newStudent.firstName,
                lastName: newStudent.lastName,
                studentAppId: newStudent.studentAppId,
                password: plainPassword // Send back plain-text once for the UI to display/download
            });

            if (newStudent.parentEmail) {
                emailJobs.push({
                    to: newStudent.parentEmail,
                    name: `${newStudent.firstName} ${newStudent.lastName || ''}`.trim(),
                    studentAppId: newStudent.studentAppId,
                    password: plainPassword,
                });
            }
        }

        // Auto-email credentials to parents that have an email (parallel, best-effort).
        const results = await Promise.allSettled(emailJobs.map(j => sendCredentialsEmail({
            to: j.to,
            name: j.name,
            loginLabel: 'Student ID',
            loginId: j.studentAppId,
            password: j.password,
            roleLabel: 'student account',
            appName: 'Scoolg Student App',
            loginUrl: STUDENT_APP_URL,
        })));
        const emailedCount = results.filter(r => r.status === 'fulfilled' && r.value?.sent).length;

        res.status(201).json({
            message: `${createdStudents.length} students added successfully`,
            students: createdStudents,
            emailedCount
        });
    } catch (err) {
        console.error("❌ Bulk add students error:", err);
        res.status(500).json({ error: "Failed to bulk add students", details: err.message });
    }
};

export const getAdminStudents = async (req, res) => {
    try {
        const { schoolId, className, sectionName } = req.query;
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        let query = { schoolId: school._id };
        if (className) query.class = className;
        if (sectionName) query.section = sectionName;

        const students = await Student.find(query).sort({ rollNumber: 1, firstName: 1 }).select('-password').lean();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
};

export const putAdminStudentsById = async (req, res) => {
    try {
        const studentId = req.params.id;
        const updates = req.body;
        
        // Exclude sensitive fields from being updated directly here if needed
        delete updates.password;
        delete updates.studentAppId;

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId, 
            { $set: updates },
            { new: true }
        );

        if (!updatedStudent) return res.status(404).json({ error: "Student not found" });

        res.json({ message: "Student updated successfully", student: updatedStudent });
    } catch (err) {
        console.error("❌ Update student error:", err);
        res.status(500).json({ error: "Failed to update student details" });
    }
};

// Admin resets a student's password back to a fresh temporary one (DOB by default).
// Forces a change on next login (isPasswordChanged=false) and emails the parent if
// an email is on file. Returns the new temp password once for the admin to share.
export const postAdminStudentsResetPassword = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: "Student not found" });

        // New temp password = DOB (DDMMYYYY) when available, else a short random one.
        let plainPassword;
        if (student.dateOfBirth) {
            const d = new Date(student.dateOfBirth);
            plainPassword = `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`;
        } else {
            plainPassword = `SCG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        }

        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(plainPassword, salt);
        student.isPasswordChanged = false; // force change on next login
        student.tempPassword = plainPassword; // visible to admin until the student changes it
        student.resetOtp = undefined;
        student.resetOtpExpires = undefined;
        await student.save();

        let emailed = false;
        if (student.parentEmail) {
            const r = await sendCredentialsEmail({
                to: student.parentEmail,
                name: `${student.firstName} ${student.lastName || ''}`.trim(),
                loginLabel: 'Student ID',
                loginId: student.studentAppId,
                password: plainPassword,
                roleLabel: 'student account',
                appName: 'Scoolg Student App',
                loginUrl: STUDENT_APP_URL,
            });
            emailed = !!r?.sent;
        }

        res.json({
            message: "Password reset successfully",
            emailed,
            parentEmail: student.parentEmail || null,
            appCredentials: { studentAppId: student.studentAppId, password: plainPassword }
        });
    } catch (err) {
        console.error("❌ Reset student password error:", err);
        res.status(500).json({ error: "Failed to reset password" });
    }
};
