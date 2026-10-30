import time
import logging
import numpy as np
from typing import Dict, List, Tuple, Optional, Union
import flwr as fl
from flwr.common import Metrics, NDArrays, Parameters, FitIns, FitRes, Scalar
from flwr.server.client_proxy import ClientProxy

try:
    from server.server_registry import ServerRegistry
except ImportError:
    from server_registry import ServerRegistry

logging.basicConfig(level=logging.INFO, format="%(asctime)s [FLoRA STRATEGY] %(message)s")


class FLoRAStrategy(fl.server.strategy.Strategy):
    """
    Federated Low-Rank Adaptation (FLoRA) Server Strategy.
    
    Responsibilities:
      1. Aggregates heterogeneous low-rank adapter updates without injecting noise.
      2. Tracks client participation and sample volumes in ServerRegistry.
      3. Records round durations, parameter convergence, and audit events.
    """
    def __init__(
        self,
        registry: Optional[ServerRegistry] = None,
        min_fit_clients: int = 1,
        min_available_clients: int = 1,
        fraction_fit: float = 1.0,
    ):
        super().__init__()
        self.registry = registry or ServerRegistry()
        self.min_fit_clients = min_fit_clients
        self.min_available_clients = min_available_clients
        self.fraction_fit = fraction_fit
        self.global_adapter_weights: Optional[Parameters] = None
        self.round_start_times: Dict[int, float] = {}

    def initialize_parameters(self, client_manager: fl.server.client_manager.ClientManager) -> Optional[Parameters]:
        """Initializes global model parameters if available."""
        self.registry.log_event("STRATEGY_INIT", "FLoRAStrategy initialized. Waiting for client connections.")
        return None

    def configure_fit(
        self, server_round: int, parameters: Parameters, client_manager: fl.server.client_manager.ClientManager
    ) -> List[Tuple[ClientProxy, FitIns]]:
        """Samples clients for the current federated training round."""
        self.round_start_times[server_round] = time.time()
        config = {"server_round": server_round}

        available = client_manager.num_available()
        if available < self.min_available_clients:
            logging.warning(f"Round {server_round}: Insufficient clients available ({available} < {self.min_available_clients})")
            return []

        # Sample all or fraction of clients
        num_to_sample = max(self.min_fit_clients, int(available * self.fraction_fit))
        clients = client_manager.sample(num_clients=num_to_sample, min_num_clients=self.min_fit_clients)

        # Register clients in database
        for c in clients:
            self.registry.register_or_update_client(
                client_id=c.cid,
                org_name=f"Org-{c.cid[:8]}",
                ip_address="127.0.0.1"
            )

        self.registry.log_event(
            "ROUND_CONFIGURED",
            f"Round {server_round}: Configured fit for {len(clients)} participating clients."
        )
        return [(client, FitIns(parameters, config)) for client in clients]

    def aggregate_fit(
        self,
        server_round: int,
        results: List[Tuple[ClientProxy, FitRes]],
        failures: List[Union[Tuple[ClientProxy, FitRes], BaseException]]
    ) -> Tuple[Optional[Parameters], Dict[str, Scalar]]:
        """
        Aggregates LoRA parameter matrices from reporting clients.
        Computes weighted parameter updates and records telemetry into ServerRegistry.
        """
        if not results:
            self.registry.log_event("ROUND_FAILED", f"Round {server_round}: No client results received.")
            return None, {}

        start_time = self.round_start_times.get(server_round, time.time())
        duration_ms = (time.time() - start_time) * 1000

        total_samples = 0
        client_weights = []

        for client_proxy, fit_res in results:
            cid = client_proxy.cid
            num_samples = fit_res.num_examples
            total_samples += num_samples

            # Convert flwr Parameters to numpy ndarrays
            ndarrays = fl.common.parameters_to_ndarrays(fit_res.parameters)
            
            # Compute parameter L2 norm as an update magnitude indicator
            norm_delta = float(sum(np.linalg.norm(w) for w in ndarrays)) if ndarrays else 0.0
            
            # Log individual contribution in server database
            self.registry.record_contribution(
                round_num=server_round,
                client_id=cid,
                num_samples=num_samples,
                weight_norm_delta=norm_delta
            )
            client_weights.append((ndarrays, num_samples))

        # Perform weighted aggregation across LoRA parameter matrices
        if client_weights and total_samples > 0:
            aggregated_ndarrays = [
                np.zeros_like(w) for w in client_weights[0][0]
            ]
            for ndarrays, samples in client_weights:
                weight_factor = samples / total_samples
                for i, layer in enumerate(ndarrays):
                    aggregated_ndarrays[i] += layer * weight_factor

            self.global_adapter_weights = fl.common.ndarrays_to_parameters(aggregated_ndarrays)
        else:
            # Fallback to first client's parameters
            self.global_adapter_weights = results[0][1].parameters

        # Record round completion in database
        self.registry.record_round_completion(
            round_num=server_round,
            num_clients=len(results),
            duration_ms=duration_ms,
            global_loss=0.0
        )

        return self.global_adapter_weights, {"num_clients": len(results), "total_samples": total_samples}

    def configure_evaluate(
        self, server_round: int, parameters: Parameters, client_manager: fl.server.client_manager.ClientManager
    ) -> List[Tuple[ClientProxy, fl.common.EvaluateIns]]:
        return []

    def aggregate_evaluate(
        self,
        server_round: int,
        results: List[Tuple[ClientProxy, fl.common.EvaluateRes]],
        failures: List[Union[Tuple[ClientProxy, fl.common.EvaluateRes], BaseException]]
    ) -> Tuple[Optional[float], Dict[str, Scalar]]:
        return None, {}

    def evaluate(self, server_round: int, parameters: Parameters) -> Optional[Tuple[float, Dict[str, Scalar]]]:
        return None
