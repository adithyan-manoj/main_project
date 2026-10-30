import logging
import flwr as fl

try:
    from server.config import SERVER_ADDRESS, NUM_ROUNDS, MIN_FIT_CLIENTS, MIN_AVAILABLE_CLIENTS
    from server.flora_strategy import FLoRAStrategy
    from server.server_registry import ServerRegistry
except ImportError:
    from config import SERVER_ADDRESS, NUM_ROUNDS, MIN_FIT_CLIENTS, MIN_AVAILABLE_CLIENTS
    from flora_strategy import FLoRAStrategy
    from server_registry import ServerRegistry

logging.basicConfig(level=logging.INFO, format="%(asctime)s [CENTRAL FLOWER SERVER] %(message)s")


def run_central_server():
    """
    Launches the central FedThreat Federated Learning Orchestration Server.
    Listens on SERVER_ADDRESS and logs state to SQLite ServerRegistry.
    """
    logging.info("=" * 65)
    logging.info("   🚀 FEDTHREAT CENTRAL FEDERATED AGGREGATOR SERVER 🚀")
    logging.info("=" * 65)
    logging.info(f"Host Address:         {SERVER_ADDRESS}")
    logging.info(f"Target FL Rounds:     {NUM_ROUNDS}")
    logging.info(f"Min Participating:    {MIN_FIT_CLIENTS}")

    registry = ServerRegistry()
    registry.log_event("SERVER_START", f"Flower server starting on {SERVER_ADDRESS}")

    strategy = FLoRAStrategy(
        registry=registry,
        min_fit_clients=MIN_FIT_CLIENTS,
        min_available_clients=MIN_AVAILABLE_CLIENTS
    )

    try:
        fl.server.start_server(
            server_address=SERVER_ADDRESS,
            strategy=strategy,
            config=fl.server.ServerConfig(num_rounds=NUM_ROUNDS),
        )
    except Exception as e:
        logging.error(f"Server execution error: {e}")
        registry.log_event("SERVER_ERROR", str(e), level="ERROR")
    finally:
        registry.log_event("SERVER_STOPPED", "Flower server terminated.")
        logging.info("Server process concluded.")


if __name__ == "__main__":
    run_central_server()
