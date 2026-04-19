import mongoose from 'mongoose';
import dotenv from 'dotenv';
import School from './models/School.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log("Connected to MongoDB...");
    const schools = await School.find({ campusCode: { $exists: false } });
    console.log(`Found ${schools.length} schools without campus code.`);
    
    for (let school of schools) {
        const schoolNamePrefix = school.formData?.schoolName 
            ? school.formData.schoolName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'SCH') 
            : 'SCH';
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        school.campusCode = `${schoolNamePrefix}-${randomCode}`;
        await school.save();
        console.log(`Updated ${school.email} with campus code: ${school.campusCode}`);
    }
    
    console.log("Done.");
    process.exit(0);
}).catch(console.error);
