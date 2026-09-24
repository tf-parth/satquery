"""
SatQuery AI - Checkpoint Saving & Loading Module
Handles persistence of fine-tuned remote sensing model weights, training telemetry, and metadata.
"""

import os
import json
import numpy as np
from typing import Dict, Any, Optional

def save_checkpoint(
    model: Any,
    epoch: int,
    metrics: Dict[str, Any],
    config: Dict[str, Any],
    checkpoint_dir: str,
    filename: str = "best_checkpoint.json"
) -> str:
    """
    Saves weights (or state dict) and training metadata into a structured checkpoint file.
    """
    os.makedirs(checkpoint_dir, exist_ok=True)
    filepath = os.path.join(checkpoint_dir, filename)

    metadata = {
        "framework": "PyTorch" if hasattr(model, "state_dict") else "StandaloneNumpy",
        "epoch": epoch,
        "metrics": metrics,
        "config": config,
        "timestamp": str(np.datetime64('now'))
    }

    if hasattr(model, "state_dict"):
        import torch
        pt_path = os.path.join(checkpoint_dir, filename.replace(".json", ".pt"))
        torch.save({
            "model_state_dict": model.state_dict(),
            "metadata": metadata
        }, pt_path)
        metadata["pt_weights_path"] = pt_path

    # Always persist JSON metadata for cross-platform portability
    with open(filepath, "w") as f:
        json.dump(metadata, f, indent=2)

    return filepath

def load_checkpoint_metadata(checkpoint_path: str) -> Dict[str, Any]:
    """
    Reads checkpoint JSON metadata.
    """
    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(f"Checkpoint not found at: {checkpoint_path}")
    with open(checkpoint_path, "r") as f:
        return json.load(f)
