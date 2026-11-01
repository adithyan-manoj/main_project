import flwr as fl
import torch
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import logging

logging.basicConfig(level=logging.INFO)

# Master MITRE CTI Classes trained on authentic CTI reports (Phase 3)
CLASS_NAMES = [
    "Benign / Defensive Operations",               # Class 0
    "T1498: Denial of Service & Impact",            # Class 1
    "T1110: Brute Force & Credential Access",       # Class 2
    "T1059: Command and Scripting Interpreter",     # Class 3
    "T1190: Exploit Public-Facing Application",      # Class 4
    "T1098: Account Manipulation & Priv Escalation" # Class 5
]

class FedThreatClient(fl.client.NumPyClient):
    def __init__(self, anomaly_data: list):
        self.anomaly_data = anomaly_data
        
        # Load the frozen SecureBERT model (6 authentic CTI MITRE classes)
        model_name = "ehsanaghaei/SecureBERT"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.base_model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=6)
        # Load the Pre-trained Baseline LoRA Adapter
        import os
        from peft import PeftModel
        candidates = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models', 'securebert_lora')),
            os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'Models', 'SecureBERT')),
            os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Models', 'SecureBERT')),
        ]
        adapter_path = candidates[0]
        for c in candidates:
            if os.path.exists(c):
                adapter_path = c
                break

        self.model = PeftModel.from_pretrained(
            self.base_model, 
            adapter_path, 
            is_trainable=True
        )
        logging.info(f"Loaded SecureBERT with LoRA Adapter from {adapter_path}")

    def get_parameters(self, config):
        """Extract only the trainable LoRA parameters."""
        return [val.detach().cpu().numpy() for _, val in self.model.named_parameters() if val.requires_grad]

    def set_parameters(self, parameters):
        """Inject global FLoRA weights from the Colab Server."""
        trainable_keys = [k for k, v in self.model.named_parameters() if v.requires_grad]
        params_dict = zip(trainable_keys, parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        self.model.load_state_dict(state_dict, strict=False)

    def fit(self, parameters, config):
        """Simulate training the LoRA adapter on local anomaly data."""
        self.set_parameters(parameters)
        logging.info("Training local LoRA adapter on zero-day event...")
        # Simulated training loop goes here
        return self.get_parameters(config=None), len(self.anomaly_data), {}

    def dynamic_merge_and_infer(self, raw_telemetry: str) -> dict:
        """Stage 3: Zero-Latency Inference using merge_and_unload()"""
        logging.info("Fusing global adapter into SecureBERT base model in-memory.")
        merged_model = self.model.merge_and_unload()
        
        inputs = self.tokenizer(raw_telemetry, return_tensors="pt", truncation=True, max_length=512)
        
        with torch.no_grad():
            outputs = merged_model(**inputs)
            probs = torch.softmax(outputs.logits, dim=-1)[0]
            predicted_class = torch.argmax(probs, dim=-1).item()
            confidence = float(probs[predicted_class].item())
            
        threat_class = CLASS_NAMES[predicted_class] if predicted_class < len(CLASS_NAMES) else f"Technique Class {predicted_class}"
        return {
            "threat_class": threat_class,
            "confidence": round(confidence, 4),
            "class_index": predicted_class,
            "engine": "SecureBERT-FLoRA-Merged"
        }

_LOCAL_SECUREBERT_MODEL = None
_LOCAL_SECUREBERT_TOKENIZER = None

def get_local_securebert():
    """Returns cached, local SecureBERT + LoRA model for zero-latency local inference."""
    global _LOCAL_SECUREBERT_MODEL, _LOCAL_SECUREBERT_TOKENIZER
    if _LOCAL_SECUREBERT_MODEL is None:
        import os
        from peft import PeftModel
        model_name = "ehsanaghaei/SecureBERT"
        _LOCAL_SECUREBERT_TOKENIZER = AutoTokenizer.from_pretrained(model_name)
        base_model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=6)
        candidates = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models', 'securebert_lora')),
            os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'Models', 'SecureBERT')),
            os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Models', 'SecureBERT')),
        ]
        adapter_path = candidates[0]
        for c in candidates:
            if os.path.exists(c):
                adapter_path = c
                break
        _LOCAL_SECUREBERT_MODEL = PeftModel.from_pretrained(base_model, adapter_path)
        _LOCAL_SECUREBERT_MODEL.eval()
        logging.info(f"Initialized standalone SecureBERT + LoRA classifier from {adapter_path}")
    return _LOCAL_SECUREBERT_TOKENIZER, _LOCAL_SECUREBERT_MODEL

def classify_threat_narrative(narrative_text: str) -> dict:
    """
    Performs real neural sequence classification on narrative CTI text using fine-tuned SecureBERT + LoRA.
    """
    try:
        tokenizer, model = get_local_securebert()
        inputs = tokenizer(narrative_text, return_tensors="pt", truncation=True, max_length=256)
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.softmax(outputs.logits, dim=-1)[0]
            pred_idx = torch.argmax(probs, dim=-1).item()
            conf = float(probs[pred_idx].item())
        
        threat_class = CLASS_NAMES[pred_idx] if pred_idx < len(CLASS_NAMES) else f"Technique Class {pred_idx}"
        return {
            "threat_class": threat_class,
            "confidence": round(conf, 4),
            "class_index": pred_idx,
            "engine": "SecureBERT-LoRA-Neural"
        }
    except Exception as e:
        logging.warning(f"[SecureBERT Inference Warning] Local neural classification error: {e}")
        raise e

def trigger_federated_round(anomaly_data: list, server_address: str = None):
    """Connects to the Colab/Central Flower Server via the provided address or env var."""
    import os
    if server_address is None:
        server_address = os.getenv("FEDTHREAT_SERVER_ADDRESS", "127.0.0.1:8080")
    client = FedThreatClient(anomaly_data)
    logging.info(f"Connecting to FLoRA Server at {server_address}")
    # In a real run, this blocks until the round completes.
    fl.client.start_numpy_client(server_address=server_address, client=client)
    return client
