import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  Download, 
  Ban, 
  Server, 
  Zap,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';

export default function ActiveThreatAlertHub({ threatData, onPushWeights }) {
  // Interactive checklist state
  const [checkedActions, setCheckedActions] = useState({
    0: true,  // First item pre-checked
    1: false,
    2: false,
    3: false,
  });

  const [toastMessage, setToastMessage] = useState(null);

  const toggleCheck = (idx) => {
    setCheckedActions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Determine state based on live or fallback threat data
  const isAnomaly = !threatData || threatData.status === "anomaly_detected";
  const classification = threatData?.securebert_classification || "T1498: Network Denial of Service";
  const confidence = threatData?.securebert_confidence 
    ? Math.round(threatData.securebert_confidence * 100) 
    : 96;

  // Extract clean summary
  const rawSummary = threatData?.llama3_advisory?.threat_summary || 
    threatData?.narrative_translation ||
    "Anomalous volumetric flow targeting destination port 443 detected. Flow duration exceeded 12,000 microseconds transmitting 4,500 forward packets, exhibiting asymmetric volumetric flood signatures characteristic of high-rate SYN flood resource exhaustion.";

  const isOllamaOffline = threatData?.llama3_advisory?.ollama_status === 'offline';

  const immediateActions = threatData?.llama3_advisory?.immediate_actions || [
    "Drop incoming traffic originating from anomalous source CIDR block",
    "Rate-limit ingress TCP SYN packets on destination Port 443 via Edge iptables",
    "Trigger priority LoRA parameter upload (ΔW) to Cloud Aggregator",
    "Isolate edge client MAC-EDGE-01 from internal protected network segment"
  ];

  const longTermMitigations = threatData?.llama3_advisory?.long_term_mitigations || [
    "Enforce upstream BGP scrubbing for volumetric edge protection",
    "Retrain Stage 1 XGBoost triage boundary on newly flagged packet flow thresholds",
    "Publish verified MITRE technique IOC into collaborative federated memory"
  ];

  return (
    <div className="bg-[#0d0f12] border border-[#1a1e27] hover:border-[#262d3a] rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-md relative overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-6 z-20 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ambient Top Glow Border */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${
        isAnomaly 
          ? 'bg-gradient-to-r from-transparent via-rose-500/60 to-transparent' 
          : 'bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent'
      }`}></div>

      {/* HEADER: Classification Badge & Model Confidence */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#1a1e27]">
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
            isAnomaly 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isAnomaly ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span>{isAnomaly ? `🚨 CRITICAL: ${classification}` : '✅ BENIGN TRAFFIC CONFIRMED'}</span>
          </div>

          <span className="text-xs font-mono text-gray-400 bg-[#12151c] px-2.5 py-1 rounded-lg border border-[#1f2533]">
            MITRE ATT&CK T1498 • Network Flooding
          </span>
        </div>

        {/* Confidence & Severity Indicator */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block">
              SecureBERT Match
            </span>
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="text-2xl font-bold text-white font-sans">
                {confidence}%
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">Confidence</span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            HIGH SEVERITY
          </div>
        </div>
      </div>

      {/* BODY: Llama-3 Executive Summary */}
      <div className="my-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Llama-3 RAG Executive Advisory
            </h3>
          </div>

          {isOllamaOffline && (
            <span className="text-[10px] font-mono text-purple-400/80 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Database className="w-3 h-3 text-purple-400" />
              <span>ChromaDB MITRE Context</span>
            </span>
          )}
        </div>

        <div className="bg-[#07080b] border border-[#181c24] rounded-xl p-4 text-xs text-gray-300 leading-relaxed font-sans shadow-inner">
          <p>{rawSummary}</p>
          {threatData?.narrative_translation && threatData?.narrative_translation !== rawSummary && (
            <p className="mt-2 text-gray-400 text-[11px] pt-2 border-t border-[#141822] font-mono">
              <span className="text-blue-400">Telemetry Translation:</span> {threatData.narrative_translation}
            </p>
          )}
        </div>
      </div>

      {/* TWO-COLUMN RESPONSE PLAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Left: Immediate Containment Actions Checklist */}
        <div className="bg-[#07080b]/60 border border-[#181c24] rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Immediate Incident Response (SOC Checklist)
            </h4>
            <span className="text-[10px] text-gray-500 font-mono">
              {Object.values(checkedActions).filter(Boolean).length}/{immediateActions.length} Completed
            </span>
          </div>

          <div className="space-y-2">
            {immediateActions.map((action, idx) => {
              const isChecked = checkedActions[idx] ?? false;
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  role="checkbox"
                  aria-checked={isChecked}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border select-none ${
                    isChecked 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-gray-200' 
                      : 'bg-[#0a0c10] border-[#181c24] text-gray-400 hover:border-gray-700 hover:text-gray-200'
                  }`}
                >
                  <span className="mt-0.5 text-emerald-400 flex-shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-600" />
                    )}
                  </span>
                  <span className={`text-xs leading-snug ${isChecked ? 'line-through text-gray-500' : ''}`}>
                    {action}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Long-Term Hardening Mitigations */}
        <div className="bg-[#07080b]/60 border border-[#181c24] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Long-Term Architecture Hardening
            </h4>

            <ul className="space-y-2.5">
              {longTermMitigations.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-400 bg-[#0a0c10] border border-[#181c24] p-2.5 rounded-xl">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-[#181c24] flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Federated Strategy: FLoRA</span>
            <span className="text-purple-400">Differential Privacy ε=0.5</span>
          </div>
        </div>
      </div>

      {/* ACTIONS: Standardized h-9.5 Outline Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1a1e27]">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => showToast("Ingress rule applied: CIDR 192.168.1.0/24 dropped at Edge iptables.")}
            className="flex items-center gap-2 h-9.5 px-4 rounded-xl bg-transparent border border-rose-500/40 hover:border-rose-500 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-all hover:bg-rose-500/10 active:scale-95 cursor-pointer shadow-sm"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Block Source IP</span>
          </button>

          <button
            onClick={() => showToast("Edge host isolated from network segment. Management tunnel active.")}
            className="flex items-center gap-2 h-9.5 px-4 rounded-xl bg-transparent border border-amber-500/40 hover:border-amber-500 text-amber-400 hover:text-amber-300 text-xs font-semibold transition-all hover:bg-amber-500/10 active:scale-95 cursor-pointer shadow-sm"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Quarantine Subnet</span>
          </button>

          <button
            onClick={() => showToast("Incident dossier compiled. Downloaded PDF report.")}
            className="flex items-center gap-2 h-9.5 px-4 rounded-xl bg-transparent border border-[#262d3a] hover:border-gray-500 text-gray-300 hover:text-white text-xs font-medium transition-all hover:bg-[#141821] active:scale-95 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Incident PDF</span>
          </button>
        </div>

        {/* Federated Sync Trigger */}
        <button
          onClick={() => {
            if (onPushWeights) onPushWeights();
            showToast("Zero-Day LoRA parameters packaged and synced to Flower Server!");
          }}
          className="flex items-center gap-2 h-9.5 px-4.5 rounded-xl bg-purple-500/10 border border-purple-500/40 hover:border-purple-400 text-purple-300 hover:text-purple-200 text-xs font-semibold transition-all hover:bg-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] active:scale-95 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>Push Local Weights to Colab</span>
        </button>
      </div>
    </div>
  );
}
