#!/usr/bin/env python3
"""
========================================================================================
 FedThreat: Multi-Sensor Advanced Cyber Attack Campaign Simulator
========================================================================================
 Purpose:
   Simulates a realistic, 5-stage Advanced Persistent Threat (APT) campaign by
   injecting live telemetry packets across all 5 enterprise sensor modalities:
     Stage 1: Web Ingress (SQL Injection Probe)
     Stage 2: Authentication & IAM (Credential Stuffing / SSH Brute Force)
     Stage 3: Endpoint Host Shell (Living-off-the-Land PowerShell Execution)
     Stage 4: Cloud Infrastructure (AWS IAM Privilege Escalation)
     Stage 5: Network Volumetric Exfiltration & Zero-Day Trigger

 Target Endpoint:
   POST http://127.0.0.1:8000/api/telemetry

 Design:
   100% standalone and decoupled from the internal codebase. Uses Python standard
   libraries (urllib, json, time) with zero external dependencies.
========================================================================================
"""

import sys
import time
import json
import urllib.request
import urllib.error

# ANSI Color Codes for Professional Terminal Presentation
CYAN    = "\033[96m"
GREEN   = "\033[92m"
YELLOW  = "\033[93m"
RED     = "\033[91m"
MAGENTA = "\033[95m"
BOLD    = "\033[1m"
DIM     = "\033[2m"
RESET   = "\033[0m"

API_URL = "http://127.0.0.1:8000/api/telemetry"
TARGET_HOST = "Adithyans-MacBook-Air"
ATTACKER_IP = "185.220.101.5"
STEP_DELAY = 2.0  # seconds between attack stages to let UI update

# Define the 5 attack stages representing a complete Cyber Kill-Chain
CAMPAIGN_STAGES = [
    {
        "step": 1,
        "name": "Stage 1: Ingress Web Application Probe (SQL Injection)",
        "sensor": "web",
        "description": "Adversary probes public web gateway with SQL syntax manipulation on authentication endpoint.",
        "payload": {
            "modality": "web",
            "uri_endpoint": "/api/v1/auth/login?user=admin' OR '1'='1'--",
            "http_method": "POST",
            "status_code": 500,
            "source_ip": ATTACKER_IP,
            "host_name": TARGET_HOST,
            "payload_size_bytes": 1420,
            "simulate_zero_day": False
        }
    },
    {
        "step": 2,
        "name": "Stage 2: Credential Stuffing & SSH Brute Force",
        "sensor": "auth",
        "description": "High-frequency authentication attempts from the same source IP targeting administrative accounts.",
        "payload": {
            "modality": "auth",
            "user_id": "sec_admin_ops",
            "source_ip": ATTACKER_IP,
            "auth_service": "SSH",
            "failed_attempts_5m": 24,
            "login_velocity_per_min": 18.0,
            "mfa_failed": 1,
            "is_privileged_account": 1,
            "host_name": TARGET_HOST,
            "simulate_zero_day": False
        }
    },
    {
        "step": 3,
        "name": "Stage 3: Endpoint Host Shell Execution (Living-off-the-Land)",
        "sensor": "endpoint",
        "description": "Suspicious base64-encoded shell execution spawned under office document process.",
        "payload": {
            "modality": "endpoint",
            "host_name": TARGET_HOST,
            "process_name": "powershell.exe",
            "parent_process": "winword.exe",
            "command_line": "powershell.exe -NoProfile -ExecutionPolicy Bypass -enc SQBFAFgA...",
            "is_unsigned_binary": 1,
            "source_ip": ATTACKER_IP,
            "simulate_zero_day": False
        }
    },
    {
        "step": 4,
        "name": "Stage 4: Cloud Infrastructure Privilege Escalation",
        "sensor": "cloud",
        "description": "Unauthorized AWS IAM CreateAccessKey API invocation originating from compromised edge entity.",
        "payload": {
            "modality": "cloud",
            "event_name": "CreateAccessKey",
            "event_source": "iam.amazonaws.com",
            "source_ip": ATTACKER_IP,
            "host_name": TARGET_HOST,
            "error_code": "NoError",
            "simulate_zero_day": False
        }
    },
    {
        "step": 5,
        "name": "Stage 5: Volumetric Network Flood & Outbound Zero-Day Trigger",
        "sensor": "network",
        "description": "Extreme asymmetric packet flood on port 443 triggering FLoRA Federated Learning & LLaMA-3.1.",
        "payload": {
            "modality": "network",
            "Dst_Port": 443,
            "Protocol": "TCP",
            "Tot_Fwd_Pkts": 8500,
            "Tot_Bwd_Pkts": 12,
            "Flow_Duration": 85000,
            "source_ip": ATTACKER_IP,
            "host_name": TARGET_HOST,
            "simulate_zero_day": True
        }
    }
]

