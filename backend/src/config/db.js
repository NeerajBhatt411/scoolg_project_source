import 'dotenv/config';
import mongoose from 'mongoose';

// --- MongoDB Connection (Serverless-Safe) ---
// A single cached connection promise is reused across warm Lambda/Netlify
// invocations so we never open a new pool on every request.
let cachedDbPromise = null;

export const connectToDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not configured');
    }

    if (!cachedDbPromise) {
        cachedDbPromise = mongoose.connect(process.env.MONGODB_URI)
            .then((connection) => {
                console.log("✅ MongoDB Connected Successfully to Atlas!");
                return connection;
            })
            .catch((err) => {
                cachedDbPromise = null;
                console.error("❌ MongoDB Connection Error:", err);
                throw err;
            });
    }

    return cachedDbPromise;
};

export default connectToDB;
