// SatQuery AI - Health Check Route
import express from 'express';

const router = express.Router();

router.get('/healthz', (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "SatQuery AI - India-Wide Multimodal Satellite Intelligence Assistant",
    version: "2.4.0",
    scope: "INDIA-WIDE (28 States, 8 UTs, Custom Coordinates & AOI)",
    lockedTechnicalStack: [
      "GeoChat (Multimodal RS-VQA & Grounding)",
      "GroundingDINO (Text-Guided Object Detection)",
      "SAM2 / SamGeo (Pixel-Level Zero-Shot Segmentation)",
      "rschange / ChangeFormer (Bi-Temporal Change Detection)",
      "SARAS-Net (Synthetic Aperture Radar Inundation & Penetration)",
      "SatCLIP (Satellite Foundation Embeddings & Land Cover)",
      "NDVI (Normalized Difference Vegetation Index)",
      "NDWI (Normalized Difference Water Index)",
      "NDBI (Normalized Difference Built-up Index)"
    ],
    supportedFormats: ["PNG", "JPG", "JPEG", "TIFF", "GeoTIFF"],
    languages: ["en", "hi", "hinglish"],
    timestamp: new Date().toISOString()
  });
});

export default router;
