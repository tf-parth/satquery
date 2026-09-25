// SatQuery AI - Express Server
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import healthRouter from './routes/health.js';
import officialRoutes from './routes/officialRoutes.js';
import analyzeRouter from './routes/analyze.js';
import queryRouter from './routes/query.js';
import compareRouter from './routes/compare.js';
import investigateRouter from './routes/investigate.js';
import { INDIA_DEMO_SCENES, INDIA_ADMIN_REGIONS } from './services/demoData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load .env from backend directory or project root
const envPaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env')
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          const val = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
          process.env[key] = val;
        }
      }
    } catch (e) {}
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static asset serving for demo satellite scenes if needed
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// Register API Routes - SIH Official Endpoints & Legacy V1
app.use('/api', officialRoutes);
app.use('/api', healthRouter);
app.use('/api/v1', analyzeRouter);
app.use('/api/v1', queryRouter);
app.use('/api/v1', compareRouter);
app.use('/api/v1', investigateRouter);

import { resolveIndianLocation, ALL_INDIAN_STATES_UTS, PROMINENT_INDIAN_LOCATIONS } from './services/indiaGeocodingService.js';

// Extra helper endpoints for frontend lookup
app.get(['/api/regions', '/api/india/regions', '/api/v1/regions'], (req, res) => {
  res.json({ status: "SUCCESS", regions: INDIA_ADMIN_REGIONS });
});

app.get(['/api/scenes', '/api/v1/scenes'], (req, res) => {
  res.json({ status: "SUCCESS", scenes: INDIA_DEMO_SCENES });
});

app.get(['/api/locations/resolve', '/api/v1/locations/resolve'], async (req, res) => {
  try {
    const q = req.query.q || req.query.query || req.query.location || "";
    const loc = await resolveIndianLocation(q);
    res.json({ status: "SUCCESS", location: loc });
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});


// Root greeting
app.get('/', (req, res) => {
  res.json({
    app: "SatQuery AI",
    tagline: "India-Wide Multimodal Satellite Intelligence Assistant",
    apiPrefix: "/api/v1",
    documentation: {
      health: "GET /api/healthz",
      analyze: "POST /api/v1/analyze-image",
      query: "POST /api/v1/query",
      compare: "POST /api/v1/compare",
      investigate: "POST /api/v1/investigate",
      getInvestigation: "GET /api/v1/investigations/:id",
      scenes: "GET /api/v1/scenes",
      regions: "GET /api/v1/regions"
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`📡 SatQuery AI Backend running on http://localhost:${PORT}`);
  console.log(`🛰️  India-Wide Multimodal Satellite Intelligence Stack Active`);
});
