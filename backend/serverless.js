// Wrapper to make Express App compatible with Serverless platforms (AWS Lambda/Netlify)
import serverless from 'serverless-http';
import { app } from './src/app.js';

// Export handler function for cloud provider execution
export const handler = serverless(app);
