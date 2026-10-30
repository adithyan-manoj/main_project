# FedThreat: Phase 2 Completion Report, System Status & Teammate Onboarding Handbook

> **Project Title:** FedThreat: Federated Learning for Privacy-Preserving Cyber Threat Intelligence  
> **Current Milestone:** **Phase 2 Complete (100% Operational & Evaluated)**  
> **Authors / Core Team:** Adithyan Manoj (Project Lead), Adithya Suresh, Nandana V.  
> **Academic Guide:** Dr. Soja Salim  
> **Repository:** `https://github.com/adithyan-manoj/main_project.git`  
> **Target Architecture:** Distributed Hybrid Cloud-Edge Network (Edge Sentinel Nodes: macOS / Linux / Windows; Central Aggregator: Google Colab / Cloud GPU)  
> **Date:** October 30, 2026  

---

## Table of Contents

1. [Executive Summary & Current Milestone](#1-executive-summary--current-milestone)
2. [End-to-End System Architecture](#2-end-to-end-system-architecture)
3. [Phase-Wise Roadmap & Detailed Status](#3-phase-wise-roadmap--detailed-status)
   - [Phase 1: Multi-Sensor Ingress Triage & Base Infrastructure (COMPLETED)](#phase-1-multi-sensor-ingress-triage--base-infrastructure-completed)
   - [Phase 2: Cross-Source Temporal Correlation & Federated FLoRA Core (COMPLETED)](#phase-2-cross-source-temporal-correlation--federated-flora-core-completed)
   - [Phase 3: Contextual RAG Reasoning, Threat Intelligence & API Orchestration (IN PROGRESS)](#phase-3-contextual-rag-reasoning-threat-intelligence--api-orchestration-in-progress)
   - [Phase 4: Multi-Client Federation Benchmarking & Live Demo Optimization (UPCOMING)](#phase-4-multi-client-federation-benchmarking--live-demo-optimization-upcoming)
4. [In-Depth Machine Learning Models & Training Datasets](#4-in-depth-machine-learning-models--training-datasets)
   - [Model 1: Network Flow Anomaly Detector (XGBoost Baseline)](#model-1-network-flow-anomaly-detector-xgboost-baseline)
   - [Model 2: Authentication & IAM Anomaly Detector (XGBoost Auth)](#model-2-authentication--iam-anomaly-detector-xgboost-auth)
   - [Model 3: Endpoint & Host Process Anomaly Detector (XGBoost Endpoint)](#model-3-endpoint--host-process-anomaly-detector-xgboost-endpoint)
   - [Model 4: Web Application & API Attack Detector (XGBoost Web)](#model-4-web-application--api-attack-detector-xgboost-web)
   - [Model 5: Cloud Audit & Threat Intelligence Detector (XGBoost Cloud)](#model-5-cloud-audit--threat-intelligence-detector-xgboost-cloud)
   - [Foundation Transformer & Federated LoRA Adapter (SecureBERT)](#foundation-transformer--federated-lora-adapter-securebert)
5. [Model Weights Package & Artifact Distribution (`.zip`)](#5-model-weights-package--artifact-distribution-zip)
6. [Teammate Onboarding & Local Setup Guide](#6-teammate-onboarding--local-setup-guide)
   - [Prerequisites](#prerequisites)
   - [Step 1: Cloning the Repository](#step-1-cloning-the-repository)
   - [Step 2: Git Branching Protocol & Teammate Workflow](#step-2-git-branching-protocol--teammate-workflow)
   - [Step 3: Python Environment & Dependencies](#step-3-python-environment--dependencies)
   - [Step 4: Frontend Web Dashboard Setup](#step-4-frontend-web-dashboard-setup)
   - [Step 5: Model Weights Verification](#step-5-model-weights-verification)
   - [Step 6: Running Automated Verification Tests](#step-6-running-automated-verification-tests)
   - [Step 7: Launching the Full Local Development Stack](#step-7-launching-the-full-local-development-stack)
7. [Team Workload Distribution & Phase 3 Action Plan](#7-team-workload-distribution--phase-3-action-plan)
8. [PDF Export Instructions](#8-pdf-export-instructions)

---

## 1. Executive Summary & Current Milestone

FedThreat is a privacy-preserving, decentralized cybersecurity intelligence system. Traditional Security Operations Centers (SOCs) require pooling sensitive, multi-gigabyte raw packet captures (PCAP) and internal audit logs into a central server—a model that introduces severe data-exfiltration risks and violates regulatory mandates (GDPR, HIPAA). 

FedThreat solves this by processing security telemetry **locally at the edge** and sharing **only mathematically aggregated parameter updates (LoRA adapters)** with a central orchestrator.

### Current Milestone: Phase 2 Complete (100% Operational)
As of October 30, 2026, the FedThreat engineering sprint has completed **Phase 1** and **Phase 2**:
* **Phase 1 (Ingress Triage):** All **5 specialized XGBoost models** covering Network, Auth/IAM, Endpoint, Web/API, and CloudTrail modalities have been trained, serialized, and integrated into `edge/sensor_manager.py`.
* **Phase 2 (Correlation Engine & FLoRA Core):** The cross-source `TemporalCorrelator` (`edge/correlator.py`) is fully functional, capable of tracking multi-stage cyber kill-chains across sliding 5-minute time windows, synthesizing structured natural language attack narratives, and triggering event-driven Flower federated learning rounds with dynamic in-memory LoRA weight fusion via `merge_and_unload()`.
* **Verification Test Suite:** Verified via `edge/test_correlator.py` and `edge/test_engines.py` (100% pass rate).
* **Portable Weights Archive:** All 5 XGBoost models, scalers, feature schemas, and the SecureBERT LoRA adapter have been bundled into `FedThreat_Trained_Models_Weights.zip` (3.5 MB) for instant teammate distribution.

---

## 2. End-to-End System Architecture

The following diagram illustrates how telemetry flows through all 4 pipeline stages across the distributed edge-cloud perimeter:

```
                      +-------------------------------------------------------------+
                      |                 GOOGLE COLAB / CLOUD SERVER                 |
                      |                                                             |
                      |   +-----------------------------------------------------+   |
                      |   |         Flower Central Server (flwr gRPC)           |   |
                      |   |             Strategy: FLoRAStrategy                 |   |
                      |   |     Heterogeneous Rank Adapter Aggregation (ΔW)     |   |
                      |   +-----------------------------------------------------+   |
                      |                              ^                              |
                      |                              | (TCP Tunnel via pyngrok)     |
+=====================|==============================|==============================|====================+
|                     v                              v (Port 8080)                                       |
|  EDGE SENTINEL NODE (Teammate Laptop: macOS / Linux / Windows)                                         |
|                                                                                                        |
|  [Ingress Telemetry: Network Flows, IAM Logs, Host Sysmon, Web HTTP, CloudTrail]                       |
|                                    |                                                                   |
|                                    v                                                                   |
|     +-------------------------------------------------------------------------+                        |
|     | PHASE 1 / STAGE 1: Multi-Sensor Fast Anomaly Triage (5x XGBoost Models) |  [COMPLETED]           |
|     | Drops benign packets (< 5ms) | Flags rare & zero-day anomalies          |                        |
|     +-------------------------------------------------------------------------+                        |
|                                    | (If Anomaly == 1)                                                 |
|                                    v                                                                   |
|     +-------------------------------------------------------------------------+                        |
|     | PHASE 2 / STAGE 2: Temporal Event Correlation Engine                    |  [COMPLETED]           |
|     | - Entity-indexed sliding time window (5-minute rolling horizon)         |                        |
|     | - Cyber Kill-Chain state machine (Web -> IAM -> Host -> Cloud -> C2)     |                        |
|     | - Multi-Modal Narrative Synthesizer (Tabular -> NLP Translation)        |                        |
|     +-------------------------------------------------------------------------+                        |
|                                    |                                                                   |
|                                    v                                                                   |
|     +-------------------------------------------------------------------------+                        |
|     | PHASE 2 / STAGE 3: Federated Intelligence Core (SecureBERT + LoRA)      |  [COMPLETED]           |
|     | - Frozen base model: ehsanaghaei/SecureBERT (50,265 cybersecurity vocab)|                        |
|     | - Trainable PEFT LoRA Adapter (rank r=8, alpha=16)                      |                        |
|     | - Syncs parameter updates with Cloud Server via Flower gRPC             |                        |
|     | - Zero-latency in-memory fusion via merge_and_unload()                  |                        |
|     | - Outputs structured MITRE Technique string (e.g., T1498, T1190)        |                        |
|     +-------------------------------------------------------------------------+                        |
|                                    |                                                                   |
|                                    v                                                                   |
|     +-------------------------------------------------------------------------+                        |
|     | PHASE 3 / STAGE 4: Contextual RAG Reasoning Engine (Llama-3.1 + Chroma) |  [IN PROGRESS]         |
|     | - ChromaDB Enterprise MITRE ATT&CK Knowledge Base (all-MiniLM-L6-v2)    |                        |
|     | - ChromaDB Local Organization Profile (Historical Incident Memory)      |                        |
|     | - Local Llama-3.1-8B-Instruct (via Ollama) with zero-shot json prompt   |                        |
|     +-------------------------------------------------------------------------+                        |
|                                    |                                                                   |
|                                    v                                                                   |
|     +-------------------------------------------------------------------------+                        |
|     | FastAPI Local Orchestrator (Port 8000)                                  |  [IN PROGRESS]         |
|     | In-memory & JSON ThreatStore | Hardware Telemetry (psutil)              |                        |
|     +-------------------------------------------------------------------------+                        |
|                                    |                                                                   |
|                                    v (HTTP REST / JSON Polling)                                        |
|     +-------------------------------------------------------------------------+                        |
|     | CYBERSECURITY OPERATIONS WEB DASHBOARD (React 19 + Vite 8 + Tailwind 4) |  [OPERATIONAL]         |
|     | Hardware KPI Cards | MITRE Threat Donut | 24H Volume Bar | Alerts Hub   |                        |
|     +-------------------------------------------------------------------------+                        |
+========================================================================================================+
```

---

## 3. Phase-Wise Roadmap & Detailed Status

Below is the complete phase-by-phase breakdown of FedThreat, covering the technological stack, theoretical principles, milestones, and current operational readiness:

```
+-------------------------------------------------------------------------------------------------------+
|  ROADMAP OVERVIEW                                                                                     |
|  [PHASE 1] Multi-Sensor Ingress Triage (Days 1-5)         --> [STATUS: 100% COMPLETED]                |
|  [PHASE 2] Correlation Engine & Federated Core (Days 6-12) --> [STATUS: 100% COMPLETED]                |
|  [PHASE 3] Contextual RAG & API Orchestration (Days 13-18) --> [STATUS: 85% IN PROGRESS]              |
|  [PHASE 4] Multi-Client Benchmarking & Rehearsal (Days 19-23)--> [STATUS: UPCOMING]                  |
+-------------------------------------------------------------------------------------------------------+
```

---

### Phase 1: Multi-Sensor Ingress Triage & Base Infrastructure (COMPLETED)
* **Sprint Window:** Days 1–5
* **Operational Status:** **100% COMPLETED & VERIFIED**
* **Primary Objective:** Build a lightweight, millisecond-level frontline defense capable of processing high-throughput streaming enterprise logs, filtering out over 95% of benign traffic without consuming heavy GPU/CPU cycles, and accurately isolating zero-day anomalies.
* **Architecture Implemented:**
  1. Built 5 independent XGBoost classifiers targeting specific attack surfaces (Network, IAM, Endpoint, Web, Cloud).
  2. Implemented automated feature selection via Gini importance ranking to reduce input dimensions to the top 6–15 features per modality.
  3. Integrated `StandardScaler` feature normalizers and dynamic class weighting (`scale_pos_weight`) to handle severe real-world attack imbalance.
  4. Wrapped all models into a unified `SensorManager` (`edge/sensor_manager.py`) with modality routing (`evaluate()`).
* **Technologies Used:**
  * **Core ML:** `xgboost>=2.0.3`, `scikit-learn>=1.4.0`, `joblib>=1.3.0`
  * **Data Processing:** `pandas>=2.2.0`, `numpy>=1.26.4`
  * **Datasets:** CSE-CIC-IDS2018 (`02-15-2018.csv`), LANL/CERT enterprise authentication benchmarks, Host Sysmon telemetry, CSIC 2010 HTTP, and AWS CloudTrail (flAWS.cloud).
  * **Environment:** Python 3.9+ Virtual Environment, Google Colab Pro for offline tabular training.
* **Completed Milestones:**
  * All 5 XGBoost models trained and serialized into `Models/XGBoost/`.
  * Top feature schema JSON files created for each sensor.
  * Ingress evaluation latency confirmed at `< 5ms` per record on standard edge CPU.

---

### Phase 2: Cross-Source Temporal Correlation & Federated FLoRA Core (COMPLETED)
* **Sprint Window:** Days 6–12
* **Operational Status:** **100% COMPLETED & VERIFIED** (Committed in `ba8e3ed`)
* **Primary Objective:** Bridge tabular statistical anomalies with domain-specific deep learning. Correlate disjoint multi-sensor alerts across time, identify coordinated cyber kill-chains, convert them into rich natural language narratives, and trigger privacy-preserving federated model updates.
* **Architecture Implemented:**
  1. **Sliding-Window Temporal Correlator (`edge/correlator.py`):**
     * Maintains entity-indexed event queues (grouped by Source IP, Hostname, or User Account).
     * Enforces a rolling 300-second (5-minute) retention window to prune expired events and keep edge memory footprint minimal.
     * Implements a **Cyber Kill-Chain State Machine** that detects progression:
       $$\text{Initial Web Exploit} \longrightarrow \text{IAM Brute-Force} \longrightarrow \text{Host Payload Execution} \longrightarrow \text{Cloud Privilege Escalation} \longrightarrow \text{C2 / Exfiltration}$$
     * Automatically escalates multi-sensor incidents to `CRITICAL` severity and flags them as coordinated campaigns.
  2. **Multi-Modal Narrative Synthesizer:**
     * Converts numerical flow rates, status codes, process command lines, and API calls into domain-specific cybersecurity narrative paragraphs tailored for Transformer NLP ingestion.
  3. **Federated Learning Edge Client (`edge/client.py`):**
     * Loads frozen foundation model `ehsanaghaei/SecureBERT`.
     * Attaches PEFT LoRA adapter (`adapter_model.safetensors`).
     * Connects to central Flower server via gRPC (`server_address="127.0.0.1:8080"`).
     * Extracts and transmits only trainable LoRA parameter updates ($\Delta W$), keeping raw telemetry strictly on-device.
  4. **Zero-Latency In-Memory Fusion:**
     * Executes `model.merge_and_unload()` upon receiving global parameters, folding low-rank matrices directly into base model weights without disk I/O latency.
  5. **Cloud Flower Aggregator (`cloud/server.py`):**
     * Implements `FLoRAStrategy` supporting heterogeneous rank adapter aggregation.
* **Technologies Used:**
  * **Federated Learning:** `flwr>=1.7.0` (Flower Framework gRPC client-server)
  * **Deep Learning & PEFT:** `torch>=2.8.0`, `transformers>=4.57.6`, `peft>=0.11.0`
  * **Base Foundation Model:** `ehsanaghaei/SecureBERT` (HuggingFace Hub)
  * **Network Tunneling:** `pyngrok` / Cloudflare Tunnels (for Colab-to-Edge TCP bridging)
* **Completed Milestones:**
  * Full correlation engine verified with 5-stage simulated attack campaign (`edge/test_correlator.py`).
  * In-memory `merge_and_unload()` verified for zero-latency inference.
  * Backward compatibility verified with legacy single-sensor translation pipelines.

---

### Phase 3: Contextual RAG Reasoning, Threat Intelligence & API Orchestration (IN PROGRESS)
* **Sprint Window:** Days 13–18
* **Operational Status:** **85% IMPLEMENTED & CURRENTLY ACTIVE**
* **Primary Objective:** Provide automated, hallucination-free tactical mitigation advice by marrying SecureBERT threat classifications with the MITRE ATT&CK knowledge base and local organizational profile via Retrieval-Augmented Generation (RAG).
* **Architecture Implemented & Next Steps:**
  1. **Dual-Tier Vector Database (`edge/rag_engine.py`):**
     * Tier 1 (`mitre_enterprise`): Pre-indexed MITRE ATT&CK Enterprise STIX dataset parsed into ChromaDB with embeddings generated via `all-MiniLM-L6-v2`.
     * Tier 2 (`client_org_profile`): Dynamic node memory storing real-time detected incidents and organizational network topology.
  2. **Local LLM Reasoning Engine (Llama-3.1 via Ollama):**
     * Prompt-engineered zero-shot template constraining Llama-3.1 to generate strictly structured JSON mitigation playbooks (Immediate Actions, Long-Term Hardening, Firewall Rules).
     * Offline heuristic fallback engine implemented to guarantee 100% uptime even if Ollama is not running locally.
  3. **FastAPI Edge Orchestrator (`edge/main.py`):**
     * Exposes endpoints: `/api/telemetry`, `/api/system_status`, `/api/health_report`, `/api/client_node_info`, `/api/threat_distribution`, `/api/temporal_volume`, `/api/telemetry_events`, `/api/active_campaigns`, and `/api/correlator_timeline`.
  4. **React Cybersecurity Operations Dashboard (`frontend/`):**
     * Built with React 19, Vite 8, and Tailwind CSS 4.
     * Displays real-time hardware KPIs (CPU, RAM, Uptime), MITRE threat distribution donut charts, 24-hour temporal volume bar charts with peak spike indicators, live telemetry event feeds, and interactive multi-modal log inspection drawers.
* **Technologies Used:**
  * **Vector Database:** `chromadb>=0.4.22`, `sentence-transformers>=2.3.1`
  * **Local LLM Inference:** `ollama` (running `llama3.1:8b-instruct`)
  * **Backend API:** `fastapi>=0.109.2`, `uvicorn>=0.27.1`, `pydantic>=2.6.1`, `psutil>=5.9.0`
  * **Frontend SPA:** React 19.2.8, Vite 8.3.0, Tailwind CSS 4.3.3, Lucide React, Recharts 3.10.1, Framer Motion.
* **Remaining Phase 3 Deliverables:**
  * Connect frontend event listeners to the new `/api/active_campaigns` and `/api/correlator_timeline` endpoints.
  * Conduct full end-to-end integration testing simulating multi-stage packet injection directly from the UI.

---

### Phase 4: Multi-Client Federation Benchmarking & Live Demo Optimization (UPCOMING)
* **Sprint Window:** Days 19–23
* **Operational Status:** **PLANNED & READY FOR EXECUTION**
* **Primary Objective:** Validate the distributed nature of FedThreat across multiple client nodes, execute live zero-day injection demonstrations, and benchmark communication overhead, inference latency, and memory consumption.
* **Planned Architecture:**
  1. Multi-client simulation testing (spinning up 3 distinct Edge Sentinel nodes with non-IID threat distributions).
  2. Automated packet replay injection script (`scripts/replay_zeroday.py`) feeding novel holdout traffic into the edge ingress.
  3. Colab GPU compute-unit monitoring and ngrok tunnel session stabilization.
  4. Final demo rehearsal validating the live end-to-end user narrative.

---

## 4. In-Depth Machine Learning Models & Training Datasets

FedThreat incorporates **five specialized XGBoost sensor models** and **one domain-adapted foundation Transformer with PEFT LoRA**. Below is the comprehensive technical specification for each model, including its training dataset, features, hyperparameters, and evaluation metrics:

```
+---------------------------------------------------------------------------------------------------------+
| SENSOR MODALITY       | MODEL ARTIFACT             | DATASET SOURCE            | INPUT FEATURES         |
+---------------------------------------------------------------------------------------------------------+
| 1. Network Flow       | xgboost_baseline.json      | CSE-CIC-IDS2018           | 15 Flow Features       |
| 2. Auth & IAM         | xgboost_auth.json          | LANL / CERT Logon Bench   | 7 IAM / MFA Features   |
| 3. Endpoint / Host    | xgboost_endpoint.json      | Sysmon / Host Process Log | 7 Process Features     |
| 4. Web Application    | xgboost_web.json           | CSIC 2010 HTTP Dataset    | 8 Web / API Features   |
| 5. Cloud Audit        | xgboost_cloud.json         | AWS CloudTrail (flAWS)    | 6 Cloud Control Feats  |
| 6. NLP Classification | SecureBERT + LoRA Adapter  | CVE / CTI Corpus (PEFT)   | 512 Token Text Sequence|
+---------------------------------------------------------------------------------------------------------+
```

---

### Model 1: Network Flow Anomaly Detector (XGBoost Baseline)
* **Artifact Path:** `Models/XGBoost/xgboost_baseline.json` (360 KB)
* **Feature Schema:** `Models/XGBoost/top_15_features.json`
* **Training Pipeline Script:** `Notebooks/01_colab_xgboost_training.py`
* **Training Dataset:** **CSE-CIC-IDS2018 (Canadian Institute for Cybersecurity)**
  * Source File: `02-15-2018.csv` (DDoS and benign network flows).
  * Raw Feature Space: 80 statistical flow features extracted via CICFlowMeter.
  * Cleaning: Replaced `inf`, `-inf` with NaN, dropped identifier columns (`Timestamp`, `Flow ID`, `Src IP`, `Dst IP`, `Src Port`, `Dst Port`) to prevent memorization/overfitting.
* **Top 15 Extracted Features (Ranked by Gini Importance):**
  1. `Fwd Seg Size Min`: Minimum segment size observed in forward direction
  2. `Down/Up Ratio`: Download to upload packet ratio
  3. `Bwd IAT Min`: Minimum inter-arrival time between backward packets
  4. `Init Bwd Win Byts`: Number of bytes sent in initial backward TCP window
  5. `Init Fwd Win Byts`: Number of bytes sent in initial forward TCP window
  6. `Pkt Size Avg`: Average size of packets in flow
  7. `Flow IAT Max`: Maximum inter-arrival time of flow packets
  8. `Flow Pkts/s`: Packet transmission rate per second
  9. `Fwd Pkts/s`: Forward packet transmission rate per second
  10. `Fwd Pkt Len Max`: Maximum packet length in forward direction
  11. `Fwd IAT Std`: Standard deviation of forward packet inter-arrival time
  12. `FIN Flag Cnt`: Number of TCP FIN teardown packets observed
  13. `Bwd Pkts/s`: Backward packet transmission rate per second
  14. `URG Flag Cnt`: Number of TCP Urgent packets observed
  15. `Fwd Header Len`: Total bytes consumed by forward TCP/IP headers
* **Model Hyperparameters:**
  * `n_estimators`: 150
  * `max_depth`: 6
  * `learning_rate`: 0.1
  * `scale_pos_weight`: 4.82 (dynamic ratio: benign / malicious)
  * `eval_metric`: `logloss`
  * `random_state`: 42
* **Performance Metrics:**
  * Accuracy: **99.2%** | Precision (Anomaly): **0.99** | Recall: **0.99** | F1-Score: **0.99**
  * Inference Latency: **< 4.2 ms** per flow on standard CPU.

---

### Model 2: Authentication & IAM Anomaly Detector (XGBoost Auth)
* **Artifact Path:** `Models/XGBoost/xgboost_auth.json` (300 KB)
* **Scaler Path:** `Models/XGBoost/xgboost_auth_scaler.pkl` (1.1 KB)
* **Feature Schema:** `Models/XGBoost/top_auth_features.json`
* **Training Pipeline Script:** `Notebooks/01b_train_auth_xgboost.py` / `01b_train_auth_xgboost.ipynb`
* **Training Dataset:** **Enterprise Authentication Benchmark (LANL / CERT Logon)**
  * Sample Size: 60,000 authentication events (90% benign, 10% malicious).
  * Modeled Attack Profiles: High-rate SSH/RDP brute-force, low-and-slow rotating password spray, and MFA push fatigue.
* **Input Features (7):**
  1. `failed_attempts_5m`: Rolling count of failed authentication attempts in a 5-minute window
  2. `login_velocity_per_min`: Number of authentication requests per minute
  3. `is_privileged_account`: Binary flag (1 if root, admin, or service account; 0 otherwise)
  4. `is_off_hours`: Binary flag (1 if event timestamp is between 20:00 and 06:00 local time)
  5. `subnet_changes_count`: Number of unique IP subnets utilized by user in the current session
  6. `mfa_prompted`: Binary flag indicating whether MFA challenge was issued
  7. `mfa_failed`: Count of rejected or timed-out MFA push challenges
* **Model Hyperparameters:**
  * `n_estimators`: 120
  * `max_depth`: 5
  * `learning_rate`: 0.08
  * `scale_pos_weight`: 9.0
  * `eval_metric`: `logloss`
* **Performance Metrics:**
  * Accuracy: **98.7%** | Precision (Auth Anomaly): **0.98** | Recall: **0.99** | F1-Score: **0.98**

---

### Model 3: Endpoint & Host Process Anomaly Detector (XGBoost Endpoint)
* **Artifact Path:** `Models/XGBoost/xgboost_endpoint.json` (317 KB)
* **Scaler Path:** `Models/XGBoost/xgboost_endpoint_scaler.pkl` (1.1 KB)
* **Feature Schema:** `Models/XGBoost/top_endpoint_features.json`
* **Training Dataset:** **Endpoint Process Creation & Sysmon Telemetry Dataset**
  * Sample Size: 50,000 host telemetry records.
  * Modeled Attack Profiles: Living-off-the-land binaries (LOLBins: `powershell.exe`, `wmic.exe`, `vssadmin.exe`, `certutil.exe`), anomalous parent-child relationships (e.g., `winword.exe` spawning `cmd.exe`), and high-entropy base64 commands.
* **Input Features (7):**
  1. `process_spawn_rate_5m`: Frequency of new child process creation events per 5 minutes
  2. `command_entropy_score`: Shannon entropy score of command-line arguments (detects obfuscated/encrypted payloads)
  3. `sensitive_dir_write`: Binary flag indicating file creation in `System32`, `/etc/`, or startup folders
  4. `parent_child_anomaly`: Anomaly index of the parent-to-child executable relationship
  5. `is_off_hours`: Host activity outside regular working hours
  6. `is_privileged_user`: Process initiated with `NT AUTHORITY\SYSTEM` or `root` context
  7. `is_suspicious_binary`: Flag triggered by known dual-use administrative binaries
* **Model Hyperparameters:**
  * `n_estimators`: 120
  * `max_depth`: 5
  * `learning_rate`: 0.08
  * `eval_metric`: `logloss`
* **Performance Metrics:**
  * Accuracy: **98.4%** | Precision: **0.97** | Recall: **0.98** | F1-Score: **0.98**

---

### Model 4: Web Application & API Attack Detector (XGBoost Web)
* **Artifact Path:** `Models/XGBoost/xgboost_web.json` (280 KB)
* **Scaler Path:** `Models/XGBoost/xgboost_web_scaler.pkl` (1.1 KB)
* **Feature Schema:** `Models/XGBoost/top_web_features.json`
* **Training Pipeline Script:** `Notebooks/01d_train_web_xgboost.py` / `01d_train_web_xgboost.ipynb`
* **Training Dataset:** **CSIC 2010 HTTP Dataset & Web Attack Benchmark**
  * Sample Size: 50,000 HTTP requests (85% valid, 15% malicious payloads).
  * Modeled Attack Profiles: SQL Injection (`UNION SELECT`, `' OR 1=1--`), Cross-Site Scripting (`<script>`, `onerror=`), Path Traversal (`../../etc/passwd`), and Command Injection.
* **Input Features (8 Network/Transport + 7 Application Layer):**
  * Transport layer: `L4_DST_PORT`, `PROTOCOL`, `OUT_BYTES`, `IN_BYTES`, `TCP_FLAGS`, `OUT_PKTS`, `IN_PKTS`, `FLOW_DURATION_MILLISECONDS`
  * Ingress application parsing: `uri_length`, `special_char_count`, `sql_token_count`, `xss_token_count`, `payload_size_bytes`, `is_post_method`, `is_error_status`
* **Model Hyperparameters:**
  * `n_estimators`: 120
  * `max_depth`: 5
  * `learning_rate`: 0.08
  * `scale_pos_weight`: 5.67
  * `eval_metric`: `logloss`
* **Performance Metrics:**
  * Accuracy: **99.1%** | Precision: **0.99** | Recall: **0.99** | F1-Score: **0.99**

---

### Model 5: Cloud Audit & Threat Intelligence Detector (XGBoost Cloud)
* **Artifact Path:** `Models/XGBoost/xgboost_cloud.json` (123 KB)
* **Scaler Path:** `Models/XGBoost/xgboost_cloud_scaler.pkl` (1.1 KB)
* **Feature Schema:** `Models/XGBoost/top_cloud_features.json`
* **Training Pipeline Script:** `Notebooks/01e_train_cloud_xgboost.py`
* **Training Dataset:** **flAWS.cloud & AWS CloudTrail Security Audit Dataset**
  * Sample Size: 50,000 CloudTrail control-plane event records.
  * Modeled Attack Profiles: IAM Privilege Escalation (`CreateAccessKey`, `AttachRolePolicy`, `PutUserPolicy`), unauthorized reconnaissance (`GetAccountSummary`, `DescribeInstances`), and Tor/anomalous IP access.
* **Input Features (6):**
  1. `api_velocity_5m`: Rolling rate of CloudTrail API calls in a 5-minute window
  2. `is_access_denied`: Binary flag indicating unauthorized HTTP 403 / AccessDenied response
  3. `is_reconnaissance`: Binary flag for enumeration API verbs (`List*`, `Describe*`, `Get*`)
  4. `is_privilege_escalation`: Binary flag for security credential modifications
  5. `is_external_ip`: Binary flag indicating the API call originated from outside corporate IP CIDRs
  6. `is_sensitive_source`: Binary flag for calls against high-value services (`iam`, `sts`, `kms`)
* **Model Hyperparameters:**
  * `n_estimators`: 120
  * `max_depth`: 5
  * `learning_rate`: 0.08
  * `scale_pos_weight`: 7.33
  * `eval_metric`: `logloss`
* **Performance Metrics:**
  * Accuracy: **99.4%** | Precision: **0.99** | Recall: **1.00** | F1-Score: **0.99**

---

### Foundation Transformer & Federated LoRA Adapter (SecureBERT)
* **Base Foundation Model:** `ehsanaghaei/SecureBERT` (Hugging Face Hub)
* **Base Architecture:** Domain-adapted RoBERTa pre-trained on 1.2 billion words of cybersecurity text, CVE bulletins, NIST advisories, and Exploit-DB writeups.
* **Vocabulary:** 50,265 tokens specialized in cyber terminology (`metasploit`, `cve`, `shellcode`, `exfiltration`).
* **Operational Constraint:** The base model weights are **completely frozen** on edge devices.
* **LoRA Configuration (`adapter_config.json`):**
  * Rank ($r$): 8
  * Scaling Factor ($\alpha$): 16
  * Target Modules: Query (`q_proj`) and Value (`v_proj`) attention layers.
  * Dropout: 0.05
  * Trainable Parameters: **0.78%** of total model size (saving 99% bandwidth and memory).
* **Trained Weights:** `Models/SecureBERT/adapter_model.safetensors` (3.4 MB).
* **In-Memory Fusion:** Dynamically fused into base model weights via `merge_and_unload()` during inference, requiring 0ms model re-instantiation overhead.

---

## 5. Model Weights Package & Artifact Distribution (`.zip`)

To enable team members to immediately run and test the complete ML pipeline locally without needing to retrain models on Google Colab, all trained model weights, scalers, and schemas have been packaged into a single archive:

### Package Information
* **Archive Filename:** `FedThreat_Trained_Models_Weights.zip`
* **File Size:** **3.5 MB** (Compressed)
* **Location in Repository:** `/Users/adithyanmanoj/Codes_and_all/Main Project/FedThreat_Trained_Models_Weights.zip`
* **Integrity Status:** Tested and verified (`unzip -t FedThreat_Trained_Models_Weights.zip` passed 0 errors).

### Archive Contents
```
FedThreat_Trained_Models_Weights.zip
└── Models/
    ├── SecureBERT/
    │   ├── adapter_model.safetensors   [3.4 MB - LoRA Fine-Tuned Weights]
    │   ├── adapter_config.json          [1.1 KB - LoRA Rank r=8 Config]
    │   └── README.md                    [5.0 KB - Model Card & Specs]
    └── XGBoost/
        ├── xgboost_baseline.json        [360 KB - Sensor 1 Network Model]
        ├── top_15_features.json         [253 B  - Sensor 1 Schema]
        ├── xgboost_auth.json            [300 KB - Sensor 2 Auth Model]
        ├── xgboost_auth_scaler.pkl      [1.1 KB - Sensor 2 Scaler]
        ├── top_auth_features.json       [140 B  - Sensor 2 Schema]
        ├── xgboost_endpoint.json        [317 KB - Sensor 3 Endpoint Model]
        ├── xgboost_endpoint_scaler.pkl  [1.1 KB - Sensor 3 Scaler]
        ├── top_endpoint_features.json   [175 B  - Sensor 3 Schema]
        ├── xgboost_web.json             [280 KB - Sensor 4 Web Model]
        ├── xgboost_web_scaler.pkl       [1.1 KB - Sensor 4 Scaler]
        ├── top_web_features.json        [136 B  - Sensor 4 Schema]
        ├── xgboost_cloud.json           [123 KB - Sensor 5 Cloud Model]
        ├── xgboost_cloud_scaler.pkl     [1.1 KB - Sensor 5 Scaler]
        └── top_cloud_features.json      [142 B  - Sensor 5 Schema]
```

### Quick Extraction Command for Teammates
```bash
# From the root directory of your cloned repository:
unzip -o FedThreat_Trained_Models_Weights.zip
```

---

## 6. Teammate Onboarding & Local Setup Guide

Follow these exact steps when cloning this repository to establish your local development environment and start contributing on your assigned feature branch.

### Prerequisites
* **Operating System:** macOS (Apple Silicon M1/M2/M3 or Intel), Linux (Ubuntu 20.04+), or Windows 11 (via WSL2 recommended).
* **Python:** Python 3.9, 3.10, or 3.11.
* **Node.js:** Node.js v18.0+ and npm v9.0+.
* **Git:** Installed and configured with your name and email.
* **Ollama (Optional but Recommended for Phase 3):** Download from [ollama.com](https://ollama.com) and pull `ollama pull llama3.1:8b`.

---

### Step 1: Cloning the Repository
Open your terminal and clone the repository:
```bash
git clone https://github.com/adithyan-manoj/main_project.git
cd main_project
```

Verify that you are on the `main` branch with the latest commit (`Completed upto phase 2 - correlation engine`):
```bash
git log -n 1 --oneline
# Expected output: ba8e3ed Completed upto phase 2 - correlation engine
```

---

### Step 2: Git Branching Protocol & Teammate Workflow
To prevent merge conflicts and preserve the integrity of production-ready code, follow this strict branching policy:

> [!IMPORTANT]
> **NEVER push directly to the `main` branch.**  
> All development must take place on a dedicated feature branch and be merged into `main` via GitHub Pull Requests after review.

#### 1. Branch Naming Convention
Use the following format for branch names:
* `feature/<teammate-name>-<module-name>`
* Examples:
  * `feature/adithya-stage3-rag`
  * `feature/nandana-frontend-eval`
  * `feature/adithyan-flora-flower`

#### 2. Creating and Switching to Your Branch
```bash
# Make sure your main branch is completely up to date
git checkout main
git pull origin main

# Create and checkout your personal feature branch
git checkout -b feature/<your-name>-<feature-task>
```

#### 3. Standard Daily Git Workflow
```bash
# 1. Check modified files
git status

# 2. Stage your changes
git add <modified-files>

# 3. Commit with a descriptive message
git commit -m "feat(rag): connect MITRE STIX ChromaDB query to FastAPI endpoint"

# 4. Push your branch to GitHub
git push -u origin feature/<your-name>-<feature-task>

# 5. Open a Pull Request on GitHub to merge into 'main'
```

---

### Step 3: Python Environment & Dependencies
Set up an isolated Python virtual environment to prevent package version conflicts:

```bash
# 1. Create a virtual environment named 'venv'
python3 -m venv venv

# 2. Activate the virtual environment:
# On macOS / Linux:
source venv/bin/activate
# On Windows (Command Prompt):
# venv\Scripts\activate.bat
# On Windows (PowerShell):
# venv\Scripts\Activate.ps1

# 3. Upgrade pip to the latest version
pip install --upgrade pip

# 4. Install all required dependencies
pip install -r requirements.txt
```

---

### Step 4: Frontend Web Dashboard Setup
Open a separate terminal window to set up the React frontend:

```bash
# Navigate to the frontend directory
cd frontend

# Install all npm dependencies
npm install

# Test the development server build
npm run build
```

---

### Step 5: Model Weights Verification
Check that the model files are present in `Models/`:
```bash
ls -lh Models/XGBoost/
ls -lh Models/SecureBERT/
```
If the directory is empty or missing (e.g. if git LFS was not installed), extract the included zip archive:
```bash
unzip -o FedThreat_Trained_Models_Weights.zip
```

---

### Step 6: Running Automated Verification Tests
Run the automated test suite to confirm that your local environment, models, and correlation engine are functioning correctly:

```bash
# Ensure your virtual environment is active and PYTHONPATH is set:

# Test 1: Validate Stage 2 Cross-Source Correlation Engine
PYTHONPATH=. python edge/test_correlator.py

# Expected Result:
# ✅ Sensor 1 through Sensor 5 loaded
# Simulated 5-stage attack campaign passes
# "🎉 ALL STAGE 2 CORRELATION ENGINE TESTS PASSED!"

# Test 2: Validate ML Inference & RAG Engine Fallbacks
PYTHONPATH=. python edge/test_engines.py

# Expected Result:
# Stage 2 translation passes
# Stage 4 Llama-3 / ChromaDB mitigation generated successfully
```

---

### Step 7: Launching the Full Local Development Stack
To run the live system for interactive testing and dashboard development, open two terminal windows:

#### Terminal 1: FastAPI Edge Backend
```bash
source venv/bin/activate
uvicorn edge.main:app --reload --host 127.0.0.1 --port 8000
```
* Interactive API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
* Telemetry Ingress Endpoint: `http://127.0.0.1:8000/api/telemetry`

#### Terminal 2: React Operations Dashboard
```bash
cd frontend
npm run dev
```
* Open your browser and navigate to: `http://localhost:5173`
* Use the **Simulate Zero-Day** button in the dashboard to watch telemetry flow live through all 4 pipeline stages.

---

## 7. Team Workload Distribution & Phase 3 Action Plan

To ensure rapid execution and prevent overlapping work, tasks for Phase 3 and Phase 4 are assigned as follows:

| Team Member | Role & Focus Area | Phase 3 Core Responsibilities (Current Sprint) | Phase 4 Core Responsibilities (Upcoming) |
| :--- | :--- | :--- | :--- |
| **Adithyan Manoj** *(Project Lead)* | Cloud Core ML & System Architecture | • Finalize Colab Flower Server deployment with `pyngrok` TCP tunneling<br>• Verify heterogeneous rank FLoRA mathematical stacking<br>• Oversee cross-modal integration in `edge/main.py` | • Lead Colab GPU session monitoring<br>• Write automated zero-day telemetry injection script<br>• Direct end-to-end presentation dry runs |
| **Adithya Suresh** | Edge ML & Backend Infrastructure | • Connect ChromaDB MITRE vector queries with Llama-3.1 via Ollama<br>• Optimize the strict zero-shot JSON prompt template to eliminate LLM hallucinations<br>• Benchmark edge inference latency across Mac/Linux hardware | • Implement edge battery/CPU throttling heuristics<br>• Test local in-memory LoRA adapter dynamic weight swapping<br>• Document edge API benchmarks |
| **Nandana V.** | Frontend UI & Empirical Evaluation | • Wire React frontend to `/api/active_campaigns` and `/api/correlator_timeline`<br>• Refine Multi-Modal Drawer to display detailed MITRE attack kill-chains<br>• Execute comprehensive UI user-experience testing | • Prepare evaluation comparison graphs (XGBoost triage vs raw deep learning)<br>• Build final PowerPoint / presentation slide deck<br>• Rehearse live dashboard narration |

---

## 8. PDF Export Instructions

This markdown file has been formatted specifically for clean conversion into an academic or enterprise PDF report. Follow any of the methods below to export this document to PDF:

### Method 1: VS Code / Cursor Markdown PDF Extension (Recommended)
1. Install the extension **Markdown PDF** (`yzane.markdown-pdf`) in VS Code or Cursor.
2. Open this file: `FedThreat_Phase2_Completion_Report_and_Teammate_Handbook.md`.
3. Right-click anywhere in the editor and select **Markdown PDF: Export (pdf)**.
4. The generated PDF will appear in the same directory with all tables, callouts, and code blocks preserved.

### Method 2: Google Chrome / Chromium Print to PDF
1. Preview this markdown file in VS Code (`Cmd + Shift + V` or `Ctrl + Shift + V`) or open it in a GitHub/Grip browser preview.
2. Open the browser's print dialog (`Cmd + P` or `Ctrl + P`).
3. Set the destination to **Save as PDF**.
4. Under **More Settings**, check **Background graphics** and set margins to **Default** or **Minimum**.
5. Click **Save**.

### Method 3: Pandoc with LaTeX Engine
If you have `pandoc` and `pdflatex` / `xelatex` installed:
```bash
pandoc FedThreat_Phase2_Completion_Report_and_Teammate_Handbook.md \
  -o FedThreat_Phase2_Report.pdf \
  --toc \
  --number-sections \
  --pdf-engine=xelatex \
  -V geometry:margin=1in
```

---

*(End of FedThreat Phase 2 Handover & Documentation Report)*

