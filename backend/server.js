// Import the Express app engine
import { app } from './src/app.js';

// Get PORT from environment variables or use 5000 as default
const PORT = process.env.PORT || 5000;

// Start the server on the specified PORT
app.listen(PORT, () => {
    console.log(`🔥 Local Server is alive and running on PORT ${PORT}!`);
    console.log(`🌐 API Health Check: http://localhost:${PORT}/api/health`);
});
