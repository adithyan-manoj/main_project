import os
import time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification, get_linear_schedule_with_warmup
from peft import LoraConfig, get_peft_model, TaskType

MODEL_NAME = "ehsanaghaei/SecureBERT"
NUM_CLASSES = 6
BATCH_SIZE = 16
NUM_EPOCHS = 5
LEARNING_RATE = 2e-4
MAX_LENGTH = 128

# 1. Custom PyTorch Dataset
class CTIDataset(Dataset):
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

def train_model():
    print("=" * 70)
    print("🚀 STEP 5: GPU-ACCELERATED TRAINING LOOP (APPLE SILICON MPS) 🚀")
    print("=" * 70)

    # 1. Device Setup
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print("✅ Accelerator: Apple Silicon Metal Performance Shaders (device='mps')")
    else:
        device = torch.device("cpu")
        print("⚠️ Accelerator: MPS not available. Using CPU.")

    # 2. Paths
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "client", "data"))
    train_csv = os.path.join(data_dir, "train_cti.csv")
    val_csv = os.path.join(data_dir, "val_cti.csv")

    if not os.path.exists(train_csv) or not os.path.exists(val_csv):
        raise FileNotFoundError("Split datasets not found. Run Step 3 first.")

    # 3. Load Tokenizer & Datasets
    print("\n[1/5] Loading tokenizer and building PyTorch DataLoaders...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    train_dataset = CTIDataset(train_csv, tokenizer, max_length=MAX_LENGTH)
    val_dataset = CTIDataset(val_csv, tokenizer, max_length=MAX_LENGTH)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    print(f"  • Training Samples:   {len(train_dataset):,} (Batches: {len(train_loader)})")
    print(f"  • Validation Samples: {len(val_dataset):,} (Batches: {len(val_loader)})")
    print(f"  • Batch Size:         {BATCH_SIZE}")

    # 4. Model & LoRA Setup
    print("\n[2/5] Initializing base SecureBERT & attaching LoRA adapter...")
    id2label = {
        0: "Benign / Defensive Operations",
        1: "T1498: Denial of Service & Impact",
        2: "T1110: Brute Force & Credential Access",
        3: "T1059: Command and Scripting Interpreter",
        4: "T1190: Exploit Public-Facing Application",
        5: "T1098: Account Manipulation & Priv Escalation"
    }
    label2id = {v: k for k, v in id2label.items()}

    base_model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=NUM_CLASSES,
        id2label=id2label,
        label2id=label2id
    )

    lora_config = LoraConfig(
        task_type=TaskType.SEQ_CLS,
        r=8,
        lora_alpha=16,
        target_modules=["query", "value"],
        lora_dropout=0.05,
        bias="none"
    )
    model = get_peft_model(base_model, lora_config)
    model.to(device)

    # 5. Optimizer, Loss & Scheduler
    optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=0.01)
    criterion = nn.CrossEntropyLoss()
    total_steps = len(train_loader) * NUM_EPOCHS
    warmup_steps = int(0.1 * total_steps)
    scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=warmup_steps, num_training_steps=total_steps)

    print(f"\n[3/5] Optimizer & Hyperparameters:")
    print(f"  • Optimizer:        AdamW (lr={LEARNING_RATE}, weight_decay=0.01)")
    print(f"  • Scheduler:        Linear Warmup ({warmup_steps} steps) + Linear Decay")
    print(f"  • Total Steps:      {total_steps} (across {NUM_EPOCHS} epochs)")

    # 6. Training Loop
    print("\n" + "=" * 70)
    print("🏁 [4/5] STARTING TRAINING ON APPLE SILICON GPU...")
    print("=" * 70)

    best_val_acc = 0.0
    checkpoint_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "client", "models", "checkpoint_temp"))
    os.makedirs(checkpoint_dir, exist_ok=True)

    start_total_time = time.time()

    for epoch in range(1, NUM_EPOCHS + 1):
        epoch_start = time.time()
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        print(f"\n--- Epoch {epoch}/{NUM_EPOCHS} ---")
        for batch_idx, batch in enumerate(train_loader, 1):
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["label"].to(device)

            optimizer.zero_grad()
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            loss = criterion(logits, labels)

            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            scheduler.step()

            running_loss += loss.item()
            preds = torch.argmax(logits, dim=-1)
            correct_train += (preds == labels).sum().item()
            total_train += labels.size(0)

            # Print intermediate progress every 40 batches
            if batch_idx % 40 == 0 or batch_idx == len(train_loader):
                batch_loss = running_loss / batch_idx
                batch_acc = (correct_train / total_train) * 100
                current_lr = scheduler.get_last_lr()[0]
                print(f"  Step [{batch_idx:>3}/{len(train_loader)}] | Train Loss: {batch_loss:.4f} | Train Acc: {batch_acc:.1f}% | LR: {current_lr:.2e}")

        epoch_duration = time.time() - epoch_start
        train_acc = (correct_train / total_train) * 100
        avg_train_loss = running_loss / len(train_loader)

        # Validation Pass
        model.eval()
        val_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                labels = batch["label"].to(device)

                outputs = model(input_ids=input_ids, attention_mask=attention_mask)
                loss = criterion(outputs.logits, labels)
                val_loss += loss.item()

                preds = torch.argmax(outputs.logits, dim=-1)
                correct_val += (preds == labels).sum().item()
                total_val += labels.size(0)

        avg_val_loss = val_loss / len(val_loader)
        val_acc = (correct_val / total_val) * 100

        print(f"\n📊 Epoch {epoch} Summary ({epoch_duration:.1f}s):")
        print(f"  • Train Loss: {avg_train_loss:.4f} | Train Accuracy: {train_acc:.2f}%")
        print(f"  • Val Loss:   {avg_val_loss:.4f} | Val Accuracy:   {val_acc:.2f}%")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            print(f"  ⭐ New Best Validation Accuracy: {best_val_acc:.2f}%! Saving checkpoint...")
            model.save_pretrained(checkpoint_dir)
            tokenizer.save_pretrained(checkpoint_dir)

    total_training_time = time.time() - start_total_time
    print("\n" + "=" * 70)
    print(f"🎉 [5/5] TRAINING COMPLETE in {total_training_time:.1f} seconds! (Best Val Acc: {best_val_acc:.2f}%)")
    print(f"Saved candidate adapter checkpoint to: {checkpoint_dir}")
    print("=" * 70)

if __name__ == "__main__":
    train_model()

