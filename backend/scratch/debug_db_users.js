import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function debugDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const collections = ['schools', 'admins', 'teachers'];
    
    for (const colName of collections) {
      console.log(`\n--- Checking collection: ${colName} ---`);
      const results = await mongoose.connection.db.collection(colName).find({
        $or: [
          { email: /neeraj/i },
          { email: /ongraph/i },
          { username: /neeraj/i }
        ]
      }).toArray();
      
      if (results.length > 0) {
        results.forEach(user => {
          console.log(`ID: ${user._id}`);
          console.log(`Email: ${user.email}`);
          console.log(`CampusCode: ${user.campusCode || 'N/A'}`);
          console.log(`Password Hash (prefix): ${user.password ? user.password.substring(0, 10) + '...' : 'MISSING'}`);
          console.log(`IsPasswordChanged: ${user.isPasswordChanged}`);
          console.log('-------------------');
        });
      } else {
        console.log('No matches found.');
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugDatabase();
