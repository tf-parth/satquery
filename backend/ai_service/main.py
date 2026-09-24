"""
SatQuery AI - Python AI Inference Service (FastAPI)
Real Remote Sensing Vision-Language and Multimodal Geospatial Microservice
Aligned with SIH Problem Statement 26167.
"""

import sys
import os
import io
import time
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure utf-8 encoding on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from geospatial_raster import read_raster_bytes, generate_base64_preview, compute_spectral_indices
from vqa_grounding_engine import run_single_image_vqa_and_grounding
from change_detection_engine import run_bitemporal_change_detection
from optical_sar_fusion import run_optical_sar_fusion_analysis

app = FastAPI(
    title="SatQuery AI - Remote Sensing Multimodal Inference Service",
    description="Genuine Remote Sensing Vision-Language & Multimodal AI Microservice (SIH 26167)",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "SatQuery AI Remote Sensing Inference Microservice",
        "version": "2.0.0",
        "status": "OPERATIONAL",
        "documentation": "/docs",
        "endpoints": [
            "POST /infer/single-vqa",
            "POST /infer/grounding",
            "POST /infer/change-detection",
            "POST /infer/cross-modal-fusion",
            "POST /infer/validate-rasters",
            "GET /infer/models",
            "GET /health"
        ]
    }

@app.get("/health")
def health_check():
    import rasterio
    import numpy as np
    import cv2
    import transformers
    try:
        import torch
        torch_status = "Available (CUDA)" if torch.cuda.is_available() else "Available (CPU)"
    except ImportError:
        torch_status = "Standalone NumPy Engine"

    return {
        "status": "HEALTHY",
        "service": "satquery-ai-microservice",
        "python_version": sys.version.split(" ")[0],
        "rasterio": rasterio.__version__,
        "numpy": np.__version__,
        "opencv": cv2.__version__,
        "transformers": transformers.__version__,
        "torch": torch_status,
        "execution_mode": "LIVE_INFERENCE"
    }

@app.get("/infer/models")
def get_model_registry():
    return {
        "status": "SUCCESS",
        "models": [
            {
                "id": "remote_sensing_vqa",
                "name": "SatQuery RS-VQA Foundation Model",
                "task": "single_image_vqa",
                "status": "LIVE",
                "input": ["optical", "multispectral", "sar"],
                "output": ["natural_language_answer", "confidence", "evidence"],
                "execution": "LIVE"
            },
            {
                "id": "captioning",
                "name": "Remote Sensing Scene Captioner",
                "task": "scene_description",
                "status": "LIVE",
                "input": ["optical", "multispectral"],
                "output": ["text", "confidence"],
                "execution": "LIVE"
            },
            {
                "id": "grounding",
                "name": "Text-Guided Visual Grounding Engine",
                "task": "text_guided_grounding",
                "status": "LIVE",
                "input": ["optical", "multispectral"],
                "output": ["bounding_boxes", "confidence"],
                "execution": "LIVE"
            },
            {
                "id": "segmentation",
                "name": "Spectral Contour Segmentation",
                "task": "region_segmentation",
                "status": "LIVE",
                "input": ["optical", "multispectral"],
                "output": ["polygons", "masks"],
                "execution": "LIVE"
            },
            {
                "id": "change_detection",
                "name": "Change Vector Analysis (CVA) & ChangeFormer Engine",
                "task": "bi_temporal_change",
                "status": "LIVE",
                "input": ["optical", "sar"],
                "output": ["change_map", "hectare_metrics", "confidence"],
                "execution": "LIVE"
            },
            {
                "id": "change_vqa",
                "name": "Bi-Temporal Change VQA Engine",
                "task": "change_question_answering",
                "status": "LIVE",
                "input": ["image_t1", "image_t2"],
                "output": ["text", "evidence", "confidence"],
                "execution": "LIVE"
            },
            {
                "id": "optical_sar_fusion",
                "name": "Cross-Modal Optical + SAR Structural-Spectral Fusion Engine",
                "task": "cross_modal_analysis",
                "status": "LIVE",
                "input": ["optical", "sar"],
                "output": ["water_regions", "built_up_regions", "vegetation_regions", "confidence"],
                "execution": "LIVE"
            },
            {
                "id": "bigearthnet_adapter",
                "name": "BigEarthNet-Adapted Multispectral Classifier",
                "task": "remote_sensing_adaptation",
                "status": "LIVE",
                "input": ["sentinel_2_multispectral"],
                "output": ["corine_classes", "probabilities"],
                "execution": "LIVE"
            }
        ]
    }

