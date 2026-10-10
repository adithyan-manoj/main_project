import logging
import json
from edge.client import trigger_federated_round

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class EventCorrelator:
    """
    Stage 2: The Event Correlator.
    Acts as the bridge between Stage 1 (XGBoost Numbers) and Stage 3 (SecureBERT NLP).
    """
    def __init__(self, server_address="127.0.0.1:8080"):
        self.server_address = server_address

    def translate_to_text(self, raw_features: dict) -> str:
        """
        Translates raw numerical network features into a chronological narrative 
        string that SecureBERT can understand. 
        
        Note: Currently built to handle single events for the MVP, but modularly designed
        to easily accept temporal arrays (time windows) in future versions.
        """
        # Safely extract features (using common column names from your dataset)
        dst_port = raw_features.get("Dst Port", "Unknown")
        protocol = raw_features.get("Protocol", "TCP")
        fwd_pkts = raw_features.get("Tot Fwd Pkts", 0)
        bwd_pkts = raw_features.get("Tot Bwd Pkts", 0)
        duration = raw_features.get("Flow Duration", 0)
        
        # Generate the narrative translation
        narrative = (
            f"Detected anomalous {protocol} network flow targeting destination port {dst_port}. "
            f"The connection lasted {duration} microseconds, transmitting {fwd_pkts} forward packets "
            f"and {bwd_pkts} backward packets, exhibiting irregular volumetric signatures characteristic "
            f"of a potential zero-day payload injection or denial of service."
        )
        return narrative

    def process_xgboost_output(self, xgboost_label: int, raw_features: dict):
        """
        The Trigger: If XGBoost flags an anomaly, it translates the data and automatically
        kicks off the FLoRA Federated Learning round.
        """
        if xgboost_label == 0:
            logging.info("[CORRELATOR] Traffic is benign. No action required.")
            return None, None
            
        logging.warning("[CORRELATOR] Critical Anomaly (1) detected by Stage 1! Translating telemetry...")
        
        # 1. Translate numbers to text
        narrative_text = self.translate_to_text(raw_features)
        logging.info(f"[CORRELATOR] Translation complete: '{narrative_text}'")
        
        # 2. Package into the exact JSON array expected by FedThreatClient
        anomaly_data = [{"text": narrative_text, "label": 1}]
        
        # 3. Seamlessly trigger Stage 3 (Federation)
        logging.warning("[CORRELATOR] Triggering Stage 3: Event-Driven Federation...")
        fl_client = trigger_federated_round(anomaly_data, server_address=self.server_address)
        
        # Return the client and the text so the orchestrator can run final inference
        return fl_client, narrative_text
