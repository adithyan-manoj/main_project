/**
 * FedThreat Central API Client
 * Provides type-safe, asynchronous communication with the local edge orchestrator (FastAPI :8000).
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    // Fallback direct check against 127.0.0.1:8000 if running on vite without proxy
    if (!API_BASE && !url.startsWith('http')) {
      try {
        const directRes = await fetch(`http://127.0.0.1:8000${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
          },
          ...options
        });
        if (directRes.ok) {
          return await directRes.json();
        }
      } catch {
        // ignore fallback error
      }
    }
    console.warn(`[API Client] Request failed for ${endpoint}:`, err.message);
    throw err;
  }
}

// 1. Dynamic Host Identity
export async function fetchNodeInfo() {
  return await request('/api/client_node_info');
}

// 2. Real System Telemetry & Hardware Utilization
export async function fetchSystemStatus() {
  return await request('/api/system_status');
}

// 3. Real Threat Distribution (ChromaDB)
export async function fetchThreatDistribution() {
  return await request('/api/threat_distribution');
}

// 4. Real Hourly Ingress Attack Velocity (ThreatStore)
export async function fetchTemporalVolume(timeRange = '24H') {
  return await request(`/api/temporal_volume?time_range=${encodeURIComponent(timeRange)}`);
}

// 5. Real Live Telemetry Stream
export async function fetchTelemetryEvents() {
  return await request('/api/telemetry_events');
}

// 6. View 3: Ingress Sensor Health (5 XGBoost Classifiers)
export async function fetchSensorHealth() {
  return await request('/api/sensor_health');
}

// 7. View 4: Flower Federation Status & Audit Trail
export async function fetchFederationStatus() {
  return await request('/api/federation_status');
}

// 8. View 5: Storage Footprint & Latency Benchmarks
export async function fetchHardwareDiagnostics() {
  return await request('/api/hardware_diagnostics');
}

// 9. View 2: Active Incident & MITRE Playbook
export async function fetchLatestIncident() {
  return await request('/api/incidents/latest');
}

// 10. View 6: Ingest Telemetry & Execute 4 ML Stages
export async function injectTelemetry(payload) {
  return await request('/api/telemetry', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// 11. Remediation Actions (Real Functions for Buttons)
export async function blockIP(ip) {
  return await request('/api/remediation/block_ip', {
    method: 'POST',
    body: JSON.stringify({ ip })
  });
}

export async function quarantineHost(quarantine = true) {
  return await request('/api/remediation/quarantine', {
    method: 'POST',
    body: JSON.stringify({ quarantine })
  });
}

export async function pushWeights() {
  return await request('/api/remediation/push_weights', {
    method: 'POST'
  });
}

export async function resolveIncident() {
  return await request('/api/remediation/resolve_incident', {
    method: 'POST'
  });
}

export async function exportIncidentReport() {
  return await request('/api/remediation/export_report');
}

export async function fetchRemediationStatus() {
  return await request('/api/remediation/status');
}

