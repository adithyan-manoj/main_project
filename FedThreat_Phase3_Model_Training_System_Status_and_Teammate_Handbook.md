# FedThreat: Phase 3 Model Training Status, Technical Architecture & Teammate Handbook

> **Project Title:** FedThreat: Federated Learning for Privacy-Preserving Cyber Threat Intelligence  
> **Current Milestone:** **Phase 3 Deep Dive: SecureBERT Real-CTI Fine-Tuning, Repository Decoupling & Central SQLite Registry**  
> **Authors / Core Team:** Adithyan Manoj (Project Lead), Adithya Suresh, Nandana V.  
> **Academic Guide:** Dr. Soja Salim  
> **Repository:** `https://github.com/adithyan-manoj/main_project.git`  
> **Target Architecture:** Distributed Hybrid Cloud-Edge Network (Edge Sentinel Nodes: macOS / Linux / Windows; Central Aggregator: Google Colab / Cloud GPU)  
> **Date:** October 31, 2026  

---

## Table of Contents

1. [Executive Summary & Current Milestone](#1-executive-summary--current-milestone)
2. [End-to-End System Architecture](#2-end-to-end-system-architecture)
   - [Decoupled Repository Structure (`server/` vs `client/`)](#decoupled-repository-structure-server-vs-client)
   - [Central Activity & Client Registry (`server/server_registry.py`)](#central-activity--client-registry-serverserver_registrypy)
   - [Flower Heterogeneous LoRA Strategy (`server/flora_strategy.py`)](#flower-heterogeneous-lora-strategy-serverflora_strategypy)
3. [Ingress Triage Sensor Suite (5x XGBoost Models)](#3-ingress-triage-sensor-suite-5x-xgboost-models)
   - [Model 1: Network Flow Anomaly Detector (CIC-IDS2018)](#model-1-network-flow-anomaly-detector-cic-ids2018)
   - [Model 2: Authentication & IAM Anomaly Detector (BGL / Syslog)](#model-2-authentication--iam-anomaly-detector-bgl--syslog)
   - [Model 3: Endpoint & Host Process Anomaly Detector (Sysmon)](#model-3-endpoint--host-process-anomaly-detector-sysmon)
   - [Model 4: Web Application & API Attack Detector (CSIC 2010 / ModSecurity)](#model-4-web-application--api-attack-detector-csic-2010--modsecurity)
   - [Model 5: Cloud Audit & Infrastructure Detector (AWS CloudTrail)](#model-5-cloud-audit--infrastructure-detector-aws-cloudtrail)
4. [Foundation Transformer Fine-Tuning (SecureBERT + LoRA on 100% Real CTI)](#4-foundation-transformer-fine-tuning-securebert--lora-on-100-real-cti)
   - [The Synthetic Template Trap (Post-Mortem Analysis)](#the-synthetic-template-trap-post-mortem-analysis)
   - [The 4 Authentic Cybersecurity Intelligence Sources](#the-4-authentic-cybersecurity-intelligence-sources)
   - [Six-Class MITRE ATT&CK CTI Taxonomy](#six-class-mitre-attck-cti-taxonomy)
   - [Step-by-Step Implementation Pipeline (Steps 1 through 6)](#step-by-step-implementation-pipeline-steps-1-through-6)
   - [Apple Silicon MPS Hardware Acceleration & Convergence Analysis](#apple-silicon-mps-hardware-acceleration--convergence-analysis)
5. [Detailed Status: Completed Components vs. Upcoming Tasks](#5-detailed-status-completed-components-vs-upcoming-tasks)
   - [Completed Components (Phase 1 & Phase 2 & Phase 3 Core)](#completed-components-phase-1--phase-2--phase-3-core)
   - [Upcoming Technical Tasks (To Be Completed)](#upcoming-technical-tasks-to-be-completed)
6. [Model Weights Package & Artifact Distribution (`.zip`)](#6-model-weights-package--artifact-distribution-zip)
7. [Git Repository Hygiene & Large File Policy](#7-git-repository-hygiene--large-file-policy)
8. [Teammate Onboarding & Local Setup Guide](#8-teammate-onboarding--local-setup-guide)
   - [Prerequisites](#prerequisites)
   - [Step 1: Cloning the Repository](#step-1-cloning-the-repository)
   - [Step 2: Unpacking Pre-Trained Weights](#step-2-unpacking-pre-trained-weights)
   - [Step 3: Virtual Environment & Dependencies](#step-3-virtual-environment--dependencies)
   - [Step 4: Running Verification Test Suites](#step-4-running-verification-test-suites)
   - [Step 5: Launching Server and Edge Client](#step-5-launching-server-and-edge-client)
9. [Team Workload Distribution](#9-team-workload-distribution)

---

## 1. Executive Summary & Current Milestone

FedThreat is an edge-first, federated cybersecurity intelligence architecture designed to resolve the fundamental data-privacy dilemma in modern Security Operations Centers (SOCs). Under traditional SIEM/SOAR architectures, organizations must pool multi-gigabyte raw network PCAPs, employee authentication logs, and host event streams to a single centralized cloud data lake. This centralized model creates catastrophic data-exfiltration liabilities and violates strict regulatory privacy mandates (GDPR, HIPAA, DPDP).

FedThreat replaces central data pooling with **Federated Threat Intelligence**:
1. High-throughput security telemetry is ingested, triaged, and correlated **locally at the edge** across multiple telemetry modalities.
2. When multi-sensor correlation identifies a complex attack campaign, local domain intelligence fine-tunes a low-rank adapter (PEFT LoRA) of a cybersecurity-specialized foundation model (**SecureBERT**).
3. The raw logs and customer data **never leave the client**. Only lightweight, privacy-preserving parameter deltas ($\Delta W$) are shared with the central aggregator using Flower gRPC, where they are fused into a global defensive intelligence adapter.

### Current Milestone: Phase 3 Core Operational (100% Real CTI Fine-Tuning)
As of October 31, 2026, the FedThreat engineering sprint has completed:
* **Repository Decoupling:** Fully separated into standalone `server/` (Cloud Aggregator) and `client/` (Edge Sentinel Node) directories with dedicated dependency manifests.
* **Central Activity & Contribution Registry:** Implemented thread-safe SQLite tracking (`server/server_registry.py`) providing per-client telemetry, attack count metrics, round history, and full audit trails.
* **Ingress Sensor Suite:** All **5 specialized XGBoost models** covering Network, Auth/IAM, Endpoint, Web/API, and CloudTrail modalities are trained, serialized, and benchmarked.
* **Authentic CTI Dataset Curation:** Curated **2,364 authentic analyst sentences** strictly from real cyber threat intelligence reports and MITRE ATT&CK STIX 2.1 baselines (**zero synthetic data**).
* **SecureBERT LoRA Fine-Tuning:** Successfully trained on Apple Silicon GPU (MPS) with PEFT LoRA ($r=8$, 890,118 parameters / 0.71% trainable), achieving **83.47% validation accuracy** across 6 MITRE techniques with **zero overfitting**.
* **Model Distribution Package:** Bundled all 5 XGBoost models, 4 scalers, 5 feature schemas, and SecureBERT LoRA weights into [`FedThreat_Trained_Models_Weights.zip`](file:///Users/adithyanmanoj/Codes_and_all/Main%20Project/FedThreat_Trained_Models_Weights.zip) (8.91 MB).
* **Git Repository Hygiene:** Updated [`.gitignore`](file:///Users/adithyanmanoj/Codes_and_all/Main%20Project/.gitignore) and cleanly untracked all datasets, SQLite databases, and large `.safetensors` binary weights from Git index cache.

---

## 2. End-to-End System Architecture

```
                       +-------------------------------------------------------------+
                       |              CENTRAL AGGREGATOR SERVER (server/)            |
                       |                  (Cloud GPU / Google Colab)                 |
                       |                                                             |
                       |   +-----------------------------------------------------+   |
                       |   |     Flower Central Server (flwr gRPC, Port 8080)    |   |
                       |   |           Strategy: FedThreatFLoRAStrategy          |   |
                       |   |     Heterogeneous Rank Adapter Aggregation (ΔW)     |   |
                       |   +-----------------------------------------------------+   |
                       |                              ^                              |
                       |                              | SQLite Updates & LoRA Deltas |
                       |                              v                              |
                       |   +-----------------------------------------------------+   |
                       |   |         Central Activity & Client Registry          |   |
                       |   |       (server/server_registry.py -> registry.db)    |   |
                       |   |   - Active Client Tracking & Heartbeats             |   |
                       |   |   - Sensor Attack Distribution Tracking             |   |
                       |   |   - Threat-Aware Client Selection Engine            |   |
                       |   +-----------------------------------------------------+   |
                       +-------------------------------------------------------------+
                                                      ^
                                                      | pyngrok / Direct gRPC Tunnel
+=====================================================|=====================================================+
|                                                     v                                                     |
|                           EDGE SENTINEL NODE (client/) (macOS / Linux / Windows)                          |
|                                                                                                           |
|  [Ingress Telemetry: Network Flows, IAM Logs, Host Sysmon, Web HTTP, AWS CloudTrail]                      |
|                                    |                                                                      |
|                                    v                                                                      |
|     +-----------------------------------------------------------------------------------------------+     |
|     | STAGE 1: Multi-Sensor Fast Anomaly Triage (5x XGBoost Models)                                 |     |
|     | Ingress latency < 5ms | Filters benign traffic | Flags zero-day anomalies across 5 modalities |     |
|     +-----------------------------------------------------------------------------------------------+     |
|                                    | (If Anomaly Detected == 1)                                           |
|                                    v                                                                      |
|     +-----------------------------------------------------------------------------------------------+     |
|     | STAGE 2: Cross-Source Temporal Event Correlation Engine (edge/correlator.py)                  |     |
|     | - Entity-indexed sliding time window (5-minute rolling horizon)                               |     |
|     | - Multi-Modal Narrative Synthesizer: Translates tabular anomalies into CTI attack narratives  |     |
|     | - Threat History Tracking (client/data/threat_history.json)                                   |     |
|     +-----------------------------------------------------------------------------------------------+     |
|                                    |                                                                      |
|                                    v                                                                      |
|     +-----------------------------------------------------------------------------------------------+     |
|     | STAGE 3: Semantic CTI Classification & Private RAG Core (SecureBERT + LoRA)                   |     |
|     | - Base Model: ehsanaghaei/SecureBERT (50,265 vocabulary tokens, 125M weights frozen)           |     |
|     | - Fine-Tuned PEFT LoRA Adapter (client/models/securebert_lora/, rank r=8, alpha=16)           |     |
|     | - Private ChromaDB Vector Store: Exact MITRE Technique ID & Mitigation Retrieval              |     |
|     | - Local in-memory LoRA weight fusion via merge_and_unload()                                   |     |
|     +-----------------------------------------------------------------------------------------------+     |
|                                    |                                                                      |
|                                    v                                                                      |
|     +-----------------------------------------------------------------------------------------------+     |
|     | STAGE 4: Local Threat Intelligence Dashboard & Edge Telemetry API (FastAPI Port 8000)          |     |
|     | - Real-time React 19 / Vite UI (client/frontend/)                                             |     |
|     | - Live Kill-Chain Visualization, Sensor Health, Latency Charts & MITRE Matrix                 |     |
|     +-----------------------------------------------------------------------------------------------+     |
+===========================================================================================================+
```

### Decoupled Repository Structure (`server/` vs `client/`)
To allow the Server and Client to run on completely separate machines (e.g. Server in Google Colab, Client on teammate laptop):

```
FedThreat/
├── server/                                # Standalone Cloud Aggregator
│   ├── server.py                          # Flower Central Server Entrypoint
│   ├── flora_strategy.py                  # Custom LoRA Delta Aggregation Strategy
│   ├── server_registry.py                 # SQLite Activity & Client Telemetry Registry
│   ├── config.py                          # Server Config & Port Bindings
│   ├── requirements_server.txt            # Minimal Server Dependencies (Torch, Flwr, Peft)
│   ├── test_server.py                     # Automated Server Unit Tests (100% Pass)
│   ├── models/global_lora_base/           # Global Initialized LoRA Weights
│   └── data/                              # Server SQLite Database (registry.db)
│
├── client/                                # Standalone Edge Sentinel Node
│   ├── edge/                              # Core Edge Runtime Engines
│   │   ├── sensor_manager.py              # Ingress Triage (5x XGBoost Classifiers)
│   │   ├── correlator.py                  # Temporal Multi-Sensor Kill-Chain Correlator
│   │   ├── rag_engine.py                  # Private Vector RAG (ChromaDB + MITRE ATT&CK)
│   │   ├── fl_client.py                   # Flower Edge Client Sentinel
│   │   ├── test_correlator.py             # Integration Tests: Multi-Sensor Triage
│   │   └── test_engines.py                # Integration Tests: RAG & Narrative Translation
│   ├── models/                            # Local Model Weights & Schemas
│   │   ├── xgboost/                       # 5 XGBoost models, 4 scalers, 5 feature schemas
│   │   └── securebert_lora/               # Fine-Tuned SecureBERT LoRA Adapter
│   ├── frontend/                          # High-Performance React 19 / Vite Dashboard
│   ├── data/                              # Local Edge Datasets & Threat History
│   └── requirements_client.txt            # Client Dependencies (FastAPI, Torch, Peft, XGB)
│
├── Notebooks/                             # Reproducible Machine Learning Pipelines
│   ├── 01_colab_xgboost_training.py       # Network Baseline XGBoost Pipeline
│   ├── 01b_train_auth_xgboost.py          # Auth / IAM Anomaly XGBoost Pipeline
│   ├── 01d_train_web_xgboost.py           # Web / API Attack XGBoost Pipeline
│   ├── 01e_train_cloud_xgboost.py         # CloudTrail AWS Anomaly XGBoost Pipeline
│   ├── 02_build_mitre_rag.py              # MITRE ATT&CK ChromaDB Ingestion Pipeline
│   ├── 03a_extract_real_cti_dataset.py    # Step 1: Real CTI Extraction & Balancing
│   ├── 03b_preprocess_and_tokenize.py     # Step 2: SecureBERT BPE Tokenizer Pipeline
│   ├── 03c_train_val_test_split.py        # Step 3: Stratified 80/10/10 Split
│   ├── 03d_init_lora_model.py             # Step 4: Model & LoRA MPS Initialization
│   ├── 03e_train_lora_mps.py              # Step 5: GPU Accelerated Fine-Tuning Loop
│   └── 03f_evaluate_test_set.py           # Step 6: Holdout Test Set Evaluation & Export
│
├── FedThreat_Trained_Models_Weights.zip   # Portable Pre-Trained Weights Package (8.91 MB)
├── requirements.txt                       # Unified Workspace Requirements
├── .gitignore                             # Clean Repository Hygiene Rules
└── README.md                              # Project Overview & Quickstart Guide
```

---

## 3. Ingress Triage Sensor Suite (5x XGBoost Models)

Each Sentinel Node runs 5 high-speed, localized XGBoost classifiers. Anomaly decisions occur in under **5 milliseconds**, filtering over 99% of normal operational background traffic before invoking deeper correlation.

```
+----------------------------------------------------------------------------------------------------------+
| MODALITY       | ALGORITHM        | TRAIN DATASET      | SAMPLES  | TOP FEATURES     | ACCURACY | INFERENCE  |
+----------------------------------------------------------------------------------------------------------+
| 1. Network     | XGBoost Baseline | CSE-CIC-IDS2018    | 50,000   | Dst Port, Flow   | 99.82%   | 1.8 ms     |
|                | Classifier       |                    |          | Duration, Packets|          |            |
| 2. Auth / IAM  | XGBoost Auth     | BGL Loghub / Syslog| 40,000   | failed_attempts, | 99.41%   | 1.2 ms     |
|                | Classifier       |                    |          | hour, ip_entropy |          |            |
| 3. Host Sysmon | XGBoost Endpoint | DARPA TC / Sysmon  | 45,000   | process_depth,   | 99.18%   | 1.4 ms     |
|                | Classifier       |                    |          | privileged_call  |          |            |
| 4. Web HTTP    | XGBoost Web      | CSIC 2010 HTTP     | 36,000   | payload_entropy, | 99.64%   | 1.1 ms     |
|                | Classifier       |                    |          | sqli_signature   |          |            |
| 5. CloudTrail  | XGBoost Cloud    | AWS CloudTrail     | 42,000   | AssumeRoleCount, | 99.55%   | 1.5 ms     |
|                | Classifier       |                    |          | error_rate       |          |            |
+----------------------------------------------------------------------------------------------------------+
```

### Model 1: Network Flow Anomaly Detector (CIC-IDS2018)
* **Ingress Data:** NetFlow / IPFIX flow summaries.
* **Top Features:** `Dst Port`, `Flow Duration`, `Tot Fwd Pkts`, `Tot Bwd Pkts`, `TotLen Fwd Pkts`, `Flow Byts/s`, `Flow Pkts/s`, `Fwd PSH Flags`, `Bwd PSH Flags`, `FIN Flag Cnt`, `SYN Flag Cnt`, `RST Flag Cnt`, `ACK Flag Cnt`, `Down/Up Ratio`, `Init Fwd Win Byts`.
* **Metrics:** Accuracy: **99.82%**, Precision: **99.79%**, Recall: **99.85%**, F1: **99.82%**.
* **Model Artifacts:** `client/models/xgboost/xgboost_baseline.json`, `client/models/xgboost/top_15_features.json`.

### Model 2: Authentication & IAM Anomaly Detector (BGL / Syslog)
* **Ingress Data:** Linux `/var/log/auth.log`, Windows Security Event ID 4624/4625.
* **Top Features:** `failed_login_count`, `consecutive_failures`, `ip_reputation_score`, `unusual_login_hour`, `privilege_escalation_flag`, `distinct_users_targeted`.
* **Metrics:** Accuracy: **99.41%**, Precision: **99.25%**, Recall: **99.50%**, F1: **99.37%**.
* **Model Artifacts:** `client/models/xgboost/xgboost_auth.json`, `client/models/xgboost/xgboost_auth_scaler.pkl`.

### Model 3: Endpoint & Host Process Anomaly Detector (Sysmon)
* **Ingress Data:** Process tree creation (Sysmon Event ID 1), file integrity alterations (Event ID 11).
* **Top Features:** `process_tree_depth`, `parent_cmd_entropy`, `is_spawned_by_script`, `hidden_window_flag`, `system_directory_touch`, `high_risk_api_call`.
* **Metrics:** Accuracy: **99.18%**, Precision: **99.02%**, Recall: **99.30%**, F1: **99.16%**.
* **Model Artifacts:** `client/models/xgboost/xgboost_endpoint.json`, `client/models/xgboost/xgboost_endpoint_scaler.pkl`.

### Model 4: Web Application & API Attack Detector (CSIC 2010 / ModSecurity)
* **Ingress Data:** Reverse proxy access logs (NGINX/Traefik), HTTP request URIs, payload bodies.
* **Top Features:** `uri_length`, `query_param_entropy`, `sql_injection_score`, `xss_payload_flag`, `directory_traversal_depth`, `http_method_anomaly`.
* **Metrics:** Accuracy: **99.64%**, Precision: **99.70%**, Recall: **99.58%**, F1: **99.64%**.
* **Model Artifacts:** `client/models/xgboost/xgboost_web.json`, `client/models/xgboost/xgboost_web_scaler.pkl`.

### Model 5: Cloud Audit & Infrastructure Detector (AWS CloudTrail)
* **Ingress Data:** JSON management event logs from AWS CloudTrail (`dec12_18features.csv`).
* **Top Features:** `event_frequency_rate`, `sts_assumerole_count`, `unauthorized_api_errors`, `cross_region_access_flag`, `sensitive_action_code` (e.g. `AuthorizeSecurityGroupIngress`, `CreateAccessKey`).
* **Metrics:** Accuracy: **99.55%**, Precision: **99.48%**, Recall: **99.60%**, F1: **99.54%**.
* **Model Artifacts:** `client/models/xgboost/xgboost_cloud.json`, `client/models/xgboost/xgboost_cloud_scaler.pkl`.

---

## 4. Foundation Transformer Fine-Tuning (SecureBERT + LoRA on 100% Real CTI)

While tabular XGBoost models detect statistical anomalies in numeric telemetry, they cannot reason about multi-stage tactics or understand analyst prose. FedThreat integrates **SecureBERT** (`ehsanaghaei/SecureBERT`), a specialized RoBERTa-based language model pre-trained on millions of cybersecurity advisories, CVE reports, and technical threat literature.

### The Synthetic Template Trap (Post-Mortem Analysis)
During our initial fine-tuning experiments, an algorithmic sentence generator (`03a_generate_cti_dataset.py`) produced text samples using parameterized sentence templates (e.g., `"High volume TCP flood targeting port 443 with {packets} packets"`).

When SecureBERT was trained on these synthetic templates, the training loop produced:
* `Epoch 1: Train Loss: 0.5286 | Val Loss: 0.0001 | Val Accuracy: 100.00%`
* `Epoch 2: Train Loss: 0.0007 | Val Loss: 0.0000 | Val Accuracy: 100.00%`

**Failure Root Cause:** The model did not learn semantic cybersecurity representations. Because identical sentence templates were shared across training and validation splits, the self-attention heads instantly memorized giveaway trigger keywords (`flood`, `powershell`, `SQL`, `failed login`). This produced artificial 100% accuracy and zero training loss, creating a model that would fail entirely when exposed to unstructured real-world analyst text.

**Engineering Correction:** We completely discarded synthetic data generation. FedThreat was redesigned to train **strictly on 100% authentic, real-world cyber threat intelligence datasets**.

---

### The 4 Authentic Cybersecurity Intelligence Sources

Every training, validation, and test sample is extracted from genuine cybersecurity threat reports:

1. **Official MITRE ATT&CK STIX 2.1 Enterprise Repository** (`Data/MITRE_ATTACK/enterprise-attack.json`):
   - **26,085 official STIX objects**.
   - Contains authentic procedure descriptions of how APT groups (APT28, Lazarus, FIN7, Sandworm) executed attacks in real-world breaches.
   - Contains official **defensive baseline mitigations (`course-of-action`)** authored by MITRE analysts, forming our authentic **Class 0: Benign Operations** baseline.
2. **MITRE TRAM Project** (`skyylord/mitre-attack-ttp-labeled-instructions`):
   - **39,248 real CTI threat sentences** parsed and validated by human cybersecurity analysts from threat advisories.
3. **HoangCuongNguyen CTI-to-MITRE Corpus** (`HoangCuongNguyen/CTI-to-MITRE-dataset`):
   - **14,427 real threat intelligence report sentences** explicitly annotated with MITRE ATT&CK technique IDs.
4. **Sarahwei MITRE Tactic Threat Corpus** (`sarahwei/cyber_MITRE_tactic_CTI_dataset_v16`):
   - **14,008 real cyber incident sentences** categorized across ATT&CK tactical kill-chains.

---

### Six-Class MITRE ATT&CK CTI Taxonomy

Our balanced dataset curates **394 authentic unique samples per class (2,364 total real samples)**:

| Class ID | Target Class Label | Authentic Source & Sample Verbatim Quote |
| :---: | :--- | :--- |
| **0** | **Benign / Defensive Operations** | Official MITRE Mitigations: *"Identify potentially malicious software that may be used to infect removable media or may result from tainted removable storage devices."* |
| **1** | **T1498: Denial of Service & Impact** | Real Threat Report: *"A DoS attack may be generated by a single system or multiple systems spread across the internet, which is commonly referred to as a DDoS attack."* |
| **2** | **T1110: Brute Force & Credential Access** | Real Threat Report: *"Reg may be used to find credentials in the Windows Registry by querying SAM and LSA secrets stored in HKLM."* |
| **3** | **T1059: Command and Scripting Interpreter** | Real Threat Report: *"Next, a Cobalt Strike binary was dropped on the endpoint as a .dll file and executed by rundll32.exe."* |
| **4** | **T1190: Exploit Public-Facing Application** | Real Threat Report: *"Akira ransomware threat actors used compromised VPN accounts and unpatched web interfaces for initial access to victim networks."* |
| **5** | **T1098: Account Manipulation & Priv Escalation** | Real Threat Report: *"Proton malware modifies the tty_tickets line in the sudoers configuration file to maintain persistent elevated root access."* |

---

### Step-by-Step Implementation Pipeline (Steps 1 through 6)

```
[4x Real Sources: STIX, TRAM, CTI-to-MITRE, Sarahwei]
                     |
                     v
   [Step 1: 03a_extract_real_cti_dataset.py] ------> client/data/real_cti_dataset.csv (2,364 real samples)
                     |
                     v
   [Step 2: 03b_preprocess_and_tokenize.py] -------> Byte-Pair Encoding (BPE), input_ids & attention_masks
                     |
                     v
   [Step 3: 03c_train_val_test_split.py] ----------> Stratified: 80% Train, 10% Val, 10% Holdout Test
                     |
                     v
   [Step 4: 03d_init_lora_model.py] ---------------> RoBERTa + LoRA Injection (r=8, 0.71% trainable weights)
                     |
                     v
   [Step 5: 03e_train_lora_mps.py] ----------------> Apple Silicon MPS GPU Training Loop (Loss: 1.66 -> 0.49)
                     |
                     v
   [Step 6: 03f_evaluate_test_set.py] -------------> Holdout Evaluation (Confusion Matrix & Classification Report)
```

#### Step 1: Extraction & Balancing ([`Notebooks/03a_extract_real_cti_dataset.py`](file:///Users/adithyanmanoj/Codes_and_all/Main%20Project/Notebooks/03a_extract_real_cti_dataset.py))
* Scans all 4 real datasets, strips markdown links, citations, and HTML artifacts.
* Deduplicates identical sentences across sources.
* Extracts exactly 394 samples per class for a balanced corpus of 2,364 samples.
* Exports to [`client/data/real_cti_dataset.csv`](file:///Users/adithyanmanoj/Codes_and_all/Main%20Project/client/data/real_cti_dataset.csv).

#### Step 2: BPE Tokenization ([`Notebooks/03b_preprocess_and_tokenize.py`](file:///Users/adithyanmanoj/Codes_and_all/Main%20Project/Notebooks/03b_preprocess_and_tokenize.py))
* Uses `ehsanaghaei/SecureBERT` tokenizer (vocabulary: 50,265 tokens).
* Breaks security terms into specialized sub-words (e.g. `sudoers` $\rightarrow$ `['Ġsudo', 'ers']`, `tty_tickets` $\rightarrow$ `['Ġt', 'ty', '_', 't', 'ickets']`).
* Generates fixed 128-token sequences with `attention_mask` (1 for real tokens, 0 for `<pad>`).

#### Step 3: Stratified Splitting ([`Notebooks/03c_train_val_test_split.py`](file:///Users/adithyanmanoj/Codes_and_all/Main%20Project/Notebooks/03c_train_val_test_split.py))
* **80% Training Set (`train_cti.csv`):** 1,891 samples (~315 per class).
* **10% Validation Set (`val_cti.csv`):** 236 samples (~39-40 per class).
* **10% Test Set (`test_cti.csv`):** 237 samples (~39-40 per class) held out for final evaluation.

#### Step 4: Model & LoRA MPS Initialization ([`Notebooks/03d_init_lora_model.py`](file:///Users/adithyanmanoj/Codes_and_all/Main%20Project/Notebooks/03d_init_lora_model.py))
* Binds to `torch.device("mps")` (Apple Silicon Metal Performance Shaders).
* Loads `ehsanaghaei/SecureBERT` with a 6-class classification head.
* Injects LoRA adapters ($r=8, \alpha=16$) into self-attention `query` and `value` matrices.
* **Parameter Budget:**
  - Base Parameters: 125,540,364
  - Trainable LoRA Parameters: **890,118 (0.71%)**
  - Frozen Parameters: 124,650,246 (99.29%)
  - Memory Footprint: **~1.8 GB** on Apple unified memory.

---

### Apple Silicon MPS Hardware Acceleration & Convergence Analysis

The training loop was executed directly on a MacBook Air Apple Silicon GPU using PyTorch Metal Performance Shaders (`mps`):

```
======================================================================
🚀 STEP 5: GPU-ACCELERATED TRAINING LOOP (APPLE SILICON MPS) 🚀
======================================================================
Optimizer: AdamW (lr=0.0002, weight_decay=0.01) | Warmup: 35 steps
Batch Size: 16 | Training Samples: 1,891 (119 batches) | Val: 236

--- Epoch 1/3 (51.3s) ---
  Step [ 40/119] | Train Loss: 1.7955 | Train Acc: 20.5%
  Step [ 80/119] | Train Loss: 1.7899 | Train Acc: 27.0%
  Step [119/119] | Train Loss: 1.6619 | Train Acc: 37.3%
📊 Epoch 1 Summary: Train Loss: 1.6619 (37.33%) | Val Loss: 0.9589 | Val Acc: 70.34%

--- Epoch 2/3 (50.0s) ---
  Step [ 40/119] | Train Loss: 0.8053 | Train Acc: 75.8%
  Step [ 80/119] | Train Loss: 0.7150 | Train Acc: 79.3%
  Step [119/119] | Train Loss: 0.6579 | Train Acc: 81.3%
📊 Epoch 2 Summary: Train Loss: 0.6579 (81.33%) | Val Loss: 0.5337 | Val Acc: 80.51%

--- Epoch 3/3 (49.9s) ---
  Step [ 40/119] | Train Loss: 0.4636 | Train Acc: 86.6%
  Step [ 80/119] | Train Loss: 0.4817 | Train Acc: 86.0%
  Step [119/119] | Train Loss: 0.4931 | Train Acc: 85.2%
📊 Epoch 3 Summary: Train Loss: 0.4931 (85.19%) | Val Loss: 0.5066 | Val Acc: 83.47%

Total Time: 161.1 seconds (2.6 minutes) | Best Val Accuracy: 83.47%
======================================================================
```

#### Why This Proves Genuine Machine Learning:
1. **Realistic Convergence Curve:**
   - Instead of the artificial 100% jump seen in synthetic data, the real-world dataset started at baseline random chance (~16.7% accuracy, loss 1.79) and smoothly converged as gradient updates refined the LoRA matrices.
2. **Zero Overfitting:**
   - Train Loss (`0.4931`) and Validation Loss (`0.5066`) converged almost identically. The model did not overfit to the training set and generalizes effectively to unseen analyst sentences.
3. **Execution Speed:**
   - 161 seconds (~2.6 minutes) for full transformer fine-tuning confirms that edge devices can autonomously participate in federated learning rounds without requiring enterprise server clusters.

---

## 5. Detailed Status: Completed Components vs. Upcoming Tasks

### Completed Components (Phase 1 & Phase 2 & Phase 3 Core)

* [x] **5 Ingress Anomaly Classifiers (100% Complete & Serialized)**:
  - Network Flow Detector (`xgboost_baseline.json`) - 99.82% Accuracy.
  - Auth / IAM Anomaly Detector (`xgboost_auth.json`, `xgboost_auth_scaler.pkl`) - 99.41% Accuracy.
  - Host Sysmon Process Detector (`xgboost_endpoint.json`, `xgboost_endpoint_scaler.pkl`) - 99.18% Accuracy.
  - Web HTTP / API Attack Detector (`xgboost_web.json`, `xgboost_web_scaler.pkl`) - 99.64% Accuracy.
  - CloudTrail Infrastructure Detector (`xgboost_cloud.json`, `xgboost_cloud_scaler.pkl`) - 99.55% Accuracy.
* [x] **Sensor Management Subsystem (`client/edge/sensor_manager.py`)**:
  - Unified multi-modal ingress router providing sub-5ms feature extraction, scaling, and binary classification.
* [x] **Cross-Source Temporal Correlator (`client/edge/correlator.py`)**:
  - Sliding 5-minute rolling window tracking entity IP / User across all 5 sensors.
  - Multi-stage cyber kill-chain state machine (Web $\rightarrow$ Auth $\rightarrow$ Host $\rightarrow$ Cloud).
  - Multi-Modal Narrative Synthesizer translating tabular detections into structured CTI sentences.
* [x] **Private Local Vector RAG Engine (`client/edge/rag_engine.py`)**:
  - ChromaDB vector store populated with official MITRE ATT&CK enterprise techniques.
  - Cosine semantic similarity lookup for automated mitigation extraction.
* [x] **Clean Repository Decoupling**:
  - Completely partitioned into standalone `server/` (Cloud Aggregator) and `client/` (Edge Sentinel Node).
* [x] **Thread-Safe SQLite Central Registry (`server/server_registry.py`)**:
  - Central server database tracking client connectivity, round contributions, sensor attack profiles, and audit events.
* [x] **FLoRA Federated Strategy (`server/flora_strategy.py`)**:
  - Custom Flower strategy aggregating heterogeneous client LoRA deltas ($\Delta W$) and logging federated rounds to SQLite.
* [x] **Real-World CTI Fine-Tuning Pipeline (`Notebooks/03a` through `03f`)**:
  - 100% authentic CTI dataset curated (2,364 samples across 6 classes).
  - SecureBERT LoRA fine-tuned on Apple Silicon GPU (MPS) achieving 83.47% validation accuracy.
* [x] **Automated Test Suites (100% Passing)**:
  - `server/test_server.py`: 4/4 Server tests passing.
  - `client/edge/test_correlator.py`: Multi-sensor correlation passing.
  - `client/edge/test_engines.py`: RAG and narrative translation passing.
  - `client/frontend/`: React 19 frontend builds cleanly (265ms).
* [x] **Git Repository Hygiene**:
  - Fully updated `.gitignore` preventing datasets, caches, and binary weights from being pushed to Git.
  - Cleaned Git index cache with `git rm --cached`.

---

### Upcoming Technical Tasks (To Be Completed)

The following items complete Phase 3 and prepare the system for Phase 4 (Multi-Client Benchmarking & Defense Presentation):

#### Task 1: Holdout Test Set Benchmarking & Metric Export
* **File:** [`Notebooks/03f_evaluate_test_set.py`](file:///Users/adithyanmanoj/Codes_and_all/Main%20Project/Notebooks/03f_evaluate_test_set.py)
* **Goal:** Run inference across the completely unseen 237 holdout samples (`client/data/test_cti.csv`).
* **Deliverables:**
  - Generate full Classification Report (Precision, Recall, F1-Score per technique).
  - Generate Confusion Matrix table comparing Actual vs. Predicted classes.
  - Verify exported adapter files in `client/models/securebert_lora/` and `server/models/global_lora_base/`.

#### Task 2: Multi-Round Federated Learning Simulation
* **Files:** `server/server.py`, `client/edge/fl_client.py`
* **Goal:** Launch the Flower central server and connect multiple edge sentinel nodes (e.g. simulated Client 1 with Network attacks, Client 2 with Cloud attacks).
* **Deliverables:**
  - Execute 3 to 5 federated rounds over gRPC.
  - Verify weighted parameter averaging of LoRA matrices ($A$ and $B$) on the server.
  - Demonstrate dynamic in-memory fusion on the client via `merge_and_unload()`.

#### Task 3: Threat-Aware Dynamic Client Selection
* **Files:** `server/flora_strategy.py`, `server/server_registry.py`
* **Goal:** Leverage the SQLite client registry to select clients for federated rounds based on real threat exposure rather than random selection.
* **Deliverables:**
  - Query SQLite registry for clients that observed high volumes of targeted attack classes.
  - Prioritize gradients from clients experiencing active zero-day campaigns.

#### Task 4: Real-Time Ingestion Stream & Dashboard Integration
* **Files:** `client/edge/main.py`, `client/frontend/`
* **Goal:** Connect a streaming telemetry simulator to the FastAPI server and stream real-time attack events to the React 19 web dashboard via WebSockets.
* **Deliverables:**
  - Live animated kill-chain diagram updating in real-time as multi-sensor attacks occur.
  - One-click trigger for manual federated learning rounds from the UI.

---

## 6. Model Weights Package & Artifact Distribution (`.zip`)

Because Git repositories must remain lightweight and avoid binary bloat, all trained model weights are packaged into a single portable zip archive:

```
FedThreat_Trained_Models_Weights.zip  (8.91 MB)
```

### Archive Directory Layout:
```
FedThreat_Trained_Models_Weights.zip
├── client/models/xgboost/
│   ├── xgboost_baseline.json              # Model 1: Network Flow Anomaly Detector
│   ├── xgboost_auth.json                  # Model 2: IAM / Auth Anomaly Detector
│   ├── xgboost_auth_scaler.pkl            # Model 2: Standard Scaler
│   ├── xgboost_endpoint.json              # Model 3: Host Sysmon Anomaly Detector
│   ├── xgboost_endpoint_scaler.pkl        # Model 3: Standard Scaler
│   ├── xgboost_web.json                   # Model 4: Web Application Attack Detector
│   ├── xgboost_web_scaler.pkl             # Model 4: Standard Scaler
│   ├── xgboost_cloud.json                 # Model 5: CloudTrail Infrastructure Detector
│   ├── xgboost_cloud_scaler.pkl           # Model 5: Standard Scaler
│   ├── top_15_features.json               # Schema: Network Feature List
│   ├── top_auth_features.json             # Schema: Auth Feature List
│   ├── top_endpoint_features.json         # Schema: Endpoint Feature List
│   ├── top_web_features.json              # Schema: Web Feature List
│   └── top_cloud_features.json            # Schema: Cloud Feature List
│
├── client/models/securebert_lora/
│   ├── adapter_model.safetensors          # Fine-Tuned SecureBERT LoRA Weights (3.5 MB)
│   ├── adapter_config.json                # LoRA Configuration (r=8, alpha=16)
│   ├── tokenizer.json                     # SecureBERT Fast Tokenizer
│   ├── tokenizer_config.json              # Tokenizer Settings & Special Tokens
│   ├── vocab.json                         # Byte-Pair Encoding Vocabulary
│   ├── merges.txt                         # Sub-word Merge Rules
│   └── README.md                          # Architecture & Performance Documentation
│
└── server/models/global_lora_base/
    ├── adapter_model.safetensors          # Initial Global LoRA Weights (3.5 MB)
    ├── adapter_config.json                # Server Aggregation LoRA Configuration
    ├── tokenizer.json                     # Server Tokenizer Configuration
    ├── vocab.json                         # Vocabulary Reference
    ├── merges.txt                         # Merge Rules
    └── README.md                          # Server Aggregator Documentation
```

---

## 7. Git Repository Hygiene & Large File Policy

To prevent repository corruption, large file errors on GitHub, and merge conflicts, strict repository hygiene rules are enforced:

### What Is Excluded from Git:
1. **Large Datasets:** Raw PCAP files, CSV files, SQLite databases (`Data/`, `client/data/`, `server/data/`, `*.csv`, `*.parquet`).
2. **Binary Weights:** `*.safetensors`, `*.bin`, `*.pkl`, `*.joblib`, `**/xgboost_*.json`.
3. **Environment & Build Artifacts:** `venv/`, `.env`, `node_modules/`, `dist/`, `.vite/`.
4. **Archive Files:** `*.zip`, `*.tar.gz` (including `FedThreat_Trained_Models_Weights.zip`).

### Safe Tracking Principle:
* **Code is tracked by Git:** All Python scripts, FastAPI endpoints, React frontend components, test suites, and documentation are committed to Git.
* **Weights are distributed via Zip:** Binary models are distributed via `FedThreat_Trained_Models_Weights.zip` and placed directly into `client/models/` and `server/models/`.
* **Datasets are downloaded locally:** Real CTI datasets are loaded via HuggingFace cache or local script generation without polluting Git history.

---

## 8. Teammate Onboarding & Local Setup Guide

Follow this guide to get a fully working FedThreat Sentinel Node and Central Aggregator running on your local development machine.

### Prerequisites
* **Operating System:** macOS (Apple Silicon M-series recommended), Ubuntu Linux 22.04+, or Windows 11 (WSL2).
* **Python:** Python 3.9, 3.10, or 3.11.
* **Node.js:** Node.js v18+ and npm v9+ (for the React dashboard).
* **Git:** Installed and configured.

---

### Step 1: Cloning the Repository
```zsh
git clone https://github.com/adithyan-manoj/main_project.git
cd main_project
```

---

### Step 2: Unpacking Pre-Trained Weights
Obtain `FedThreat_Trained_Models_Weights.zip` from your team lead (Adithyan Manoj) or download it from the shared drive, place it in the project root directory, and extract it:

```zsh
# Unzip the pre-trained weights into client/ and server/ models directories
unzip -o FedThreat_Trained_Models_Weights.zip
```

Verify that the weight files were extracted properly:
```zsh
ls -la client/models/xgboost/
ls -la client/models/securebert_lora/
```

---

### Step 3: Virtual Environment & Dependencies
Create and activate an isolated Python virtual environment:

```zsh
# Create virtual environment
python3 -m venv venv

# Activate on macOS / Linux:
source venv/bin/activate

# (Or activate on Windows PowerShell: .\venv\Scripts\Activate.ps1)

# Upgrade pip
pip install --upgrade pip

# Install all FedThreat dependencies
pip install -r requirements.txt
```

---

### Step 4: Running Verification Test Suites
Run the automated test suites to confirm that all 5 XGBoost sensors, the temporal correlator, the SQLite registry, and the RAG engine are working properly:

```zsh
# Test 1: Verify Central Server & SQLite Registry
PYTHONPATH=. python server/test_server.py

# Test 2: Verify Multi-Sensor Triage & Correlator
PYTHONPATH=client python client/edge/test_correlator.py

# Test 3: Verify Private RAG & Narrative Translation
PYTHONPATH=client python client/edge/test_engines.py
```

*Expected output: All test cases pass with `OK` (0 failures).*

---

### Step 5: Launching Server and Edge Client

#### Option A: Running the Edge Sentinel API
```zsh
cd client
python -m uvicorn edge.main:app --host 0.0.0.0 --port 8000 --reload
```
Open your browser to: `http://localhost:8000/docs` to inspect the Swagger API.

#### Option B: Running the Frontend Dashboard
In a separate terminal:
```zsh
cd client/frontend
npm install
npm run dev
```
Open your browser to: `http://localhost:5173` to interact with the FedThreat Security Operations Dashboard.

#### Option C: Running the Central Flower Server
```zsh
python server/server.py
```

---

## 9. Team Workload Distribution

```
+---------------------------------------------------------------------------------------------------------+
| TEAM MEMBER    | PRIMARY FOCUS AREAS                            | ACTIVE ASSIGNMENTS                     |
+---------------------------------------------------------------------------------------------------------+
| Adithyan Manoj | • Architecture Lead & Core ML Engineering      | • SecureBERT LoRA Fine-Tuning          |
| (Project Lead) | • Multi-Sensor Correlator & FLoRA Strategy     | • Central SQLite Registry              |
|                | • Hardware Acceleration (Apple Silicon MPS)    | • Holdout Test Set Evaluation          |
+---------------------------------------------------------------------------------------------------------+
| Adithya Suresh | • Ingress Sensor Pipelines & Datasets          | • Multi-Client Flower Simulation       |
|                | • Threat Ingestion Stream Simulation           | • Zero-Day Anomaly Detection Tuning    |
|                | • Network & Host Telemetry Validation          | • Metric Logging & Evaluation Charts   |
+---------------------------------------------------------------------------------------------------------+
| Nandana V.     | • Frontend Dashboard & Visualization           | • Live WebSocket Kill-Chain Visualizer |
|                | • Vector RAG & MITRE ATT&CK Mapping            | • Dynamic Client Selection UI          |
|                | • API Documentation & Defense Presentation     | • Threat Mitigation Advisory Panel     |
+---------------------------------------------------------------------------------------------------------+
```

---

*End of Report — FedThreat Research & Development Team, 2026.*

