// SatQuery AI - Conversational Investigation Memory Route
// POST /api/v1/investigate & GET /api/v1/investigations/:id
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { routeQuery } from '../services/modelRouter.js';
import { generateGroundingEvidence } from '../services/groundingEngine.js';
import { generateNlmResponse } from '../services/nlmExplainer.js';
import { INDIA_DEMO_SCENES, getDemoScene } from '../services/demoData.js';
import { askGemini } from '../services/geminiService.js';

const router = express.Router();

// In-memory persistent session store
const investigations = new Map();

// Initialize with a few active India investigations
investigations.set("inv_assam_monsoon", {
  id: "inv_assam_monsoon",
  title: "Assam Brahmaputra Flood Inundation Tracking",
  title_hi: "असम ब्रह्मपुत्र बाढ़ जलमग्नता ट्रैकिंग",
  region: "Assam, Northeast India",
  createdAt: new Date().toISOString(),
  sceneId: "assam_brahmaputra",
  conversation: [
    {
      role: "user",
      text: "Show flood impact in Kaziranga and surrounding villages."
    },
    {
      role: "assistant",
      text: "SatQuery detected 14,280 hectares of inundated terrain using Sentinel-1 C-SAR radar backscatter.",
      evidence: ["Sentinel-1 C-SAR", "SARAS-Net", "NDWI"]
    }
  ],
  activeLayers: ["layer_saras_net", "layer_ndwi"]
});

investigations.set("inv_mumbai_coastal", {
  id: "inv_mumbai_coastal",
  title: "Mumbai Coastal Road Infrastructure Audit",
  title_hi: "मुंबई तटीय सड़क बुनियादी ढांचा ऑडिट",
  region: "Maharashtra, West India",
  createdAt: new Date().toISOString(),
  sceneId: "mumbai_coastal",
  conversation: [
    {
      role: "user",
      text: "Find buildings along newly reclaimed shoreline."
    },
    {
      role: "assistant",
      text: "SatQuery detected 42 coastal structures and 18.4 ha of reclaimed land footprint.",
      evidence: ["GroundingDINO", "SAM2", "ChangeFormer"]
    }
  ],
  activeLayers: ["layer_grounding_dino", "layer_change_former"]
});

// List investigations
router.get('/investigations', (req, res) => {
  const list = Array.from(investigations.values());
  res.json({
    status: "SUCCESS",
    count: list.length,
    investigations: list
  });
});

// Get specific investigation
router.get('/investigations/:id', (req, res) => {
  const inv = investigations.get(req.params.id);
  if (!inv) {
    return res.status(404).json({
      status: "NOT_FOUND",
      message: `Investigation ${req.params.id} not found.`
    });
  }
  res.json({ status: "SUCCESS", investigation: inv });
});

// Create or continue investigation (Conversational memory)
router.post('/investigate', async (req, res) => {
  try {
    const { 
      investigationId = null, 
      query = "", 
      sceneId = "mumbai_coastal", 
      aoi = null, 
      language = "en" 
    } = req.body || {};

    let inv = investigationId ? investigations.get(investigationId) : null;
    if (!inv) {
      const id = investigationId || `inv_${uuidv4().substring(0, 8)}`;
      inv = {
        id,
        title: query ? `Investigation: ${query.substring(0, 40)}...` : "India Satellite Investigation",
        createdAt: new Date().toISOString(),
        sceneId,
        aoi,
        conversation: [],
        activeLayers: []
      };
      investigations.set(id, inv);
    }

    const scene = getDemoScene(sceneId || inv.sceneId);

    // AI Intent & context
    const routed = routeQuery(query, {
      language,
      location: scene.location,
      previousFindings: inv.conversation.map(c => c.text)
    });

    const grounding = generateGroundingEvidence(routed, scene);
    const nlm = generateNlmResponse(routed, scene, grounding, language);

    let finalAnswer = nlm.answer;
    let finalExplanation = nlm.explanation;
    if (process.env.GEMINI_API_KEY) {
      const historyContext = inv.conversation.slice(-4).map(c => `${c.role}: ${c.text}`).join('\n');
      const geminiPrompt = `Active Satellite Scene: ${scene.title} (${scene.location}, Sensor: ${scene.sensor}).
Previous Conversation History:
${historyContext}
User Query: "${query}".
Answer as SatQuery Earth Observation AI concisely in 2-3 sentences.`;
      const liveGeminiText = await askGemini({ prompt: geminiPrompt, language });
      if (liveGeminiText) {
        finalAnswer = liveGeminiText;
      }
    }

    // Push turn into conversational memory
    inv.conversation.push({
      role: "user",
      text: query,
      timestamp: new Date().toISOString()
    });

    inv.conversation.push({
      role: "assistant",
      text: finalAnswer,
      explanation: finalExplanation,
      evidence: nlm.evidenceSources,
      timestamp: new Date().toISOString()
    });

    inv.lastUpdated = new Date().toISOString();

    res.json({
      status: "SUCCESS",
      investigationId: inv.id,
      conversationLength: inv.conversation.length,
      answer: nlm.answer,
      explanation: nlm.explanation,
      nextActions: nlm.nextActions,
      detections: grounding.detections,
      segments: grounding.segments,
      map_layers: grounding.layers,
      evidence: nlm.evidenceSources,
      provenance: nlm.provenance,
      conversationHistory: inv.conversation
    });
  } catch (error) {
    console.error("Error in /api/v1/investigate:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Investigation turn could not be processed.",
      error: error.message
    });
  }
});

export default router;
