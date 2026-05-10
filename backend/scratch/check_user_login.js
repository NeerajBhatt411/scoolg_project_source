import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'neeraj.bhatt@ongraph.com';
    
    // Check in all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      const result = await mongoose.connection.db.collection(col.name).findOne({ 
        $or: [
          { email: email },
          { studentAppId: email },
          { username: email }
        ]
      });
      
      if (result) {
        console.log(`Found in collection: ${col.name}`);
        console.log(JSON.stringify(result, null, 2));
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUser();