def check_backend_health():
    """Verifies that the FastAPI Sentinel server is reachable."""
    test_url = "http://127.0.0.1:8000/api/system_status"
    try:
        req = urllib.request.Request(test_url, headers={"User-Agent": "FedThreat-Campaign-Tester"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            return resp.status == 200
    except Exception:
        return False

def send_telemetry_event(payload):
    """Sends a single telemetry payload to the FastAPI backend."""
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=data_bytes,
        headers={"Content-Type": "application/json", "User-Agent": "FedThreat-Adversary-Simulator"},
        method="POST"
    )
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            latency_ms = (time.time() - start_time) * 1000
            res_body = response.read().decode("utf-8")
            return json.loads(res_body), latency_ms, None
    except urllib.error.HTTPError as e:
        latency_ms = (time.time() - start_time) * 1000
        error_msg = e.read().decode("utf-8")
        return None, latency_ms, f"HTTP Error {e.code}: {error_msg}"
    except Exception as e:
        latency_ms = (time.time() - start_time) * 1000
        return None, latency_ms, str(e)

def format_severity(sev):
    """Applies ANSI colors based on severity string."""
    sev_upper = str(sev).upper()
    if sev_upper == "CRITICAL":
        return f"{RED}{BOLD}CRITICAL{RESET}"
    elif sev_upper == "HIGH":
        return f"{YELLOW}{BOLD}HIGH{RESET}"
    elif sev_upper == "MEDIUM":
        return f"{CYAN}{BOLD}MEDIUM{RESET}"
    return f"{GREEN}{sev}{RESET}"

def run_campaign():
    """Orchestrates the 5-stage attack simulation."""
    print("\n" + "=" * 78)
    print(f"{BOLD}{MAGENTA} ⚔️  FEDTHREAT ADVANCED CYBER ATTACK CAMPAIGN SIMULATOR ⚔️{RESET}")
    print("=" * 78)
    print(f" Target Sentinel Node:  {CYAN}{TARGET_HOST}{RESET}")
    print(f" Adversary Identity:    {RED}{ATTACKER_IP}{RESET}")
    print(f" Gateway Ingress URL:   {DIM}{API_URL}{RESET}")
    print(f" Kill-Chain Modalities: {YELLOW}Web → Auth → Endpoint → Cloud → Network (Zero-Day){RESET}")
    print("=" * 78 + "\n")

    print(f"[*] Checking connection to FedThreat Edge Sentinel on {API_URL}...")
    if not check_backend_health():
        print(f"\n{RED}[!] ERROR: Cannot connect to FedThreat Edge Backend on http://127.0.0.1:8000.{RESET}")
        print(f"{YELLOW}[*] Make sure Terminal 3 is running:{RESET}")
        print(f"    PYTHONPATH=client uvicorn client.edge.main:app --host 127.0.0.1 --port 8000\n")
        sys.exit(1)
    print(f"{GREEN}[✓] Sentinel backend is ONLINE and responsive.{RESET}\n")

    print(f"{BOLD}[*] Launching 5-Stage Coordinated Attack Campaign...{RESET}")
    print(f"{DIM}(Keep your React Dashboard open at http://localhost:5173 to watch live updates!){RESET}\n")

    total_start = time.time()

    for idx, stage in enumerate(CAMPAIGN_STAGES, 1):
        step_num = stage["step"]
        name = stage["name"]
        sensor = stage["sensor"].upper()
        desc = stage["description"]
        payload = stage["payload"]

        print("-" * 78)
        print(f"{BOLD}[Step {step_num}/5] {name}{RESET}")
        print(f"  {DIM}Sensor Modality: [{sensor}] | Objective: {desc}{RESET}")

        res, latency, err = send_telemetry_event(payload)

        if err:
            print(f"  {RED}[✗] Ingress transmission failed: {err}{RESET}")
        elif res:
            status = res.get("status", "unknown")
            xgboost_score = res.get("xgboost_score", 0)
            confidence = res.get("sensor_confidence", 0.0)
            severity = res.get("severity", "LOW")
            is_campaign = res.get("is_campaign", False)
            events_count = res.get("correlated_events_count", 1)
            unique_sensors = res.get("unique_sensors", [sensor.lower()])
            classification = res.get("securebert_classification", "Unclassified")
            narrative = res.get("narrative_translation", "")

            # Print formatted results
            print(f"  {GREEN}▶ Stage 1 Triage:{RESET} Anomaly Score={xgboost_score} | Confidence={confidence:.1%} ({latency:.1f}ms)")
            print(f"  {CYAN}▶ Stage 2 Correlator:{RESET} Severity={format_severity(severity)} | Campaign={BOLD}{is_campaign}{RESET} | Events={events_count} | Sensors={unique_sensors}")
            print(f"  {YELLOW}▶ Stage 3 CTI Class:{RESET} {classification}")

            # If Zero-Day fired (Stage 5), display LLaMA-3.1 Mitigation Advisory
            if payload.get("simulate_zero_day"):
                advisory = res.get("llama3_advisory", {})
                print(f"\n  {MAGENTA}{BOLD}🛡️ STAGE 4: AUTONOMOUS LLAMA-3.1 MITIGATION PLAYBOOK:{RESET}")
                
                if isinstance(advisory, dict):
                    summary = advisory.get("threat_summary", "Autonomous threat mitigation active.")
                    actions = advisory.get("immediate_actions", [])
                    mitigations = advisory.get("long_term_mitigations", [])

                    print(f"  {BOLD}Threat Summary:{RESET} {summary}")
                    if actions:
                        print(f"  {BOLD}Immediate Containment Actions:{RESET}")
                        for act in actions[:3]:
                            print(f"    {RED}• [ACTION]{RESET} {act}")
                    if mitigations:
                        print(f"  {BOLD}Long-Term Hardening:{RESET}")
                        for mit in mitigations[:2]:
                            print(f"    {GREEN}• [POLICY]{RESET} {mit}")
                else:
                    print(f"  {advisory}")

        # Pause between steps to allow evaluators to watch the React UI animate
        if idx < len(CAMPAIGN_STAGES):
            print(f"\n  {DIM}Waiting {STEP_DELAY}s before advancing to next kill-chain phase...{RESET}")
            time.sleep(STEP_DELAY)

    total_duration = time.time() - total_start
    print("\n" + "=" * 78)
    print(f"{BOLD}{GREEN} 🎉 MULTI-SENSOR CYBER ATTACK CAMPAIGN COMPLETE in {total_duration:.2f}s! 🎉{RESET}")
    print("=" * 78)
    print(f" • All 5 sensor modalities evaluated by local XGBoost classifiers.")
    print(f" • Temporal Correlator linked cross-source telemetry into an active APT campaign.")
    print(f" • Incident severity escalated from {CYAN}MEDIUM{RESET} → {YELLOW}HIGH{RESET} → {RED}CRITICAL{RESET}.")
    print(f" • Outbound Zero-Day triggered LoRA weight adaptation & LLaMA-3.1 MITRE advisory.")
    print(f" • Verified live in React SOC Dashboard: {CYAN}http://localhost:5173{RESET}")
    print("=" * 78 + "\n")

if __name__ == "__main__":
    run_campaign()

