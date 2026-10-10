# FedThreat: Comprehensive Dashboard UI & UX Specification

This document serves as the complete, authoritative specification for the UI redesign of the **FedThreat Edge & SOC Dashboard**. It includes all client-specified components, architecture-specific federated learning modules, multi-modal ingestion inspectors, design tokens, and data contracts.

---

## 1. Executive Summary & Design Vision

**FedThreat** is a privacy-preserving, federated cybersecurity learning framework that detects rare and zero-day threats across distributed edge organizations without centralizing raw security telemetry.

### Core Dashboard Objectives
1. **Real-Time Situation Awareness:** Provide immediate visibility into edge system resources, network telemetry, and detected anomalies.
2. **Explainable AI & Incident Response:** Bridge raw numerical packet features to human-readable MITRE ATT&CK tactics, backed by Llama-3 generative mitigation playbooks.
3. **Federated Orchestration Transparency:** Clearly reflect the local training state, LoRA adapter synchronization, and privacy guarantees ($\epsilon$-Differential Privacy) with the central cloud aggregator (Google Colab / Flower server).
4. **Multi-Modal Data Ingestion:** Enable granular inspection across diverse security log formats (Network flows, Auth logs, System logs, Web API telemetry).

---

## 2. Core Requirements Breakdown

### 2.1. System Hardware & Resource Usages (Top KPI Row)
Provides instant telemetry on the host machine running the edge agent:

*   **CPU Utilization:**
    *   *Metric:* Real-time percentage (e.g., `24.5%`) with core count indicator.
    *   *Visualization:* Compact gauge or micro-sparkline tracking the last 60 seconds.
*   **RAM (System Memory):**
    *   *Metric:* Used vs. Total (e.g., `6.2 GB / 16.0 GB` • `38.7%`).
    *   *Visualization:* Horizontal dual-tone progress bar.
*   **GPU / VRAM (Accelerator Monitoring):**
    *   *Metric:* VRAM allocated for local PyTorch / SecureBERT / LoRA adapters (e.g., `3.1 GB / 8.0 GB`).
    *   *Visualization:* Dedicated acceleration badge indicating execution device (`MPS / Apple Silicon`, `CUDA`, or `CPU`).
*   **Storage & Disk I/O:**
    *   *Metric:* Disk consumption of local FAISS vector store, model weights, and cached telemetry logs.
*   **System Health & Uptime:**
    *   *Metric:* Elapsed active runtime (e.g., `14.8 hours`) and operating thermal profile / host status (`Normal • 48°C`).

---

### 2.2. Threat Distribution Analytics & Breakdown (Center Visualization)
Presents aggregated security intelligence for the edge node:

*   **Threat Categorization (Donut / Radial Chart):**
    *   Visual breakdown of total detected incidents by classification percentage:
        *   **Denial of Service (DoS / DDoS):** ~40% (Red)
        *   **Port Scanning & Reconnaissance:** ~25% (Orange)
        *   **Brute Force / Credential Stuffing:** ~15% (Amber)
        *   **Zero-Day / Novelty Infiltration:** ~12% (Violet / Neon Purple)
        *   **Benign / False Positives:** ~8% (Emerald Green)
    *   *Center Label:* Displays total blocked events count (e.g., `142 Threats Mitigated`).
*   **Temporal Attack Volume (Historical Sparkline / Bar Chart):**
    *   Hourly / Daily timeline graph displaying threat spikes over selectable time windows (`1 Hour`, `24 Hours`, `7 Days`).
*   **Threat Severity Matrix:**
    *   Counters filtered by urgency levels: `Critical (Red)`, `High (Orange)`, `Medium (Yellow)`, and `Low / Info (Blue)`.

---

### 2.3. Output Alert Section & AI Incident Response Hub
Displays live alerts and actionable remediation playbooks generated when anomalies are flagged:

*   **Alert Status Banner:**
    *   Dynamic classification badge: `🚨 ANOMALY DETECTED` or `✅ TRAFFIC BENIGN`.
    *   MITRE ATT&CK Classification Tag: (e.g., `T1498: Network Denial of Service` or `T1110: Brute Force`).
    *   Model Confidence Gauge: Percentage meter (e.g., `SecureBERT Confidence: 96%`).
