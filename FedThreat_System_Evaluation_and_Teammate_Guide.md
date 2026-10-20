# FedThreat: Comprehensive System Evaluation, Architecture Blueprint & Teammate Onboarding Guide

**Document Version:** 1.0.0 (Production Release)  
**Project Title:** FedThreat: Federated Learning for Privacy-Preserving Cyber Threat Intelligence  
**Authors / Core Team:** Adithyan Manoj, Adithya Suresh, Nandana V.  
**Project Guide:** Dr. Soja Salim  
**Repository:** `https://github.com/adithyan-manoj/main_project.git`  
**Target Environment:** Distributed Hybrid Cloud-Edge Network (Edge: macOS / Linux / Windows Laptops; Cloud: Google Colab GPU Accelerated Aggregator)

---

## 1. Executive Summary & Current System Status

### 1.1 Project Overview
FedThreat is an enterprise-grade, privacy-preserving cybersecurity framework designed to detect, correlate, federate, and mitigate novel and zero-day cyber threats across decentralized organizational boundaries. Unlike traditional Security Operations Center (SOC) models that require pooling sensitive, multi-gigabyte raw packet captures (PCAP) or internal audit logs into a centralized repository, FedThreat processes telemetry **locally at the edge** and shares **only mathematically aggregated parameter updates (LoRA adapters)** with a central orchestrator.

### 1.2 Current Operational Status Evaluation
As of the current codebase evaluation, the system has successfully achieved an **85%+ completion milestone** for an end-to-end Minimum Viable Product (MVP), exceeding the initial sprint projections.

| Component / Subsystem | Implementation Path | Current Status | Technical Evaluation & Maturity |
| :--- | :--- | :--- | :--- |
| **Stage 1: Anomaly Triage** | `edge/main.py`, `Models/XGBoost/` | **Fully Operational (100%)** | Trained XGBoost model (`xgboost_baseline.json`) taking the top 15 network flow features extracted from CSE-CIC-IDS2018. Classifies network packets into benign vs. anomalous within `< 5ms`. Includes presentation demo trigger. |
| **Stage 2: Event Correlation** | `edge/correlator.py` | **Fully Operational (100%)** | Chronologically aggregates numerical network metrics and converts them into natural language narrative incident descriptions tailored for Transformer NLP ingestion. |
| **Stage 3: Federated Edge Client** | `edge/client.py` | **Fully Operational (95%)** | Loads frozen `ehsanaghaei/SecureBERT` base model, injects custom PEFT LoRA adapter (`adapter_model.safetensors`), connects to Flower Server via gRPC, and executes zero-latency in-memory fusion via `merge_and_unload()`. |
| **Stage 4: Private RAG Advisory** | `edge/rag_engine.py` | **Fully Operational (100%)** | Queries dual-tier ChromaDB (`mitre_enterprise` + `client_org_profile`). Invokes local Llama-3.1 (via Ollama) with a constrained zero-shot prompt returning structured JSON. Features robust offline fallback heuristics. |
| **Telemetry History & Stats** | `edge/threat_store.py` | **Fully Operational (100%)** | Thread-safe in-memory and disk-persisted (`Data/threat_history.json`) logging of hourly attack volumes, peak spike tracking, and MITRE category counts. |
| **Cloud Central Server** | `cloud/server.py`, `Notebooks/04_colab_flower_server.py` | **Fully Operational (90%)** | Custom Flower `FLoRAStrategy` supporting heterogeneous rank LoRA adapter aggregation. Configured for Google Colab with `pyngrok` TCP tunneling. |
| **Frontend Web Dashboard** | `frontend/src/` | **Fully Operational (100%)** | Modern, high-performance React 19 + Vite 8 + Tailwind CSS 4 Single-Page Application (SPA) with dual routes (`/` Edge Sentinel and `/cloud` Aggregator Tracker), live polling, KPI cards, Recharts visualizations, and interactive slide-out drawers. |
| **Offline Training Notebooks** | `Notebooks/` | **Complete (100%)** | Full reproducible scripts for XGBoost feature selection and training (`01`), MITRE STIX JSON parsing and ChromaDB building (`02`), SecureBERT LoRA fine-tuning (`03`), and Flower Colab hosting (`04`). |

