import os
import time
import json
import logging
from datetime import datetime
from collections import defaultdict
from typing import Dict, Any, List, Optional, Tuple

try:
    from edge.client import trigger_federated_round
except ImportError:
    from client import trigger_federated_round

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


class TemporalCorrelator:
    """
    Stage 2: Cross-Source Temporal Correlation Engine.
    
    Acts as the multi-modal cognitive bridge between Stage 1 (5 XGBoost Sensor Models)
    and Stage 3 (FLoRA SecureBERT NLP Classifier).
    
    Key Capabilities:
      1. Entity-Indexed Sliding Window: Groups events by Source IP, Hostname, and Username.
      2. 5-Minute Time Horizon: Auto-prunes expired events to maintain low edge-memory footprint.
      3. Cyber Kill-Chain State Machine: Tracks attack stage progression (Web -> Auth -> Endpoint -> Cloud -> Network).
      4. Chronological Attack Narrative Synthesis: Generates rich natural language descriptions for SecureBERT.
      5. Threat Severity & Novelty Scoring: Escalates single-sensor anomalies into high-severity multi-sensor campaigns.
    """
    def __init__(self, window_seconds: int = 300, server_address: str = "127.0.0.1:8080"):
        self.window_seconds = window_seconds  # Default 5-minute sliding window
        self.server_address = server_address
        
        # Entity-based event buffers: entity_key -> list of event dicts
        self.entity_buffers: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        
        # Chronological incident history for telemetry feed and frontend visualization
        self.correlated_incidents: List[Dict[str, Any]] = []

    # -------------------------------------------------------------------------
    # 1. ENTITY KEY EXTRACTION & BUFFER PRUNING
    # -------------------------------------------------------------------------
    def _extract_entity_keys(self, sensor: str, payload: Dict[str, Any], details: Dict[str, Any]) -> List[str]:
        """
        Extracts primary entity keys (IP, Host, User) to bind cross-sensor events together.
        """
        keys = []
        
        # Extract IP address
        ip = (
            payload.get("source_ip") or payload.get("sourceIPAddress") or 
            payload.get("src_ip") or details.get("source_ip") or details.get("src_ip")
        )
        if ip and ip != "0.0.0.0" and ip != "127.0.0.1":
            keys.append(f"ip:{ip}")
            
        # Extract Hostname
        host = payload.get("host_name") or payload.get("hostname") or details.get("host_name")
        if host:
            keys.append(f"host:{host}")
            
        # Extract User / IAM Identity
        user = payload.get("user_id") or payload.get("username") or details.get("user_id")
        if user and user != "unknown":
            keys.append(f"user:{user}")

        # If no specific entity identifier found, group under default edge cluster
        if not keys:
            keys.append("cluster:default_edge")

        return keys

    def _prune_expired_events(self, current_time: float):
        """
        Evicts events older than window_seconds from all entity buffers.
        """
        cutoff = current_time - self.window_seconds
        expired_entities = []

        for entity, events in self.entity_buffers.items():
            valid_events = [ev for ev in events if ev["timestamp"] >= cutoff]
            if valid_events:
                self.entity_buffers[entity] = valid_events
            else:
                expired_entities.append(entity)

        for entity in expired_entities:
            del self.entity_buffers[entity]

    # -------------------------------------------------------------------------
    # 2. SENSOR-SPECIFIC NARRATIVE PHRASING
    # -------------------------------------------------------------------------
    def _phrase_event(self, sensor: str, payload: Dict[str, Any], details: Dict[str, Any]) -> str:
        """
        Translates raw sensor telemetry into a domain-specific cybersecurity narrative clause.
        """
        sensor = sensor.lower()

        if sensor == "network":
            proto = payload.get("Protocol", details.get("protocol", "TCP"))
            port = payload.get("Dst_Port", payload.get("Dst Port", details.get("dst_port", 443)))
            duration = payload.get("Flow_Duration", payload.get("Flow Duration", 0))
            fwd = payload.get("Tot_Fwd_Pkts", payload.get("Tot Fwd Pkts", 0))
            bwd = payload.get("Tot_Bwd_Pkts", payload.get("Tot Bwd Pkts", 0))
            return (
                f"Anomalous {proto} network flow targeting destination port {port} "
                f"(duration: {duration}µs, fwd_pkts: {fwd}, bwd_pkts: {bwd}) "
                f"exhibiting volumetric spike signatures indicative of denial-of-service or exfiltration"
            )

        elif sensor == "auth":
            user = details.get("user_id", payload.get("user_id", "admin_root"))
            service = details.get("service", payload.get("auth_service", "SSH"))
            fails = details.get("failed_attempts", payload.get("failed_attempts_5m", 0))
            velocity = payload.get("login_velocity_per_min", 0.0)
            mfa_failed = payload.get("mfa_failed", 0)
            return (
                f"Authentication anomaly on {service} for account '{user}': "
                f"{fails} failed attempts at velocity {velocity:.1f}/min with "
                f"{'MFA challenge rejection' if mfa_failed else 'rapid credential brute-forcing'}"
            )

        elif sensor == "endpoint":
            proc = details.get("process_name", payload.get("process_name", "unknown.exe"))
            parent = details.get("parent_process", payload.get("parent_process", "explorer.exe"))
            host = details.get("host_name", payload.get("host_name", "HOST-01"))
            cmd = details.get("command_line", payload.get("command_line", proc))
            if len(cmd) > 60:
                cmd = cmd[:57] + "..."
            return (
                f"Suspicious host execution on {host}: process '{proc}' spawned by '{parent}' "
                f"executing anomalous commandline [{cmd}]"
            )

        elif sensor == "web":
            method = details.get("method", payload.get("http_method", "GET"))
            uri = details.get("uri", payload.get("uri_endpoint", "/"))
            status = details.get("status_code", payload.get("status_code", 200))
            sqli = details.get("sql_injection_detected", False)
            xss = details.get("xss_detected", False)
            pattern = "SQL injection probe" if sqli else ("Cross-Site Scripting (XSS)" if xss else "irregular payload pattern")
            return (
                f"Web application exploit attempt via HTTP {method} {uri} (status: {status}) "
                f"exhibiting {pattern}"
            )

        elif sensor == "cloud":
            event = details.get("event_name", payload.get("event_name", "UnknownEvent"))
            source = details.get("event_source", payload.get("event_source", "iam.amazonaws.com"))
            is_priv = details.get("privilege_escalation", False)
            is_recon = details.get("reconnaissance", False)
            tag = "Privilege Escalation" if is_priv else ("Cloud Reconnaissance" if is_recon else "Unauthorized API call")
            return (
                f"Cloud control-plane anomaly: {tag} invocation '{event}' against {source} "
                f"from external client IP"
            )

        return f"Telemetry event observed on sensor '{sensor}' with anomaly score 1"

    # -------------------------------------------------------------------------
    # 3. CHRONOLOGICAL ATTACK CHAIN SYNTHESIS
    # -------------------------------------------------------------------------
    def synthesize_narrative(self, events: List[Dict[str, Any]], primary_entity: str) -> str:
        """
        Synthesizes a list of chronologically ordered events into a rich incident narrative
        tailored for SecureBERT's 512-token context window.
        """
        if not events:
            return "No correlated security events observed."

        # Sort strictly by timestamp
        sorted_events = sorted(events, key=lambda ev: ev["timestamp"])
        unique_sensors = set(ev["sensor"] for ev in sorted_events)
        duration_sec = int(sorted_events[-1]["timestamp"] - sorted_events[0]["timestamp"])

        if len(sorted_events) == 1:
            ev = sorted_events[0]
            ts_str = datetime.fromtimestamp(ev["timestamp"]).strftime("%H:%M:%S")
            return (
                f"Security Incident Alert on [{primary_entity}] at {ts_str}: "
                f"Stage 1 {ev['sensor'].upper()} sensor detected: {ev['phrase']}. "
                f"Observed confidence {ev['confidence']:.1%}."
            )

        # Multi-event correlated campaign narrative
        lines = [
            f"Multi-Sensor Attack Campaign detected targeting [{primary_entity}] "
            f"across {len(unique_sensors)} modalities within {duration_sec}s window:"
        ]

        for step, ev in enumerate(sorted_events, start=1):
            ts_str = datetime.fromtimestamp(ev["timestamp"]).strftime("%H:%M:%S")
            modality = ev["sensor"].upper()
            conf_str = f"{ev['confidence']:.1%}"
            lines.append(f"  ({step}) [{ts_str} | {modality} Sensor | Conf: {conf_str}]: {ev['phrase']}.")

        # Kill-chain progression assessment
        sensor_order = [ev["sensor"] for ev in sorted_events]
        summary_tags = []
        if "web" in sensor_order:
            summary_tags.append("Initial Web Exploit")
        if "auth" in sensor_order:
            summary_tags.append("IAM Credential Stuffing")
        if "endpoint" in sensor_order:
            summary_tags.append("Host Payload Execution")
        if "cloud" in sensor_order:
            summary_tags.append("Cloud Privilege Escalation")
        if "network" in sensor_order:
            summary_tags.append("Volumetric C2 / Exfiltration")

        progression_str = " -> ".join(summary_tags) if summary_tags else "Coordinated Threat Sequence"
        lines.append(f"Correlation Assessment: Coordinated multi-stage attack path observed [{progression_str}].")

        return "\n".join(lines)

    # -------------------------------------------------------------------------
    # 4. EVENT INGESTION & CORRELATION EVALUATION
    # -------------------------------------------------------------------------
    def ingest_sensor_event(
        self, 
        sensor: str, 
        anomaly_flag: int, 
        confidence: float, 
        sensor_details: Dict[str, Any], 
        raw_payload: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Master ingestion method. Ingests evaluated output from SensorManager,
        manages sliding windows, detects attack chains, and produces the narrative.
        
        Returns:
          {
            "is_campaign": bool (True if multi-sensor chain or multi-event burst),
            "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
            "narrative_text": str,
            "unique_sensors": list of sensors,
            "event_count": int,
            "primary_entity": str,
            "events": list of event summaries
          }
        """
        current_time = time.time()
        self._prune_expired_events(current_time)

        raw_payload = raw_payload or {}
        phrase = self._phrase_event(sensor, raw_payload, sensor_details)
        entity_keys = self._extract_entity_keys(sensor, raw_payload, sensor_details)
        primary_entity = entity_keys[0]

        event_entry = {
            "timestamp": current_time,
            "sensor": sensor,
            "anomaly_flag": anomaly_flag,
            "confidence": float(confidence),
            "phrase": phrase,
            "details": sensor_details,
            "raw_payload": raw_payload,
            "entity_keys": entity_keys
        }

        # If benign, record to buffer if needed, but do not escalate
        if anomaly_flag == 0:
            return {
                "is_campaign": False,
                "severity": "INFO",
                "narrative_text": f"Benign {sensor} activity observed on {primary_entity}.",
                "unique_sensors": [sensor],
                "event_count": 1,
                "primary_entity": primary_entity,
                "events": [event_entry]
            }

        # Append anomaly to all matching entity buffers
        for ek in entity_keys:
            self.entity_buffers[ek].append(event_entry)

        # Retrieve all correlated events for the primary entity
        correlated_events = self.entity_buffers[primary_entity]
        unique_sensors = list(set(ev["sensor"] for ev in correlated_events))
        event_count = len(correlated_events)

        # Determine Severity & Campaign Status
        if len(unique_sensors) >= 3 or event_count >= 4:
            severity = "CRITICAL"
            is_campaign = True
        elif len(unique_sensors) >= 2 or event_count >= 2:
            severity = "HIGH"
            is_campaign = True
        else:
            severity = "MEDIUM"
            is_campaign = False

        narrative_text = self.synthesize_narrative(correlated_events, primary_entity)

        incident_result = {
            "is_campaign": is_campaign,
            "severity": severity,
            "narrative_text": narrative_text,
            "unique_sensors": unique_sensors,
            "event_count": event_count,
            "primary_entity": primary_entity,
            "events": correlated_events
        }

        # Record into recent incident history
        self.correlated_incidents.append({
            "timestamp": current_time,
            "primary_entity": primary_entity,
            "severity": severity,
            "unique_sensors": unique_sensors,
            "event_count": event_count,
            "narrative": narrative_text
        })
        if len(self.correlated_incidents) > 100:
            self.correlated_incidents.pop(0)

        return incident_result

    # -------------------------------------------------------------------------
    # 5. BACKWARD-COMPATIBILITY ADAPTERS (For existing edge/main.py & tests)
    # -------------------------------------------------------------------------
    def translate_to_text(self, raw_features: dict) -> str:
        """
        Backward-compatible method for single network packets.
        Also handles multi-modal payloads gracefully.
        """
        sensor = raw_features.get("modality", "network")
        return self._phrase_event(sensor, raw_features, raw_features)

    def process_xgboost_output(self, xgboost_label: int, raw_features: dict):
        """
        Backward-compatible trigger method. Translates data and kicks off FLoRA round.
        """
        if xgboost_label == 0:
            logging.info("[CORRELATOR] Traffic is benign. No action required.")
            return None, None

        logging.warning("[CORRELATOR] Anomaly detected! Correlating across time window...")
        sensor = raw_features.get("modality", "network")
        incident = self.ingest_sensor_event(
            sensor=sensor,
            anomaly_flag=xgboost_label,
            confidence=0.98,
            sensor_details=raw_features,
            raw_payload=raw_features
        )

        narrative_text = incident["narrative_text"]
        logging.info(f"[CORRELATOR] Narrative generated:\n{narrative_text}")

        # Package into JSON expected by FedThreatClient
        anomaly_data = [{"text": narrative_text, "label": 1}]

        logging.warning("[CORRELATOR] Triggering Stage 3: Event-Driven Federation...")
        fl_client = trigger_federated_round(anomaly_data, server_address=self.server_address)

        return fl_client, narrative_text


# Backward-compatible alias
EventCorrelator = TemporalCorrelator
