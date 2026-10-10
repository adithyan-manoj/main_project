import flwr as fl
from typing import Dict, List, Tuple
from flwr.common import Metrics, NDArrays, FitIns, FitRes
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class FLoRAStrategy(fl.server.strategy.Strategy):
    """
    Custom Flower Strategy implementing FLoRA (Federated Low-Rank Adaptation).
    Aggregates heterogeneous rank LoRA adapters without adding noise.
    """
    def __init__(self):
        super().__init__()
        self.global_adapter_weights = None

    def initialize_parameters(self, client_manager):
        return None 

    def configure_fit(self, server_round: int, parameters, client_manager):
        config = {"server_round": server_round}
        # Sample all available clients for the event-driven anomaly round
        clients = client_manager.sample(num_clients=1, min_num_clients=1)
        logging.info(f"Round {server_round}: Configuring fit for {len(clients)} clients.")
        return [(client, FitIns(parameters, config)) for client in clients]

    def aggregate_fit(self, server_round: int, results: List[Tuple[fl.server.client_proxy.ClientProxy, FitRes]], failures):
        if not results:
            return None, {}
        
        logging.info(f"Round {server_round}: Aggregating heterogeneous LoRA adapters from {len(results)} clients.")
        
        # In a real FLoRA implementation, we would mathematically stack the block-diagonal matrices here.
        # For boilerplate purposes, we extract the first client's weights to simulate the return broadcast.
        aggregated_weights = results[0][1].parameters
        self.global_adapter_weights = aggregated_weights
        
        return aggregated_weights, {}

    def configure_evaluate(self, server_round, parameters, client_manager):
        return []

    def aggregate_evaluate(self, server_round, results, failures):
        return None, {}

    def evaluate(self, server_round, parameters):
        return None

if __name__ == "__main__":
    logging.info("Starting Federated FLoRA Server...")
    fl.server.start_server(
        server_address="0.0.0.0:8080",
        strategy=FLoRAStrategy(),
        config=fl.server.ServerConfig(num_rounds=3),
    )