@app.post("/infer/single-vqa")
async def single_image_vqa(
    image: UploadFile = File(...),
    query: str = Form("Explain this satellite image"),
    language: str = Form("en")
):
    try:
        t0 = time.time()
        file_bytes = await image.read()
        parsed = read_raster_bytes(file_bytes, image.filename)
        raster_arr = parsed["raster_array"]

        result = run_single_image_vqa_and_grounding(
            raster_array=raster_arr,
            query=query,
            metadata=parsed,
            language=language
        )

        preview_url = generate_base64_preview(raster_arr)
        elapsed = round((time.time() - t0) * 1000.0, 1)

        clean_metadata = {k: v for k, v in parsed.items() if k != "raster_array"}
        clean_metadata["previewUrl"] = preview_url

        return {
            "status": "SUCCESS",
            "task": "single_image_vqa",
            "query": query,
            "language": language,
            "answer": result["answer"],
            "explanation": result["explanation"],
            "confidence": result["confidence"],
            "detections": result["detections"],
            "segments": result["segments"],
            "evidence": result["evidence"],
            "metadata": clean_metadata,
            "adaptation": result["adaptation"],
            "latency_ms": elapsed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/infer/grounding")
async def text_guided_grounding(
    image: UploadFile = File(...),
    prompt: str = Form("Highlight all buildings"),
    language: str = Form("en")
):
    try:
        t0 = time.time()
        file_bytes = await image.read()
        parsed = read_raster_bytes(file_bytes, image.filename)
        raster_arr = parsed["raster_array"]

        result = run_single_image_vqa_and_grounding(
            raster_array=raster_arr,
            query=prompt,
            metadata=parsed,
            language=language
        )
        elapsed = round((time.time() - t0) * 1000.0, 1)

        return {
            "status": "SUCCESS",
            "task": "text_guided_grounding",
            "prompt": prompt,
            "detections": result["detections"],
            "segments": result["segments"],
            "confidence": result["confidence"],
            "evidence": result["evidence"],
            "latency_ms": elapsed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/infer/change-detection")
async def bi_temporal_change(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
    query: str = Form("What changed between these two images?"),
    language: str = Form("en")
):
    try:
        t0 = time.time()
        b1 = await image1.read()
        b2 = await image2.read()

        p1 = read_raster_bytes(b1, image1.filename)
        p2 = read_raster_bytes(b2, image2.filename)

        res = run_bitemporal_change_detection(
            t1_array=p1["raster_array"],
            t2_array=p2["raster_array"],
            t1_meta=p1,
            t2_meta=p2,
            query=query,
            language=language
        )

        elapsed = round((time.time() - t0) * 1000.0, 1)
        res["status"] = "SUCCESS"
        res["latency_ms"] = elapsed
        res["t1_metadata"] = {k: v for k, v in p1.items() if k != "raster_array"}
        res["t2_metadata"] = {k: v for k, v in p2.items() if k != "raster_array"}

        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/infer/cross-modal-fusion")
async def cross_modal_fusion(
    optical: UploadFile = File(...),
    sar: UploadFile = File(...),
    query: str = Form("Use the optical and SAR images to identify water and built-up regions"),
    language: str = Form("en")
):
    try:
        t0 = time.time()
        b_opt = await optical.read()
        b_sar = await sar.read()

        p_opt = read_raster_bytes(b_opt, optical.filename)
        p_sar = read_raster_bytes(b_sar, sar.filename)

        res = run_optical_sar_fusion_analysis(
            optical_array=p_opt["raster_array"],
            sar_array=p_sar["raster_array"],
            optical_meta=p_opt,
            sar_meta=p_sar,
            query=query,
            language=language
        )

        elapsed = round((time.time() - t0) * 1000.0, 1)
        res["status"] = "SUCCESS"
        res["latency_ms"] = elapsed
        res["optical_metadata"] = {k: v for k, v in p_opt.items() if k != "raster_array"}
        res["sar_metadata"] = {k: v for k, v in p_sar.items() if k != "raster_array"}

        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/infer/validate-rasters")
async def validate_rasters(
    files: List[UploadFile] = File(...),
    modality: Optional[str] = Form(None)
):
    try:
        report = []
        for f in files:
            content = await f.read()
            parsed = read_raster_bytes(content, f.filename)
            report.append({
                "filename": f.filename,
                "is_geotiff": parsed["is_geotiff"],
                "has_embedded_crs": parsed["has_embedded_crs"],
                "crs": parsed["crs"],
                "dimensions": parsed["dimensions"],
                "resolution": parsed["resolution"],
                "band_count": parsed["band_count"],
                "acquisition_date": parsed["acquisition_date"]
            })
        return {"status": "SUCCESS", "rasters": report}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
