import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Student from '../models/Student.js';

dotenv.config();

async function resetPassword() {
    await mongoose.connect(process.env.MONGODB_URI);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);
    
    const result = await Student.findOneAndUpdate(
        { studentAppId: 'sch1001' },
        { password: hashedPassword },
        { new: true }
    );
    
    if (result) {
        console.log("✅ Password for sch1001 has been reset to: 12345678");
    } else {
        console.log("❌ Student not found");
    }
    process.exit();
}

resetPassword();
