"""
=============================================================================
FedThreat - Step 6: Holdout Test Set Evaluation & Deployment
=============================================================================
Evaluates the fine-tuned SecureBERT + LoRA model on the held-out test set
(client/data/test_cti.csv, 237 unseen real CTI samples).
Generates:
  • Overall Test Accuracy
  • Per-Class Precision, Recall, and F1-Score
  • Text-based Confusion Matrix
  • Exports final weights to both client/ and server/ model directories
=============================================================================
"""

import os
import shutil
import torch
import pandas as pd
from torch.utils.data import DataLoader, Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from peft import PeftModel
from sklearn.metrics import classification_report, confusion_matrix

MODEL_NAME = "ehsanaghaei/SecureBERT"
NUM_CLASSES = 6
BATCH_SIZE = 16
MAX_LENGTH = 128

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CHECKPOINT_DIR = os.path.join(PROJECT_ROOT, "client", "models", "checkpoint_temp")
TEST_CSV = os.path.join(PROJECT_ROOT, "client", "data", "test_cti.csv")

CLIENT_TARGET_DIR = os.path.join(PROJECT_ROOT, "client", "models", "securebert_lora")
SERVER_TARGET_DIR = os.path.join(PROJECT_ROOT, "server", "models", "global_lora_base")

CLASS_NAMES = [
    "Benign / Defensive Operations",
    "T1498: Denial of Service & Impact",
    "T1110: Brute Force & Credential Access",
    "T1059: Command and Scripting Interpreter",
    "T1190: Exploit Public-Facing Application",
    "T1098: Account Manipulation & Priv Escalation"
]

class CTITestDataset(Dataset):
    def __init__(self, csv_path, tokenizer, max_length=128):
        df = pd.read_csv(csv_path)
        self.texts = df["text"].tolist()
        self.labels = df["label"].tolist()
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = int(self.labels[idx])
        encoding = self.tokenizer(
            text,
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )
        return {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "label": torch.tensor(label, dtype=torch.long)
        }

def evaluate_test_set():
    print("=" * 72)
    print("🧪 STEP 6: HOLDOUT TEST SET EVALUATION & VERIFICATION 🧪")
    print("=" * 72)

    # 1. Hardware Selection
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print("✅ Accelerator: Apple Silicon GPU (device='mps')")
    else:
        device = torch.device("cpu")
        print("⚠️ Accelerator: Using CPU")

    if not os.path.exists(CHECKPOINT_DIR):
        raise FileNotFoundError(f"Checkpoint not found at: {CHECKPOINT_DIR}! Run Step 5 first.")

    if not os.path.exists(TEST_CSV):
        raise FileNotFoundError(f"Test dataset missing at: {TEST_CSV}! Run Step 3 first.")

    # 2. Load Tokenizer & Model
    print(f"\n[1/3] Loading Best Candidate Checkpoint from: {CHECKPOINT_DIR}...")
    tokenizer = AutoTokenizer.from_pretrained(CHECKPOINT_DIR)

    id2label = {i: name for i, name in enumerate(CLASS_NAMES)}
    label2id = {v: k for k, v in id2label.items()}

    base_model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=NUM_CLASSES,
        id2label=id2label,
        label2id=label2id
    )
    model = PeftModel.from_pretrained(base_model, CHECKPOINT_DIR)
    model.to(device)
    model.eval()

    # 3. Build Test DataLoader
    test_dataset = CTITestDataset(TEST_CSV, tokenizer, max_length=MAX_LENGTH)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)
    print(f"✅ Loaded holdout test set: {len(test_dataset)} unseen real CTI samples.")

    # 4. Evaluation Loop
    print("\n[2/3] Executing Model Inference across Unseen Holdout Samples...")
    all_preds = []
    all_labels = []

    with torch.no_grad():
        for batch in test_loader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["label"].to(device)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            preds = torch.argmax(outputs.logits, dim=-1)

            all_preds.extend(preds.cpu().tolist())
            all_labels.extend(labels.cpu().tolist())

    # 5. Metrics & Reports
    print("\n" + "=" * 72)
    print("📊 CLASSIFICATION PERFORMANCE REPORT (ON REAL UNSEEN CTI TEXT)")
    print("=" * 72)

    report = classification_report(
        all_labels,
        all_preds,
        target_names=[f"Class {i}: {name[:28]}" for i, name in enumerate(CLASS_NAMES)],
        digits=4
    )
    print(report)

    cm = confusion_matrix(all_labels, all_preds)
    print("\n" + "=" * 72)
    print("🔍 CONFUSION MATRIX (Rows: Actual True Class | Columns: Model Prediction)")
    print("=" * 72)
    header = "       " + " ".join([f"C{i:>4}" for i in range(NUM_CLASSES)])
    print(header)
    print("-" * 38)
    for i, row in enumerate(cm):
        row_str = f"True C{i}: " + " ".join([f"{val:>4}" for val in row])
        print(row_str)
    print("=" * 72)

    # 6. Deploy & Export Weights
    print("\n[3/3] Deploying Validated LoRA Adapter Weights to Production Paths...")
    for target_dir in [CLIENT_TARGET_DIR, SERVER_TARGET_DIR]:
        os.makedirs(target_dir, exist_ok=True)
        for fname in os.listdir(CHECKPOINT_DIR):
            src_f = os.path.join(CHECKPOINT_DIR, fname)
            dst_f = os.path.join(target_dir, fname)
            if os.path.isfile(src_f):
                shutil.copy2(src_f, dst_f)
        print(f"  • Successfully exported weights to: {target_dir}")

    print("\n" + "=" * 72)
    print("🎉 STEP 6 COMPLETE: SecureBERT LoRA is fully trained, evaluated, and deployed!")
    print("=" * 72)

if __name__ == "__main__":
    evaluate_test_set()

