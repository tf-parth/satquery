// SatQuery AI - Specialist Model Registry
// Adheres strictly to official SIH Problem Statement 26167.

export const MODEL_REGISTRY = {
  "remote_sensing_vqa": {
    "id": "remote_sensing_vqa",
    "name": "SatQuery RS-VQA Multimodal Model",
    "task": "single_image_vqa",
    "input": ["optical", "multispectral", "sar"],
    "output": ["text", "confidence", "evidence"],
    "description": "Natural language visual question answering on optical, multispectral, and SAR satellite rasters.",
    "status": "READY",
    "execution": "LIVE"
  },

  "captioning": {
    "id": "captioning",
    "name": "Remote Sensing Scene Captioner",
    "task": "scene_description",
    "input": ["optical", "multispectral"],
    "output": ["text", "confidence"],
    "description": "Generates holistic geographic and environmental scene descriptions.",
    "status": "READY",
    "execution": "LIVE"
  },

  "grounding": {
    "id": "grounding",
    "name": "Text-Guided Visual Grounding Engine",
    "task": "text_guided_grounding",
    "input": ["optical", "multispectral"],
    "output": ["bounding_boxes", "confidence"],
    "description": "Grounds natural-language queries (e.g., 'Highlight all buildings') into spatial coordinates.",
    "status": "READY",
    "execution": "LIVE"
  },

  "segmentation": {
    "id": "segmentation",
    "name": "Spectral Contour Region Segmentation",
    "task": "region_segmentation",
    "input": ["optical", "multispectral"],
    "output": ["masks", "confidence"],
    "description": "Generates precise polygon masks for segmented features.",
    "status": "READY",
    "execution": "LIVE"
  },

  "change_detection": {
    "id": "change_detection",
    "name": "Change Vector Analysis (CVA) & ChangeFormer",
    "task": "bi_temporal_change",
    "input": ["optical", "sar"],
    "output": ["change_map", "confidence", "hectares"],
    "description": "Calculates pixel-level difference vectors and produces quantified change maps.",
    "status": "READY",
    "execution": "LIVE"
  },

  "change_vqa": {
    "id": "change_vqa",
    "name": "Bi-Temporal Change Question Answering",
    "task": "change_question_answering",
    "input": ["image_t1", "image_t2"],
    "output": ["text", "evidence", "confidence"],
    "description": "Answers questions regarding landscape shifts, growth, and destruction across temporal pairs.",
    "status": "READY",
    "execution": "LIVE"
  },

  "optical_sar_fusion": {
    "id": "optical_sar_fusion",
    "name": "Cross-Modal Optical + SAR Structural-Spectral Fusion Engine",
    "task": "cross_modal_analysis",
    "input": ["optical", "sar"],
    "output": ["regions", "classes", "confidence"],
    "description": "Jointly processes optical reflectance and microwave radar backscatter for cloud-penetrating consensus.",
    "status": "READY",
    "execution": "LIVE"
  },

  "optical_spectral_analysis": {
    "id": "optical_spectral_analysis",
    "name": "Spectral Telemetry Engine (NDVI, NDWI, NDBI)",
    "task": "spectral_indices",
    "input": ["optical", "multispectral"],
    "output": ["indices", "statistics"],
    "description": "Extracts calibrated physical surface indices from calibrated multi-band rasters.",
    "status": "READY",
    "execution": "LIVE"
  },

  "sar_analysis": {
    "id": "sar_analysis",
    "name": "SAR Radar Backscatter Analyzer (SARAS-Net)",
    "task": "sar_backscatter_analysis",
    "input": ["sar"],
    "output": ["water_boundaries", "structural_reflectors"],
    "description": "Evaluates C-band/L-band radar backscatter coefficients (dB) for dielectric and roughness signatures.",
    "status": "READY",
    "execution": "LIVE"
  },

  "bigearthnet_adaptation": {
    "id": "bigearthnet_adaptation",
    "name": "BigEarthNet-Adapted Multispectral Classifier",
    "task": "remote_sensing_adaptation",
    "input": ["sentinel_2"],
    "output": ["corine_classes", "probabilities"],
    "description": "Adapted on BigEarthNet-19 standard remote-sensing benchmark dataset.",
    "status": "READY",
    "execution": "LIVE"
  }
};

export async function getLiveModelStatus() {
  try {
    const res = await fetch("http://127.0.0.1:8000/health", { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      return {
        aiServiceOnline: true,
        aiServiceHealth: data,
        models: Object.values(MODEL_REGISTRY).map(m => ({ ...m, status: "LIVE", execution: "LIVE" }))
      };
    }
  } catch (e) {
    // Microservice offline
  }

  return {
    aiServiceOnline: false,
    aiServiceHealth: { status: "OFFLINE", note: "Python AI microservice is standing by." },
    models: Object.values(MODEL_REGISTRY).map(m => ({ ...m, status: "READY", execution: "STANDBY" }))
  };
}
