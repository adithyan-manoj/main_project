# FedThreat: Federated Learning for Privacy-Preserving Cyber Threat Intelligence

FedThreat is a decentralized, privacy-preserving cybersecurity framework that detects, correlates, and federates zero-day cyber threats across organizational boundaries without pooling raw network packets or private telemetry.

---

## Architecture Overview

```
                      +-------------------------------------------------------------+
                      |                      SERVER COMPONENT                       |
                      |            (Google Colab / Central Cloud Node)              |
                      |                                                             |
                      |   - Flower gRPC Orchestrator (server/server.py:8080)        |
                      |   - FLoRA Mathematical LoRA Stacking (flora_strategy.py)    |
                      |   - SQLite Client & Activity Tracker (server_registry.py)   |
                      |   - Global Master LoRA Weights (models/global_lora_base/)   |
                      +-------------------------------------------------------------+
                                                     ^
                                                     | (gRPC over TCP / ngrok tunnel)
+====================================================|===================================================+
|                                                    v
|                                             CLIENT COMPONENT
|                                 (Edge Organization Sentinel Laptop / VM)
|
|   +-------------------------------------------------------------------------------------------------+
|   | STAGE 1: Fast Multi-Sensor Anomaly Triage (5x XGBoost Models: Net, Auth, Host, Web, Cloud)      |
|   +-------------------------------------------------------------------------------------------------+
|                                                    |
|                                                    v
|   +-------------------------------------------------------------------------------------------------+
|   | STAGE 2: 5-Minute Temporal Event Correlation & Kill-Chain Narrative Synthesizer                 |
|   +-------------------------------------------------------------------------------------------------+
|                                                    |
|                                                    v
|   +-------------------------------------------------------------------------------------------------+
|   | STAGE 3: Local LoRA Fine-Tuning & In-Memory Fusion (SecureBERT + merge_and_unload)              |
|   +-------------------------------------------------------------------------------------------------+
|                                                    |
|                                                    v
|   +-------------------------------------------------------------------------------------------------+
|   | STAGE 4: Local Private RAG & Mitigation Reasoning (MITRE ATT&CK + Llama-3.1 via Ollama)         |
|   +-------------------------------------------------------------------------------------------------+
|                                                    |
|                                                    v
|   +-------------------------------------------------------------------------------------------------+
|   | PRESENTATION: FastAPI Ingress Orchestrator (:8000) & React 19 SOC Operations Dashboard (:5173)  |
|   +-------------------------------------------------------------------------------------------------+
+========================================================================================================+
```

---

## Directory Layout

* **`server/`**: Standalone Central Cloud Aggregator.
  * `server.py`: Flower central server entrypoint (gRPC port 8080).
  * `flora_strategy.py`: Custom FLoRA aggregation and client contribution accounting.
  * `server_registry.py`: Thread-safe SQLite database tracking registered clients, round metrics, and audit logs.
  * `data/server_history.db`: SQLite database storing activity and round history.
  * `models/global_lora_base/`: Reference master LoRA adapter weights.
  * `requirements_server.txt`: Minimal cloud server dependencies.
* **`client/`**: Standalone Edge Sentinel Node.
  * `edge/`: Python backend (FastAPI orchestrator, SensorManager, Correlator, RAGEngine, ThreatStore).
  * `models/`: Local client models (`xgboost/` with 5 sensor models + `securebert_lora/` with local LoRA adapter).
  * `data/`: Local ChromaDB vector store (`MITRE_ATTACK/chroma_db`) and local incident log (`threat_history.json`).
  * `frontend/`: Modern React 19 + Vite 8 + Tailwind CSS 4 SOC Operations Dashboard.
  * `requirements_client.txt`: Complete client dependencies.
* **`notebooks/`**: Central training pipelines (XGBoost feature extraction, ChromaDB builders, Colab SecureBERT training).
* **`scripts/`**: Automation tools and dataset download helpers.

---

## Quickstart

### 1. Launching the Central Server (Terminal 1)
```bash
# Activate Python environment
source venv/bin/activate

# Start Flower Aggregator with SQLite tracking on port 8080
PYTHONPATH=. python server/server.py
```

### 2. Launching the Edge Client Backend (Terminal 2)
```bash
# Activate Python environment
source venv/bin/activate

# Start FastAPI Sentinel Orchestrator on port 8000
PYTHONPATH=client uvicorn client.edge.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Launching the React SOC Dashboard (Terminal 3)
```bash
cd client/frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to monitor live telemetry, hardware KPIs, and trigger simulated attack campaigns.

---

## Verification Test Suite

```bash
# Test Server Component & SQLite Registry
PYTHONPATH=. python server/test_server.py

# Test Client Multi-Sensor Triage & Stage 2 Temporal Correlation
PYTHONPATH=client python client/edge/test_correlator.py

# Test Client Private RAG & MITRE Knowledge Engine
PYTHONPATH=client python client/edge/test_engines.py
```

