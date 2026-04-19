import mongoose from 'mongoose';
import dotenv from 'dotenv';
import School from './models/School.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log("Connected to MongoDB for dash removal...");
    const schools = await School.find({ campusCode: { $regex: '-' } });
    console.log(`Found ${schools.length} schools with dash in campus code.`);
    
    for (let school of schools) {
        const oldCode = school.campusCode;
        school.campusCode = oldCode.replace('-', '');
        await school.save();
        console.log(`Updated ${school.email}: ${oldCode} -> ${school.campusCode}`);
    }
    
    console.log("Done.");
    process.exit(0);
}).catch(console.error);
