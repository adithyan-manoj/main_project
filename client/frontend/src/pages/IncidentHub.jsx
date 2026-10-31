import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  CheckSquare, 
  Square, 
  Ban, 
  Server, 
  Download, 
  Zap, 
  ArrowRight,
  Database,
  Terminal,
  Activity,
  Layers,
  CheckCircle2
} from 'lucide-react';
import PillButton from '../components/common/PillButton';
import { 
  fetchLatestIncident, 
  blockIP, 
  quarantineHost, 
  pushWeights, 
  exportIncidentReport,
  resolveIncident 
} from '../api/client';

export default function IncidentHub({ refreshTrigger = 0, onTriggerRefresh }) {
  const [incident, setIncident] = useState(null);
  const [checkedActions, setCheckedActions] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [isQuarantined, setIsQuarantined] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleCheck = (idx) => {
    setCheckedActions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Load real active incident from backend
  useEffect(() => {
    let isMounted = true;
    const loadIncident = async () => {
      try {
        const data = await fetchLatestIncident();
        if (isMounted && data) {
          setIncident(data);
          if (data.remediation_status) {
            setIsQuarantined(Boolean(data.remediation_status.is_quarantined));
          }
        }
      } catch (err) {
        console.warn("[IncidentHub] Failed loading latest incident:", err);
      }
    };

    loadIncident();
  }, [refreshTrigger]);

  // MITRE 6-Class Tactical Matrix supported by our fine-tuned SecureBERT
  const mitreTechniques = [
    { id: 'T1190', name: 'Exploit Public App', tactic: 'Initial Access' },
    { id: 'T1059', name: 'Command & Scripting', tactic: 'Execution' },
    { id: 'T1078', name: 'Valid Accounts', tactic: 'Persistence' },
    { id: 'T1068', name: 'Privilege Escalation', tactic: 'Priv Escalation' },
    { id: 'T1070', name: 'Indicator Removal', tactic: 'Defense Evasion' },
    { id: 'T1498', name: 'Network Denial of Service', tactic: 'Impact' },
  ];

  const isThreatActive = Boolean(incident?.has_active_incident) && incident?.severity !== 'NORMAL';
  const activeTechniqueId = isThreatActive ? (incident?.technique_id || 'T1498') : 'NORMAL';
  const confidence = isThreatActive ? (incident?.confidence || 96.4) : 100;
  const severity = isThreatActive ? (incident?.severity || 'P1 SEVERITY') : 'NORMAL';
  const targetAsset = incident?.target_asset || "Adithyan's MacBook Air (Protected)";
  const protocol = incident?.protocol || (isThreatActive ? 'TCP' : 'TLS / Encrypted');
  const narrative = incident?.narrative || (isThreatActive 
    ? "Anomalous ingress telemetry detected." 
    : "All 5 edge ingress sensors (Network, Auth, Host Endpoint, Web, Cloud Audit) report normal operational telemetry. Zero active threats or anomalous spikes detected.");
  const advisory = incident?.advisory || {};

  const immediateActions = advisory.immediate_actions || (isThreatActive ? [
    "Drop incoming traffic originating from source entity CIDR",
    "Rate-limit ingress TCP SYN packets on destination port via edge packet filter",
    "Trigger priority LoRA parameter delta upload (ΔW) to Cloud Aggregator",
    "Isolate host interface from protected network segment"
  ] : [
    "Continue normal background multi-sensor triage across all 5 modalities",
    "Maintain local parameter isolation and differential privacy guarantees"
  ]);

  const longTermMitigations = advisory.long_term_mitigations || (isThreatActive ? [
    "Enforce upstream scrubbing for volumetric edge protection",
    "Retrain Stage 1 XGBoost triage boundary on newly flagged packet flow thresholds",
    "Publish verified MITRE technique IOC into collaborative federated memory"
  ] : [
    "Synchronize periodic model checkpoint updates via Cloud Federation Hub",
    "Monitor ingress velocity trends in Command Center"
  ]);

  // Real button actions
  const handleResolveIncident = async () => {
    try {
      setIsProcessing(true);
      const res = await resolveIncident();
      showToast(res.message || "Threat alert resolved. System restored to normal baseline.");
      if (onTriggerRefresh) onTriggerRefresh();
      const updated = await fetchLatestIncident();
      if (updated) setIncident(updated);
    } catch (err) {
      showToast(`Failed to resolve incident: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlockSource = async () => {
    const rawSrc = incident?.source_entity || '192.168.1.100';
    const cleanIp = rawSrc.split(':')[0];
    try {
      setIsProcessing(true);
      const res = await blockIP(cleanIp);
      showToast(res.message || `Firewall rule applied: Blocked ${cleanIp}`);
      if (onTriggerRefresh) onTriggerRefresh();
    } catch (err) {
      showToast(`Failed to block IP: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuarantine = async () => {
    try {
      setIsProcessing(true);
      const targetState = !isQuarantined;
      const res = await quarantineHost(targetState);
      setIsQuarantined(res.is_quarantined);
      showToast(res.message || (res.is_quarantined ? 'Host isolated from protected network segment.' : 'Host network connectivity restored.'));
      if (onTriggerRefresh) onTriggerRefresh();
    } catch (err) {
      showToast(`Quarantine action error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setIsProcessing(true);
      const report = await exportIncidentReport();
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FedThreat_Forensic_Report_${report.report_id || Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloaded incident forensic dossier (${report.report_id})`);
    } catch (err) {
      showToast(`Export failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePushWeights = async () => {
    try {
      setIsProcessing(true);
      const res = await pushWeights();
      showToast(res.message || 'LoRA parameter delta packaged and synced to Flower Server!');
      if (onTriggerRefresh) onTriggerRefresh();
    } catch (err) {
      showToast(`Failed to push weights: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-8 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Incident Header Card (Dynamic based on real threat presence) */}
      <div className={`rounded-3xl p-6 sm:p-7 border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
        isThreatActive 
          ? 'bg-white border-rose-200/80 shadow-rose-50/50' 
          : 'bg-emerald-50/30 border-emerald-200/80 shadow-emerald-50/40'
      }`}>
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isThreatActive 
                ? 'bg-rose-50 text-rose-700 border-rose-200/80' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isThreatActive ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span>{isThreatActive ? severity : 'NORMAL • PROTECTED'}</span>
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {isThreatActive ? `MITRE ATT&CK: ${activeTechniqueId}` : 'TRIAGE: 5 SENSORS ACTIVE'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {incident?.classification || (isThreatActive ? 'T1498: Denial of Service Ingress' : 'All Clear • No Active Threats Intercepted')}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Target Asset: <span className="font-semibold text-gray-700">{targetAsset}</span> • Protocol: <span className="font-mono text-gray-700">{protocol}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              {isThreatActive ? 'SecureBERT Match' : 'Sentinel Posture'}
            </span>
            <span className="text-3xl font-black text-gray-950 font-sans">
              {confidence}%
            </span>
            <span className={`text-[11px] font-bold block ${isThreatActive ? 'text-rose-600' : 'text-emerald-600'}`}>
              {isThreatActive ? 'High Threat Confidence' : 'System Secure'}
            </span>
          </div>

          <div className={`px-3 py-2 rounded-2xl border text-xs font-bold ${
            isThreatActive 
              ? 'bg-rose-50 border-rose-200/70 text-rose-700' 
              : 'bg-emerald-50 border-emerald-200/70 text-emerald-700'
          }`}>
            {isThreatActive ? severity : 'ALL CLEAR'}
          </div>
        </div>
      </div>

      {/* Stage 2 Narrative Translation Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Stage 2: Cross-Source Event Correlation Narrative
          </h3>
        </div>
        <div className="bg-gray-50/80 border border-gray-200/70 rounded-2xl p-4 text-xs text-gray-700 leading-relaxed font-sans font-medium">
          "{narrative}"
        </div>
      </div>

      {/* 6-Class MITRE ATT&CK Tactical Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              MITRE ATT&CK 6-Class Intelligence Matrix
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              SecureBERT + LoRA semantic classification on 2,364 authentic CTI reports
            </p>
          </div>
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200/60">
            PEFT LoRA r=8
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {mitreTechniques.map((tech) => {
            const isActive = activeTechniqueId === tech.id;
            return (
              <div
                key={tech.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                    : 'bg-white border-gray-200/70 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-gray-500">
                    {tech.id}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>
                <h4 className={`text-xs font-bold leading-tight ${isActive ? 'text-rose-900' : 'text-gray-800'}`}>
                  {tech.name}
                </h4>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">{tech.tactic}</p>
                {isActive && (
                  <div className="mt-2 pt-2 border-t border-rose-200/60 text-[11px] font-bold text-rose-700 font-mono">
                    {confidence}% Conf
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Llama-3 Generative Incident Mitigation Hub */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Llama-3 RAG Automated Incident Playbook
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-600" />
            <span>ChromaDB MITRE Context</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Immediate Actions Checklist */}
          <div className="bg-gray-50/70 border border-gray-200/70 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Immediate Incident Response (SOC Checklist)
              </h4>
              <span className="text-[10px] font-mono text-gray-500 font-semibold">
                {Object.values(checkedActions).filter(Boolean).length}/{immediateActions.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {immediateActions.map((action, idx) => {
                const isChecked = checkedActions[idx] ?? false;
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border select-none ${
                      isChecked
                        ? 'bg-emerald-50/60 border-emerald-200 text-gray-900'
                        : 'bg-white border-gray-200/70 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mt-0.5 text-emerald-600 flex-shrink-0">
                      {isChecked ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                    </span>
                    <span className={`text-xs leading-snug font-medium ${isChecked ? 'line-through text-gray-400' : ''}`}>
                      {action}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Long-Term Architecture Hardening */}
          <div className="bg-gray-50/70 border border-gray-200/70 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Activity className="w-3.5 h-3.5" />
                Long-Term Architecture Hardening
              </h4>
              <ul className="space-y-2">
                {longTermMitigations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 bg-white border border-gray-200/70 p-2.5 rounded-xl font-medium">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 text-[11px] text-gray-500 font-mono flex items-center justify-between">
              <span>Strategy: FLoRA LoRA</span>
              <span className="text-purple-600 font-semibold">Differential Privacy ε=0.5</span>
            </div>
          </div>
        </div>

        {/* Real Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {isThreatActive && (
              <PillButton
                variant="pastel-green"
                icon={CheckCircle2}
                onClick={handleResolveIncident}
                disabled={isProcessing}
              >
                Acknowledge & Resolve Alert
              </PillButton>
            )}

            <PillButton
              variant="pastel-pink"
              icon={Ban}
              onClick={handleBlockSource}
              disabled={isProcessing || !isThreatActive}
            >
              Block Source IP
            </PillButton>

            <PillButton
              variant={isQuarantined ? "pastel-green" : "outline"}
              icon={Server}
              onClick={handleQuarantine}
              disabled={isProcessing}
            >
              {isQuarantined ? "Restore Network Access" : "Quarantine Host"}
            </PillButton>

            <PillButton
              variant="outline"
              icon={Download}
              onClick={handleExportReport}
              disabled={isProcessing}
            >
              Export Incident Dossier
            </PillButton>
          </div>

          <PillButton
            variant="pastel-purple"
            icon={Zap}
            onClick={handlePushWeights}
            disabled={isProcessing}
          >
            Push Weights to Federation Hub
          </PillButton>
        </div>
      </div>
    </div>
  );
}
