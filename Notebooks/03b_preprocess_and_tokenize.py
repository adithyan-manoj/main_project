import os
import pandas as pd
import torch
from transformers import AutoTokenizer
from datasets import Dataset

MODEL_NAME = "ehsanaghaei/SecureBERT"
MAX_LENGTH = 128

def inspect_and_tokenize():
    print("=" * 70)
    print("🧪 STEP 2: TOKENIZATION & PREPROCESSING PIPELINE 🧪")
    print("=" * 70)

    # 1. Load Real CTI Dataset
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "client", "data", "real_cti_dataset.csv"))
    if not os.path.exists(csv_path):
        # Fallback to cti_narratives_dataset.csv if needed
        csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "client", "data", "cti_narratives_dataset.csv"))
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Dataset not found! Run Step 1 first.")
    
    df = pd.read_csv(csv_path)
    print(f"✅ Loaded 100% Real CTI Dataset: {len(df):,} records from {csv_path}")

    # 2. Load the SecureBERT Domain-Specific Tokenizer
    print(f"\n[Tokenizer] Initializing tokenizer from HuggingFace: '{MODEL_NAME}'...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    print(f"✅ Tokenizer loaded successfully.")
    print(f"  • Vocabulary Size:       {tokenizer.vocab_size:,} tokens")
    print(f"  • Special Tokens:         BOS={tokenizer.bos_token} (ID:{tokenizer.bos_token_id}), EOS={tokenizer.eos_token} (ID:{tokenizer.eos_token_id}), PAD={tokenizer.pad_token} (ID:{tokenizer.pad_token_id})")
    print(f"  • Fixed Max Sequence:     {MAX_LENGTH} tokens")

    # 3. Educational Demonstration: Tokenizing a Single Sample
    demo_sample = df.iloc[0]
    raw_text = demo_sample["text"]
    raw_label = demo_sample["label"]
    raw_class = demo_sample.get("label_name", demo_sample.get("class_name", f"Class {raw_label}"))

    print("\n" + "-" * 70)
    print("📖 EDUCATIONAL BREAKDOWN: HOW SECUREBERT SEES A CYBER INCIDENT")
    print("-" * 70)
    print(f"Original Text (Class {raw_label} - {raw_class}):\n  \"{raw_text}\"\n")

    encoded_demo = tokenizer(
        raw_text,
        max_length=MAX_LENGTH,
        padding="max_length",
        truncation=True,
        return_tensors="pt"
    )

    tokens = tokenizer.convert_ids_to_tokens(encoded_demo["input_ids"][0])
    # Filter out trailing padding tokens for readability
    non_pad_tokens = [t for t in tokens if t != tokenizer.pad_token]

    print("1. Sub-word Token Sequence (Byte-Pair Encoding):")
    print(f"   {non_pad_tokens[:18]} ... (+ {len(non_pad_tokens)-18} more tokens)\n")

    print(f"2. Numerical Token IDs (`input_ids` shape: {encoded_demo['input_ids'].shape}):")
    print(f"   First 15 IDs: {encoded_demo['input_ids'][0][:15].tolist()} ...")
    print(f"   Trailing IDs (Padding = {tokenizer.pad_token_id}): {encoded_demo['input_ids'][0][-5:].tolist()}\n")

    print(f"3. Attention Mask (`attention_mask` shape: {encoded_demo['attention_mask'].shape}):")
    print(f"   First 15 flags: {encoded_demo['attention_mask'][0][:15].tolist()} (1 = attend to word)")
    print(f"   Trailing flags: {encoded_demo['attention_mask'][0][-5:].tolist()} (0 = ignore padding)")
    print("-" * 70)

    # 4. Batch Tokenization across entire dataset
    print(f"\n[Batch Processing] Tokenizing all {len(df):,} dataset samples...")
    raw_dataset = Dataset.from_pandas(df[["text", "label"]])

    def tokenize_fn(batch):
        return tokenizer(
            batch["text"],
            max_length=MAX_LENGTH,
            padding="max_length",
            truncation=True
        )

    tokenized_dataset = raw_dataset.map(tokenize_fn, batched=True, batch_size=1000)
    tokenized_dataset = tokenized_dataset.rename_column("label", "labels")
    tokenized_dataset.set_format("torch", columns=["input_ids", "attention_mask", "labels"])

    print(f"✅ All {len(df):,} records successfully preprocessed and tokenized!")
    print(f"  • Total Dataset Features: {tokenized_dataset.column_names}")
    print(f"  • Sample Record Tensor Types: input_ids={type(tokenized_dataset[0]['input_ids'])}, labels={type(tokenized_dataset[0]['labels'])}")
    print("=" * 70)

    return tokenizer, tokenized_dataset

if __name__ == "__main__":
    inspect_and_tokenize()

