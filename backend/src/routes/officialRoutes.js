// SatQuery AI - Official SIH API Routes
// Adheres strictly to Section 15 of official SIH Problem Statement 26167.

import express from 'express';
import multer from 'multer';
import { orchestrateQuery } from '../services/agentController.js';
import { MODEL_REGISTRY, getLiveModelStatus } from '../services/modelRegistry.js';
import { parseGeospatialMetadata } from '../services/geotiffParser.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

// 1. Health & Model status
router.get('/health', async (req, res) => {
  const status = await getLiveModelStatus();
  res.json({
    status: "HEALTHY",
    service: "SatQuery AI Multimodal API Gateway",
    version: "2.0.0",
    sihProblemStatement: "26167",
    aiService: status.aiServiceHealth,
    availableModelsCount: Object.keys(MODEL_REGISTRY).length
  });
});

// 2. Model Registry Explorer
router.get('/models', async (req, res) => {
  const status = await getLiveModelStatus();
  res.json({
    status: "SUCCESS",
    count: status.models.length,
    models: status.models
  });
});

// 3. Upload & Inspect GeoTIFF / Raster
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "ERROR", message: "No file uploaded." });
    }
    const metadata = await parseGeospatialMetadata(req.file.buffer, req.file.originalname);
    res.json({
      status: "SUCCESS",
      filename: req.file.originalname,
      sizeBytes: req.file.size,
      metadata
    });
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

// 4. Agentic Query Orchestrator (POST /api/agent/query)
router.post('/agent/query', upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files || [];
    const query = req.body.query || "Explain this image";
    const language = req.body.language || "en";
    const mode = req.body.mode || "auto";
    const modality = req.body.modality || null;
    const demoId = req.body.demoId || null;

    const result = await orchestrateQuery({
      files,
      query,
      language,
      mode,
      modality,
      demoId
    });

    res.json(result);
  } catch (err) {
    console.error("Error in /api/agent/query:", err);
    res.status(500).json({
      status: "ERROR",
      message: err.message,
      execution_trace: [{ step: "Error Handler", status: "FAILED", detail: err.message }]
    });
  }
});

// 5. Single Image Analysis (POST /api/analyze/single)
router.post('/analyze/single', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const files = file ? [file] : [];
    const query = req.body.query || "Describe this remote sensing image";
    const language = req.body.language || "en";

    const result = await orchestrateQuery({
      files,
      query,
      language,
      mode: "single"
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

// 6. Natural Language VQA (POST /api/analyze/vqa)
router.post('/analyze/vqa', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const files = file ? [file] : [];
    const query = req.body.query || req.body.question || "What features are visible?";
    const language = req.body.language || "en";

    const result = await orchestrateQuery({
      files,
      query,
      language,
      mode: "single"
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

// 7. Text-Guided Grounding (POST /api/analyze/grounding)
router.post('/analyze/grounding', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const files = file ? [file] : [];
    const prompt = req.body.prompt || req.body.query || "Highlight all buildings";
    const language = req.body.language || "en";

    const result = await orchestrateQuery({
      files,
      query: prompt,
      language,
      mode: "single"
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

// 8. Bi-Temporal Change Detection (POST /api/analyze/change)
router.post('/analyze/change', upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), async (req, res) => {
  try {
    const f1 = req.files?.image1?.[0];
    const f2 = req.files?.image2?.[0];
    const files = (f1 && f2) ? [f1, f2] : [];
    const query = req.body.query || "What changed between these two images?";
    const language = req.body.language || "en";

    const result = await orchestrateQuery({
      files,
      query,
      language,
      mode: "bitemporal"
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

// 9. Cross-Modal Optical + SAR Analysis (POST /api/analyze/cross-modal)
router.post('/analyze/cross-modal', upload.fields([{ name: 'optical', maxCount: 1 }, { name: 'sar', maxCount: 1 }]), async (req, res) => {
  try {
    const f_opt = req.files?.optical?.[0];
    const f_sar = req.files?.sar?.[0];
    const files = (f_opt && f_sar) ? [f_opt, f_sar] : [];
    const query = req.body.query || "Use the optical and SAR images to identify water and built-up regions";
    const language = req.body.language || "en";

    const result = await orchestrateQuery({
      files,
      query,
      language,
      mode: "crossmodal"
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

export default router;
