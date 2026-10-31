import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Key, 
  Server, 
  Globe, 
  Download, 
  Zap, 
  Ban, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Layers,
  Terminal,
  Activity,
  Check,
  X
} from 'lucide-react';
import PillButton from '../components/common/PillButton';
import { 
  fetchNodeInfo, 
  fetchFederationStatus, 
  fetchRemediationStatus, 
  blockIP, 
  quarantineHost, 
  exportIncidentReport,
  pushWeights 
} from '../api/client';

export default function Profile({ 
  nodeProfile, 
  remediationState, 
  isFederated, 
  onToggleQuarantine, 
  onTriggerRefresh 
}) {
  const [operatorInfo, setOperatorInfo] = useState({
    name: "Adithyan Manoj",
    role: "Lead SOC Security Administrator",
    clearance: "Tier-1 Principal SOC Authority",
    operatorId: "SEC-OP-9082",
    sessionStatus: "Active • Hardware FIDO2 Verified",
    email: "adithyan.manoj@fedthreat.local",
    lastAuth: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  });

  const [localNodeInfo, setLocalNodeInfo] = useState(nodeProfile || {
    title: "Adithyan's MacBook Air",
    nodeId: "Adithyans-MacBook-Air",
    arch: "arm64 • Apple Silicon",
    os: "macOS Darwin",
    role: "Autonomous Sentinel"
  });

  const [remState, setRemState] = useState(remediationState || {
    blocked_ips: ["198.51.100.89"],
    is_quarantined: false
  });

  const [newIpToBlock, setNewIpToBlock] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    let isMounted = true;
    const syncData = async () => {
      try {
        const [nodeData, remData] = await Promise.allSettled([
          fetchNodeInfo(),
          fetchRemediationStatus()
        ]);

        if (isMounted && nodeData.status === 'fulfilled' && nodeData.value) {
          const val = nodeData.value;
          setLocalNodeInfo({
            title: val.display_name || "Adithyan's MacBook Air",
            nodeId: val.node_id || "Adithyans-MacBook-Air",
            arch: `${val.architecture || 'arm64'} • Apple Silicon`,
            os: val.os || "macOS Darwin",
            role: val.role || "Autonomous Sentinel"
          });
        }

        if (isMounted && remData.status === 'fulfilled' && remData.value) {
          setRemState(remData.value);
        }
      } catch (err) {
        console.warn("[Profile] Sync notice:", err);
      }
    };

    syncData();
  }, []);

  const handleBlockIp = async (e) => {
    e.preventDefault();
    if (!newIpToBlock.trim()) return;
    try {
      setIsProcessing(true);
      const res = await blockIP(newIpToBlock.trim());
      setRemState(prev => ({ ...prev, blocked_ips: res.blocked_ips }));
      setNewIpToBlock('');
      showToast(`Added ${newIpToBlock.trim()} to edge firewall drop list.`);
      if (onTriggerRefresh) onTriggerRefresh();
    } catch (err) {
      showToast(`Failed to add firewall rule: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleQuarantineClick = async () => {
    try {
      setIsProcessing(true);
      const target = !remState.is_quarantined;
      const res = await quarantineHost(target);
      setRemState(prev => ({ ...prev, is_quarantined: res.is_quarantined }));
      showToast(res.message);
      if (onToggleQuarantine) onToggleQuarantine();
      if (onTriggerRefresh) onTriggerRefresh();
    } catch (err) {
      showToast(`Quarantine action failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportDossier = async () => {
    try {
      setIsProcessing(true);
      const report = await exportIncidentReport();
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FedThreat_Sentinel_Audit_${report.report_id || Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported verified compliance audit dossier (${report.report_id})`);
    } catch (err) {
      showToast(`Export failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePushLoRA = async () => {
    try {
      setIsProcessing(true);
      const res = await pushWeights();
      showToast(res.message || 'LoRA model parameters packaged and synchronized.');
      if (onTriggerRefresh) onTriggerRefresh();
    } catch (err) {
      showToast(`Sync failed: ${err.message}`);
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

      {/* Top Banner: Operator & Sentinel Identity */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Operator Avatar with Live Green Status Dot */}
            <div className="relative">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-blue-500 flex items-center justify-center text-white text-2xl font-black shadow-lg border-2 border-white/20">
                AM
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-gray-900" title="Session Authenticated" />
            </div>

            {/* Operator Details */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {operatorInfo.clearance}
                </span>
                <span className="text-[11px] font-mono text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">
                  ID: {operatorInfo.operatorId}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {operatorInfo.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 font-medium mt-0.5">
                {operatorInfo.role} • <span className="text-gray-400">{localNodeInfo.title}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <PillButton
              variant="pastel-green"
              icon={Download}
              onClick={handleExportDossier}
              disabled={isProcessing}
            >
              Export Audit Dossier
            </PillButton>

            <PillButton
              variant={remState.is_quarantined ? "pastel-pink" : "pastel-purple"}
              icon={Server}
              onClick={handleToggleQuarantineClick}
              disabled={isProcessing}
            >
              {remState.is_quarantined ? "Restore Network" : "Quarantine Machine"}
            </PillButton>
          </div>
        </div>
      </div>

      {/* Main Grid: 4 Core Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Section 1: Security Operator Credentials & Session */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                  Operator Credentials & Session Status
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                Session Active
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Principal Operator</span>
                <span className="font-bold text-gray-900">{operatorInfo.name}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Operational Role</span>
                <span className="font-semibold text-gray-800">{operatorInfo.role}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Clearance Authority</span>
                <span className="font-mono text-purple-700 font-bold">{operatorInfo.clearance}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Authentication Protocol</span>
                <span className="font-medium text-gray-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  Hardware FIDO2 / Passkey MFA
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Operator Identifier</span>
                <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                  {operatorInfo.operatorId}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-500 font-medium">Session Verification</span>
                <span className="text-gray-600 font-mono">Heartbeat Verified ({operatorInfo.lastAuth})</span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Authorized to enforce edge firewall drops, network isolation, and global federated model weight propagation.</span>
          </div>
        </div>

        {/* Section 2: Assigned Sentinel Node Hardware & Runtime */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                  Sentinel Hardware Node Identity
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/60 font-mono">
                {localNodeInfo.nodeId}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Device Profile</span>
                <span className="font-bold text-gray-900">{localNodeInfo.title}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Processor Architecture</span>
                <span className="font-mono text-gray-800 font-semibold">{localNodeInfo.arch}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Operating System</span>
                <span className="text-gray-800 font-medium">{localNodeInfo.os}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Local Vector Memory</span>
                <span className="text-emerald-700 font-semibold font-mono">ChromaDB (STIX 2.1 ATT&CK)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Core Sequence Classifier</span>
                <span className="font-mono text-purple-700 font-semibold">SecureBERT (PEFT LoRA r=8)</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-500 font-medium">Ingress Triage Stage</span>
                <span className="text-gray-700 font-medium">5x Specialized XGBoost Deciders (&lt;2ms)</span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-2xl bg-sky-50/70 border border-sky-200/60 flex items-center justify-between text-xs text-sky-900 font-semibold">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              MPS GPU Acceleration Active
            </span>
            <span className="font-mono text-[11px] text-sky-700">Client v3.2</span>
          </div>
        </div>

        {/* Section 3: Privacy Guarantees & Cryptographic Isolation */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                  Cryptographic Privacy & Model Isolation
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                Strict Edge Isolation
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Differential Privacy Budget</span>
                <span className="font-mono text-emerald-700 font-bold">ε = 0.5 • δ = 10⁻⁵</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Raw Telemetry Egress</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  0 Packets Transmitted (Strict Local Triage)
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Federated Parameter Delta</span>
                <span className="font-mono text-gray-800 font-semibold">FLoRA LoRA ΔW (890,118 parameters)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Transmission Protocol</span>
                <span className="text-gray-800 font-medium">Encrypted gRPC (mTLS Authentication)</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-500 font-medium">Inference Architecture</span>
                <span className="text-purple-700 font-medium">Zero-Latency `merge_and_unload()`</span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900 font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Mathematical guarantee: Network packets, user logs, and private keys never leave local device storage.</span>
          </div>
        </div>

        {/* Section 4: Edge Firewall & Containment Policy */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Ban className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                  Active Edge Firewall & Containment Policy
                </h3>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                remState.is_quarantined 
                  ? 'bg-rose-50 text-rose-700 border-rose-200/60' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
              }`}>
                {remState.is_quarantined ? 'Machine Quarantined' : 'Subnet Online'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-500 font-medium block mb-1.5">Active Dropped Entities (Edge ACLs):</span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-100">
                  {remState.blocked_ips && remState.blocked_ips.length > 0 ? (
                    remState.blocked_ips.map((ip, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white text-rose-700 border border-rose-200 font-mono text-[11px] shadow-2xs">
                        {ip}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">No custom firewall drops currently active.</span>
                  )}
                </div>
              </div>

              {/* Form to block new IP */}
              <form onSubmit={handleBlockIp} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter IP or CIDR (e.g. 198.51.100.89)..."
                  value={newIpToBlock}
                  onChange={(e) => setNewIpToBlock(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400 font-mono bg-white"
                />
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Drop IP
                </button>
              </form>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Subnet Containment Status</span>
            <button
              onClick={handleToggleQuarantineClick}
              disabled={isProcessing}
              className={`font-semibold text-xs px-3 py-1 rounded-xl transition-all cursor-pointer ${
                remState.is_quarantined 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              {remState.is_quarantined ? "Restore Host Connectivity" : "Enforce Subnet Isolation"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

