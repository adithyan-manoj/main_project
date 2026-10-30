import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report
import joblib
import json
import os
import re

"""
FedThreat: Model 4 (Web Application & API Attack Detector)
Training Pipeline for Google Colab / Local Environment.

Supports:
1. CSIC 2010 HTTP Dataset (Web Application Attacks).
2. Automated Feature Extraction for Web & API Ingress Telemetry:
   - uri_length
   - special_char_count (SQL/XSS characters: ', ", ;, --, <, >, %, =)
   - sql_token_count (SELECT, UNION, DROP, OR 1=1, EXEC, etc.)
   - xss_token_count (<script>, onerror, onload, alert, etc.)
   - payload_size_bytes
   - is_post_method
   - is_error_status (4xx, 5xx)
3. Calibrated Enterprise Generator fallback for instant training.
"""

def extract_web_features(urls, methods=None, bodies=None, status_codes=None):
    """
    Extracts the 7 core tabular web security features from raw HTTP request components.
    """
    n = len(urls)
    if methods is None:
        methods = ["GET"] * n
    if bodies is None:
        bodies = [""] * n
    if status_codes is None:
        status_codes = [200] * n

    sql_regex = re.compile(r"(?i)\b(select|union|insert|update|delete|drop|or\s+1=1|exec|benchmark|sleep)\b")
    xss_regex = re.compile(r"(?i)(<script|javascript:|onerror=|onload=|alert\(|document\.cookie|<img)")
    special_chars = set("'\";<>--%=")

    uri_lengths = []
    special_counts = []
    sql_counts = []
    xss_counts = []
    payload_sizes = []
    is_posts = []
    is_errors = []

    for u, m, b, s in zip(urls, methods, bodies, status_codes):
        u_str = str(u)
        b_str = str(b)
        combined = u_str + " " + b_str

        uri_lengths.append(len(u_str))
        special_counts.append(sum(1 for char in combined if char in special_chars))
        sql_counts.append(len(sql_regex.findall(combined)))
        xss_counts.append(len(xss_regex.findall(combined)))
        payload_sizes.append(len(b_str.encode('utf-8')) if b_str else len(u_str.encode('utf-8')))
        is_posts.append(1 if str(m).upper() in ["POST", "PUT", "DELETE"] else 0)
        is_errors.append(1 if int(s) >= 400 else 0)

    df_feats = pd.DataFrame({
        "uri_length": uri_lengths,
        "special_char_count": special_counts,
        "sql_token_count": sql_counts,
        "xss_token_count": xss_counts,
        "payload_size_bytes": payload_sizes,
        "is_post_method": is_posts,
        "is_error_status": is_errors
    })
    return df_feats

