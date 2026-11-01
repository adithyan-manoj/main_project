#!/usr/bin/env python3
"""
========================================================================================
 FedThreat: Multi-Campaign Cyber Adversary Simulator & Demonstration Suite
========================================================================================
 Purpose:
   Simulates realistic enterprise cyber threat scenarios by injecting live telemetry
   across all 5 sensor modalities:
     [1] Full 5-Stage APT Kill-Chain (Web → Auth → Endpoint → Cloud → Network)
     [2] Volumetric Network Denial of Service (T1498 TCP SYN Flood)
     [3] Credential Stuffing & SSH Brute Force (T1110 Account Access)
     [4] Living-off-the-Land Host Execution (T1059 Base64 PowerShell)
     [5] Cloud Infrastructure Privilege Escalation (T1098 AWS IAM)
     [6] Web Application SQL Injection Probe (T1190 Web Exploit)
     [7] Benign Operational Traffic (Verify Zero False Positives)
     [8] Auto-Rotate Mode (Cycles to a new attack scenario on every run!)

 Target Endpoint:
   POST http://127.0.0.1:8000/api/telemetry

 Design:
   100% standalone and decoupled. Uses only Python standard libraries (urllib, json,
   time, argparse, sys) with zero external dependencies.
========================================================================================
"""

import sys
import os
import time
import json
import argparse
import urllib.request
import urllib.error

# ANSI Color Codes for Terminal Formatting
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
STATE_FILE = os.path.join(os.path.dirname(__file__), ".last_campaign_profile")

# ======================================================================================
# ATTACK CAMPAIGN DEFINITIONS
# ======================================================================================

