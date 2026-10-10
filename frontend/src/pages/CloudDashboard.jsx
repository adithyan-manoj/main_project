import React from 'react';
import { Server, Users, ArrowDownUp, HardDrive, ShieldCheck, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CloudDashboard() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="panel p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="data-label">Connected Nodes</div>
              <div className="data-value text-xl mt-1 text-accent-blue">1</div>
            </div>
            <Users className="w-5 h-5 text-gray-600" />
          </div>
        </div>
        
        <div className="panel p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="data-label">Active Strategy</div>
              <div className="data-value text-xl mt-1">FLoRA</div>
            </div>
            <Server className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        <div className="panel p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="data-label">Aggregation Status</div>
              <div className="mt-1"><span className="badge-normal">Ready</span></div>
            </div>
            <ArrowDownUp className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        <div className="panel p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="data-label">Colab VRAM Usage</div>
              <div className="data-value text-xl mt-1">4.2 / 15.0 GB</div>
            </div>
            <HardDrive className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        <div className="panel p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="data-label">Global Loss</div>
              <div className="data-value text-xl mt-1 text-accent-green">0.6421</div>
            </div>
            <Cpu className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Main Orchestration Log */}
      <div className="panel flex-1 flex flex-col overflow-hidden">
        <div className="bg-cyber-card-hover border-b border-cyber-border p-4 flex justify-between items-center">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-200">
            <ShieldCheck className="w-4 h-4 text-accent-blue" /> 
            Federated Aggregation Tracker
          </h2>
          <div className="text-xs font-mono text-gray-500">Port 8080 (gRPC)</div>
        </div>
        
        <div className="p-6 font-mono text-[13px] leading-relaxed text-gray-400 overflow-y-auto bg-[#050505]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyber-border text-gray-600 uppercase text-[10px]">
                <th className="pb-2 w-32 font-semibold">Timestamp</th>
                <th className="pb-2 w-24 font-semibold">Level</th>
                <th className="pb-2 w-32 font-semibold">Node</th>
                <th className="pb-2 font-semibold">Event Description</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr className="border-b border-cyber-border/30 hover:bg-white/5 transition-colors">
                <td className="py-2.5">10:00:45.015</td>
                <td className="py-2.5 text-accent-blue">INFO</td>
                <td className="py-2.5">MAC-EDGE-01</td>
                <td className="py-2.5">Incoming connection established. Requesting initial parameters.</td>
              </tr>
              <tr className="border-b border-cyber-border/30 hover:bg-white/5 transition-colors">
                <td className="py-2.5">10:00:45.102</td>
                <td className="py-2.5 text-accent-orange">WARN</td>
                <td className="py-2.5">MAC-EDGE-01</td>
                <td className="py-2.5">Zero-day anomaly flag detected. Entering priority FLoRA aggregation pipeline.</td>
              </tr>
              <tr className="border-b border-cyber-border/30 hover:bg-white/5 transition-colors">
                <td className="py-2.5">10:00:47.442</td>
                <td className="py-2.5 text-accent-blue">INFO</td>
                <td className="py-2.5">SERVER-CORE</td>
                <td className="py-2.5">Received heterogeneous LoRA adapter weights (Shape: 768x8).</td>
              </tr>
              <tr className="border-b border-cyber-border/30 hover:bg-white/5 transition-colors">
                <td className="py-2.5">10:00:47.450</td>
                <td className="py-2.5 text-accent-green">SUCCESS</td>
                <td className="py-2.5">SERVER-CORE</td>
                <td className="py-2.5 font-bold">FLoRA Math: Aggregated 1 adapters. No differential privacy noise added (Enterprise Mode).</td>
              </tr>
              <tr className="border-b border-cyber-border/30 hover:bg-white/5 transition-colors">
                <td className="py-2.5">10:00:47.455</td>
                <td className="py-2.5 text-accent-blue">INFO</td>
                <td className="py-2.5">SERVER-CORE</td>
                <td className="py-2.5">Broadcasting updated global weights to MAC-EDGE-01 over gRPC.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