---

## 2. End-to-End System Architecture

FedThreat operates as a distributed **Hybrid Cloud-Edge Architecture**:

```
                       +-------------------------------------------------------+
                       |              GOOGLE COLAB / CLOUD SERVER              |
                       |                                                       |
                       |  +-------------------------------------------------+  |
                       |  |        Flower Central Server (flwr gRPC)        |  |
                       |  |            Strategy: FLoRAStrategy              |  |
                       |  |       Aggregates LoRA Parameter Deltas (ΔW)     |  |
                       |  +-------------------------------------------------+  |
                       |                          ^                            |
                       |                          | (TCP Tunnel via pyngrok)   |
                       +--------------------------|----------------------------+
                                                  |
==================================================|==================================================
                                                  v (Port 8080)
                       +-------------------------------------------------------+
                       |               EDGE SENTINEL NODE (LAPTOP)             |
                       |                                                       |
                       |  [Raw Ingress Telemetry / Packet Features]            |
                       |                          |                            |
                       |                          v                            |
                       |     +------------------------------------------+      |
                       |     | STAGE 1: Fast Anomaly Triage (XGBoost)   |      |
                       |     | Classifies Benign (0) vs Anomaly (1)     |      |
                       |     +------------------------------------------+      |
                       |                          | (If Anomaly == 1)          |
                       |                          v                            |
                       |     +------------------------------------------+      |
                       |     | STAGE 2: Event Correlator (NLP Bridge)   |      |
                       |     | Numerical Flow -> Textual Narrative      |      |
                       |     +------------------------------------------+      |
                       |                          |                            |
                       |                          v                            |
                       |     +------------------------------------------+      |
                       |     | STAGE 3: Federated Intelligence Core     |      |
                       |     | - SecureBERT Base (Frozen)               |      |
                       |     | - PEFT LoRA Adapter (Local Fine-Tuning)  |      |
                       |     | - Syncs with Cloud Server (gRPC)         |      |
                       |     | - Zero-Latency `merge_and_unload()`      |      |
                       |     +------------------------------------------+      |
                       |                          | (Threat Classification)    |
                       |                          v                            |
                       |     +------------------------------------------+      |
                       |     | STAGE 4: Private RAG & Mitigation Engine |      |
                       |     | - ChromaDB Vector Store (MITRE ATT&CK)   |      |
                       |     | - ChromaDB Local Profile (Node Memory)   |      |
                       |     | - Llama-3.1 via Ollama (JSON Advisory)   |      |
                       |     +------------------------------------------+      |
                       |                          |                            |
                       |                          v                            |
                       |     +------------------------------------------+      |
                       |     | FastAPI Orchestrator (Port 8000)         |      |
                       |     | ThreatStore State & Hardware Telemetry   |      |
                       |     +------------------------------------------+      |
                       +--------------------------|----------------------------+
                                                  |
                                                  | HTTP REST / JSON Polling
                                                  v
                       +-------------------------------------------------------+
                       |              CYBERSECURITY OPS DASHBOARD              |
                       |                 (React 19 + Vite + CSS)               |
                       |                                                       |
                       |  - Real-Time Hardware KPIs (CPU, RAM, Uptime)         |
                       |  - MITRE ATT&CK Threat Distribution Donut Chart       |
                       |  - 24-Hour Temporal Volume Bar Chart (Peak Spike)     |
                       |  - Active Threat Alert Hub with Full Advisory Cards   |
                       |  - Live Ingress Telemetry Table with Search & Filter  |
                       |  - Multi-Modal Log Drawer & Federation Control Drawer |
                       +-------------------------------------------------------+
```

---

## 3. Machine Learning Models & Technical Specifications

FedThreat incorporates five specialized machine learning and AI models, each fulfilling a designated responsibility in the detection and response pipeline:

