import logging
import os
import sys

# Ensure the edge module can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

try:
    from edge.client import trigger_federated_round
except ImportError:
    from client import trigger_federated_round

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def test_federated_loop():
    print("\n=======================================================")
    print("🚀 SIMULATING ZERO-DAY ANOMALY DETECTED BY XGBOOST 🚀")
    print("=======================================================\n")
    
    # Mock data that would normally come from XGBoost/Correlator
    mock_anomaly_data = [{"text": "Unknown binary payload detected on port 443", "label": 1}]
    
    print("[EDGE] Initializing SecureBERT and connecting to FLoRA Server...")
    
    # This will block until the Colab/Local server finishes the aggregation round
    fl_client = trigger_federated_round(mock_anomaly_data, server_address="127.0.0.1:8080")
    
    print("\n[EDGE] FLoRA Round Complete. Global weights received!")
    print("[EDGE] Executing zero-latency in-memory fusion (merge_and_unload)...")
    
    # Test inference
    raw_telemetry_string = "Massive encrypted traffic spike indicating potential data exfiltration"
    classification_result = fl_client.dynamic_merge_and_infer(raw_telemetry_string)
    
    print("\n=======================================================")
    print("✅ FEDERATION & FUSION SUCCESSFUL ✅")
    print(f"Final Threat Classification: {classification_result}")
    print("=======================================================\n")

if __name__ == "__main__":
    test_federated_loop()
