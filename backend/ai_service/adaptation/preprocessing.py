"""
SatQuery AI - Remote Sensing Adaptation Preprocessing Pipeline
Normalizes Sentinel-2 and Landsat multispectral reflectance values, performs
band calibration, cloud-shadow mask handling, and patch augmentations.
"""

import numpy as np
from PIL import Image

# Sentinel-2 Level-2A BOA standard normalization constants (mean/std per band)
# Bands: B02 (Blue), B03 (Green), B04 (Red), B08 (NIR)
S2_MEANS = np.array([1353.72, 1117.20, 1041.80, 2265.41], dtype=np.float32)
S2_STDS = np.array([653.23, 584.00, 676.60, 1099.50], dtype=np.float32)

BIGEARTHNET_CLASSES = [
    "Urban fabric",
    "Industrial or commercial units",
    "Arable land",
    "Permanent crops",
    "Pastures",
    "Complex cultivation patterns",
    "Land principally occupied by agriculture with significant natural vegetation",
    "Agro-forestry areas",
    "Broad-leaved forest",
    "Coniferous forest",
    "Mixed forest",
    "Natural grassland and sparsely vegetated areas",
    "Moors, heathland and sclerophyllous vegetation",
    "Transitional woodland, shrub",
    "Beaches, dunes, sands",
    "Inland wetlands",
    "Coastal wetlands",
    "Inland waters",
    "Marine waters"
]

def normalize_multispectral_patch(patch_array: np.ndarray, apply_standardization: bool = True) -> np.ndarray:
    """
    Normalizes a multispectral patch (H, W, C) where C is typically 3 (RGB) or 4 (RGB+NIR).
    Sentinel-2 L2A values are integers in [0, 10000] representing surface reflectance * 10000.
    """
    arr = patch_array.astype(np.float32)
    
    # Clip extreme cloud glint outliers above 10,000 BOA reflectance
    arr = np.clip(arr, 0.0, 10000.0)
    
    if apply_standardization and arr.shape[-1] == 4:
        # Standardize against global BigEarthNet channel statistics
        arr = (arr - S2_MEANS) / (S2_STDS + 1e-6)
    else:
        # Min-max scale to [0, 1]
        arr = arr / 10000.0 if arr.max() > 1.0 else arr
        
    return arr

def convert_to_display_rgb(raster_data: np.ndarray) -> Image.Image:
    """
    Converts multi-band raster data (H, W, C) into an 8-bit RGB Pillow image with percentile stretch.
    """
    if raster_data.ndim == 2:
        # Grayscale / single band (e.g. SAR or NDVI)
        p2, p98 = np.percentile(raster_data, (2, 98))
        stretched = np.clip((raster_data - p2) / (p98 - p2 + 1e-6) * 255.0, 0, 255).astype(np.uint8)
        return Image.fromarray(stretched, mode='L').convert('RGB')
    
    if raster_data.shape[-1] >= 3:
        # Take first 3 bands (or R, G, B order)
        rgb = raster_data[..., :3].astype(np.float32)
        out = np.zeros_like(rgb, dtype=np.uint8)
        for c in range(3):
            band = rgb[..., c]
            p2, p98 = np.percentile(band, (2, 98))
            if p98 > p2:
                stretched = np.clip((band - p2) / (p98 - p2) * 255.0, 0, 255).astype(np.uint8)
            else:
                stretched = np.clip(band, 0, 255).astype(np.uint8)
            out[..., c] = stretched
        return Image.fromarray(out, mode='RGB')
    
    raise ValueError(f"Unsupported raster shape: {raster_data.shape}")

def augment_patch(patch: np.ndarray, seed: int = None) -> np.ndarray:
    """
    Applies geospatial symmetry-invariant augmentations: 90-degree rotations, flips.
    Satellite overhead views are rotationally invariant.
    """
    if seed is not None:
        np.random.seed(seed)
    
    k = np.random.randint(0, 4)
    patch = np.rot90(patch, k=k, axes=(0, 1))
    
    if np.random.rand() > 0.5:
        patch = np.fliplr(patch)
    if np.random.rand() > 0.5:
        patch = np.flipud(patch)
        
    return patch
