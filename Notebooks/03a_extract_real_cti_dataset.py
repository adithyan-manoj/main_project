"""
=============================================================================
FedThreat - Step 1: 100% Real CTI Dataset Extraction & Curation
=============================================================================
Sources (100% Real & Verified):
  1. MITRE TRAM Project (skyylord/mitre-attack-ttp-labeled-instructions)
  2. HoangCuongNguyen CTI-to-MITRE Dataset (Real adversary report sentences)
  3. Sarahwei MITRE Tactic CTI Dataset (Real APT & cyber threat incident reports)
  4. Official MITRE ATT&CK STIX 2.1 Enterprise Repository:
     - Real Threat Actor / Malware Procedures (uses relationships)
     - Real Defensive System Hardening & Mitigations (for Benign Class 0)
=============================================================================
"""

import os
import sys
import json
import re
import random
from collections import defaultdict
import pandas as pd
from datasets import load_dataset

# Set random seed for reproducibility
random.seed(42)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
STIX_PATH = os.path.join(PROJECT_ROOT, "Data", "MITRE_ATTACK", "enterprise-attack.json")
OUTPUT_CSV = os.path.join(PROJECT_ROOT, "client", "data", "real_cti_dataset.csv")
OUTPUT_JSON = os.path.join(PROJECT_ROOT, "client", "data", "real_cti_dataset.json")

CLASS_MAPPING = {
    0: ("Benign / Defensive Operations", "Normal administrative, defensive baseline & hardening procedures"),
    1: ("T1498: Denial of Service & Impact", "Network / host service interruption, resource exhaustion, shutdown"),
    2: ("T1110: Brute Force & Credential Access", "Password guessing, credential dumping, token theft, brute force"),
    3: ("T1059: Command and Scripting Interpreter", "PowerShell, cmd, bash, python execution, macro scripts"),
    4: ("T1190: Exploit Public-Facing Application", "SQLi, remote code execution, web application exploitation"),
    5: ("T1098: Account Manipulation & Priv Escalation", "Account creation, permission modification, credential delegation")
}

