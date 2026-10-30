import os
import pandas as pd
from sklearn.model_selection import train_test_split

def perform_stratified_split():
    print("=" * 70)
    print("🧪 STEP 3: STRATIFIED TRAIN / VALIDATION / TEST SPLIT 🧪")
    print("=" * 70)

    # 1. Load the real CTI dataset
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "client", "data", "real_cti_dataset.csv"))
    if not os.path.exists(csv_path):
        csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "client", "data", "cti_narratives_dataset.csv"))
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Dataset not found! Please run Step 1 first.")

    df = pd.read_csv(csv_path)
    print(f"✅ Loaded master dataset: {len(df):,} total samples.")

    # 2. First Split: 80% Train, 20% Temp (with stratification on 'label')
    print("\n[Splitting] Executing First Cut: 80% Train, 20% Temp...")
    train_df, temp_df = train_test_split(
        df,
        test_size=0.20,
        random_state=42,
        stratify=df["label"]
    )

    # 3. Second Split: Split 20% Temp equally into 10% Validation and 10% Test
    print("[Splitting] Executing Second Cut: 10% Validation, 10% Test...")
    val_df, test_df = train_test_split(
        temp_df,
        test_size=0.50,
        random_state=42,
        stratify=temp_df["label"]
    )

    # 4. Save the three splits into client/data/
    data_dir = os.path.dirname(csv_path)
    train_path = os.path.join(data_dir, "train_cti.csv")
    val_path = os.path.join(data_dir, "val_cti.csv")
    test_path = os.path.join(data_dir, "test_cti.csv")

    train_df.to_csv(train_path, index=False)
    val_df.to_csv(val_path, index=False)
    test_df.to_csv(test_path, index=False)

    # 5. Display Summary Statistics
    print("\n" + "=" * 70)
    print("📊 DATASET SPLIT VERIFICATION TABLE")
    print("=" * 70)
    print(f"{'CLASS ID':<10} | {'CLASS NAME':<40} | {'TRAIN (80%)':<12} | {'VAL (10%)':<10} | {'TEST (10%)':<10}")
    print("-" * 90)

    name_col = "label_name" if "label_name" in df.columns else "class_name"
    classes = df[["label", name_col]].drop_duplicates().sort_values("label")
    for _, row in classes.iterrows():
        cid = row["label"]
        cname = row[name_col]
        n_train = sum(train_df["label"] == cid)
        n_val = sum(val_df["label"] == cid)
        n_test = sum(test_df["label"] == cid)
        print(f"{cid:<10} | {cname:<40} | {n_train:<12} | {n_val:<10} | {n_test:<10}")

    print("-" * 90)
    print(f"{'TOTAL':<10} | {'ALL CLASSES':<40} | {len(train_df):<12} | {len(val_df):<10} | {len(test_df):<10}")
    print("=" * 70)

    print("\n📁 Exported Split Files:")
    print(f"  • Training Data:   {train_path}")
    print(f"  • Validation Data: {val_path}")
    print(f"  • Test Data:       {test_path}")
    print("\n🎉 STEP 3 COMPLETE: Datasets are stratified and ready for Model Loading!")
    print("=" * 70)

if __name__ == "__main__":
    perform_stratified_split()