*   **Stage 2 Narrative Translation Box:**
    *   Human-readable synthesis produced by the Event Correlator (e.g., *"Detected anomalous TCP network flow targeting destination port 443. Flow lasted 12,000 microseconds transmitting 4,500 forward packets, exhibiting volumetric flood signatures."*).
*   **Generative Incident Advisory (Llama-3 RAG):**
    *   **Executive Summary:** Plain-English description of the incident, impact scope, and probable attacker motivation.
    *   **Immediate Incident Response (Playbook Checklist):**
        *   Interactive checklist of urgent remediation steps (e.g., `Block Source CIDR 192.168.1.100`, `Rate-limit ingress SYN packets on port 443`, `Quarantine impacted subnet`).
    *   **Long-Term Mitigations:**
        *   Architecture recommendations (e.g., `Update edge firewall ACLs`, `Tune WAF rate-limiting policies`).
*   **Direct Response Actions (Buttons):**
    *   `[Quarantine Target Host]`
    *   `[Apply Firewall Rule]`
    *   `[Export Incident Report (PDF/JSON)]`
    *   `[Acknowledge / Dismiss]`

---

### 2.4. Left Panel: Multi-Modal Ingestion Streams & Inspector
Allows SOC operators to switch between and inspect different data ingestion pipelines feeding the edge models:

*   **Ingestion Modality Selectors (Interactive List):**
    1.  **Network Flows (`NetFlow / PCAP`):**
        *   *Fields:* `Dst Port`, `Protocol`, `Flow Duration`, `Tot Fwd Pkts`, `Tot Bwd Pkts`, `Pkt Size Avg`.
        *   *Rate:* ~1,200 packets/sec.
    2.  **Authentication & IAM Logs (`Auth Logs`):**
        *   *Fields:* `User ID`, `Auth Method`, `Failed Attempts`, `Geo-Location`, `MFA Status`.
        *   *Rate:* ~15 events/min.
    3.  **Endpoint & Host Logs (`Syslog / OSQuery`):**
        *   *Fields:* `Process Name`, `PID`, `Parent Process`, `File Modifications`, `System Calls`.
        *   *Rate:* ~90 events/sec.
    4.  **Web & Application Telemetry (`HTTP Access Logs`):**
        *   *Fields:* `HTTP Method`, `URI Endpoint`, `Response Code (403, 500)`, `User-Agent`, `Payload Length`.
        *   *Rate:* ~45 req/sec.
    5.  **Threat Intelligence Feeds (`IOC Sync`):**
        *   *Fields:* Synchronized IP blacklists, known bad domain hashes, CVE vulnerability feeds.
*   **Modality Inspector Drawer:**
    *   Clicking any source expands an inspector view displaying:
        *   *Ingestion Health:* Status indicator (`Active`, `Degraded`, `Paused`).
        *   *Raw Payload Viewer:* Formatted JSON / Hex snippet of the last ingested record.
        *   *Filter / Search:* Live regex filter for quick inspection.

---

### 2.5. Top-Left Sidebar: Organization Profile & Node Identity
Establishes edge node context within the broader enterprise network:

*   **Organization Profile Header:**
    *   **Organization Icon & Name:** (e.g., `Alpha Banking Corp` or `City Health Network`).
    *   **Facility / Node Identity:** `Edge Node ID: MAC-EDGE-01`.
    *   **Cluster & Department:** `Regional Security Cluster • Finance HQ`.
    *   **Node Role:** `Autonomous Edge Sentinel (Tier-1 Local Ingestion)`.
*   **Live Connection Status Badge:**
    *   Pulsing badge indicating active federation:
        *   `● ONLINE • FEDERATED` (Emerald Green)
        *   `● OFFLINE / ISOLATED` (Rose Red)
        *   `● SYNCING WEIGHTS` (Amber / Blue)

---

## 3. Essential Missing Components (Federated Intelligence Layer)

To turn a standard dashboard into the **FedThreat Federated Defense Platform**, the following modules are required:

