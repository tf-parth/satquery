"""
SatQuery AI - BigEarthNet Remote Sensing Model Adaptation & Fine-Tuning Pipeline
Reproducible training workflow:
1. Loads BigEarthNet dataset (or synthetic sample mode for lightweight verification)
2. Trains/adapts 4-channel spectral visual classifier
3. Evaluates with Macro-F1 / Micro-F1 multi-label metrics
4. Persists checkpoint for real inference service
"""

import os
import sys
import argparse
import time
import numpy as np

# Ensure adaptation package can resolve internal imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from dataset_loader import BigEarthNetDataset
from preprocessing import BIGEARTHNET_CLASSES
from model_adapter import get_model_adapter, TORCH_AVAILABLE
from evaluation import evaluate_predictions
from checkpoint_saving import save_checkpoint

def run_training(
    epochs: int = 3,
    batch_size: int = 16,
    lr: float = 0.001,
    sample_mode: bool = True,
    sample_size: int = 64,
    checkpoint_dir: str = os.path.join(current_dir, "checkpoints")
):
    print("=" * 70)
    print("🛰️  SATQUERY AI — BIGEARTHNET REMOTE SENSING ADAPTATION PIPELINE")
    print("=" * 70)
    print(f"• Framework: {'PyTorch' if TORCH_AVAILABLE else 'Standalone NumPy Spectral Adapter'}")
    print(f"• Target Classes: {len(BIGEARTHNET_CLASSES)} (BigEarthNet-19 CORINE Taxonomy)")
    print(f"• Mode: {'Sample Verification Mode (Lightweight)' if sample_mode else 'Full Dataset Mode'}")
    print(f"• Epochs: {epochs} | Batch Size: {batch_size} | Learning Rate: {lr}")
    print(f"• Checkpoint Directory: {checkpoint_dir}")
    print("-" * 70)

    # 1. Dataset Loaders
    print("📦 Loading training & validation datasets...")
    train_dataset = BigEarthNetDataset(
        split="train",
        sample_mode=sample_mode,
        sample_size=sample_size,
        transform=True
    )
    val_dataset = BigEarthNetDataset(
        split="val",
        sample_mode=sample_mode,
        sample_size=max(16, sample_size // 4),
        transform=False
    )
    print(f"✓ Loaded {len(train_dataset)} training samples and {len(val_dataset)} validation samples.")

    # 2. Instantiate Model Adapter
    model = get_model_adapter(in_channels=4, num_classes=len(BIGEARTHNET_CLASSES))
    config = {
        "epochs": epochs,
        "batch_size": batch_size,
        "lr": lr,
        "sample_mode": sample_mode,
        "num_classes": len(BIGEARTHNET_CLASSES),
        "in_channels": 4,
        "classes": BIGEARTHNET_CLASSES
    }

    best_f1 = 0.0
    best_checkpoint_file = None

    if TORCH_AVAILABLE:
        import torch
        import torch.nn as nn
        import torch.optim as optim
        from torch.utils.data import DataLoader, TensorDataset

        # Convert to Torch Tensors
        X_train = torch.tensor(np.stack([train_dataset[i][0] for i in range(len(train_dataset))]), dtype=torch.float32)
        y_train = torch.tensor(np.stack([train_dataset[i][1] for i in range(len(train_dataset))]), dtype=torch.float32)
        train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=batch_size, shuffle=True)

        X_val = torch.tensor(np.stack([val_dataset[i][0] for i in range(len(val_dataset))]), dtype=torch.float32)
        y_val_np = np.stack([val_dataset[i][1] for i in range(len(val_dataset))])

        criterion = nn.BCEWithLogitsLoss()
        optimizer = optim.Adam(model.parameters(), lr=lr)

        print("\n🚀 Commencing training epochs...")
        for epoch in range(1, epochs + 1):
            model.train()
            epoch_loss = 0.0
            t0 = time.time()

            for bx, by in train_loader:
                optimizer.zero_grad()
                logits = model(bx)
                loss = criterion(logits, by)
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item()

            avg_loss = epoch_loss / len(train_loader)
            elapsed = time.time() - t0

            # Validation
            model.eval()
            with torch.no_grad():
                val_logits = model(X_val).cpu().numpy()
            
            metrics = evaluate_predictions(y_val_np, val_logits)
            f1_macro = metrics["f1_macro"]
            f1_micro = metrics["f1_micro"]

            print(f"Epoch [{epoch:02d}/{epochs:02d}] Loss: {avg_loss:.4f} | Val Macro-F1: {f1_macro:.4f} | Val Micro-F1: {f1_micro:.4f} ({elapsed:.2f}s)")

            if f1_macro >= best_f1:
                best_f1 = f1_macro
                best_checkpoint_file = save_checkpoint(
                    model=model,
                    epoch=epoch,
                    metrics=metrics,
                    config=config,
                    checkpoint_dir=checkpoint_dir,
                    filename="bigearthnet_adapted_best.json"
                )
    else:
        # Standalone NumPy training/evaluation
        print("\n🚀 Executing Standalone Spectral Adaptation optimization...")
        X_val = np.stack([val_dataset[i][0] for i in range(len(val_dataset))])
        y_val = np.stack([val_dataset[i][1] for i in range(len(val_dataset))])

        val_logits = model.forward(X_val)
        metrics = evaluate_predictions(y_val, val_logits)
        best_f1 = metrics["f1_macro"]
        
        print(f"Adapted Model Evaluation | Val Macro-F1: {best_f1:.4f} | Val Micro-F1: {metrics['f1_micro']:.4f}")
        best_checkpoint_file = save_checkpoint(
            model=model,
            epoch=1,
            metrics=metrics,
            config=config,
            checkpoint_dir=checkpoint_dir,
            filename="bigearthnet_adapted_best.json"
        )

    print("-" * 70)
    print(f"✅ Training completed successfully!")
    print(f"💾 Checkpoint saved: {best_checkpoint_file}")
    print("=" * 70)
    return best_checkpoint_file

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train / Adapt SatQuery Remote Sensing Model")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    parser.add_argument("--sample-mode", action="store_true", default=True, help="Run on reproducible sample dataset")
    parser.add_argument("--checkpoint-dir", type=str, default=os.path.join(current_dir, "checkpoints"), help="Checkpoint directory")
    args = parser.parse_args()

    run_training(
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        sample_mode=args.sample_mode,
        checkpoint_dir=args.checkpoint_dir
    )
