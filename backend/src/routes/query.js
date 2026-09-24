// SatQuery AI - Geographic & Conversational Query Route
// POST /api/v1/query
import express from 'express';
import { routeQuery } from '../services/modelRouter.js';
import { generateGroundingEvidence } from '../services/groundingEngine.js';
import { generateNlmResponse } from '../services/nlmExplainer.js';
import { INDIA_DEMO_SCENES, getDemoScene } from '../services/demoData.js';
import { resolveIndianLocation } from '../services/indiaGeocodingService.js';
import { askGemini } from '../services/geminiService.js';

const router = express.Router();

router.post('/query', async (req, res) => {
  try {
    const { 
      query = "", 
      conversation = [], 
      context = {}, 
      language = "en",
      image = null 
    } = req.body || {};

    const trimmedQuery = (query || "").trim();
    if (!trimmedQuery && !image) {
      return res.status(400).json({
        success: false,
        error: "QUERY_REQUIRED",
        message: "A query string or image must be provided."
      });
    }

    const effectiveQuery = trimmedQuery || (language === 'hi' ? "संलग्न उपग्रह इमेज का विश्लेषण करें" : "Analyze this satellite image.");

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: "AI_NOT_CONFIGURED",
        message: "SatQuery AI is not configured. Add GEMINI_API_KEY to the backend environment."
      });
    }

    // AI Intent & Location Parsing for Earth Observation grounding
    const routed = routeQuery(effectiveQuery, { language, location: context.location });

    // Dynamic Pan-India Location & Scene Resolution
    let matchedScene = null;
    const locString = typeof routed.extractedLocation === 'string'
      ? routed.extractedLocation
      : (routed.extractedLocation?.name || context.location || "");

    // 1. If activeSceneId provided, look up or build scene
    if (context.activeSceneId) {
      matchedScene = getDemoScene(context.activeSceneId);
    }

    // 2. If a specific Indian location or coordinate was detected/provided, resolve it
    if (!matchedScene && (locString || effectiveQuery)) {
      matchedScene = await resolveIndianLocation(locString || effectiveQuery);
    }

    // 3. Fallback based on specific query intent or national view (never defaulting to Mumbai)
    if (!matchedScene) {
      if (routed.isDisaster) {
        matchedScene = getDemoScene("assam_brahmaputra");
      } else if (routed.targetObject === "canopy_and_crops") {
        matchedScene = getDemoScene("punjab_agriculture");
      } else if (routed.targetObject === "solar_pv") {
        matchedScene = getDemoScene("rajasthan_bhadla");
      } else {
        matchedScene = await resolveIndianLocation("All India");
      }
    }

    // Grounding & NLM synthesis with localized geography
    const grounding = generateGroundingEvidence(routed, matchedScene);
    const nlm = generateNlmResponse(routed, matchedScene, grounding, language);

    // Call Gemini with user query, conversation history, image, and spatial context
    const geminiRes = await askGemini({
      query: effectiveQuery,
      conversation,
      image,
      context: {
        location: matchedScene?.location || locString || context.location,
        activeSceneTitle: matchedScene?.title,
        coordinates: matchedScene?.coordinates,
        state: matchedScene?.state,
        terrain: matchedScene?.terrain,
        advancedOptions: context.advancedOptions,
        analysisResultsSummary: context.analysisResultsSummary
      }
    });

    const answerText = (geminiRes.success && geminiRes.text) ? geminiRes.text : (nlm.answer || "Satellite observation completed successfully.");
    const explanationText = (geminiRes.success && geminiRes.explanation) ? geminiRes.explanation : (nlm.explanation || "Multimodal earth observation models evaluated the scene.");

    // Return clean JSON response with real answer and Earth observation telemetry
    return res.json({
      success: true,
      answer: answerText,
      explanation: explanationText,
      query: trimmedQuery,
      language,
      intent: routed.intent,
      modelsUsed: routed.modelsToRun,
      matchedRegion: routed.extractedLocation || { name: matchedScene.state, type: "State" },

      detections: grounding.detections || [],
      segments: grounding.segments || [],
      map_layers: grounding.layers || [],
      evidence: nlm.evidenceSources || [],
      scene: {
        id: matchedScene.id,
        title: matchedScene.title,
        title_hi: matchedScene.title_hi,
        location: matchedScene.location,
        coordinates: matchedScene.coordinates,
        crs: matchedScene.crs,
        bounds: matchedScene.bounds,
        previewUrl: matchedScene.previewUrl
      }
    });
  } catch (error) {
    console.error("Error in /api/v1/query:", error);
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "SatQuery AI is temporarily unavailable. Please try again."
    });
  }
});

export default router;
