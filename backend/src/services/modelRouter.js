// SatQuery AI - Query Understanding & Locked Model Router
// Routes user natural-language questions to the minimum required models from the locked SatQuery technical stack:
// GeoChat, GroundingDINO, SAM2/SamGeo, rschange/ChangeFormer, SARAS-Net, SatCLIP, NDVI, NDWI, NDBI.
import { ALL_INDIAN_STATES_UTS, PROMINENT_INDIAN_LOCATIONS } from './indiaGeocodingService.js';

export function routeQuery(query = "", context = {}) {
  const q = (query || "").trim().toLowerCase();
  
  // Detect language & script
  const hasHindiDevanagari = /[\u0900-\u097F]/.test(query);
  const hasHinglishKeywords = /\b(kaha|kahan|hai|kya|dikhao|batao|pani|imarat|paani|baadh|badh|ped|jungle|yahan|isme|ismein|bataiye)\b/i.test(query);
  
  let detectedLanguage = "en";
  if (hasHindiDevanagari) {
    detectedLanguage = "hi";
  } else if (hasHinglishKeywords) {
    detectedLanguage = "hinglish";
  } else if (context.language === "hi") {
    detectedLanguage = "hi";
  }

  // Detect Comparison / Change requirement
  const isComparisonQuery = 
    context.isComparison ||
    /\b(change|changed|difference|compare|before and after|expansion|growth|loss|बदलाव|परिवर्तन|अंतर|पहले और बाद|badlav|kya badla)\b/i.test(q);

  // Detect Disaster / Flood intent
  const isDisasterQuery =
    /\b(flood|inundat|disaster|damage|hazard|cyclone|submerged|बाढ़|आपदा|नुकसान|जलभराव|डूबा|badh|baadh|paani bhara)\b/i.test(q);

  // Detect Water intent
  const isWaterQuery =
    /\b(water|river|lake|reservoir|canal|ocean|sea|pond|water body|जल|पानी|नदी|झील|तालाब|jal|paani|nadi|jheel)\b/i.test(q);

  // Detect Vegetation / Agriculture intent
  const isVegetationQuery =
    /\b(vegetation|tree|trees|forest|greenery|crop|crops|farm|agriculture|plants|वनस्पति|पेड़|जंगल|फसल|हरियाली|kheti|fasal|ped|jungle|hariyali)\b/i.test(q);

  // Detect Urban / Built-up / Building intent
  const isBuildingQuery =
    /\b(building|buildings|house|houses|structure|structures|settlement|urban|built-up|roof|roofs|इमारत|भवन|मकान|बस्ती|निर्माण|imarat|ghar|basti)\b/i.test(q);

  // Detect Road / Infrastructure / Solar intent
  const isInfrastructureQuery =
    /\b(road|roads|highway|highway|street|bridge|solar|pv|panel|panels|सड़क|राजमार्ग|पुल|सोलर|sadak|pul|rasta)\b/i.test(q);

  // Intent Classification
  let intent = "image_understanding";
  let targetObject = "general_scene";
  let analysisType = "vqa";
  let modelsToRun = [];

  if (isComparisonQuery) {
    intent = "change_detection";
    targetObject = "temporal_difference";
    analysisType = "bi_temporal_change";
    modelsToRun = ["rschange / ChangeFormer", "GeoChat"];
    if (isVegetationQuery) modelsToRun.push("NDVI");
    if (isWaterQuery) modelsToRun.push("NDWI");
    if (isBuildingQuery) modelsToRun.push("NDBI");
  } else if (isDisasterQuery) {
    intent = "disaster_analysis";
    targetObject = "flood_and_damage";
    analysisType = "hazard_assessment";
    modelsToRun = ["SARAS-Net", "NDWI", "GeoChat"];
  } else if (isWaterQuery) {
    intent = "water_detection";
    targetObject = "water_bodies";
    analysisType = "spectral_and_segmentation";
    modelsToRun = ["NDWI", "SAM2 / SamGeo"];
  } else if (isVegetationQuery) {
    intent = "vegetation_analysis";
    targetObject = "canopy_and_crops";
    analysisType = "spectral_index";
    modelsToRun = ["NDVI", "GeoChat"];
  } else if (isBuildingQuery) {
    intent = "object_detection";
    targetObject = "buildings_and_structures";
    analysisType = "grounded_detection";
    modelsToRun = ["GroundingDINO", "SAM2 / SamGeo"];
  } else if (isInfrastructureQuery) {
    intent = "infrastructure_mapping";
    targetObject = "roads_and_grids";
    analysisType = "grounded_detection";
    modelsToRun = ["GroundingDINO", "SatCLIP"];
  } else {
    // General VQA or overview query ("Explain this image", "What is visible?")
    intent = "image_understanding";
    targetObject = "general_landscape";
    analysisType = "scene_understanding";
    modelsToRun = ["GeoChat"];
  }

  // Location entity extraction across India
  const extractedLocation = extractIndianLocation(query) || context.location || null;

  return {
    query,
    detectedLanguage,
    intent,
    targetObject,
    analysisType,
    modelsToRun, // Minimum required models
    extractedLocation,
    isComparison: isComparisonQuery,
    isDisaster: isDisasterQuery
  };
}