### 3.1 Model 1: Fast Tabular Anomaly Detector (XGBoost)
* **Model Class:** Extreme Gradient Boosting Classifier (`xgboost.XGBClassifier`)
* **Role:** Tier-1 Ingress Filter. Handles millisecond-level triage of streaming network telemetry to drop benign packets and isolate anomalies.
* **Trained Artifact Location:** `Models/XGBoost/xgboost_baseline.json` (368 KB)
* **Input Dimension:** 15 selected tabular network flow features.
* **Model Hyperparameters:**
  * `n_estimators`: 150 trees
  * `max_depth`: 6
  * `learning_rate`: 0.1
  * `scale_pos_weight`: Dynamic ratio based on benign-to-attack imbalance ($\approx 4.8$)
  * `eval_metric`: `logloss`
  * `random_state`: 42
* **Selected 15 Top Features (Ranked by Gini Importance):**
  1. `Fwd Seg Size Min` (Minimum forward segment size)
  2. `Down/Up Ratio` (Download to upload packet ratio)
  3. `Bwd IAT Min` (Minimum backward inter-arrival time)
  4. `Init Bwd Win Byts` (Initial backward TCP window bytes)
  5. `Init Fwd Win Byts` (Initial forward TCP window bytes)
  6. `Pkt Size Avg` (Average packet length)
  7. `Flow IAT Max` (Maximum flow inter-arrival time)
  8. `Flow Pkts/s` (Flow packet transmission rate)
  9. `Fwd Pkts/s` (Forward packet transmission rate)
  10. `Fwd Pkt Len Max` (Maximum forward packet length)
  11. `Fwd IAT Std` (Standard deviation of forward inter-arrival time)
  12. `FIN Flag Cnt` (Count of TCP FIN teardown flags)
  13. `Bwd Pkts/s` (Backward packet transmission rate)
  14. `URG Flag Cnt` (Count of TCP Urgent flags)
  15. `Fwd Header Len` (Total bytes in forward TCP/IP headers)

### 3.2 Model 2: Foundation Cybersecurity Transformer (`SecureBERT`)
* **Base Model Identifier:** `ehsanaghaei/SecureBERT` (HuggingFace Hub)
* **Architecture:** Domain-adapted RoBERTa (Robustly Optimized BERT Approach) pre-trained exclusively on cybersecurity corpora, CVE vulnerabilities, threat advisories, and security papers.
* **Vocabulary Size:** 50,265 tokens specialized with cybersecurity lexicon (e.g., `exfiltration`, `metasploit`, `cve`, `shellcode`).
* **Operational Constraint:** The entire base model weights are **frozen** on the edge node. No gradients are calculated for the base model during local training, preserving edge VRAM and compute.

### 3.3 Model 3: Federated Parameter-Efficient Fine-Tuning Adapter (PEFT LoRA)
* **Framework:** HuggingFace `peft` (Low-Rank Adaptation)
* **Trained Weights:** `Models/SecureBERT/adapter_model.safetensors` (3.55 MB)
* **Configuration:** `Models/SecureBERT/adapter_config.json`
* **LoRA Specifications:**
  * **Intrinsic Rank ($r$):** 8
  * **Scaling Factor ($\alpha$):** 32
  * **Target Modules:** Injected into multi-head self-attention projection matrices: `["query", "value"]`
  * **Modules to Save:** `["classifier", "score"]` (Sequence classification head)
  * **Dropout Rate:** 0.05
  * **Task Type:** `SEQ_CLS` (Sequence Classification, 2 labels: Benign vs Specific Threat)
  * **Trainable Parameters:** $< 0.8\%$ of total model parameters ($\approx 1.2\text{M}$ trainable parameters out of $125\text{M}$).
* **Zero-Latency In-Memory Fusion:** 
  During inference, the client invokes `self.model.merge_and_unload()`. This directly calculates $W_{\text{effective}} = W_0 + \frac{\alpha}{r} (B \times A)$ in memory, eliminating LoRA adapter latency overhead and allowing standard forward-pass speeds.