def clean_text(text: str) -> str:
    """Sanitize text by stripping markdown links, HTML tags, citations, and extra whitespace."""
    if not text:
        return ""
    # Remove markdown links [text](url) -> text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove citations like (Citation: ...)
    text = re.sub(r'\(Citation:[^\)]+\)', '', text)
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_real_cti_data():
    print("=" * 72)
    print("🧪 STEP 1: EXTRACTING & CURATING 100% REAL CTI DATASET 🧪")
    print("=" * 72)

    pools = defaultdict(set)

    # -------------------------------------------------------------------------
    # 1. Official MITRE ATT&CK STIX 2.1 (Local Verified File)
    # -------------------------------------------------------------------------
    print("\n[1/4] Parsing Official MITRE ATT&CK STIX 2.1 Enterprise Repository...")
    if not os.path.exists(STIX_PATH):
        raise FileNotFoundError(f"STIX file missing at: {STIX_PATH}")

    with open(STIX_PATH, "r", encoding="utf-8") as f:
        stix = json.load(f)

    # Map attack pattern STIX ID to MITRE Technique ID
    tech_map = {}
    for obj in stix.get("objects", []):
        if obj.get("type") == "attack-pattern":
            for ref in obj.get("external_references", []):
                if ref.get("source_name") == "mitre-attack":
                    tech_map[obj["id"]] = ref.get("external_id")

    for obj in stix.get("objects", []):
        desc = obj.get("description", "")
        if not desc:
            continue
        obj_type = obj.get("type")

        # Class 0: Real Defensive Hardening & Mitigations from MITRE Analysts
        if obj_type == "course-of-action":
            # Split paragraph into individual meaningful operational sentences
            for sent in re.split(r'\.\s+', desc):
                cleaned = clean_text(sent)
                if len(cleaned) >= 40 and not cleaned.startswith("Note:") and not cleaned.lower().startswith("table"):
                    pools[0].add(cleaned)

        # Attack Classes: Real Threat Group Procedures (uses relationships)
        elif obj_type == "relationship" and obj.get("relationship_type") == "uses":
            target = obj.get("target_ref")
            if target in tech_map:
                tid = tech_map[target].split(".")[0]
                cleaned = clean_text(desc)
                if len(cleaned) >= 30:
                    if tid in ["T1498", "T1499", "T1489"]:
                        pools[1].add(cleaned)
                    elif tid in ["T1110", "T1003", "T1114"]:
                        pools[2].add(cleaned)
                    elif tid in ["T1059", "T1204", "T1053"]:
                        pools[3].add(cleaned)
                    elif tid in ["T1190"]:
                        pools[4].add(cleaned)
                    elif tid in ["T1098", "T1078", "T1136"]:
                        pools[5].add(cleaned)

    print(f"  • STIX extracted: Class 0 ({len(pools[0])}), Class 1 ({len(pools[1])}), Class 2 ({len(pools[2])}), Class 3 ({len(pools[3])}), Class 4 ({len(pools[4])}), Class 5 ({len(pools[5])})")

    # -------------------------------------------------------------------------
    # 2. MITRE TRAM Project (Real analyst sentences from threat reports)
    # -------------------------------------------------------------------------
    print("\n[2/4] Extracting from MITRE TRAM (skyylord/mitre-attack-ttp-labeled-instructions)...")
    try:
        tram = load_dataset("skyylord/mitre-attack-ttp-labeled-instructions", split="train")
        for row in tram:
            ttp = row.get("TTP", "")
            sentence = clean_text(row.get("name", ""))
            if not ttp or len(sentence) < 30:
                continue
            tid = ttp.split(".")[0]
            if tid in ["T1498", "T1499", "T1489"]:
                pools[1].add(sentence)
            elif tid in ["T1110", "T1003", "T1114"]:
                pools[2].add(sentence)
            elif tid in ["T1059"]:
                pools[3].add(sentence)
            elif tid in ["T1190"]:
                pools[4].add(sentence)
            elif tid in ["T1098", "T1078"]:
                pools[5].add(sentence)
        print("  • MITRE TRAM records successfully integrated.")
    except Exception as e:
        print(f"  ⚠️ Warning loading TRAM: {e}")

    # -------------------------------------------------------------------------
    # 3. HoangCuongNguyen CTI-to-MITRE (Authentic Threat Intelligence Reports)
    # -------------------------------------------------------------------------
    print("\n[3/4] Extracting from HoangCuongNguyen/CTI-to-MITRE-dataset...")
    try:
        hcn = load_dataset("HoangCuongNguyen/CTI-to-MITRE-dataset", split="train")
        pat = re.compile(r'### Human:Find the techniques and ID from MITRE ATT&CK framework\.,(.*?)### Assistant:\s*(T\d{4}(?:\.\d{3})?)', re.DOTALL)
        for row in hcn:
            txt = row.get("text", "")
            m = pat.search(txt)
            if m:
                c_text = clean_text(m.group(1))
                tid = m.group(2).split(".")[0]
                if len(c_text) >= 30:
                    if tid in ["T1498", "T1499", "T1489"]:
                        pools[1].add(c_text)
                    elif tid in ["T1110", "T1003", "T1114"]:
                        pools[2].add(c_text)
                    elif tid in ["T1059"]:
                        pools[3].add(c_text)
                    elif tid in ["T1190"]:
                        pools[4].add(c_text)
                    elif tid in ["T1098", "T1078"]:
                        pools[5].add(c_text)
        print("  • CTI-to-MITRE records successfully integrated.")
    except Exception as e:
        print(f"  ⚠️ Warning loading CTI-to-MITRE: {e}")

    # -------------------------------------------------------------------------
    # 4. Sarahwei MITRE Tactic CTI Dataset (Real Cyber Threat Reports)
    # -------------------------------------------------------------------------
    print("\n[4/4] Extracting from sarahwei/cyber_MITRE_tactic_CTI_dataset_v16...")
    try:
        sw = load_dataset("sarahwei/cyber_MITRE_tactic_CTI_dataset_v16", split="train")
        for row in sw:
            lbl = str(row.get("label", ""))
            txt = clean_text(row.get("text", ""))
            if len(txt) < 30:
                continue
            if "TA0040:Impact" in lbl:
                pools[1].add(txt)
            elif "TA0006:Credential Access" in lbl:
                pools[2].add(txt)
            elif "TA0002:Execution" in lbl:
                pools[3].add(txt)
            elif "TA0001:Initial Access" in lbl:
                pools[4].add(txt)
            elif "TA0004:Privilege Escalation" in lbl:
                pools[5].add(txt)
        print("  • Sarahwei Tactic CTI records successfully integrated.")
    except Exception as e:
        print(f"  ⚠️ Warning loading Sarahwei CTI: {e}")

    # -------------------------------------------------------------------------
    # 5. Balance and Compile Dataset (Target: 440 real samples per class = 2,640 total)
    # -------------------------------------------------------------------------
    print("\n" + "=" * 72)
    print("📊 REAL DATASET CURATION & BALANCING SUMMARY")
    print("=" * 72)
    print(f"{'CLASS ID':<8} | {'CLASS LABEL':<40} | {'UNIQUE REAL FOUND':<17} | {'SELECTED'}")
    print("-" * 72)

    min_available = min(len(pools[c]) for c in range(6))
    target_per_class = min(440, min_available)

    records = []
    for c in range(6):
        sample_list = list(pools[c])
        random.shuffle(sample_list)
        selected = sample_list[:target_per_class]
        class_name, _ = CLASS_MAPPING[c]
        print(f"{c:<8} | {class_name:<40} | {len(pools[c]):<17} | {len(selected)}")

        for text in selected:
            records.append({
                "label": c,
                "label_name": class_name,
                "text": text,
                "char_length": len(text),
                "word_count": len(text.split())
            })

    print("-" * 72)
    print(f"TOTAL REAL SAMPLES CURATED: {len(records)} (Strictly 100% Real Analyst CTI Texts)")
    print("=" * 72)

    # Shuffle final dataset
    random.shuffle(records)
    df = pd.DataFrame(records)

    # Export to client/data/
    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)
    df.to_csv(OUTPUT_CSV, index=False)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    print(f"\n📁 Exported Curated Real Dataset:")
    print(f"  • CSV:  {OUTPUT_CSV}")
    print(f"  • JSON: {OUTPUT_JSON}")
    print("\n🔍 SAMPLE REAL TEXTS FROM EACH CLASS:")
    for c in range(6):
        sample_row = df[df["label"] == c].iloc[0]
        print(f"\n  [Class {c}: {sample_row['label_name']}]")
        print(f"  \"{sample_row['text'][:120]}...\"")

    print("\n" + "=" * 72)
    print("🎉 STEP 1 COMPLETE: Authentic Real Dataset Ready for Tokenization & Splitting!")
    print("=" * 72)

if __name__ == "__main__":
    extract_real_cti_data()