### 3.1. Federated Learning (FL) Synchronization Monitor
*   **Central Aggregator Connection:** gRPC connection status to Google Colab Flower server (`ngrok.app:8080`).
*   **FL Round Tracker:** Visual counter showing `Global Round 4 / 10`.
*   **LoRA Adapter Synchronization:** Status showing whether the local parameter weights ($\Delta W$) have been transmitted or merged.
*   **Differential Privacy (DP) Meter:**
    *   Displays current privacy budget consumption: $\epsilon = 0.5$, $\delta = 10^{-5}$.
    *   Guarantee confirmation tag: `Zero Raw Data Leaves Edge • 100% Parameter Isolation`.
*   **Global Model Drift Index:** Indicates divergence between the edge node's local threat distribution and the global model.

---

### 3.2. 4-Stage Detection Pipeline Visualizer
A pipeline stepper reflecting FedThreat’s core machine learning workflow in real time:

| Stage | Model / Component | Role | Latency Benchmark |
| :--- | :--- | :--- | :--- |
| **Stage 1** | **XGBoost Classifier** | Frontline fast triage filter. Discards 95%+ benign traffic. | `< 2 ms` |
| **Stage 2** | **Event Correlator** | Translates numeric vector features into chronological natural language narrative. | `< 4 ms` |
| **Stage 3** | **SecureBERT + LoRA** | MITRE ATT&CK multi-class classification and confidence calculation. | `~45 ms` |
| **Stage 4** | **Llama-3 RAG** | Vector retrieval of mitigation strategies and structured incident report generation. | `~350 ms` |

---

### 3.3. Simulation & Presentation Controls (Demo Switchboard)
Crucial for demonstrating capabilities live to evaluators and stakeholders:

*   **"Inject Threat Payload" Button:** Sends a simulated attack packet (e.g., High Flow Duration, Volumetric Flood) to verify anomaly detection.
*   **"Send Benign Traffic" Button:** Sends standard normal traffic (Port 443, low packet count) to verify triage filtering.
*   **"Zero-Day Simulation Mode" Toggle:**
    *   *Checked (ON):* Flags traffic as an unseen attack, triggers local LoRA fine-tuning, and packages weights for Flower federation.
    *   *Unchecked (OFF):* Routes to fast local model inference without cloud weight synchronization.
*   **Custom File Ingestion:** Drag-and-drop box for `.pcap` or `.csv` files.

---

### 3.4. Live Event Telemetry Stream (Tabular Log Feed)
A real-time, scrolling log table displaying incoming events:

*   **Columns:**
    1.  `Timestamp` (e.g., `14:32:05.102`)
    2.  `Source / Dest IP` (e.g., `10.0.4.12 -> 192.168.1.1`)
    3.  `Port & Protocol` (e.g., `443 / TCP`)
    4.  `Stage 1 Score` (Benign `0` / Anomaly `1`)
    5.  `Stage 3 Label` (e.g., `T1498 DoS`)
    6.  `Status` (`Blocked`, `Inspected`, `Passed`)

---

### 3.5. Global Navigation, Search & Notification Bar (Top Header)
*   **Global Search Bar:** Instant query for IP addresses, domain names, MITRE technique IDs, or CVEs.
*   **Time Horizon Filter:** `Live (Streaming)`, `15m`, `1h`, `24h`, `Custom Range`.
*   **Audio Alert Toggle:** Audible chime for Critical `P1` zero-day events.
*   **Role Switcher:** Toggle view between `Edge Node Operator` and `Global Cloud Aggregator`.

---

## 4. UI Layout & Wireframe Blueprint

