import time
import logging
from edge.sensor_manager import SensorManager
from edge.correlator import TemporalCorrelator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def test_temporal_correlator():
    print("=" * 70)
    print("🧪 FEDTHREAT STAGE 2: TESTING TEMPORAL EVENT CORRELATION ENGINE 🧪")
    print("=" * 70)

    # 1. Initialize SensorManager & TemporalCorrelator
    sm = SensorManager()
    correlator = TemporalCorrelator(window_seconds=300)

    # Simulated Attacker IP and Target Host
    attacker_ip = "185.220.101.5"
    target_host = "MAC-EDGE-01"
    target_user = "admin_jdoe"

    print("\n--- SIMULATING 5-STAGE ADVANCED CYBER ATTACK CAMPAIGN ---")

    # Step 1: Web Application Probe (SQL Injection)
    print("\n[Step 1] Ingress Web Exploit Attempt...")
    web_payload = {
        "modality": "web",
        "uri_endpoint": "/api/v1/auth/login?user=admin' OR '1'='1'--",
        "http_method": "POST",
        "status_code": 500,
        "source_ip": attacker_ip,
        "host_name": target_host
    }
    flag1, conf1, d1 = sm.evaluate_web(web_payload)
    inc1 = correlator.ingest_sensor_event("web", flag1, conf1, d1, web_payload)
    print(f"  -> Flag: {flag1} | Conf: {conf1:.1%} | Severity: {inc1['severity']} | Is Campaign: {inc1['is_campaign']}")

    time.sleep(0.5)

    # Step 2: IAM Credential Stuffing / Brute Force
    print("\n[Step 2] IAM Credential Brute-Force...")
    auth_payload = {
        "modality": "auth",
        "user_id": target_user,
        "source_ip": attacker_ip,
        "auth_service": "SSH",
        "failed_attempts_5m": 15,
        "login_velocity_per_min": 18.0,
        "mfa_failed": 1,
        "host_name": target_host
    }
    flag2, conf2, d2 = sm.evaluate_auth(auth_payload)
    inc2 = correlator.ingest_sensor_event("auth", flag2, conf2, d2, auth_payload)
    print(f"  -> Flag: {flag2} | Conf: {conf2:.1%} | Severity: {inc2['severity']} | Is Campaign: {inc2['is_campaign']}")

    time.sleep(0.5)

    # Step 3: Host Payload Execution
    print("\n[Step 3] Endpoint Shell Execution...")
    endpoint_payload = {
        "modality": "endpoint",
        "host_name": target_host,
        "process_name": "powershell.exe",
        "parent_process": "word.exe",
        "command_line": "powershell.exe -ExecutionPolicy Bypass -NoProfile -enc SQBFAFgA...",
        "is_unsigned_binary": 1,
        "source_ip": attacker_ip
    }
    flag3, conf3, d3 = sm.evaluate_endpoint(endpoint_payload)
    inc3 = correlator.ingest_sensor_event("endpoint", flag3, conf3, d3, endpoint_payload)
    print(f"  -> Flag: {flag3} | Conf: {conf3:.1%} | Severity: {inc3['severity']} | Is Campaign: {inc3['is_campaign']}")

    time.sleep(0.5)

    # Step 4: Cloud Privilege Escalation
    print("\n[Step 4] Cloud API Privilege Escalation...")
    cloud_payload = {
        "modality": "cloud",
        "event_name": "CreateAccessKey",
        "event_source": "iam.amazonaws.com",
        "source_ip": attacker_ip,
        "host_name": target_host,
        "error_code": "NoError"
    }
    flag4, conf4, d4 = sm.evaluate_cloud(cloud_payload)
    inc4 = correlator.ingest_sensor_event("cloud", flag4, conf4, d4, cloud_payload)
    print(f"  -> Flag: {flag4} | Conf: {conf4:.1%} | Severity: {inc4['severity']} | Is Campaign: {inc4['is_campaign']}")

    time.sleep(0.5)

    # Step 5: Volumetric Network Flow (Exfiltration / DoS)
    print("\n[Step 5] Outbound Network Volumetric Flow...")
    network_payload = {
        "modality": "network",
        "Dst_Port": 443,
        "Protocol": "TCP",
        "Flow_Duration": 85000,
        "Tot_Fwd_Pkts": 9500,
        "Tot_Bwd_Pkts": 4,
        "source_ip": attacker_ip,
        "host_name": target_host
    }
    flag5, conf5, d5 = sm.evaluate_network(network_payload)
    final_incident = correlator.ingest_sensor_event("network", flag5, conf5, d5, network_payload)
    print(f"  -> Flag: {flag5} | Conf: {conf5:.1%} | Severity: {final_incident['severity']} | Is Campaign: {final_incident['is_campaign']}")

    print("\n" + "=" * 70)
    print("📝 FINAL SYNTHESIZED INCIDENT ATTACK NARRATIVE (FOR STAGE 3 SECUREBERT):")
    print("=" * 70)
    print(final_incident["narrative_text"])
    print("=" * 70)

    # Assertions
    assert final_incident["is_campaign"] is True, "Expected multi-sensor campaign"
    assert final_incident["severity"] == "CRITICAL", f"Expected CRITICAL severity, got {final_incident['severity']}"
    assert len(final_incident["unique_sensors"]) == 5, f"Expected 5 sensors, got {len(final_incident['unique_sensors'])}"
    assert final_incident["event_count"] == 5, f"Expected 5 events, got {final_incident['event_count']}"

    # Verify Backward Compatibility
    print("\nTesting Backward Compatibility:")
    legacy_packet = {"Dst Port": 443, "Protocol": "TCP", "Tot Fwd Pkts": 5000, "Tot Bwd Pkts": 2, "Flow Duration": 15000}
    legacy_text = correlator.translate_to_text(legacy_packet)
    print(f"Legacy translate_to_text output:\n'{legacy_text}'\n")

    print("🎉 ALL STAGE 2 CORRELATION ENGINE TESTS PASSED!")

if __name__ == "__main__":
    test_temporal_correlator()

