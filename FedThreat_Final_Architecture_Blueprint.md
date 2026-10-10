# FedThreat: Finalized Architecture & Implementation Blueprint (Hybrid Cloud-Edge Edition)

## 1. Executive Summary & Objectives
**Project Purpose:** FedThreat is a privacy-preserving, federated cybersecurity learning framework designed to detect rare and emerging threats across distributed organizations without centralizing raw security telemetry.

**Sprint Objective:** We are operating on a strict **23-day sprint** to deliver an **80% completed Minimum Viable Product (MVP)**. 

**Demo Goals:** The culmination of this sprint is a highly functional, real-time demonstration showcasing a true **Hybrid Cloud-Edge Distributed Network**. We will prove real-world federated capabilities by linking local edge devices (laptops) to a high-compute cloud aggregator (Google Colab).

## 2. Finalized System Architecture (Distributed Cloud-Edge)
To leverage the massive compute upgrade via Google Colab while maintaining realistic edge constraints, the architecture is split into Cloud and Edge domains:

### A. The Edge Domain (Local Devices e.g., Dell Latitude, MacBook)
*   **Initial Risk Scoring (XGBoost):** Acts as the ultra-fast frontline filter. Processes streaming client telemetry locally to calculate a "Novelty/Rarity" $T_k$ metadata score.
*   **Core Threat Detection (Foundation Model):** A compact, specialized Transformer (e.g., SecureBERT or DistilBERT) resides locally.
*   **Local Federated Training:** Selected edge clients train tiny LoRA adapters on local data. This perfectly mirrors real-world constraints where data cannot leave the edge.

### B. The Cloud Domain (Google Colab Central Server)
*   **Federated Aggregation (Flower Server):** Colab hosts the Flower central server, handling the heavy lifting of aggregating LoRA adapters from distributed clients (e.g., via FedAvg) and broadcasting global updates.
*   **Threat Analysis (RAG LLM / Heavy Transformer):** Because we have Colab's high VRAM (T4/A100 GPUs), we can confidently host the heavy RAG system (frozen Llama-3-8B or an equivalent heavy generative model) on the cloud. It receives structured alerts from the edge and instantly generates MITRE ATT&CK mitigation reports.

## 3. Networking & Integration Strategy
Since our clients (and the Flutter dashboard) run locally but the server runs in the cloud, we must bridge the network securely:

*   **gRPC & API Tunneling:** We will utilize **Ngrok** (via `pyngrok`) within the Google Colab notebook. 
*   **Connection Flow:**
    1. Ngrok exposes the Flower gRPC port (for federated weight syncing).
    2. Ngrok exposes the FastAPI REST port (for the RAG endpoint).
    3. The local Flutter frontend and the local Python edge clients connect directly to these stable Ngrok URLs.

## 4. Hardware & Deployment Strategy (The Demo Flow)
*   **Real-World Federation:** The demo will no longer be simulated on a single machine. The Dell Latitude and MacBook will act as distinct physical edge organizations.
*   **Live Injection & Aggregation:** We inject a zero-day attack into the Dell Latitude. The audience watches the local XGBoost spike, the Colab server select the Dell, and the global weights update.
*   **Cloud RAG Inference:** The MacBook successfully detects the new attack using the updated global weights, sends the structured alert to the Colab FastAPI endpoint, and the local Flutter dashboard immediately displays the cloud-generated mitigation report.

## 5. Technology Stack
*   **Core ML Framework:** PyTorch (CUDA on Colab, MPS on Mac, CPU/CUDA on Dell).
*   **Federated Orchestration:** Flower (Flwr) over gRPC.
*   **Network Bridging:** Ngrok / PyNgrok.
*   **Lightweight Filtering:** XGBoost.
*   **Transformer Ecosystem:** HuggingFace `transformers` & `peft` (LoRA).
*   **Backend API:** FastAPI (Hosted on Colab, tunneling to local).
*   **Frontend Dashboard:** Flutter (Hosted locally).
*   **RAG Vector Database:** FAISS or ChromaDB.
