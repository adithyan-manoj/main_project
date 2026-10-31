import React, { useState, useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import HardwareKpiCards from '../components/HardwareKpiCards';
import ThreatDistributionDonut from '../components/ThreatDistributionDonut';
import TemporalVolumeBarChart from '../components/TemporalVolumeBarChart';
import ActiveThreatAlertHub from '../components/ActiveThreatAlertHub';
import TelemetryTable from '../components/TelemetryTable';
import MultiModalDrawer from '../components/MultiModalDrawer';
import FederationDrawer from '../components/FederationDrawer';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function EdgeDashboard() {
  // Drawer States
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Backend Connectivity State
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Hardware Status State
  const [sysStatus, setSysStatus] = useState({ 
    cpu_usage: 24.5, 
    ram_usage: 38.7, 
    uptime_hours: 14.8,
    vram_usage: 3.1
  });

  // Threat & Telemetry States
  const [clientNode, setClientNode] = useState(null);
  const [totalBlocked, setTotalBlocked] = useState(142);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isZeroDay, setIsZeroDay] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [threatData, setThreatData] = useState(null);
  const [lastInjectedEvent, setLastInjectedEvent] = useState(null);

  // Poll hardware status from real FastAPI backend (smoothly jitter if offline)
  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const [statusRes, nodeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/system_status`),
          fetch(`${API_BASE_URL}/api/client_node_info`)
        ]);

        if (statusRes.ok) {
          const data = await statusRes.json();
          if (isMounted) {
            setIsBackendConnected(true);
            setSysStatus(prev => ({
              ...prev,
              cpu_usage: data.cpu_usage ?? prev.cpu_usage,
              ram_usage: data.ram_usage ?? prev.ram_usage,
              uptime_hours: data.uptime_hours ?? prev.uptime_hours
            }));
          }
        }

        if (nodeRes.ok) {
          const nodeData = await nodeRes.json();
          if (isMounted) setClientNode(nodeData);
        }
      } catch {
        if (isMounted) {
          setIsBackendConnected(false);
          // Realistic jitter when offline
          setSysStatus(prev => ({
            ...prev,
            cpu_usage: Math.min(75, Math.max(12, prev.cpu_usage + (Math.random() * 2 - 1))),
            ram_usage: Math.min(80, Math.max(30, prev.ram_usage + (Math.random() * 0.2 - 0.1)))
          }));
        }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Keyboard shortcut listener for ESC (close drawers) & ⌘K (focus search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLeftDrawerOpen(false);
        setIsRightDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Inject traffic: connects to real FastAPI backend (with fallback simulation if backend unreachable)
  const handleInjectTraffic = async (type) => {
    setIsProcessing(true);

    const isThreat = type === 'threat';
    const payload = {
      Dst_Port: 443,
      Protocol: "TCP",
      Tot_Fwd_Pkts: isThreat ? 4500 : 10,
      Tot_Bwd_Pkts: 10,
      Flow_Duration: isThreat ? 12000 : 150,
      simulate_zero_day: isZeroDay
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setThreatData(data);
        setLastInjectedEvent({
          ...data,
          dstPort: payload.Dst_Port,
          protocol: payload.Protocol
        });

        if (data.status === "anomaly_detected" || data.xgboost_score === 1) {
          setTotalBlocked(prev => prev + 1);
        }
        setRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error("Backend response error");
      }
    } catch {
      // High-Fidelity Simulation Fallback when Edge API is offline
      setTimeout(() => {
        if (isThreat) {
          const simulatedData = {
            status: "anomaly_detected",
            xgboost_score: 1,
            dstPort: 443,
            protocol: "TCP",
            narrative_translation: "Detected anomalous TCP network flow targeting destination port 443. The connection lasted 12000 microseconds transmitting 4500 forward packets, exhibiting asymmetric volumetric flood signatures characteristic of high-rate SYN flood resource exhaustion.",
            securebert_classification: "T1498: Network Denial of Service",
            securebert_confidence: isZeroDay ? 0.96 : 0.99,
            llama3_advisory: {
              threat_summary: "Volumetric denial-of-service packet inundation attempting resource exhaustion on edge TLS gateway.",
              immediate_actions: [
                "Drop incoming traffic originating from CIDR block 192.168.1.0/24",
                "Rate-limit ingress TCP SYN packets on destination Port 443 via Edge iptables",
                "Trigger priority LoRA parameter upload (ΔW) to Cloud Aggregator",
                "Isolate edge client MAC-EDGE-01 from internal protected network segment"
              ],
              long_term_mitigations: [
                "Enforce upstream BGP scrubbing for volumetric edge protection",
                "Retrain Stage 1 XGBoost triage boundary on newly flagged packet flow thresholds",
                "Publish verified MITRE technique IOC into collaborative federated memory"
              ]
            },
            message: "All 4 ML Stages Complete! Live simulation payload active."
          };
          setThreatData(simulatedData);
          setLastInjectedEvent(simulatedData);
          setTotalBlocked(prev => prev + 1);
        } else {
          const benignData = {
            status: "benign",
            xgboost_score: 0,
            dstPort: 443,
            protocol: "TCP",
            message: "Traffic is normal. Packet dropped by Stage 1 triage."
          };
          setThreatData(benignData);
          setLastInjectedEvent(benignData);
        }
      }, 500);
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#060709] text-gray-300 font-sans p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto selection:bg-emerald-500/20 selection:text-white">
      {/* 1. HEADER (Top Navigation) */}
      <DashboardHeader
        onOpenLeftDrawer={() => setIsLeftDrawerOpen(true)}
        onOpenRightDrawer={() => setIsRightDrawerOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isBackendConnected={isBackendConnected}
        clientNode={clientNode}
      />

      {/* 2. TOP ROW: System Hardware KPIs (4 Cards) */}
      <HardwareKpiCards sysStatus={sysStatus} />

      {/* 3. MIDDLE ROW: Threat Analytics (Charts - 2-Column Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Donut Chart ("Entities Overview" style - 5 cols) */}
        <div className="lg:col-span-5 h-full">
          <ThreatDistributionDonut totalBlocked={totalBlocked} refreshTrigger={refreshTrigger} />
        </div>

        {/* Right: Bar Chart ("Network Anomallea" style with glowing spike - 7 cols) */}
        <div className="lg:col-span-7 h-full">
          <TemporalVolumeBarChart refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* 4. INSERT ROW: Active Threat Alert & AI Mitigation Hub */}
      <ActiveThreatAlertHub 
        threatData={threatData}
        onPushWeights={() => setIsRightDrawerOpen(true)}
      />

      {/* 5. BOTTOM ROW: Live Telemetry & Ingestion (Data Table) */}
      <TelemetryTable 
        externalEvent={lastInjectedEvent}
        onInspectPayload={() => setIsLeftDrawerOpen(true)}
      />

      {/* 6. SIDE/OVERLAY PANELS: Drawers */}
      {/* Left Drawer: Multi-Modal Ingestion Inspector */}
      <MultiModalDrawer
        isOpen={isLeftDrawerOpen}
        onClose={() => setIsLeftDrawerOpen(false)}
      />

      {/* Right Drawer: Federated Learning & Simulation Controls */}
      <FederationDrawer
        isOpen={isRightDrawerOpen}
        onClose={() => setIsRightDrawerOpen(false)}
        isZeroDay={isZeroDay}
        setIsZeroDay={setIsZeroDay}
        onInjectTraffic={handleInjectTraffic}
        isProcessing={isProcessing}
      />
    </div>
  );
}