### 3.4 Model 4: Dense Vector Embedding Model (`all-MiniLM-L6-v2`)
* **Framework:** `sentence-transformers` via `chromadb.utils.embedding_functions`
* **Architecture:** 6-layer MiniLM mapping textual narratives into 384-dimensional dense semantic vectors.
* **Usage:** Embeds official MITRE ATT&CK enterprise techniques into `Data/MITRE_ATTACK/chroma_db` and embeds real-time local incident memories into `client_org_profile`.

### 3.5 Model 5: Contextual Reasoning & Advisory LLM (`Llama-3.1:8B`)
* **Host Engine:** Ollama (`http://localhost:11434`)
* **Model Tag:** `llama3.1:8b` (Quantized GGUF Q4_K_M)
* **Prompt Engineering Strategy:** Constrained Zero-Shot RAG Prompt. The prompt forces the model to rely exclusively on retrieved MITRE context and strictly forbids extraneous markdown formatting by enforcing a valid JSON output schema:
  ```json
  {
    "threat_summary": "1-sentence executive summary of the attack.",
    "immediate_actions": ["action 1", "action 2", "action 3"],
    "long_term_mitigations": ["mitigation 1", "mitigation 2"]
  }
  ```
* **Offline Resiliency:** If Ollama is not launched, `edge/rag_engine.py` intercepts the connection timeout and generates a fallback incident mitigation report dynamically constructed from ChromaDB technique vectors.

---

## 4. Datasets & Vector Knowledge Base

### 4.1 CSE-CIC-IDS2018 (Canadian Institute for Cybersecurity)
* **Source:** Communications Security Establishment (CSE) & Canadian Institute for Cybersecurity (CIC).
* **Dataset Characteristics:** Collected on a comprehensive network testbed simulating 420 machines and 30 servers across 10 days. Contains realistic benign network flows alongside major attack vectors.
* **File Utilized for Training:** `02-15-2018.csv` (covering DoS-GoldenEye and DoS-Slowloris attacks).
* **Preprocessing Pipeline:**
  1. Removal of infinite values (`np.inf`, `-np.inf`) and null rows.
  2. Dropping of overfitting identifiers: `Timestamp`, `Flow ID`, `Src IP`, `Dst IP`, `Src Port`, `Dst Port`.
  3. Binary target mapping: `Benign -> 0`, `Attack -> 1`.
  4. Gini-importance-based feature reduction from 78 down to the top 15 features.
  5. Standard scaling using Scikit-Learn `StandardScaler` saved to `xgboost_scaler.pkl`.

### 4.2 MITRE ATT&CK Enterprise Matrix (STIX 2.0)
* **Source:** Official MITRE Cyber Threat Intelligence (CTI) repository.
* **Raw Artifact:** `Data/MITRE_ATTACK/enterprise-attack.json` (47.9 MB).
* **Extraction:** Parsed using Python `json` to filter all objects of type `attack-pattern`. Extracts Technique ID (e.g., `T1498`, `T1046`, `T1110`, `T1190`), technique name, and comprehensive technical mitigation procedures.
* **Vector Store Persistence:** Stored in persistent ChromaDB format under `Data/MITRE_ATTACK/chroma_db/`.

### 4.3 Local Organization Profile & Dynamic Incident Memory
* **ChromaDB Collection:** `client_org_profile`
* **Purpose:** Stores the client laptop's unique hardware identifier, hostname, and historic incident distributions.
* **Seeded Baseline (142 Incidents Grounded in IDS2018):**
  * **DoS / Flooding (`T1498`):** 58 incidents (41%)
  * **Port Scanning & Recon (`T1046`):** 35 incidents (25%)
  * **Brute Force / IAM (`T1110`):** 22 incidents (15%)
  * **Zero-Day / Novelty (`T1190`):** 17 incidents (12%)
  * **Web / API Injection (`T1059`):** 10 incidents (7%)
* **Runtime Persistence:** `Data/threat_history.json` records live incident increments, dynamic hourly buckets, and the 20 most recent incident payloads.

---

## 5. Comprehensive Repository File Structure

