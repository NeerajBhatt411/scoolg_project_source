import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.js';
import School from '../models/School.js';

dotenv.config();

async function listStudents() {
    await mongoose.connect(process.env.MONGODB_URI);
    const students = await Student.find().limit(5);
    console.log("--- LATEST STUDENTS ---");
    for (const s of students) {
        const school = await School.findById(s.schoolId);
        console.log(`Student Name: ${s.firstName} ${s.lastName}`);
        console.log(`Campus Code: ${school?.campusCode}`);
        console.log(`App ID: ${s.studentAppId}`);
        console.log(`Password: (Check your creation logs or reset it)`);
        console.log("------------------------");
    }
    process.exit();
}

listStudents();
