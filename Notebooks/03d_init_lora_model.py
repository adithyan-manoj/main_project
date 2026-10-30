import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from peft import LoraConfig, get_peft_model, TaskType

MODEL_NAME = "ehsanaghaei/SecureBERT"
NUM_CLASSES = 6

def init_and_verify_lora():
    print("=" * 70)
    print("🧪 STEP 4: MODEL INITIALIZATION & PEFT LoRA INJECTION 🧪")
    print("=" * 70)

    # 1. Device Selection (Apple Silicon GPU / MPS vs CPU)
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print("✅ Hardware Accelerator: Apple Silicon GPU detected (device='mps')")
    else:
        device = torch.device("cpu")
        print("⚠️ Hardware Accelerator: MPS not available. Using CPU.")

    # 2. Load Base SecureBERT for 6-Class Sequence Classification
    print(f"\n[1/3] Downloading/Loading '{MODEL_NAME}' base model...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    # Label mappings
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
    print("✅ Base SecureBERT loaded with 6-class classification head.")

    # 3. Configure Low-Rank Adaptation (LoRA)
    print("\n[2/3] Configuring PEFT LoRA parameters...")
    lora_config = LoraConfig(
        task_type=TaskType.SEQ_CLS,
        r=8,                       # Rank dimension of low-rank matrices A and B
        lora_alpha=16,             # Scaling multiplier (alpha / r = 2.0)
        target_modules=["query", "value"], # Inject into self-attention projection layers
        lora_dropout=0.05,
        bias="none"
    )

    # Wrap base model with LoRA (freezes 99%+ of base weights)
    model = get_peft_model(base_model, lora_config)
    model.to(device)

    # 4. Display Parameter Statistics
    print("\n" + "=" * 70)
    print("📊 PARAMETER BUDGET BREAKDOWN (PEFT vs FULL FINE-TUNING)")
    print("=" * 70)
    trainable_params, all_param = model.get_nb_trainable_parameters()
    trainable_pct = 100 * trainable_params / all_param

    print(f"  • Base Model Architecture:       RoBERTa-base (12 Attention Layers, 768 Hidden Dim)")
    print(f"  • Total Parameters:              {all_param:,}")
    print(f"  • Trainable LoRA Parameters:     {trainable_params:,}")
    print(f"  • Frozen Parameters:             {all_param - trainable_params:,}")
    print(f"  • Trainable Percentage:          {trainable_pct:.2f}% (Over 99% of weights frozen!)")
    print(f"  • Estimated VRAM Allocation:     ~1.8 GB on Apple Unified Memory")
    print("=" * 70)

    # 5. Sanity Test Forward Pass on Apple Silicon GPU
    print("\n[3/3] Executing Sanity Forward Pass on Apple Silicon GPU...")
    test_text = "Anomalous TCP network flow targeting port 443 with 4500 forward packets"
    inputs = tokenizer(test_text, return_tensors="pt", max_length=128, padding="max_length", truncation=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        predicted_id = torch.argmax(logits, dim=-1).item()

    print(f"✅ Forward pass executed successfully on device: {device}!")
    print(f"  • Input Sequence:    \"{test_text}\"")
    print(f"  • Logits Tensor:     {logits.cpu().numpy().tolist()[0]}")
    print(f"  • Output Logits Dim: {logits.shape} (Matches 6 classes)")
    print(f"  • Initial Random ID: {predicted_id} ({id2label[predicted_id]})")
    print("\n🎉 STEP 4 COMPLETE: Model is loaded, LoRA-wrapped, and ready for Training Loop!")
    print("=" * 70)

if __name__ == "__main__":
    init_and_verify_lora()

