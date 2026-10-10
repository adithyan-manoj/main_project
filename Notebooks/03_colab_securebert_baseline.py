import os
import torch
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model
from datasets import Dataset

def train_securebert_baseline():
    """
    Run this script in Google Colab to baseline-train SecureBERT using standard LoRA.
    This creates the initial "smart" model before we do any Federated Learning.
    """
    print("--- STEP 1: LOADING CTI MAPPING DATASET ---")
    # For the MVP, we use a mock Cyber Threat Intelligence dataset mapping.
    # It maps the raw attack labels from XGBoost into formal MITRE ATT&CK concepts.
    data = [
        {"text": "Network traffic spike indicating DoS Hulk", "label": 1},
        {"text": "Normal background HTTP browsing traffic", "label": 0},
        {"text": "Multiple failed SSH login attempts brute force", "label": 1},
        {"text": "Standard DNS resolution request", "label": 0},
        {"text": "Infiltration via malicious macro execution", "label": 1},
        {"text": "SYN Flood DDoS attack detected on port 80", "label": 1}
    ]
    df = pd.DataFrame(data)
    dataset = Dataset.from_pandas(df)
    
    print("\n--- STEP 2: LOADING SECUREBERT BASE MODEL ---")
    # SecureBERT is an NLP model trained on cybersecurity text
    model_name = "ehsanaghaei/SecureBERT"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # We load it for Sequence Classification (2 labels: Benign vs Specific Threat)
    base_model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
    
    def tokenize_function(examples):
        return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)

    tokenized_datasets = dataset.map(tokenize_function, batched=True)

    print("\n--- STEP 3: APPLYING PEFT LoRA ---")
    # We DO NOT train the entire SecureBERT model (it is too big). 
    # We freeze the base model and attach a tiny Low-Rank Adapter (LoRA) to it.
    lora_config = LoraConfig(
        r=8, 
        lora_alpha=32, 
        target_modules=["query", "value"], # We inject the adapter into the attention mechanism
        lora_dropout=0.05,
        bias="none",
        task_type="SEQ_CLS"
    )
    
    # This wraps the base model, freezing 99% of the parameters
    model = get_peft_model(base_model, lora_config)
    model.print_trainable_parameters()

    print("\n--- STEP 4: TRAINING THE ADAPTER ---")
    # Standard training loop (Not federated yet!)
    training_args = TrainingArguments(
        output_dir="./results",
        learning_rate=2e-4,
        per_device_train_batch_size=4,
        num_train_epochs=3,
        weight_decay=0.01,
        logging_steps=2
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_datasets,
    )

    trainer.train()

    print("\n--- STEP 5: EXPORTING ADAPTER TO GOOGLE DRIVE ---")
    # We ONLY save the tiny trained adapter weights, not the massive base model!
    export_path = '/content/drive/MyDrive/FedThreat_Data/SecureBERT_Baseline_Adapter'
    os.makedirs(export_path, exist_ok=True)
    model.save_pretrained(export_path)
    
    print(f"SUCCESS: Baseline LoRA adapter exported to {export_path}")

if __name__ == "__main__":
    train_securebert_baseline()
