import dotenv from 'dotenv';
dotenv.config();

// Import Express and CORS packages
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js'; 

// Initialize Express Engine
const app = express();

// Connect to Database
connectDB();

// Middlewares - Allow external access (CORS) and parse JSON data
app.use(cors());
app.use(express.json());

// Health check API route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server is running perfectly! 🚀' });
});

// Export app for use in server.js or serverless.js
export { app };