function extractIndianLocation(query = "") {
  if (!query || typeof query !== 'string') return null;

  // 1. Check coordinates (e.g. 28.535, 77.391 or lat: 28.535, lng: 77.391)
  const coordMatch = query.match(/lat(?:itude)?[:\s]+(-?\d+\.\d+)[\s,]+(?:lng|lon(?:gitude)?)[:\s]+(-?\d+\.\d+)/i) ||
                     query.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);

    return {
      name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      type: "Coordinates",
      lat,
      lng
    };
  }

  const qLower = query.toLowerCase();

  // 2. Prominent Cities & Districts (checked first to match specific city before generic state)
  for (const loc of PROMINENT_INDIAN_LOCATIONS) {
    if (qLower.includes(loc.name.toLowerCase()) || (loc.name_hi && query.includes(loc.name_hi))) {
      return {
        name: loc.name,
        name_hi: loc.name_hi,
        state: loc.state,
        type: loc.type,
        lat: loc.lat,
        lng: loc.lng,
        terrain: loc.terrain
      };
    }
  }

  // 3. All 28 States & 8 UTs
  for (const st of ALL_INDIAN_STATES_UTS) {
    if (qLower.includes(st.name.toLowerCase()) || (st.name_hi && query.includes(st.name_hi))) {
      return {
        name: st.name,
        name_hi: st.name_hi,
        type: st.type,
        zone: st.zone,
        lat: st.lat,
        lng: st.lng,
        terrain: st.terrain
      };
    }
  }

  // 4. Common Indian macro regions
  const commonRegions = [
    { keywords: ["western ghat", "western ghats", "sahayadri", "पश्चिमी घाट"], name: "Western Ghats", state: "Maharashtra / Karnataka / Kerala", type: "Biodiversity Hotspot", lat: 13.5, lng: 75.3 },
    { keywords: ["himalaya", "himalayas", "himalayan", "हिमालय"], name: "Himalayas", state: "Uttarakhand / HP / J&K", type: "Mountain System", lat: 31.0, lng: 78.5 },
    { keywords: ["thar", "thar desert", "थार"], name: "Thar Desert", state: "Rajasthan", type: "Arid Zone", lat: 27.2, lng: 71.5 },
    { keywords: ["ganga", "ganges", "गंगा"], name: "Ganga Basin", state: "Uttar Pradesh / Bihar", type: "River Basin", lat: 25.8, lng: 82.5 },
    { keywords: ["brahmaputra", "ब्रह्मपुत्र"], name: "Brahmaputra Valley", state: "Assam", type: "River Basin", lat: 26.5, lng: 92.5 },
    { keywords: ["sundarban", "sundarbans", "सुंदरवन"], name: "Sundarbans", state: "West Bengal", type: "Delta Reserve", lat: 21.95, lng: 88.85 },
    { keywords: ["rann of kutch", "kutch", "कच्छ"], name: "Rann of Kutch", state: "Gujarat", type: "Salt Marsh", lat: 23.8, lng: 70.5 }
  ];

  for (const reg of commonRegions) {
    if (reg.keywords.some(k => qLower.includes(k))) {
      return reg;
    }
  }

  return null;
}

