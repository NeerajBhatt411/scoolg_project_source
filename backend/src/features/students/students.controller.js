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

        // Parent email is required (used for password recovery — credentials are NOT emailed).
        const parentEmail = String(req.body.parentEmail || '').trim().toLowerCase();
        if (!parentEmail) return res.status(400).json({ error: "Parent email is required" });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) return res.status(400).json({ error: "Please enter a valid parent email" });

        // School-prefixed, globally-unique App ID (e.g. GAJ001)
        const [studentAppId] = await nextStudentIds(school, 1);
        // Login password: a random 6-digit code the school hands out (not emailed).
        const plainPassword = String(Math.floor(100000 + Math.random() * 900000));

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

        res.status(201).json({
            message: "Student added successfully",
            student: newStudent,
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
        const salt = await bcrypt.genSalt(10);
        
        // School-prefixed, globally-unique App IDs (e.g. GAJ001, GAJ002 ...)
        const appIds = await nextStudentIds(school, students.length);

        let idx = 0;
        for (const studentData of students) {
            const studentAppId = appIds[idx++];

            // Login password: admin override if given, else a random 6-digit code.
            const plainPassword = (studentData.password && String(studentData.password).trim()) || String(Math.floor(100000 + Math.random() * 900000));

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
        }

        res.status(201).json({
            message: `${createdStudents.length} students added successfully`,
            students: createdStudents
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

        // New temp password = a random 6-digit code the school hands out (not emailed).
        const plainPassword = String(Math.floor(100000 + Math.random() * 900000));

        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(plainPassword, salt);
        student.isPasswordChanged = false; // force change on next login
        student.tempPassword = plainPassword; // visible to admin until the student changes it
        student.resetOtp = undefined;
        student.resetOtpExpires = undefined;
        await student.save();

        res.json({
            message: "Password reset successfully",
            appCredentials: { studentAppId: student.studentAppId, password: plainPassword }
        });
    } catch (err) {
        console.error("❌ Reset student password error:", err);
        res.status(500).json({ error: "Failed to reset password" });
    }
};

// Re-send the existing login credentials to the parent's email. Only works while
// the student is still on the first-time password (tempPassword present).
export const postAdminStudentsResendCredentials = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: "Student not found" });
        if (!student.parentEmail) return res.status(400).json({ error: "No parent email is on file for this student" });
        if (!student.tempPassword) {
            return res.json({ changed: true, message: "This student has already set their own password. Use Reset Password to send new login details." });
        }
        const r = await sendCredentialsEmail({
            to: student.parentEmail,
            name: `${student.firstName} ${student.lastName || ''}`.trim(),
            loginLabel: 'Student ID',
            loginId: student.studentAppId,
            password: student.tempPassword,
            roleLabel: 'student account',
            appName: 'Scoolg Student App',
            loginUrl: STUDENT_APP_URL,
        });
        return res.json({ emailed: !!r?.sent, email: student.parentEmail });
    } catch (err) {
        console.error("❌ Resend student credentials error:", err);
        res.status(500).json({ error: "Failed to send login details" });
    }
};
