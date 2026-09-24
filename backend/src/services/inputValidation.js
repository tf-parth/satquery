// SatQuery AI - Input Validation Layer
// Adheres strictly to Section 2 of official SIH Problem Statement 26167.

const SUPPORTED_EXTENSIONS = ['tif', 'tiff', 'geotiff', 'png', 'jpg', 'jpeg'];

export function validateInputPayload({
  files = [],
  task = "auto",
  modality = null,
  metadataList = [],
  demoId = null
}) {
  const result = {
    valid: true,
    error: null,
    suggestion: null,
    warnings: [],
    details: {}
  };

  // If a curated demo scene is specified and no manual files were uploaded, validate benchmark mode
  if ((!files || files.length === 0) && demoId) {
    return {
      valid: true,
      error: null,
      suggestion: null,
      warnings: ["Operating on calibrated Indian benchmark satellite scene."],
      details: { demoId, mode: "benchmark" }
    };
  }

  // 1. File existence
  if (!files || files.length === 0) {
    return {
      valid: false,
      error: "No satellite raster files provided.",
      suggestion: "Upload at least one GeoTIFF, TIFF, PNG, or JPEG satellite image, or select an Indian benchmark scene."
    };
  }

  // 2. Supported extensions & corrupt file check
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const name = f.originalname || f.name || `file_${i}`;
    const ext = (name.split('.').pop() || '').toLowerCase();

    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `Unsupported file format: '${ext}' for file '${name}'.`,
        suggestion: "Please upload valid GeoTIFF, TIFF, PNG, or JPEG files."
      };
    }

    if (!f.buffer && !f.size && (!f.path || f.size === 0)) {
      return {
        valid: false,
        error: `Corrupted or empty file detected: '${name}'.`,
        suggestion: "Ensure the file was completely uploaded and has non-zero size."
      };
    }
  }

  // 3. Task-specific image count & modality requirements
  if (task === "bi_temporal_change") {
    if (files.length < 2) {
      return {
        valid: false,
        error: "Bi-temporal change analysis requires exactly two images (Image T1 and Image T2).",
        suggestion: "Upload a baseline image (T1) and a subsequent observation image (T2) of the same geographic area."
      };
    }

    // Temporal relationship check
    if (metadataList.length >= 2) {
      const m1 = metadataList[0];
      const m2 = metadataList[1];
      if (m1?.acquisition_date && m2?.acquisition_date && m1.acquisition_date === m2.acquisition_date) {
        result.warnings.push("Both images have identical acquisition dates in their metadata. Verify they represent different timestamps.");
      }
    }
  }

  if (task === "cross_modal_analysis") {
    if (files.length < 2) {
      return {
        valid: false,
        error: "Cross-modal analysis requires both an Optical/Multispectral image and a SAR image.",
        suggestion: "Upload a co-registered Optical/Multispectral raster and a Synthetic Aperture Radar (SAR) raster."
      };
    }
  }

  // 4. Spatial compatibility & co-registration checks for image pairs
  if (files.length >= 2 && metadataList.length >= 2) {
    const m1 = metadataList[0];
    const m2 = metadataList[1];

    // Dimension aspect ratio check
    if (m1?.dimensions && m2?.dimensions) {
      const ratio1 = m1.dimensions.width / (m1.dimensions.height || 1);
      const ratio2 = m2.dimensions.width / (m2.dimensions.height || 1);
      if (Math.abs(ratio1 - ratio2) > 0.35) {
        result.warnings.push("Aspect ratio mismatch between image pair. Automatic spatial re-alignment will be applied.");
      }
    }

    // CRS & Bounds compatibility
    if (m1?.has_embedded_crs && m2?.has_embedded_crs) {
      if (m1.crs !== m2.crs) {
        result.warnings.push(`CRS difference detected: '${m1.crs}' vs '${m2.crs}'. Auto-reprojection will align spatial footprints.`);
      }

      if (m1.bounds && m2.bounds) {
        // Check bounding box overlap
        const xOverlap = Math.max(0, Math.min(m1.bounds.maxX, m2.bounds.maxX) - Math.max(m1.bounds.minX, m2.bounds.minX));
        const yOverlap = Math.max(0, Math.min(m1.bounds.maxY, m2.bounds.maxY) - Math.max(m1.bounds.minY, m2.bounds.minY));
        if (xOverlap <= 0 || yOverlap <= 0) {
          return {
            valid: false,
            error: "The provided images do not share overlapping geographic boundaries.",
            suggestion: "Upload co-registered images covering the same geographic area."
          };
        }
      }
    }
  }

  result.details = {
    fileCount: files.length,
    filenames: files.map(f => f.originalname || f.name),
    taskVerified: task
  };

  return result;
}
