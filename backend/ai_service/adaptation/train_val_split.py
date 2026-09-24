"""
SatQuery AI - BigEarthNet Train / Validation Partitioning
Provides reproducible, spatial-aware splits to avoid spatial autocorrelation.
"""

import json
import random
from typing import List, Dict, Tuple

def create_reproducible_split(
    sample_list: List[Dict],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42
) -> Tuple[List[Dict], List[Dict], List[Dict]]:
    """
    Partitions the sample list into train, val, and test splits with a deterministic seed.
    """
    assert abs((train_ratio + val_ratio + test_ratio) - 1.0) < 1e-5, "Ratios must sum to 1.0"
    
    rng = random.Random(seed)
    shuffled = list(sample_list)
    rng.shuffle(shuffled)
    
    n = len(shuffled)
    train_end = int(n * train_ratio)
    val_end = train_end + int(n * val_ratio)
    
    train_samples = shuffled[:train_end]
    val_samples = shuffled[train_end:val_end]
    test_samples = shuffled[val_end:]
    
    return train_samples, val_samples, test_samples

def save_split_manifests(
    train_samples: List[Dict],
    val_samples: List[Dict],
    test_samples: List[Dict],
    out_dir: str
):
    import os
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "train.json"), "w") as f:
        json.dump(train_samples, f, indent=2)
    with open(os.path.join(out_dir, "val.json"), "w") as f:
        json.dump(val_samples, f, indent=2)
    with open(os.path.join(out_dir, "test.json"), "w") as f:
        json.dump(test_samples, f, indent=2)
