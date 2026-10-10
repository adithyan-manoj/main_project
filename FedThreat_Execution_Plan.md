# FedThreat: 23-Day Sprint Execution Plan

## 1. Overall System Flow (The Live Demo Narrative)

During the final presentation, the data will flow through the system in this exact sequence:

1. **Injection & Triage (Edge):** A zero-day attack log is manually injected into the edge client. The incoming telemetry instantly hits the local XGBoost filter. XGBoost calculates a high novelty/rarity score, recognizing this as an unseen anomaly.
2. **Event-Driven Federation (Edge to Cloud):** The high XGBoost score triggers an event-driven Federated Learning round. The edge client quickly trains its local LoRA adapter on this new zero-day data.
3. **FLoRA Stacking (Cloud):** The edge client pushes its heterogeneous rank LoRA adapter to the Google Colab central server via the ngrok/Cloudflare tunnel. The Colab server mathematically stacks this adapter (using the FLoRA methodology, without adding noise) with updates from other clients, and broadcasts the updated global adapter back to the edge.
4. **Dynamic Inference (Edge):** The edge client receives the global adapter. Using `merge_and_unload()`, it dynamically merges the new federated adapter into its frozen SecureBERT base model in-memory. SecureBERT processes the zero-day log again and outputs a definitive, structured classification (e.g., "Zero-Day SYN-Flood DDoS").
5. **Context Retrieval (Cloud):** The local FastAPI backend sends this structured classification string up to the Colab server. The Colab server queries the MITRE ATT&CK RAG vector store, retrieving the top mitigation tactics for this specific attack vector.
6. **Reasoning & Generation (Cloud):** The retrieved MITRE context and the SecureBERT classification are fed into the Colab-hosted Llama-3 model. Using a strict zero-shot prompt, Llama-3 generates a clean, hallucination-free mitigation report.
7. **Presentation (Edge):** The mitigation report is passed back down the tunnel to the local FastAPI backend, which instantly pushes the threat alert and the Llama-3 advisory to the live Flutter cross-platform dashboard for the audience to see.

## 2. Week-by-Week Task Distribution

### Week 1 (Days 1-7): Infrastructure & Baselines
*The Goal: Establish the Cloud-to-Edge network and initialize base models.*

- **Member 1 (Heavy Workload - Cloud & Core ML):** Set up the Google Colab environment. Configure and test stable ngrok/Cloudflare tunnels to expose gRPC and REST ports. Initialize Llama-3 in Colab to verify VRAM allocation.
- **Member 2 (Medium Workload - Edge ML & Backend):** Build the initial local FastAPI backend structure. Train and deploy the local XGBoost anomaly filter so it can accurately process incoming telemetry.
- **Member 3 (Medium/Low Workload - Frontend & RAG Prep):** Scaffold the baseline Flutter dashboard (UI layouts, navigation). Download and parse the MITRE ATT&CK framework, converting it into a local vector database.

### Week 2 (Days 8-14): The Federated Core & In-Memory Merging
*The Goal: Prove the event-driven FLoRA training loop.*

- **Member 1 (Heavy Workload - Cloud & Core ML):** Write the Flower Server orchestration script on Colab. Implement the specific FLoRA mathematical stacking algorithm to aggregate heterogeneous rank adapters without noise.
- **Member 2 (Medium Workload - Edge ML & Backend):** Wrap the local SecureBERT model in HuggingFace PEFT (LoRA). Write the local Flower Client script. Implement the merge-and-unload logic to ensure the local model updates dynamically in-memory after receiving global weights.
- **Member 3 (Medium/Low Workload - Frontend & RAG Prep):** Build specific Flutter UI widgets for threat alerts and server status. Write local mock API responses so UI testing isn't blocked by backend development.

### Week 3 (Days 15-21): Cloud RAG & API Orchestration
*The Goal: Connect the classification output to the reasoning engine and UI.*

- **Member 1 (Heavy Workload - Cloud & Core ML):** Host the RAG vector store on Colab (uploaded by Member 3). Write the zero-shot constrained prompt for Llama-3. Build the Colab FastAPI endpoint that receives the threat class, queries the vector store, and returns the Llama-3 report.
- **Member 2 (Medium Workload - Edge ML & Backend):** Orchestrate the local data flow. Ensure the local FastAPI backend correctly routes SecureBERT's output to Member 1's Colab RAG endpoint, and routes the final combined data to the Flutter frontend.
- **Member 3 (Medium/Low Workload - Frontend & RAG Prep):** Replace mock APIs with live FastAPI endpoints. Conduct full system-wide integration testing (injecting sample logs and verifying the dashboard updates properly).

### Final Push (Days 22-23): Demo Rehearsal & Optimization
*The Goal: Flawless live execution.*

- **Member 1:** Monitor Colab Compute Units, stabilize ngrok sessions, and monitor VRAM during the FLoRA stacking phase.
- **Member 2:** Write the exact Zero-Day Injection script that manually feeds the anomaly into XGBoost to kick off the live demo on cue.
- **Member 3:** Lead the demo rehearsal, ensuring the narrative matches the dashboard's real-time updates.

## 3. Daily Sync Strategy
To ensure the team stays unblocked during this rapid sprint, hold a daily 15-minute stand-up:
- **Format:** What did I complete yesterday? What am I completing today? What is blocking me?
- **Rule:** If a blocker involves a dependency across roles, the involved members must pair-program immediately following the stand-up to resolve it.
