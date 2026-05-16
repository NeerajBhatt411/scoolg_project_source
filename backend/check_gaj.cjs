const mongoose = require('mongoose');
require('dotenv').config();

const schoolSchema = new mongoose.Schema({
    campusCode: String,
    formData: Object
});
const School = mongoose.model('School', schoolSchema);

async function checkCode() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        const schools = await School.find({});
        console.log("All codes in DB:", schools.map(s => s.campusCode));
        const school = await School.findOne({ campusCode: "GAJ5432" });
        if (school) {
            console.log("FOUND SCHOOL:", school.formData.schoolName);
        } else {
            const schoolAny = await School.findOne({ campusCode: /GAJ5432/i });
            if (schoolAny) console.log("FOUND (Case Insensitive):", schoolAny.campusCode);
            else console.log("SCHOOL NOT FOUND");
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkCode();
