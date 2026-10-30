import React from 'react';
import { 
  Share2, 
  Lock, 
  Cpu, 
  Server, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowDownUp, 
  Clock, 
  Layers
} from 'lucide-react';
import DiscreteProgressBar from '../components/common/DiscreteProgressBar';
import PillButton from '../components/common/PillButton';

export default function FederatedMesh() {
  const auditLogs = [
    { time: '14:03:00.105', level: 'SUCCESS', node: 'SERVER-CORE', event: 'FLoRA Aggregation: Merged 1 client adapter. No differential privacy noise added (Enterprise Mode).' },
    { time: '14:02:48.442', level: 'UPLOAD', node: 'MAC-EDGE-01', event: 'Transmitted heterogeneous LoRA adapter parameter delta ΔW (Shape: 768x8, Size: 3.55 MB).' },
    { time: '14:02:45.102', level: 'LOCAL', node: 'MAC-EDGE-01', event: 'Local fine-tuning completed (3 epochs on Apple Silicon GPU / MPS, Loss: 0.284).' },
    { time: '14:00:12.015', level: 'BROADCAST', node: 'SERVER-CORE', event: 'Broadcasting initial global adapter weights over encrypted gRPC tunnel.' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Row: Mesh Topology & Round Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Cloud Aggregator Status */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Central Aggregator
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                gRPC Connected
              </span>
            </div>
            <h3 className="text-2xl font-black text-gray-950 tracking-tight mt-1">
              Google Colab GPU
            </h3>
            <p className="text-xs font-mono text-gray-500 mt-1">
              Gateway: ngrok.app:8080 (Flower 1.13)
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Global Strategy</span>
              <span className="text-xs font-bold text-gray-900 font-mono">FLoRA FedAvg</span>
            </div>
            <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
              <Lock className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
              <span>Zero Raw Data Leaves Edge • Parameters Only</span>
            </div>
          </div>
        </div>

        {/* Card 2: Federated Round Progress */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Federation Round
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                Checkpoint v3.2
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black text-gray-950 tracking-tight">
                4
              </span>
              <span className="text-lg font-bold text-gray-400">/ 10</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Global Iterations Completed</span>
              <span className="text-xs font-bold text-gray-900 font-mono">4 / 7</span>
            </div>
            <DiscreteProgressBar total={7} filled={4} variant="purple" size="md" />
            <p className="text-[11px] text-gray-500 mt-2 font-medium">
              Next scheduled synchronization in 45 minutes
            </p>
          </div>
        </div>

        {/* Card 3: LoRA Parameter Delta & Privacy Budget */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                LoRA Parameter Delta (ΔW)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
                0.71% Trainable
              </span>
            </div>
            <h3 className="text-3xl font-black text-gray-950 tracking-tight mt-1">
              890,118
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Weights fine-tuned on SecureBERT (125M base frozen)
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Privacy Budget Consumed</span>
              <span className="text-xs font-bold text-gray-900 font-mono">ε = 0.5 • δ = 10⁻⁵</span>
            </div>
            <DiscreteProgressBar total={7} filled={2} variant="green" size="md" />
            <p className="text-[11px] text-gray-500 mt-2 font-medium">
              High differential privacy protection guaranteed
            </p>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Federated Synchronization Audit Trail
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Encrypted Flower gRPC activity log verified between this node and Colab aggregator
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 font-semibold">
            Port 8080 (gRPC)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-1">Timestamp</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Node Entity</th>
                <th className="pb-3 pr-1">Event Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 pl-1 font-mono text-[11px] text-gray-500">
                    {log.time}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
                      {log.level}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-[11px] text-gray-800 font-semibold">
                    {log.node}
                  </td>
                  <td className="py-3.5 pr-1 font-medium text-gray-700">
                    {log.event}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

