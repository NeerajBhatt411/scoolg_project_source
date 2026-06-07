import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { School } from './models/School.js';

dotenv.config();

import fs from 'fs';
import path from 'path';

async function updateGajeraLogo() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Read file
        const imgPath = path.join(process.cwd(), '../school-admin-panel/public/gajera.png');
        const imgBuffer = fs.readFileSync(imgPath);
        const base64Data = 'data:image/png;base64,' + imgBuffer.toString('base64');

        // Find Gajera International School
        const school = await School.findOne({ "formData.schoolName": { $regex: /Gajera/i } });
        
        if (school) {
            console.log(`Found School: ${school.formData.schoolName}`);
            
            // Update the logo
            if (!school.formData) school.formData = {};
            school.formData.logo = base64Data;

            // Save
            school.markModified('formData');
            await school.save();
            console.log("✅ Successfully updated logo using Base64 string!");
        } else {
            console.log("❌ Gajera International School not found in database.");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

updateGajeraLogo();
