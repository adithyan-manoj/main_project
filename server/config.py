import os

# Server Network Configuration
SERVER_HOST = os.getenv("FEDTHREAT_SERVER_HOST", "0.0.0.0")
SERVER_PORT = int(os.getenv("FEDTHREAT_SERVER_PORT", "8080"))
SERVER_ADDRESS = f"{SERVER_HOST}:{SERVER_PORT}"

# Federated Learning Hyperparameters
NUM_ROUNDS = int(os.getenv("FEDTHREAT_NUM_ROUNDS", "3"))
MIN_FIT_CLIENTS = int(os.getenv("FEDTHREAT_MIN_FIT_CLIENTS", "1"))
MIN_AVAILABLE_CLIENTS = int(os.getenv("FEDTHREAT_MIN_AVAILABLE_CLIENTS", "1"))

# Database & Model Directories
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.getenv("FEDTHREAT_SERVER_DB", os.path.join(DATA_DIR, "server_history.db"))
GLOBAL_MODELS_DIR = os.path.join(BASE_DIR, "models", "global_lora_base")

