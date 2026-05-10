import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function verifyPass() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'neeraj.bhatt@ongraph.com';
    const passwordToTest = 'Neeraj8859#';

    const school = await mongoose.connection.db.collection('schools').findOne({ email: email });
    if (school) {
      const isMatch = await bcrypt.compare(passwordToTest, school.password);
      console.log(`School Account Password Match: ${isMatch}`);
      if (!isMatch) {
          // If not match, maybe it's for the teacher account
          const teacher = await mongoose.connection.db.collection('teachers').findOne({ email: email });
          if (teacher) {
              const isTeacherMatch = await bcrypt.compare(passwordToTest, teacher.password);
              console.log(`Teacher Account Password Match: ${isTeacherMatch}`);
          }
      }
    } else {
      console.log('User not found in schools collection');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verifyPass();
