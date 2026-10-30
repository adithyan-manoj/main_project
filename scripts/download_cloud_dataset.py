import os
import sys
import zipfile
import glob
from pathlib import Path

"""
FedThreat: Model 5 Dataset Downloader (AWS CloudTrail from flaws.cloud)
Downloads and extracts the dataset directly to Data/CloudTrail/
"""

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TARGET_DIR = PROJECT_ROOT / "Data" / "CloudTrail"
TARGET_DIR.mkdir(parents=True, exist_ok=True)

DATASET_SLUG = "nobukim/aws-cloudtrails-dataset-from-flaws-cloud"

def extract_from_downloads():
    """Checks ~/Downloads for any manually downloaded flaws.cloud zip and extracts it."""
    downloads_dir = Path.home() / "Downloads"
    matching_zips = (
        list(downloads_dir.glob("*flaws*.zip")) +
        list(downloads_dir.glob("*cloudtrail*.zip")) +
        list(downloads_dir.glob("*archive*.zip"))
    )
    
    if matching_zips:
        latest_zip = max(matching_zips, key=lambda f: f.stat().st_mtime)
        print(f"📦 Found downloaded archive in ~/Downloads: {latest_zip.name}")
        print(f"Extracting into {TARGET_DIR} ...")
        with zipfile.ZipFile(latest_zip, 'r') as zip_ref:
            zip_ref.extractall(TARGET_DIR)
        print(f"✅ Extracted successfully into {TARGET_DIR}!")
        return True
    return False

def download_via_kaggle_api():
    """Attempts to download using kaggle package or requests."""
    print(f"🚀 Downloading dataset: {DATASET_SLUG} ...")
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()
        api.dataset_download_files(DATASET_SLUG, path=str(TARGET_DIR), unzip=True)
        print(f"✅ Successfully downloaded and unzipped to {TARGET_DIR}")
        return True
    except Exception as e:
        print(f"\n⚠️  Kaggle API authentication error: {e}")
        print("Tip: If you do not have ~/.kaggle/kaggle.json set up, you can simply click 'Download' on the Kaggle page:")
        print(f"👉 https://www.kaggle.com/datasets/{DATASET_SLUG}")
        print("Once downloaded to ~/Downloads, re-run this script to automatically unpack it!")
        return False

def main():
    print("=" * 65)
    print("  FEDTHREAT: MODEL 5 DATASET SETUP (AWS CLOUDTRAIL)")
    print("=" * 65)
    
    # 1. Check if dataset already extracted in Data/CloudTrail
    existing_files = list(TARGET_DIR.glob("*.csv")) + list(TARGET_DIR.glob("*.json"))
    if existing_files:
        print(f"✅ Dataset already available in {TARGET_DIR}:")
        for f in existing_files:
            print(f"  - {f.name} ({f.stat().st_size / (1024*1024):.1f} MB)")
        print("\nYou are ready to train! Run:")
        print("  source venv/bin/activate && python -m Notebooks.01e_train_cloud_xgboost")
        return

    # 2. Check if user already clicked Download in browser
    if extract_from_downloads():
        print("\nYou are ready to train! Run:")
        print("  source venv/bin/activate && python -m Notebooks.01e_train_cloud_xgboost")
        return

    # 3. Try Kaggle API
    download_via_kaggle_api()

if __name__ == "__main__":
    main()
