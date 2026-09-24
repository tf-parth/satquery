"""
SatQuery AI - Remote Sensing Multi-Label Evaluation Engine
Computes standard multi-label metrics: Macro-F1, Micro-F1, Precision, Recall, and per-class metrics.
"""

import numpy as np
from typing import Dict, List, Tuple
try:
    from .preprocessing import BIGEARTHNET_CLASSES
except (ImportError, ValueError):
    from preprocessing import BIGEARTHNET_CLASSES

def sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-np.clip(x, -25.0, 25.0)))

def evaluate_predictions(
    y_true: np.ndarray,
    y_pred_logits: np.ndarray,
    threshold: float = 0.5,
    classes: List[str] = BIGEARTHNET_CLASSES
) -> Dict:
    """
    y_true: (N, C) binary matrix (0 or 1)
    y_pred_logits: (N, C) unnormalized logit values or probabilities
    """
    probs = sigmoid(y_pred_logits) if y_pred_logits.min() < 0.0 or y_pred_logits.max() > 1.0 else y_pred_logits
    preds = (probs >= threshold).astype(np.int32)
    y_true = y_true.astype(np.int32)

    num_samples, num_classes = y_true.shape
    
    # Micro metrics
    tp_micro = np.sum((preds == 1) & (y_true == 1))
    fp_micro = np.sum((preds == 1) & (y_true == 0))
    fn_micro = np.sum((preds == 0) & (y_true == 1))
    
    prec_micro = tp_micro / (tp_micro + fp_micro + 1e-6)
    rec_micro = tp_micro / (tp_micro + fn_micro + 1e-6)
    f1_micro = 2 * (prec_micro * rec_micro) / (prec_micro + rec_micro + 1e-6)

    # Macro & per-class metrics
    class_metrics = {}
    f1_list, prec_list, rec_list = [], [], []

    for c in range(num_classes):
        c_true = y_true[:, c]
        c_pred = preds[:, c]
        
        tp = np.sum((c_pred == 1) & (c_true == 1))
        fp = np.sum((c_pred == 1) & (c_true == 0))
        fn = np.sum((c_pred == 0) & (c_true == 1))
        
        prec = tp / (tp + fp + 1e-6)
        rec = tp / (tp + fn + 1e-6)
        f1 = 2 * (prec * rec) / (prec + rec + 1e-6)
        
        support = int(np.sum(c_true))
        class_name = classes[c] if c < len(classes) else f"Class_{c}"
        
        class_metrics[class_name] = {
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "support": support
        }
        
        if support > 0 or (tp + fp) > 0:
            f1_list.append(f1)
            prec_list.append(prec)
            rec_list.append(rec)

    f1_macro = np.mean(f1_list) if f1_list else 0.0
    prec_macro = np.mean(prec_list) if prec_list else 0.0
    rec_macro = np.mean(rec_list) if rec_list else 0.0

    return {
        "num_samples": num_samples,
        "f1_macro": round(float(f1_macro), 4),
        "f1_micro": round(float(f1_micro), 4),
        "precision_macro": round(float(prec_macro), 4),
        "recall_macro": round(float(rec_macro), 4),
        "per_class": class_metrics
    }
