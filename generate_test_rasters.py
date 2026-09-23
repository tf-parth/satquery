"""
Generates synthetic genuine GeoTIFF remote sensing test rasters for SIH 26167 testing.
- test_optical_t1.tif: 4-band optical/multispectral (B, G, R, NIR), EPSG:4326
- test_optical_t2.tif: 4-band optical with altered vegetation and urban expansion
- test_sar.tif: 2-band SAR (VV, VH) radar backscatter
"""
import rasterio
from rasterio.transform import from_origin
import numpy as np

transform = from_origin(72.87, 19.07, 0.0001, 0.0001) # ~10m resolution in degrees
crs = 'EPSG:4326'
width, height = 128, 128

# 1. Optical T1: 4 bands (Blue, Green, Red, NIR)
# Let's create water (low NIR, low Red), vegetation (high NIR, low Red), urban (moderate all)
np.random.seed(42)
b1_blue = np.full((height, width), 800, dtype=np.uint16)
b2_green = np.full((height, width), 900, dtype=np.uint16)
b3_red = np.full((height, width), 700, dtype=np.uint16)
b4_nir = np.full((height, width), 3500, dtype=np.uint16) # strong vegetation

# Water body in top-left
b1_blue[:40, :40] = 1200
b2_green[:40, :40] = 800
b3_red[:40, :40] = 400
b4_nir[:40, :40] = 200 # near zero in NIR for water

# Built-up cluster in center
b1_blue[50:80, 50:80] = 1800
b2_green[50:80, 50:80] = 1900
b3_red[50:80, 50:80] = 2000
b4_nir[50:80, 50:80] = 2100

with rasterio.open(
    'test_optical_t1.tif',
    'w',
    driver='GTiff',
    height=height,
    width=width,
    count=4,
    dtype=np.uint16,
    crs=crs,
    transform=transform,
) as dst:
    dst.write(b1_blue, 1)
    dst.write(b2_green, 2)
    dst.write(b3_red, 3)
    dst.write(b4_nir, 4)

print("Created test_optical_t1.tif")

# 2. Optical T2: Vegetation cleared in bottom-right (deforestation/urban sprawl)
b1_t2 = b1_blue.copy()
b2_t2 = b2_green.copy()
b3_t2 = b3_red.copy()
b4_t2 = b4_nir.copy()

# Clear vegetation in bottom-right (from NIR 3500 down to 1000, red up to 1800)
b3_t2[80:120, 80:120] = 1800
b4_t2[80:120, 80:120] = 1100

with rasterio.open(
    'test_optical_t2.tif',
    'w',
    driver='GTiff',
    height=height,
    width=width,
    count=4,
    dtype=np.uint16,
    crs=crs,
    transform=transform,
) as dst:
    dst.write(b1_t2, 1)
    dst.write(b2_t2, 2)
    dst.write(b3_t2, 3)
    dst.write(b4_t2, 4)

print("Created test_optical_t2.tif")

# 3. SAR GeoTIFF: 2 bands (VV, VH)
# Water has very low backscatter (smooth specular reflection)
# Urban has very high backscatter (double-bounce)
# Vegetation has moderate volume scattering
vv = np.full((height, width), -12.0, dtype=np.float32) # vegetation
vh = np.full((height, width), -18.0, dtype=np.float32)

# Water
vv[:40, :40] = -24.0
vh[:40, :40] = -28.0

# Urban
vv[50:80, 50:80] = -4.0
vh[50:80, 50:80] = -9.0

with rasterio.open(
    'test_sar.tif',
    'w',
    driver='GTiff',
    height=height,
    width=width,
    count=2,
    dtype=np.float32,
    crs=crs,
    transform=transform,
) as dst:
    dst.write(vv, 1)
    dst.write(vh, 2)

print("Created test_sar.tif")
