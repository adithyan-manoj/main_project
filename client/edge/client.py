import flwr as fl
import torch
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import logging

logging.basicConfig(level=logging.INFO)

class FedThreatClient(fl.client.NumPyClient):
    def __init__(self, anomaly_data: list):
        self.anomaly_data = anomaly_data
        
        # Load the frozen SecureBERT model
        model_name = "ehsanaghaei/SecureBERT"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.base_model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
        
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
            predicted_class = torch.argmax(outputs.logits, dim=-1).item()
            
        # Mock classification output for the MVP
        return {
            "threat_class": "T1498: Network Denial of Service",
            "confidence": 0.96
        }

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
