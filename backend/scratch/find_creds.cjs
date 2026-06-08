
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://neerajbhattadx_db_user:NeerajOG8859%23@cluster0.jnf7zqa.mongodb.net/test?appName=Cluster0"; // Added /test to db name if needed, or check default

async function findCredentials() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // Define minimal schemas to avoid errors
        const School = mongoose.model('School', new mongoose.Schema({
            id: String,
            campusCode: String,
            formData: { schoolName: String }
        }), 'schools');

        const Student = mongoose.model('Student', new mongoose.Schema({
            studentAppId: String,
            firstName: String,
            lastName: String,
            schoolId: mongoose.Schema.Types.ObjectId
        }), 'students');

        const schools = await School.find({ campusCode: { $exists: true } }).limit(5);
        console.log('\n--- Schools ---');
        schools.forEach(s => console.log(`Name: ${s.formData?.schoolName}, Code: ${s.campusCode}`));

        const students = await Student.find({}).limit(5);
        console.log('\n--- Students ---');
        for (const s of students) {
            const school = await School.findById(s.schoolId);
            console.log(`Name: ${s.firstName} ${s.lastName}, AppID: ${s.studentAppId}, Campus: ${school?.campusCode}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findCredentials();
