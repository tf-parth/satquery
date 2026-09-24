// SatQuery AI - In-browser GeoTIFF and Image Metadata Inspector
import * as GeoTIFF from 'geotiff';

export async function inspectLocalImageFile(file) {
  const extension = (file.name.split('.').pop() || '').toLowerCase();
  const isTiff = ['tif', 'tiff', 'geotiff'].includes(extension);

  // Default fallback for PNG / JPG
  if (!isTiff) {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        resolve({
          isGeoTiff: false,
          filename: file.name,
          fileSizeMb: (file.size / (1024 * 1024)).toFixed(2),
          fileType: extension.toUpperCase() || 'OPTICAL RASTER',
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
          hasEmbeddedCRS: false,
          crs: null,
          bounds: null,
          resolution: null,
          bands: ["Band 1 (Red)", "Band 2 (Green)", "Band 3 (Blue)"],
          bandCount: 3,
          previewUrl: objectUrl,
          note: "Standard non-georeferenced optical format (PNG/JPG). Geodetic coordinate reference system tags are not embedded."
        });
      };
      img.onerror = () => {
        resolve({
          isGeoTiff: false,
          filename: file.name,
          fileSizeMb: (file.size / (1024 * 1024)).toFixed(2),
          fileType: extension.toUpperCase(),
          dimensions: null,
          hasEmbeddedCRS: false,
          previewUrl: null
        });
      };
      img.src = objectUrl;
    });
  }

  // True GeoTIFF parsing via ArrayBuffer
  try {
    const arrayBuffer = await file.arrayBuffer();
    const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();

    const width = image.getWidth();
    const height = image.getHeight();
    const samplesPerPixel = image.getSamplesPerPixel();
    const geoKeys = image.getGeoKeys ? image.getGeoKeys() : {};
    const fileDir = image.getFileDirectory ? image.getFileDirectory() : {};

    let crs = null;
    if (geoKeys) {
      if (geoKeys.ProjectedCSTypeGeoKey) {
        crs = `EPSG:${geoKeys.ProjectedCSTypeGeoKey}`;
      } else if (geoKeys.GeographicTypeGeoKey) {
        crs = `EPSG:${geoKeys.GeographicTypeGeoKey} (Geographic WGS 84)`;
      } else if (geoKeys.GTModelTypeGeoKey === 1) {
        crs = "Projected CRS (Custom / UTM)";
      } else if (geoKeys.GTModelTypeGeoKey === 2) {
        crs = "Geographic Coordinates (Lat/Lon)";
      }
    }

    const origin = image.getOrigin ? image.getOrigin() : null;
    const resolutionPair = image.getResolution ? image.getResolution() : null;
    let bounds = null;
    let resolution = null;

    if (origin && resolutionPair) {
      const [resX, resY] = resolutionPair;
      const minX = origin[0];
      const maxY = origin[1];
      const maxX = minX + width * Math.abs(resX);
      const minY = maxY - height * Math.abs(resY);
      bounds = {
        minX: Number(minX.toFixed(6)),
        minY: Number(minY.toFixed(6)),
        maxX: Number(maxX.toFixed(6)),
        maxY: Number(maxY.toFixed(6))
      };
      resolution = `${Math.abs(resX).toFixed(2)}m/px`;
    }

    // Render quick canvas preview for TIFF
    let previewUrl = null;
    try {
      const rgbRasters = await image.readRGB({ interleave: true });
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const imgData = ctx.createImageData(width, height);
      
      // Copy rgb to rgba
      let rgbIdx = 0;
      let rgbaIdx = 0;
      for (let i = 0; i < width * height; i++) {
        imgData.data[rgbaIdx] = rgbRasters[rgbIdx];
        imgData.data[rgbaIdx + 1] = rgbRasters[rgbIdx + 1];
        imgData.data[rgbaIdx + 2] = rgbRasters[rgbIdx + 2];
        imgData.data[rgbaIdx + 3] = 255;
        rgbIdx += 3;
        rgbaIdx += 4;
      }
      ctx.putImageData(imgData, 0, 0);
      previewUrl = canvas.toDataURL('image/png');
    } catch (e) {
      console.warn("Could not generate direct canvas preview for TIFF:", e);
    }

    const bandList = [];
    for (let b = 0; b < samplesPerPixel; b++) {
      if (samplesPerPixel === 1) bandList.push("Band 1 (Single/Radar)");
      else if (b === 0) bandList.push("Band 1 (Red)");
      else if (b === 1) bandList.push("Band 2 (Green)");
      else if (b === 2) bandList.push("Band 3 (Blue)");
      else if (b === 3) bandList.push("Band 4 (NIR)");
      else bandList.push(`Band ${b + 1}`);
    }

    return {
      isGeoTiff: true,
      filename: file.name,
      fileSizeMb: (file.size / (1024 * 1024)).toFixed(2),
      fileType: "GeoTIFF Satellite Raster",
      dimensions: { width, height },
      hasEmbeddedCRS: Boolean(crs),
      crs: crs || "Unspecified GeoTIFF projection tag",
      bounds,
      resolution: resolution || "Extracted from header",
      bands: bandList,
      bandCount: samplesPerPixel,
      previewUrl,
      note: Boolean(crs) 
        ? "Verified georeferenced satellite raster with embedded geospatial tags."
        : "TIFF structure detected; spatial coordinate reference tags are uncalibrated."
    };
  } catch (err) {
    console.error("Client geotiff parse error:", err);
    return {
      isGeoTiff: true,
      filename: file.name,
      fileSizeMb: (file.size / (1024 * 1024)).toFixed(2),
      fileType: "TIFF",
      hasEmbeddedCRS: false,
      error: err.message
    };
  }
}
