import 'dotenv/config';
import app from './src/app.js';

// The fully-configured Express app lives in src/app.js (middleware, routers,
// swagger, DB). This file is the local/runtime entrypoint and the module the
// Netlify function (functions/api.mjs) wraps with serverless-http.

const PORT = process.env.PORT || 5001;

if (!process.env.NETLIFY) {
    app.listen(PORT, () => console.log(`🚀 LOCAL Scoolg Backend running on http://localhost:${PORT}`));
}

export default app;