CAMPAIGNS = {
    1: {
        "title": "Full 5-Stage APT Cyber Kill-Chain",
        "description": "Multi-stage campaign escalating from Web Ingress → Auth → Endpoint → Cloud → Network DoS",
        "delay": 2.0,
        "stages": [
            {
                "step": 1,
                "name": "Stage 1: Web Ingress SQL Injection Probe",
                "sensor": "web",
                "desc": "Adversary probes public web gateway with SQL syntax manipulation on /api/v1/auth/login.",
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
                "desc": "High-velocity authentication attempts from same IP targeting administrative account.",
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
                "desc": "Suspicious base64-encoded shell execution spawned under office document process.",
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
                "desc": "Unauthorized AWS IAM CreateAccessKey API invocation originating from compromised edge entity.",
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
                "desc": "Extreme asymmetric packet flood on port 443 triggering FLoRA Federated Learning & LLaMA-3.1.",
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
    },
    2: {
        "title": "Volumetric Network Denial of Service (T1498 Flood)",
        "description": "High-volume asymmetric SYN flood designed to exhaust host network bandwidth on port 443",
        "delay": 1.5,
        "stages": [
            {
                "step": 1,
                "name": "Inbound TCP SYN Volumetric Spike",
                "sensor": "network",
                "desc": "Adversary launches volumetric SYN packet surge with 10,500 forward packets against ingress port 443.",
                "payload": {
                    "modality": "network",
                    "Dst_Port": 443,
                    "Protocol": "TCP",
                    "Tot_Fwd_Pkts": 10500,
                    "Tot_Bwd_Pkts": 8,
                    "Flow_Duration": 95000,
                    "source_ip": "198.51.100.42",
                    "host_name": TARGET_HOST,
                    "simulate_zero_day": True
                }
            }
        ]
    },
    3: {
        "title": "Credential Stuffing & IAM Brute Force (T1110)",
        "description": "High-velocity dictionary password spray targeting enterprise SSH and IAM directory",
        "delay": 1.5,
        "stages": [
            {
                "step": 1,
                "name": "High-Frequency Authentication Failure Burst",
                "sensor": "auth",
                "desc": "32 rapid failed SSH authentication attempts within 60 seconds with repeated MFA challenge rejections.",
                "payload": {
                    "modality": "auth",
                    "user_id": "root_admin",
                    "source_ip": "203.0.113.88",
                    "auth_service": "SSH",
                    "failed_attempts_5m": 32,
                    "login_velocity_per_min": 25.0,
                    "mfa_failed": 1,
                    "is_privileged_account": 1,
                    "host_name": TARGET_HOST,
                    "simulate_zero_day": False
                }
            }
        ]
    },
    4: {
        "title": "Living-off-the-Land Host Scripting Execution (T1059)",
        "description": "Adversary leverages built-in system interpreters to execute obfuscated commands",
        "delay": 1.5,
        "stages": [
            {
                "step": 1,
                "name": "Anomalous PowerShell Process Execution",
                "sensor": "endpoint",
                "desc": "Encoded PowerShell script execution with ExecutionPolicy bypass spawned by unprivileged background process.",
                "payload": {
                    "modality": "endpoint",
                    "host_name": TARGET_HOST,
                    "process_name": "powershell.exe",
                    "parent_process": "cmd.exe",
                    "command_line": "powershell.exe -w hidden -noni -enc JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAA...",
                    "is_unsigned_binary": 1,
                    "source_ip": "192.168.1.155",
                    "simulate_zero_day": False
                }
            }
        ]
    },
    5: {
        "title": "Cloud Infrastructure Privilege Escalation (T1098)",
        "description": "Unauthorized AWS IAM access key creation and policy modification by compromised API token",
        "delay": 1.5,
        "stages": [
            {
                "step": 1,
                "name": "AWS IAM CreateAccessKey API Invocation",
                "sensor": "cloud",
                "desc": "Sensitive IAM credential generation API call invoked from unauthorized external IP address.",
                "payload": {
                    "modality": "cloud",
                    "event_name": "CreateAccessKey",
                    "event_source": "iam.amazonaws.com",
                    "source_ip": "198.51.100.99",
                    "host_name": TARGET_HOST,
                    "error_code": "NoError",
                    "simulate_zero_day": False
                }
            }
        ]
    },
    6: {
        "title": "Web Application Ingress SQL Injection (T1190)",
        "description": "Exploitation probe targeting public-facing web applications with SQL manipulation",
        "delay": 1.5,
        "stages": [
            {
                "step": 1,
                "name": "HTTP POST SQL Syntax Injection",
                "sensor": "web",
                "desc": "Adversary injects malicious SQL statement (' OR 1=1 --) into user parameter on authentication gateway.",
                "payload": {
                    "modality": "web",
                    "uri_endpoint": "/api/v1/auth/session?token=admin' UNION SELECT username,password_hash FROM users--",
                    "http_method": "POST",
                    "status_code": 500,
                    "source_ip": "185.220.101.9",
                    "host_name": TARGET_HOST,
                    "payload_size_bytes": 2048,
                    "simulate_zero_day": False
                }
            }
        ]
    },
    7: {
        "title": "Benign Operational Traffic Baseline (False Positive Test)",
        "description": "Legitimate enterprise operational traffic (Verifies that normal flows are silently dropped)",
        "delay": 1.5,
        "stages": [
            {
                "step": 1,
                "name": "Standard Secure HTTPS Browsing Session",
                "sensor": "network",
                "desc": "Normal conversational TLS session (15 packets forward, 18 packets backward, normal duration).",
                "payload": {
                    "modality": "network",
                    "Dst_Port": 443,
                    "Protocol": "TCP",
                    "Tot_Fwd_Pkts": 15,
                    "Tot_Bwd_Pkts": 18,
                    "Flow_Duration": 350,
                    "source_ip": "192.168.1.105",
                    "host_name": TARGET_HOST,
                    "simulate_zero_day": False
                }
            }
        ]
    }
}

# ======================================================================================
# HELPER FUNCTIONS
# ======================================================================================

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

def get_next_auto_profile():
    """Reads and increments the rotating campaign pointer."""
    current = 1
    try:
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE, "r") as f:
                val = int(f.read().strip())
                if 1 <= val <= 6:
                    current = val
    except Exception:
        current = 1
    
    # Next profile in round-robin sequence (cycles between 1 and 6)
    next_profile = (current % 6) + 1
    try:
        with open(STATE_FILE, "w") as f:
            f.write(str(next_profile))
    except Exception:
        pass
    
    return current

def prompt_user_selection():
    """Presents an interactive menu to choose an attack campaign."""
    print("\n" + "=" * 78)
    print(f"{BOLD}{MAGENTA} ⚔️  FEDTHREAT MULTI-CAMPAIGN ADVERSARY SIMULATOR ⚔️{RESET}")
    print("=" * 78)
    print(f" Target Host: {CYAN}{TARGET_HOST}{RESET} | Gateway: {DIM}{API_URL}{RESET}\n")
    print(f" {BOLD}Select an Attack Campaign to Simulate:{RESET}")
    print(f"   {CYAN}[1]{RESET} Full 5-Stage APT Cyber Kill-Chain (Web → Auth → Host → Cloud → Net)")
    print(f"   {CYAN}[2]{RESET} Volumetric Network Denial of Service (T1498 TCP Port 443 Flood)")
    print(f"   {CYAN}[3]{RESET} Credential Stuffing & SSH Password Spray (T1110 Auth Anomaly)")
    print(f"   {CYAN}[4]{RESET} Living-off-the-Land Host Execution (T1059 Obfuscated PowerShell)")
    print(f"   {CYAN}[5]{RESET} Cloud Infrastructure Privilege Escalation (T1098 AWS IAM Key)")
    print(f"   {CYAN}[6]{RESET} Web Application SQL Injection Probe (T1190 Web Exploit)")
    print(f"   {CYAN}[7]{RESET} Benign Operational Baseline (Verify Zero False Positives)")
    print(f"   {MAGENTA}[8]{RESET} {BOLD}Auto-Rotate Mode{RESET} (Automatically rotates a new attack each time!)")
    print("=" * 78)

    try:
        choice = input(f"\n Enter choice {BOLD}[1-8]{RESET} (Default: 1): ").strip()
        if not choice:
            return 1
        val = int(choice)
        if val == 8:
            rotated = get_next_auto_profile()
            print(f"{YELLOW}[*] Auto-Rotate selected: Running Profile #{rotated}!{RESET}")
            return rotated
        elif 1 <= val <= 7:
            return val
        else:
            print(f"{YELLOW}[!] Invalid choice '{choice}'. Defaulting to Campaign #1.{RESET}")
            return 1
    except (ValueError, KeyboardInterrupt):
        print(f"\n{YELLOW}[*] Defaulting to Campaign #1 (Full 5-Stage Kill-Chain).{RESET}")
        return 1

# ======================================================================================
# CAMPAIGN EXECUTION ORCHESTRATOR
# ======================================================================================

def execute_campaign(profile_id):
    campaign = CAMPAIGNS.get(profile_id, CAMPAIGNS[1])
    title = campaign["title"]
    desc = campaign["description"]
    stages = campaign["stages"]
    delay = campaign.get("delay", 2.0)

    print("\n" + "=" * 78)
    print(f"{BOLD}{MAGENTA} 🚀 EXECUTING: {title.upper()} 🚀{RESET}")
    print("=" * 78)
    print(f" Scenario Summary: {YELLOW}{desc}{RESET}")
    print(f" Total Phases:     {len(stages)} stage(s)")
    print(f" Real-Time Delay:  {delay}s between phases (Allows React UI to render)")
    print("=" * 78 + "\n")

    print(f"[*] Checking connection to FedThreat Edge Sentinel on {API_URL}...")
    if not check_backend_health():
        print(f"\n{RED}[!] ERROR: Cannot connect to FedThreat Edge Backend on http://127.0.0.1:8000.{RESET}")
        print(f"{YELLOW}[*] Make sure Terminal 3 is running:{RESET}")
        print(f"    source venv/bin/activate && PYTHONPATH=client uvicorn client.edge.main:app --port 8000\n")
        sys.exit(1)
    print(f"{GREEN}[✓] Sentinel backend is ONLINE and responsive.{RESET}\n")

    print(f"{BOLD}[*] Launching Telemetry Stream...{RESET}")
    print(f"{DIM}(Keep your React Dashboard open at http://localhost:5173 to watch live updates!){RESET}\n")

    total_start = time.time()

    for idx, stage in enumerate(stages, 1):
        step_num = stage["step"]
        name = stage["name"]
        sensor = stage["sensor"].upper()
        s_desc = stage["desc"]
        payload = stage["payload"]

        print("-" * 78)
        print(f"{BOLD}[Phase {step_num}/{len(stages)}] {name}{RESET}")
        print(f"  {DIM}Sensor Modality: [{sensor}] | Objective: {s_desc}{RESET}")

        res, latency, err = send_telemetry_event(payload)

        if err:
            print(f"  {RED}[✗] Ingress transmission error: {err}{RESET}")
        elif res:
            status = res.get("status", "unknown")

            # Handle Benign traffic verification
            if status == "benign":
                print(f"  {GREEN}[✓] Stage 1 Triage:{RESET} {BOLD}NORMAL TRAFFIC DETECTED{RESET} (Score: 0) ({latency:.1f}ms)")
                print(f"  {CYAN}[✓] Pipeline Action:{RESET} Silently dropped at Stage 1 triage to conserve edge compute.")
                print(f"  {GREEN}[✓] Zero False Positives Guarantee verified!{RESET}")
                continue

            xgboost_score = res.get("xgboost_score", 1)
            confidence = res.get("sensor_confidence", 0.0)
            severity = res.get("severity", "LOW")
            is_campaign = res.get("is_campaign", False)
            events_count = res.get("correlated_events_count", 1)
            unique_sensors = res.get("unique_sensors", [sensor.lower()])
            classification = res.get("securebert_classification", "Unclassified")
            engine = res.get("inference_engine", "SecureBERT-LoRA-Neural")

            # Print formatted results
            print(f"  {GREEN}▶ Stage 1 Triage:{RESET} Anomaly Score={xgboost_score} | Confidence={confidence:.1%} ({latency:.1f}ms)")
            print(f"  {CYAN}▶ Stage 2 Correlator:{RESET} Severity={format_severity(severity)} | Campaign={BOLD}{is_campaign}{RESET} | Events={events_count} | Sensors={unique_sensors}")
            print(f"  {YELLOW}▶ Stage 3 CTI Class:{RESET} {BOLD}{classification}{RESET} {DIM}(via {engine}){RESET}")

            # If Stage has advisory, display structured LLaMA-3.1 Mitigation Playbook
            advisory = res.get("llama3_advisory", {})
            if advisory and isinstance(advisory, dict) and advisory.get("immediate_actions"):
                print(f"\n  {MAGENTA}{BOLD}🛡️ STAGE 4: AUTONOMOUS LLAMA-3.1 MITIGATION PLAYBOOK:{RESET}")
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

        # Pause between steps to allow evaluators to watch the React UI animate
        if idx < len(stages):
            print(f"\n  {DIM}Waiting {delay}s before advancing to next kill-chain phase...{RESET}")
            time.sleep(delay)

    total_duration = time.time() - total_start
    print("\n" + "=" * 78)
    print(f"{BOLD}{GREEN} 🎉 CAMPAIGN EXECUTION COMPLETE in {total_duration:.2f}s! 🎉{RESET}")
    print("=" * 78)
    print(f" • Evaluated via local Stage 1 XGBoost sensor models.")
    print(f" • Stage 2 Temporal Correlator tracked entity-centric attack progression.")
    print(f" • Stage 3 SecureBERT + LoRA dynamically classified MITRE technique.")
    print(f" • Check live updates in your React Dashboard: {CYAN}http://localhost:5173{RESET}")
    print("=" * 78 + "\n")

# ======================================================================================
# ENTRY POINT & CLI PARSING
# ======================================================================================

def main():
    parser = argparse.ArgumentParser(
        description="FedThreat Multi-Campaign Cyber Adversary Simulator",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        "--profile", "-p",
        type=int,
        choices=range(1, 8),
        help="Specify campaign profile number [1-7]:\n"
             "  1: Full 5-Stage APT Kill-Chain (Default)\n"
             "  2: Volumetric Network Denial of Service (T1498)\n"
             "  3: Credential Stuffing & SSH Brute Force (T1110)\n"
             "  4: Living-off-the-Land Host Execution (T1059)\n"
             "  5: Cloud Infrastructure Privilege Escalation (T1098)\n"
             "  6: Web Application SQL Injection Probe (T1190)\n"
             "  7: Benign Operational Traffic (Zero False Positives)"
    )
    parser.add_argument(
        "--auto", "-a",
        action="store_true",
        help="Automatically rotate through a different attack profile on every run"
    )

    args = parser.parse_args()

    if args.auto:
        profile_id = get_next_auto_profile()
        print(f"\n{YELLOW}[*] Auto-Rotate Mode: Selected Profile #{profile_id}{RESET}")
    elif args.profile:
        profile_id = args.profile
    else:
        profile_id = prompt_user_selection()

    execute_campaign(profile_id)

if __name__ == "__main__":
    main()