```
Main Project/
├── .gitignore                                 # Git exclusions (safetensors, node_modules, venv, chroma)
├── requirements.txt                           # Python package dependencies
├── FedThreat_System_Evaluation_and_Teammate_Guide.md # This documentation
├── FedThreat_Project_Knowledge_Transfer.md    # Background research and literature review
├── FedThreat_Final_Architecture_Blueprint.md   # Initial architectural design specification
├── FedThreat_Execution_Plan.md                # 23-day sprint milestone roadmap
│
├── cloud/                                     # Central Cloud Aggregator Module
│   └── server.py                              # Standalone Flower server using custom FLoRAStrategy
│
├── edge/                                      # Edge Sentinel Node Module (Runs on Laptop)
│   ├── main.py                                # FastAPI orchestrator exposing REST endpoints
│   ├── client.py                              # Flower NumPyClient for local LoRA training & fusion
│   ├── correlator.py                          # EventCorrelator: translates flow numbers to text
│   ├── rag_engine.py                          # Dual-tier ChromaDB retriever + Ollama Llama-3.1
│   ├── threat_store.py                        # Thread-safe telemetry store & timeline manager
│   ├── test_engines.py                        # Integration test for correlator and RAG engine
│   └── test_federation.py                     # Integration test for client-server federation
│
├── Models/                                    # Machine Learning Weights & Configurations
│   ├── XGBoost/
│   │   ├── xgboost_baseline.json              # [TRACKED IN GIT] Trained XGBoost 15-feature model
│   │   └── top_15_features.json               # [TRACKED IN GIT] Exact ordered feature names list
│   └── SecureBERT/
│       ├── adapter_config.json                # [TRACKED IN GIT] PEFT LoRA configuration JSON
│       ├── README.md                          # [TRACKED IN GIT] Model card metadata
│       └── adapter_model.safetensors          # [GIT-IGNORED] LoRA weights (3.55 MB, see setup guide)
│
├── Data/                                      # Data, Vector Stores & Logs
│   ├── threat_history.json                    # Real-time persisted incident and timeline logs
│   ├── IDS2018/                               # Target directory for raw CSE-CIC-IDS2018 CSVs
│   └── MITRE_ATTACK/
│       ├── enterprise-attack.json             # [GIT-IGNORED] Downloaded STIX 2 JSON (48 MB)
│       └── chroma_db/                         # [GIT-IGNORED] Local ChromaDB vector database files
│
├── Notebooks/                                 # Training, Preprocessing & Cloud Deployment Scripts
│   ├── 01_colab_xgboost_training.py           # Full data cleaning, feature selection & XGBoost training
│   ├── 02_build_mitre_rag.py                  # Downloads STIX JSON & compiles ChromaDB vector store
│   ├── 03_colab_securebert_baseline.py        # Baseline LoRA training script for SecureBERT
│   └── 04_colab_flower_server.py              # Google Colab Flower server with pyngrok tunnel
│
└── frontend/                                  # React 19 Cybersecurity Operations Dashboard
    ├── package.json                           # Frontend scripts & NPM dependencies
    ├── vite.config.js                         # Vite 8 bundler configuration
    ├── index.html                             # Application HTML root
    └── src/
        ├── main.jsx                           # Application entry point
        ├── App.jsx                            # React Router (Routes: '/' and '/cloud')
        ├── index.css                          # Global dark-theme cyber styling & Tailwind v4
        ├── pages/
            ├── EdgeDashboard.jsx              # Main Edge Sentinel interface with live backend sync
            └── CloudDashboard.jsx             # Global FLoRA Aggregator status & audit log
        └── components/
            ├── DashboardHeader.jsx            # Top navigation bar with status badges & shortcuts
            ├── HardwareKpiCards.jsx           # Live CPU, RAM, Disk, Uptime metric cards
            ├── ThreatDistributionDonut.jsx    # MITRE category distribution donut chart (Recharts)
            ├── TemporalVolumeBarChart.jsx     # 24-hour attack volume bar chart with peak markers
            ├── ActiveThreatAlertHub.jsx       # Alert triage display & Llama-3 mitigation panel
            ├── TelemetryTable.jsx             # Interactive network packet table with search/filters
            ├── MultiModalDrawer.jsx           # Slide-over inspector for multi-source log streams
            └── FederationDrawer.jsx           # Slide-over simulation deck & zero-day injection toggle
```

