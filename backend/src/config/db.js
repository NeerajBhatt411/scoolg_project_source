import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.log("⚠️ MongoDB URI is missing: Please check your .env file");
            return;
        }
        
        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected Successfully! Host: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        // Exit process with failure code if connection fails
        process.exit(1);
    }
};

export { connectDB };
