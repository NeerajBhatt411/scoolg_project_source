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
        // Serverless-tuned options: fail fast on a slow/unreachable Atlas cluster
        // (default serverSelectionTimeoutMS is 30s, longer than Netlify's function
        // budget) so the request returns a clean JSON error instead of the platform
        // killing the function and the PWA spinner hanging forever. A small pool is
        // enough per warm instance.
        cachedDbPromise = mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 20000,
            maxPoolSize: 5,
        })
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
