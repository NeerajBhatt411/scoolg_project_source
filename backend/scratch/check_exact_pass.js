import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkExactPass() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'neeraj.bhatt@ongraph.com';
    const school = await mongoose.connection.db.collection('schools').findOne({ email: email });
    if (school) {
      console.log(`Email: '${school.email}' (Length: ${school.email.length})`);
      console.log(`Pass: '${school.password}' (Length: ${school.password.length})`);
      
      const testPass = 'Neeraj8859#';
      console.log(`Test: '${testPass}' (Length: ${testPass.length})`);
      console.log(`Direct Match: ${school.password === testPass}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkExactPass();
