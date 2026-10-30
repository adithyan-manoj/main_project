import os
import sys
import unittest

# Ensure root and server directory are in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

try:
    from server.server_registry import ServerRegistry
    from server.flora_strategy import FLoRAStrategy
    from server.config import DB_PATH
except ImportError:
    from server_registry import ServerRegistry
    from flora_strategy import FLoRAStrategy
    from config import DB_PATH


class TestServerComponents(unittest.TestCase):
    def setUp(self):
        # Use an in-memory or test database
        self.test_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "data", "test_registry.db"))
        self.registry = ServerRegistry(db_path=self.test_db)

    def tearDown(self):
        if os.path.exists(self.test_db):
            try:
                os.remove(self.test_db)
            except Exception:
                pass

    def test_database_initialization(self):
        self.assertTrue(os.path.exists(self.test_db))
        clients = self.registry.get_all_clients()
        self.assertEqual(len(clients), 0)

    def test_client_registration_and_update(self):
        # Register Client 1
        res = self.registry.register_or_update_client("node-01", "Bank Alpha", "192.168.1.100")
        self.assertEqual(res["client_id"], "node-01")

        clients = self.registry.get_all_clients()
        self.assertEqual(len(clients), 1)
        self.assertEqual(clients[0]["org_name"], "Bank Alpha")
        self.assertEqual(clients[0]["total_rounds_participated"], 0)

    def test_contribution_and_round_recording(self):
        self.registry.register_or_update_client("node-02", "Telecom Beta", "10.0.0.5")
        self.registry.record_contribution(
            round_num=1,
            client_id="node-02",
            num_samples=150,
            weight_norm_delta=0.452
        )

        clients = self.registry.get_all_clients()
        self.assertEqual(clients[0]["total_rounds_participated"], 1)

        self.registry.record_round_completion(
            round_num=1,
            num_clients=1,
            duration_ms=45.2,
            global_loss=0.312
        )

        rounds = self.registry.get_round_history()
        self.assertEqual(len(rounds), 1)
        self.assertEqual(rounds[0]["round_num"], 1)
        self.assertEqual(rounds[0]["status"], "completed")

    def test_strategy_instantiation(self):
        strategy = FLoRAStrategy(registry=self.registry, min_fit_clients=1)
        self.assertIsNotNone(strategy)
        self.assertEqual(strategy.min_fit_clients, 1)


if __name__ == "__main__":
    unittest.main()