```
+--------------------------------------------------------------------------------------------------------------------------------------------------+
| [LOGO] FEDTHREAT ENTERPRISE    |  [ Q Search IPs, CVEs, MITRE IDs... ]   |  [Time: Live 1h v]  |  [FL Node: CONNECTED]  |  [🔔 3]  [⚙️ Settings] |
+--------------------------------+-----------------------------------------+---------------------+------------------------+----------+--------------+
| LEFT PANEL (20% Width)         | MAIN WORKSPACE (55% Width)                                    | RIGHT PANEL (25% Width)                                 |
+--------------------------------+---------------------------------------------------------------+---------------------------------------------------------+
| [ORGANIZATION PROFILE]         | [1. SYSTEM USAGES & HARDWARE TELEMETRY]                       | [FEDERATED LEARNING STATUS]                             |
| Alpha Banking Corp             | +-----------+ +-----------+ +-----------+ +-----------+       | • Server: ngrok.app:8080 (Colab)                        |
| MAC-EDGE-01 (Online)           | | CPU: 24%  | | RAM: 38%  | | GPU: 3.1GB| | Uptime:14h|       | • Round: 4 / 10                                         |
|                                | +-----------+ +-----------+ +-----------+ +-----------+       | • Differential Privacy: Active                          |
| [DATA INGESTION STREAMS]       |                                                               | • LoRA Sync: Idle                                       |
| > [x] Network Flows (PCAP)     | [2. THREAT DISTRIBUTION & ATTACK SURFACE]                     +---------------------------------------------------------+
| > [ ] Auth / IAM Events        | +-----------------------------+ +---------------------------+ | [SIMULATION & DEMO CONTROLS]                            |
| > [ ] Endpoint Syslog          | | DONUT CHART                 | | HISTORICAL ATTACK TREND   | | [x] Zero-Day Federation Trigger                         |
| > [ ] Web / API Logs           | | 42% DDoS    25% PortScan    | | [~~~~~/\~~~~/\~~~~]       | [ Inject Threat Payload ]                               |
| > [ ] Threat Intel (IOCs)      | | 18% Brute   15% Zero-Day    | | Hourly Attack Volume      | [ Send Benign Traffic   ]                               |
|                                | +-----------------------------+ +---------------------------+ | [ Upload PCAP / CSV   ]                                 |
| [SELECTED MODALITY INSPECTOR]  |                                                               +---------------------------------------------------------+
| Mode: Network Flows (Live)     | [3. ACTIVE THREAT ALERT & AI MITIGATION HUB]                  | [REAL-TIME TELEMETRY STREAM]                            |
| • Rate: 1,240 pkts/sec         | +-----------------------------------------------------------+ | 14:30:12 | 192.168.1.5 -> 443 | TCP | Normal            |
| • Port: 443 (HTTPS)            | | 🚨 CRITICAL: T1498 Denial of Service (Confidence: 96%)    | | 14:30:18 | 10.0.0.14 -> 443   | TCP | Normal            |
| • Protocol: TCP                | | "Anomalous volumetric flow targeting destination port 443"| | 14:30:24 | 172.16.0.4 -> 443  | TCP | 🚨 THREAT (T1498) |
| • Payload: Raw Hex Preview     | +-----------------------------------------------------------+ +---------------------------------------------------------+
|                                | | LLAMA-3 EXECUTIVE SUMMARY:                                | [QUICK INCIDENT ACTIONS]                                |
|                                | | Volumetric SYN flood signature attempting resource        | [ Block Source IP ]                                     |
|                                | | exhaustion on core edge ingress gateway.                  | [ Quarantine Subnet ]                                   |
|                                | | IMMEDIATE ACTIONS:          | LONG-TERM MITIGATIONS:      | [ Export Incident Report ]                              |
|                                | | [x] Drop CIDR 192.168.1.0/24| • Reconfigure SYN cookies   |                                                         |
|                                | | [ ] Rotate Ingress Gateway  | • Tighten WAF rate limits   |                                                         |
|                                | +-----------------------------+-----------------------------+                                                         |
+--------------------------------+---------------------------------------------------------------+---------------------------------------------------------+
| BOTTOM BAR: Federated Mesh: 4 Nodes Online | Zero Raw Records Transmitted | Model Version: v2.4-FLoRA | Local Engine: SecureBERT-PEFT (MPS Enabled)             |
+---------------------------------------------------------------------------------------------------------------------------------------------------------+
```

---

## 5. Design Tokens & Visual Aesthetics

### 5.1. Color Palette (Cyberpunk / Modern SOC Dark Theme)
*   **Canvas / Backgrounds:**
    *   `bg-canvas`: `#060709` (Deep Obsidian Void)
    *   `bg-card`: `#0d0f12` (Elevated Panel)
    *   `bg-card-hover`: `#14171d` (Interactive Hover)
    *   `border-subtle`: `#1e2229` (Clean, crisp border line)
