const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/scoolg_dev').then(async () => {
    // Dynamic import to support ES modules in CommonJS
    const { Student } = await import('./models/Student.js');
    
    try {
        const studentObj = {
            firstName: "Aarav",
            lastName: "Sharma",
            gender: "Male",
            bloodGroup: "O+",
            aadhaarNumber: "123412341234",
            fatherName: "Dad",
            motherName: "Mom",
            primaryContact: "9876543210",
            parentEmail: "test@test.com",
            currentAddress: "123 Test St",
            admissionNumber: "ADM-001",
            rollNumber: "1",
            class: "1",
            section: "A",
            schoolId: new mongoose.Types.ObjectId(),
            studentAppId: "STU-SCH-1001",
            password: "hashedpassword"
        };
        const s = new Student(studentObj);
        s.dateOfBirth = "45383";
        s.dateOfAdmission = "2024-04-01";
        await s.validate();
        console.log("Validation passed!");
    } catch (err) {
        console.error("Validation error:", err.message);
    }
    process.exit(0);
});