---

## 6. Teammate Onboarding & Laptop Setup Guide

Follow this guide step-by-step to set up and run the entire FedThreat system locally on any team member's laptop (macOS, Ubuntu/Linux, or Windows).

### 6.1 System Prerequisites
Ensure the following tools are installed before proceeding:
1. **Python 3.10 or 3.11** (Verify via `python3 --version`).
2. **Node.js (v18.0 or higher)** and `npm` (Verify via `node --version`).
3. **Git** (Verify via `git --version`).
4. **Ollama** (Recommended for local LLM inference): Download and install from [https://ollama.com](https://ollama.com).

---

### 6.2 Step 1: Clone the Git Repository
Open a terminal and clone the repository:
```bash
git clone https://github.com/adithyan-manoj/main_project.git
cd main_project
```

---

### 6.3 Step 2: Python Environment Setup
Create and activate an isolated Python virtual environment:

**On macOS and Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Upgrade `pip` and install all required Python dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

> **Note on PyTorch:** `requirements.txt` specifies `torch>=2.8.0`. On macOS with Apple Silicon, PyTorch automatically uses the **MPS** (Metal Performance Shaders) backend for hardware acceleration. On CUDA-enabled systems (NVIDIA), install the corresponding CUDA-enabled PyTorch build if necessary.

---

### 6.4 Step 3: Frontend Setup
In a separate terminal window, navigate to the `frontend/` directory and install the Node packages:
```bash
cd frontend
npm install
```

---

### 6.5 Step 4: Adding Model Weights & Datasets (CRITICAL)

Because `.gitignore` prevents large binary models and vector databases from cluttering the Git history, newly cloned repos lack the following files:
* `Models/SecureBERT/adapter_model.safetensors`
* `Data/MITRE_ATTACK/enterprise-attack.json`
* `Data/MITRE_ATTACK/chroma_db/`

Choose either **Method A** (Recommended - Instant File Placement) or **Method B** (Generate from Scratch):

#### Method A: Direct Transfer from Teammates (Fastest - 2 Minutes)
If getting the files from a teammate via Google Drive, AirDrop, or USB:
1. Copy `adapter_model.safetensors` (approx. 3.55 MB) directly into:
   ```
   Main Project/Models/SecureBERT/adapter_model.safetensors
   ```
2. Copy `enterprise-attack.json` (approx. 47.9 MB) directly into:
   ```
   Main Project/Data/MITRE_ATTACK/enterprise-attack.json
   ```
3. Copy the entire `chroma_db/` folder directly into:
   ```
   Main Project/Data/MITRE_ATTACK/chroma_db/
   ```

#### Method B: Generate the Files Automatically (Self-Contained - 5 Minutes)
If generating the files independently:

1. **Build the MITRE ATT&CK ChromaDB Vector Store:**
   Run the automated builder script from the repository root:
   ```bash
   python -m Notebooks.02_build_mitre_rag
   ```
   *What this does:* Automatically downloads `enterprise-attack.json` directly from the official MITRE GitHub, parses all attack techniques, and generates the persistent `chroma_db` vector store in `Data/MITRE_ATTACK/chroma_db/`.

2. **Generate the SecureBERT LoRA Baseline Adapter:**
   Run the baseline training script:
   ```bash
   python -m Notebooks.03_colab_securebert_baseline
   ```
   *What this does:* Downloads `ehsanaghaei/SecureBERT` from HuggingFace, initializes the LoRA adapter with $r=8$, trains it on the baseline threat mapping, and exports the adapter. Copy the resulting `adapter_model.safetensors` into `Models/SecureBERT/`.

---

### 6.6 Step 5: Start Ollama for Local Llama-3.1 Reasoning
To enable Stage 4 Zero-Shot Incident Advisory generation:
1. Open a new terminal and launch Ollama:
   ```bash
   ollama serve
   ```
2. In another terminal, pull the required 8-billion parameter model:
   ```bash
   ollama pull llama3.1:8b
   ```
> **Offline Fallback Note:** If running on a laptop with limited RAM (less than 8 GB) where running Llama-3.1 is not feasible, the backend automatically generates structured ChromaDB-grounded mitigation advisories without crashing.

---

### 6.7 Step 6: Verify Integration with Test Scripts
Run the built-in test scripts to verify the local modules:
```bash
python -m edge.test_engines
```
*Expected Output:*
* Confirms Stage 2 Correlator translates numerical packets to natural language.
* Confirms Stage 4 RAG retrieves MITRE techniques and generates an advisory.

---

## 7. How to Run the Full Distributed System

To run the full end-to-end demonstration, three components should be active:

```
Terminal 1: Cloud/Local Flower Server   (Port 8080)
Terminal 2: Edge FastAPI Orchestrator  (Port 8000)
Terminal 3: React Frontend Dashboard   (Port 5173)
```

### 7.1 Terminal 1: Launch the Federated Aggregator
Depending on whether testing locally on one machine or testing distributed hybrid cloud-edge:

**Option 1: Local Server (For quick local testing)**
```bash
cd "Main Project"
source venv/bin/activate
python -m cloud.server
```
*Console Output:* `Starting Federated FLoRA Server... [INFO] Flower Evolving... 0.0.0.0:8080`

**Option 2: Cloud Server (Google Colab + Ngrok Tunnel)**
1. Open Google Colab and paste the contents of `Notebooks/04_colab_flower_server.py`.
2. Insert your free Ngrok Auth Token (or use the token pre-configured in the script).
3. Run the cell. Ngrok will output a public TCP URL (e.g., `tcp://0.tcp.ngrok.io:12345`).
4. In `edge/correlator.py` (line 12), update `self.server_address` to this public address.

---

### 7.2 Terminal 2: Launch the Edge FastAPI Backend
```bash
cd "Main Project"
source venv/bin/activate
uvicorn edge.main:app --reload --host 127.0.0.1 --port 8000
```
*Console Output:*
```
[INFO] ✅ XGBoost model loaded successfully from Models/XGBoost/xgboost_baseline.json
[INFO] [RAG] Loaded global 'mitre_enterprise' collection.
[INFO] [RAG] Loaded personalized 'client_org_profile' collection.
[INFO] Uvicorn running on http://127.0.0.1:8000
```

Verify backend health by opening your browser at `http://127.0.0.1:8000/docs` (interactive Swagger UI).

---

### 7.3 Terminal 3: Launch the React Dashboard
```bash
cd "Main Project/frontend"
npm run dev
```
*Console Output:*
```
  VITE v8.3.0  ready in 180 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
Open **`http://localhost:5173/`** in Chrome, Brave, Safari, or Edge.

---

## 8. Performing the Live Demonstration

Once all three terminals are active, demonstrate the system's live detection and federation capabilities:

1. **Observe the Dashboard Baseline:**
   * Watch the **Live Edge Sentinel Hardware** card: CPU and RAM usage update every 2 seconds via live `psutil` queries from your laptop.
   * View the **MITRE ATT&CK Threat Distribution** donut chart and the **24-Hour Attack Timeline** bar chart (identifying the 14:00 peak historical attack spike).
2. **Open the Federation Drawer:**
   * Click **"Federation / Simulation Controls"** on the right side of the screen.
   * Ensure the **Zero-Day Anomaly Simulation** toggle is enabled (active purple gradient).
3. **Simulate a Zero-Day Threat Injection:**
   * Click **"Inject Zero-Day Anomaly"**.
   * **Stage 1:** Ingress telemetry hits `POST /api/telemetry`. XGBoost detects anomalous duration and packet volumes.
   * **Stage 2:** The Correlator converts flow numbers into a narrative text description.
   * **Stage 3:** The edge client triggers a federated training round, connecting to the Flower Server on port 8080 to exchange LoRA weights, followed by in-memory `merge_and_unload()`.
   * **Stage 4:** The classification string queries ChromaDB for MITRE ATT&CK techniques, and Llama-3 generates immediate containment and long-term remediation actions.
4. **Inspect the Real-Time Update:**
   * The **Active Threat Alert Hub** updates instantly, displaying the new threat badge, model confidence ($96\%$), narrative translation, and MITRE remediation advice.
   * The **Recent Telemetry Feed** appends the blocked packet at the top of the log with a pulse highlight.
   * The **Threat Distribution Donut** dynamically recalculates percentages from the local ChromaDB memory.
5. **Inspect Multi-Modal Streams:**
   * Click the **"Multi-Modal Streams"** button on the top navigation bar to inspect Network PCAP, Authentication IAM logs, Endpoint Syslog, and Cloud Audit trails.
6. **Inspect the Cloud Aggregator:**
   * Navigate to **`http://localhost:5173/cloud`** (or click the link) to view the global Flower aggregation tracker, round status, and audit logs.

---

## 9. Troubleshooting & FAQ

### Q1: `ModuleNotFoundError: No module named 'edge'`
* **Cause:** Python cannot resolve the project root when executing scripts.
* **Fix:** Run scripts using the `-m` module flag from the repository root, e.g.:
  ```bash
  python -m edge.test_engines
  ```
  Or ensure your `PYTHONPATH` includes the repository root:
  ```bash
  export PYTHONPATH="${PYTHONPATH}:$(pwd)"
  ```

### Q2: `Connection Refused: localhost:8080` during Stage 3
* **Cause:** The Flower Server (`cloud/server.py` or Colab) is not currently running.
* **Fix:** Ensure Terminal 1 is running `python -m cloud.server`. Note that `edge/main.py` has a built-in fallback: if the Flower server is unreachable during an injection, the demo will log the warning and complete the remaining stages without crashing.

### Q3: `ChromaDB not found at .../chroma_db`
* **Cause:** Step 4 was skipped and the vector database was not copied or built.
* **Fix:** Run `python -m Notebooks.02_build_mitre_rag`. This requires an internet connection to download `enterprise-attack.json` once.

### Q4: Port Conflicts (Port 8000 or 5173 already in use)
* **Check Port 8000:** `lsof -i :8000` (macOS/Linux) or `netstat -ano | findstr :8000` (Windows).
* **Terminate Rogue Process:** `kill -9 <PID>`.
* **Alternate Port:** Run Uvicorn on a different port:
  ```bash
  uvicorn edge.main:app --reload --port 8001
  ```
  *(Update `API_BASE_URL` in `frontend/src/pages/EdgeDashboard.jsx` if changing the backend port).*

### Q5: Ollama Connection Error
* **Behavior:** The dashboard still displays complete MITRE ATT&CK mitigation advisories.
* **Explanation:** `edge/rag_engine.py` includes automatic heuristic fallback generation. If Ollama is offline or out of memory, it builds a synthesized advisory directly from retrieved ChromaDB technique chunks.

---

## 10. Research Context & Academic References

The design of FedThreat is grounded in four foundational academic publications:

1. **Saura et al. (2025/2026):** *"Enhancing Federated Intrusion Detection through LLM-Driven Alert Enrichment and Collaborative Threat Information Sharing."* (Future Generation Computer Systems).  
   *Contribution to FedThreat:* Establishes the paradigm of using local federated IDS for frontline detection while selectively passing low-confidence alerts to an LLM enriched with threat intelligence (Federated RAG).
2. **Zhang et al. (2021):** *"Client Selection for Federated Learning With Non-IID Data in Mobile Edge Computing."* (IEEE Access).  
   *Contribution to FedThreat:* Informs client selection strategies based on data heterogeneity and weight divergence.
3. **GuardianAI (2025):** *"Privacy-preserving federated anomaly detection with differential privacy."* (Array).  
   *Contribution to FedThreat:* Formulates the privacy baseline combining Differential Privacy (DP) noise mechanisms and Secure Aggregation.
4. **FLoRA (Wang et al., NeurIPS 2024):** *"Federated Fine-Tuning Large Language Models with Heterogeneous Low-Rank Adaptations."*  
   *Contribution to FedThreat:* Solves parameter-efficient distributed tuning across heterogeneous hardware by mathematically stacking low-rank LoRA matrices without cross-client interference.

---
*Document prepared for academic capstone presentation and team onboarding.*
