import bcrypt from 'bcryptjs';
import { School } from '../../../models/School.js';
import { Student } from '../../../models/Student.js';

export const postAdminStudents = async (req, res) => {
    try {
        const { schoolId } = req.body; // In real app, get from JWT token middleware
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        // Generate 6-digit App ID (e.g. 100001)
        const lastStudent = await Student.findOne({ 
            schoolId: school._id,
            studentAppId: { $regex: /^\d{6}$/ }
        }).sort({ studentAppId: -1 });

        let nextId = 100001;
        if (lastStudent && !isNaN(parseInt(lastStudent.studentAppId))) {
            nextId = parseInt(lastStudent.studentAppId) + 1;
        }

        const studentAppId = String(nextId);
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
            password: hashedPassword
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
        
        // Generate 6-digit App ID sequence starting point
        const lastStudent = await Student.findOne({ 
            schoolId: school._id,
            studentAppId: { $regex: /^\d{6}$/ }
        }).sort({ studentAppId: -1 });

        let nextId = 100001;
        if (lastStudent && !isNaN(parseInt(lastStudent.studentAppId))) {
            nextId = parseInt(lastStudent.studentAppId) + 1;
        }

        for (const studentData of students) {
            const studentAppId = String(nextId);
            nextId++;
            
            // Generate password from DOB
            const dobStr = studentData.dateOfBirth;
            let plainPassword = "password123"; // Fallback
            if (dobStr && dobStr.includes('-')) {
                const parts = dobStr.split('-'); // [yyyy, mm, dd]
                if (parts.length === 3) {
                    // YYYY-MM-DD to DDMMYYYY
                    plainPassword = `${parts[2].substring(0,2)}${parts[1]}${parts[0]}`;
                }
            } else if (dobStr) {
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
                password: hashedPassword
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