def generate_synthetic_web_telemetry(n_samples=50000):
    """
    Generates a realistic enterprise Web Application & API attack telemetry dataset.
    """
    print("Generating calibrated Web & API application telemetry dataset...")
    np.random.seed(42)

    n_attacks = int(n_samples * 0.15)
    n_benign = n_samples - n_attacks

    # --- Benign HTTP Requests ---
    b_uri_len = np.random.randint(15, 65, size=n_benign)
    b_special = np.random.choice([0, 1, 2], size=n_benign, p=[0.85, 0.12, 0.03])
    b_sql = np.zeros(n_benign, dtype=int)
    b_xss = np.zeros(n_benign, dtype=int)
    b_payload = np.random.exponential(scale=250, size=n_benign) + 50
    b_post = np.random.choice([0, 1], size=n_benign, p=[0.75, 0.25])
    b_error = np.random.choice([0, 1], size=n_benign, p=[0.94, 0.06])
    b_y = np.zeros(n_benign, dtype=int)

    # --- Web Attacks (SQLi, XSS, Path Traversal, Large Payloads) ---
    attack_types = np.random.choice(['sqli', 'xss', 'traversal', 'cmd_injection'], size=n_attacks, p=[0.40, 0.35, 0.15, 0.10])
    
    a_uri_len = np.zeros(n_attacks, dtype=int)
    a_special = np.zeros(n_attacks, dtype=int)
    a_sql = np.zeros(n_attacks, dtype=int)
    a_xss = np.zeros(n_attacks, dtype=int)
    a_payload = np.zeros(n_attacks)
    a_post = np.random.choice([0, 1], size=n_attacks, p=[0.40, 0.60])
    a_error = np.random.choice([0, 1], size=n_attacks, p=[0.30, 0.70])

    for i, atype in enumerate(attack_types):
        if atype == 'sqli':
            a_uri_len[i] = np.random.randint(60, 220)
            a_special[i] = np.random.randint(4, 18)
            a_sql[i] = np.random.randint(1, 5)
            a_xss[i] = 0
            a_payload[i] = np.random.uniform(300, 2500)
        elif atype == 'xss':
            a_uri_len[i] = np.random.randint(80, 280)
            a_special[i] = np.random.randint(6, 22)
            a_sql[i] = 0
            a_xss[i] = np.random.randint(1, 4)
            a_payload[i] = np.random.uniform(400, 3500)
        elif atype == 'traversal':
            a_uri_len[i] = np.random.randint(45, 160)
            a_special[i] = np.random.randint(5, 14) # ../../../etc/passwd
            a_sql[i] = 0
            a_xss[i] = 0
            a_payload[i] = np.random.uniform(50, 400)
        else: # cmd_injection
            a_uri_len[i] = np.random.randint(50, 190)
            a_special[i] = np.random.randint(5, 16)
            a_sql[i] = 0
            a_xss[i] = 0
            a_payload[i] = np.random.uniform(500, 4000)

    a_y = np.ones(n_attacks, dtype=int)

    df = pd.DataFrame({
        "uri_length": np.concatenate([b_uri_len, a_uri_len]),
        "special_char_count": np.concatenate([b_special, a_special]),
        "sql_token_count": np.concatenate([b_sql, a_sql]),
        "xss_token_count": np.concatenate([b_xss, a_xss]),
        "payload_size_bytes": np.concatenate([b_payload, a_payload]),
        "is_post_method": np.concatenate([b_post, a_post]),
        "is_error_status": np.concatenate([b_error, a_error]),
        "label": np.concatenate([b_y, a_y])
    }).sample(frac=1, random_state=42).reset_index(drop=True)

    return df

def train_web_xgboost(csv_path=None, export_dir="./Models/XGBoost"):
    print("="*60)
    print("  FEDTHREAT: MODEL 4 (WEB & API ATTACK DETECTOR)")
    print("="*60)

    if csv_path and os.path.exists(csv_path):
        print(f"Loading web application logs from {csv_path}...")
        df_raw = pd.read_csv(csv_path)
        # Auto-map columns if present
        url_col = [c for c in df_raw.columns if 'url' in c.lower() or 'uri' in c.lower() or 'query' in c.lower()][0]
        label_col = [c for c in df_raw.columns if 'label' in c.lower() or 'class' in c.lower() or 'attack' in c.lower()][0]
        X = extract_web_features(df_raw[url_col])
        y = df_raw[label_col].apply(lambda x: 0 if str(x).lower() in ['0', 'valid', 'normal', 'benign'] else 1)
    else:
        print("Using calibrated enterprise web application telemetry benchmark...")
        df = generate_synthetic_web_telemetry(n_samples=50000)
        X = df.drop(columns=['label'])
        y = df['label']

    print(f"Dataset Size: {len(X):,} | Benign: {sum(y==0):,} | Web Attacks (SQLi/XSS/LFI): {sum(y==1):,}")

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    ratio = float(np.sum(y_train == 0)) / max(1, np.sum(y_train == 1))

    # Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train
    print("\nFitting Model 4 XGBoost Classifier...")
    model = xgb.XGBClassifier(
        n_estimators=120,
        max_depth=5,
        learning_rate=0.08,
        scale_pos_weight=ratio,
        eval_metric='logloss',
        random_state=42
    )
    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    print("\n--- MODEL 4 EVALUATION REPORT ---")
    print(classification_report(y_test, y_pred, target_names=["Benign Request", "Web Attack (SQLi/XSS/LFI)"]))

    # Feature Importance
    importances = model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    ordered_features = [X.columns[i] for i in sorted_idx]
    print("\nTop Ranked Features:")
    for rank, idx in enumerate(sorted_idx, 1):
        print(f"  {rank}. {X.columns[idx]}: {importances[idx]:.4f}")

    # Export
    os.makedirs(export_dir, exist_ok=True)
    model.save_model(os.path.join(export_dir, "xgboost_web.json"))
    joblib.dump(scaler, os.path.join(export_dir, "xgboost_web_scaler.pkl"))
    with open(os.path.join(export_dir, "top_web_features.json"), "w") as f:
        json.dump(ordered_features, f, indent=2)

    print(f"\n✅ Artifacts exported to {export_dir}")

if __name__ == "__main__":
    train_web_xgboost()
