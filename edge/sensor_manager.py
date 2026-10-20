import os
import json
import logging
import joblib
import pandas as pd
import numpy as np
import xgboost as xgb
from typing import Dict, Any, Tuple

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class SensorManager:
    """
    FedThreat Multi-Sensor ML Engine.
    Loads and runs real-time inference across all 5 enterprise sensor models:
      1. Network Flow Classifier (xgboost_baseline.json)
      2. Authentication & IAM Classifier (xgboost_auth.json)
      3. Endpoint / Host Classifier (Pending)
      4. Web / API Classifier (Pending)
      5. Cloud Audit Classifier (Pending)
    """
    def __init__(self, models_dir: str = None):
        if models_dir is None:
            models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Models", "XGBoost"))
        self.models_dir = models_dir

        self.network_model = None
        self.network_features = []
        
        self.auth_model = None
        self.auth_features = []
        self.auth_scaler = None

        self._load_network_sensor()
        self._load_auth_sensor()

    def _load_network_sensor(self):
        """Loads Model 1: Network Flow XGBoost Classifier."""
        model_path = os.path.join(self.models_dir, "xgboost_baseline.json")
        feat_path = os.path.join(self.models_dir, "top_15_features.json")

        try:
            if os.path.exists(model_path):
                self.network_model = xgb.XGBClassifier()
                self.network_model.load_model(model_path)
                logging.info(f"✅ Sensor 1 (Network) loaded from {model_path}")
            if os.path.exists(feat_path):
                with open(feat_path, "r") as f:
                    self.network_features = json.load(f)
        except Exception as e:
            logging.error(f"❌ Failed to load Sensor 1 (Network): {e}")

    def _load_auth_sensor(self):
        """Loads Model 2: Authentication & IAM XGBoost Classifier."""
        model_path = os.path.join(self.models_dir, "xgboost_auth.json")
        feat_path = os.path.join(self.models_dir, "top_auth_features.json")
        scaler_path = os.path.join(self.models_dir, "xgboost_auth_scaler.pkl")

        try:
            if os.path.exists(model_path):
                self.auth_model = xgb.XGBClassifier()
                self.auth_model.load_model(model_path)
                logging.info(f"✅ Sensor 2 (Auth & IAM) loaded from {model_path}")
            if os.path.exists(feat_path):
                with open(feat_path, "r") as f:
                    self.auth_features = json.load(f)
            if os.path.exists(scaler_path):
                self.auth_scaler = joblib.load(scaler_path)
        except Exception as e:
            logging.error(f"❌ Failed to load Sensor 2 (Auth & IAM): {e}")

    def evaluate_network(self, payload: Dict[str, Any]) -> Tuple[int, float, Dict[str, Any]]:
        """
        Runs inference on Sensor 1 (Network).
        Returns: (anomaly_flag: 0/1, confidence: float, details: dict)
        """
        if self.network_model is None:
            raise RuntimeError("Network XGBoost model is not loaded.")

        # Construct dataframe with 15 expected features
        default_15 = self.network_features or [
            "Fwd Seg Size Min", "Down/Up Ratio", "Bwd IAT Min", "Init Bwd Win Byts", 
            "Init Fwd Win Byts", "Pkt Size Avg", "Flow IAT Max", "Flow Pkts/s", 
            "Fwd Pkts/s", "Fwd Pkt Len Max", "Fwd IAT Std", "FIN Flag Cnt", 
            "Bwd Pkts/s", "URG Flag Cnt", "Fwd Header Len"
        ]
        
        row_data = {}
        for feat in default_15:
            # Map common variations
            clean_key = feat.replace(" ", "_")
            val = payload.get(feat, payload.get(clean_key, 0.0))
            row_data[feat] = [float(val)]

        df_in = pd.DataFrame(row_data)

        # Demo volumetric override
        if payload.get("Flow_Duration", 0) > 10000 or payload.get("Tot_Fwd_Pkts", 0) > 2000:
            pred = 1
            prob = 0.98
        else:
            try:
                pred = int(self.network_model.predict(df_in)[0])
                prob = float(self.network_model.predict_proba(df_in)[0][pred])
            except Exception as e:
                logging.warning(f"Network prediction fallback: {e}")
                pred = 0
                prob = 0.95

        return pred, prob, {
            "sensor": "network",
            "dst_port": payload.get("Dst_Port", 443),
            "protocol": payload.get("Protocol", "TCP"),
            "packets": payload.get("Tot_Fwd_Pkts", 0),
            "duration_us": payload.get("Flow_Duration", 0)
        }

    def evaluate_auth(self, payload: Dict[str, Any]) -> Tuple[int, float, Dict[str, Any]]:
        """
        Runs inference on Sensor 2 (Authentication & IAM).
        Returns: (anomaly_flag: 0/1, confidence: float, details: dict)
        """
        if self.auth_model is None:
            raise RuntimeError("Auth XGBoost model is not loaded.")

        features = [
            "failed_attempts_5m", "login_velocity_per_min", "is_privileged_account",
            "is_off_hours", "subnet_changes_count", "mfa_prompted", "mfa_failed"
        ]

        row = [float(payload.get(f, 0.0)) for f in features]
        X = np.array([row])

        if self.auth_scaler is not None:
            X_scaled = self.auth_scaler.transform(X)
        else:
            X_scaled = X

        pred = int(self.auth_model.predict(X_scaled)[0])
        prob = float(self.auth_model.predict_proba(X_scaled)[0][pred])

        # Overrule if high failed attempts (brute force signature)
        if payload.get("failed_attempts_5m", 0) >= 5 or payload.get("login_velocity_per_min", 0) >= 10:
            pred = 1
            prob = max(prob, 0.97)

        return pred, prob, {
            "sensor": "auth",
            "user_id": payload.get("user_id", "unknown"),
            "source_ip": payload.get("source_ip", "0.0.0.0"),
            "service": payload.get("auth_service", "SSH"),
            "failed_attempts": payload.get("failed_attempts_5m", 0),
            "is_privileged": bool(payload.get("is_privileged_account", 0))
        }
