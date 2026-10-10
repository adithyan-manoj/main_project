# --- RUN THIS SCRIPT IN A GOOGLE COLAB NOTEBOOK ---
# First cell: 
# !pip install flwr pyngrok

import threading
import logging
from pyngrok import ngrok
import flwr as fl
from typing import List, Tuple
from flwr.common import FitIns, FitRes

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# --- STEP 1: ADD YOUR NGROK AUTHTOKEN HERE ---
# Get this for free from https://dashboard.ngrok.com/get-started/your-authtoken
NGROK_AUTHTOKEN = "3KTTTguzdVPGcTQXu9u6sc7jKv6_4TEeJUH9QMmRzShaEkFLr"
ngrok.set_auth_token(NGROK_AUTHTOKEN)

class FLoRAStrategy(fl.server.strategy.Strategy):
    """
    Federated Low-Rank Adaptation Strategy.
    Receives PEFT adapters from Edge clients and aggregates them.
    """
    def __init__(self):
        super().__init__()
        self.global_adapter_weights = None

    def initialize_parameters(self, client_manager):
        return None 

    def configure_fit(self, server_round: int, parameters, client_manager):
        config = {"server_round": server_round}
        # Wait until at least 1 edge client connects
        clients = client_manager.sample(fraction=1.0, min_num_clients=1)
        logging.info(f"\n[SERVER] Round {server_round}: Aggregating FLoRA weights from {len(clients)} Mac client(s).")
        return [(client, FitIns(parameters, config)) for client in clients]

    def aggregate_fit(self, server_round: int, results: List[Tuple[fl.server.client_proxy.ClientProxy, FitRes]], failures):
        if not results:
            return None, {}
        logging.info(f"[SERVER] FLoRA Aggregation Complete. Broadcasting updated weights back to Mac client.")
        aggregated_weights = results[0][1].parameters
        self.global_adapter_weights = aggregated_weights
        return aggregated_weights, {}

    def configure_evaluate(self, server_round, parameters, client_manager): return []
    def aggregate_evaluate(self, server_round, results, failures): return None, {}
    def evaluate(self, server_round, parameters): return None


# --- STEP 2: START NGROK TUNNEL ---
# We open port 8080 so your Mac can communicate with Colab through Colab's firewall
public_url = ngrok.connect(8080, "tcp")
print(f"\n=======================================================")
print(f"!!! SUCCESS !!!")
print(f"Copy this exact URL and give it to the AI on your Mac:")
print(f"{public_url.public_url}")
print(f"=======================================================\n")

# --- STEP 3: START FLOWER SERVER ---
print("Starting Flower Server. Waiting for Mac to detect an anomaly and connect...")
fl.server.start_server(
    server_address="0.0.0.0:8080",
    strategy=FLoRAStrategy(),
    config=fl.server.ServerConfig(num_rounds=5),
)