*   **Severity / Status Indicators:**
    *   `status-critical`: `#ef4444` (Vibrant Crimson Red)
    *   `status-warning`: `#f97316` (Neon Amber Orange)
    *   `status-success`: `#10b981` (Emerald Green)
    *   `status-info`: `#3b82f6` (Cyan / Cobalt Blue)
    *   `status-federated`: `#8b5cf6` (Electric Purple)
*   **Typography:**
    *   *Body & Headings:* Inter / Outfit / Plus Jakarta Sans.
    *   *Code & Telemetry Data:* JetBrains Mono / Fira Code.

### 5.2. Micro-Interactions & Animation Cues
*   **Pulsing Threat Radar:** Critical anomaly headers feature a glowing border pulse (`box-shadow: 0 0 15px rgba(239, 68, 68, 0.4)`).
*   **Active Log Updates:** New telemetry entries slide down with a 200ms ease-out transition.
*   **Federated Weight Sync Indicator:** Rotating orbital ring when local LoRA weights are synchronizing with the central server.

---

## 6. Data Contract & Backend Integration Reference

The redesigned dashboard interacts directly with the local FastAPI orchestrator (`edge/main.py`):

### 6.1. System Health Monitoring
*   **Endpoint:** `GET /api/system_status`
*   **Response Payload:**
```json
{
  "cpu_usage": 24.5,
  "ram_usage": 38.7,
  "disk_usage": 42.1,
  "uptime_hours": 14.8
}
```

### 6.2. Telemetry Ingestion & Attack Analysis
*   **Endpoint:** `POST /api/telemetry`
*   **Request Payload:**
```json
{
  "Dst_Port": 443,
  "Protocol": "TCP",
  "Tot_Fwd_Pkts": 4500,
  "Tot_Bwd_Pkts": 10,
  "Flow_Duration": 12000,
  "simulate_zero_day": true
}
```
*   **Response Payload:**
```json
{
  "status": "anomaly_detected",
  "xgboost_score": 1,
  "narrative_translation": "Detected anomalous TCP network flow targeting destination port 443...",
  "securebert_classification": "T1498: Network Denial of Service",
  "securebert_confidence": 0.96,
  "llama3_advisory": {
    "threat_summary": "Volumetric denial-of-service packet inundation.",
    "immediate_actions": [
      "Rate-limit incoming packets on port 443",
      "Isolate originating subnet"
    ],
    "long_term_mitigations": [
      "Implement upstream DDoS scrubbing",
      "Update firewall policy"
    ]
  },
  "message": "All 4 ML Stages Complete! Payload ready for React Dashboard."
}
```

### 6.3. Military Situational Health Report
*   **Endpoint:** `GET /api/health_report`
*   **Response Payload:**
```json
{
  "status_report": "Edge Sentinel operational. Hardware temperatures within nominal threshold. Local LoRA weights aligned with global checkpoint."
}
```

---

## 7. Implementation Checklist for Manual Redesign

- [ ] **Step 1: Layout Skeleton**
  - Implement 3-column responsive grid (Left Sidebar 20%, Center Canvas 55%, Right Panel 25%).
- [ ] **Step 2: Profile & Ingestion Panel (Left)**
  - Add Organization avatar, Node ID, and federated status indicator.
  - Implement multi-modal tabs (`Network`, `Auth`, `Endpoint`, `Web`).
  - Build collapsible raw payload inspector drawer.
- [ ] **Step 3: KPI & Hardware Cards (Top Center)**
  - Integrate polling hook (`useInterval` 2000ms) to `/api/system_status`.
  - Render CPU, RAM, GPU, and Uptime widgets.
- [ ] **Step 4: Threat Analytics & Graphs (Mid Center)**
  - Implement Donut Chart for threat distribution percentages.
  - Implement temporal attack frequency sparkline.
- [ ] **Step 5: Incident Alert & AI Advisory Hub (Bottom Center)**
  - Bind to `/api/telemetry` response.
  - Format Llama-3 mitigation checklist with interactive checkboxes and response action buttons.
- [ ] **Step 6: Federated Sync & Simulation Deck (Right Panel)**
  - Add Flower connection status badge and round counter.
  - Add demo controls (`Inject Threat`, `Send Benign`, `Zero-Day Toggle`).
  - Add live scrolling telemetry log table.
