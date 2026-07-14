import 'dotenv/config.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authHandler from './api/auth.js';
import endpointsHandler from './api/endpoints.js';
import pingHandler from './api/ping.js';
import logsHandler from './api/logs.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// API Routes
app.all('/api/auth', authHandler);
app.all('/api/endpoints', endpointsHandler);
app.all('/api/ping', pingHandler);
app.all('/api/logs', logsHandler);

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Local development server running at http://localhost:${PORT}`);
});
