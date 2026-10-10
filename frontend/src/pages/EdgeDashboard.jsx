import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Server, Activity, ShieldAlert, Cpu, Network, Database, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const mockTelemetry = [
  { time: '10:00:00', load: 12, anomaly_score: 0.1 },
  { time: '10:00:15', load: 15, anomaly_score: 0.15 },
  { time: '10:00:30', load: 14, anomaly_score: 0.08 },
  { time: '10:00:45', load: 89, anomaly_score: 0.96 }, // Attack
  { time: '10:01:00', load: 94, anomaly_score: 0.98 },
  { time: '10:01:15', load: 23, anomaly_score: 0.12 },
];

export default function EdgeDashboard() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="panel p-3">
          <div className="data-label">Node ID</div>
          <div className="data-value text-accent-blue mt-1">MAC-EDGE-01</div>
        </div>
        <div className="panel p-3">
          <div className="data-label">Status</div>
          <div className="mt-1"><span className="badge-alert">Threat Detected</span></div>
        </div>
        <div className="panel p-3">
          <div className="data-label">Active Model</div>
          <div className="data-value mt-1">SecureBERT_LoRA</div>
        </div>
        <div className="panel p-3">
          <div className="data-label">Inference Latency</div>
          <div className="data-value mt-1">42ms</div>
        </div>
        <div className="panel p-3">
          <div className="data-label">Memory Usage</div>
          <div className="data-value mt-1">1.2 GB / 16 GB</div>
        </div>
        <div className="panel p-3">
          <div className="data-label">FLoRA Connection</div>
          <div className="data-value text-accent-green mt-1">SECURE_TLS_1.3</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Telemetry Chart */}
          <div className="panel p-4 h-72 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                <Activity className="w-4 h-4 text-gray-500" />
                Network Telemetry & XGBoost Anomaly Scoring
              </h2>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTelemetry}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#262626" vertical={false} />
                  <XAxis dataKey="time" stroke="#52525B" fontSize={11} tickMargin={8} />
                  <YAxis stroke="#52525B" fontSize={11} domain={[0, 1]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c0c0c', borderColor: '#262626', borderRadius: '4px', fontSize: '12px' }}
                    itemStyle={{ color: '#E4E4E7', fontFamily: 'monospace' }}
                  />
                  <Area 
                    type="stepAfter" 
                    dataKey="anomaly_score" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Raw Log Inspection */}
          <div className="panel flex-1 flex flex-col overflow-hidden">
            <div className="bg-cyber-card-hover border-b border-cyber-border p-3 flex justify-between items-center">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                <Network className="w-4 h-4 text-gray-500" /> Raw Packet Inspection
              </h2>
              <span className="badge-normal">Tailing syslog</span>
            </div>
            <div className="p-4 font-mono text-xs space-y-1.5 text-gray-400 overflow-y-auto bg-[#050505]">
              <p>10:00:44.112 [INFO] eth0: SRC 192.168.1.15 DST 104.21.34.12 PROTO TCP PORT 443 BYTES 1420</p>
              <p>10:00:44.893 [INFO] eth0: SRC 192.168.1.22 DST 8.8.8.8 PROTO UDP PORT 53 BYTES 402</p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent-red bg-accent-red/5 p-1 -mx-1">
                <p>10:00:45.001 [CRITICAL] XGBoost Score 0.96 - UNKNOWN PAYLOAD SIGNATURE DETECTED</p>
                <p>10:00:45.003 [SYSTEM] Freezing local buffer. Extracting 500ms packet window.</p>
                <p>10:00:45.015 [FLoRA] Initiating zero-day training on SecureBERT_LoRA...</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          
          {/* AI Classification Block */}
          <div className="panel flex flex-col border-accent-red/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent-red"></div>
            <div className="p-4 border-b border-cyber-border bg-accent-red/5">
              <div className="data-label text-accent-red">Federated Classification Result</div>
              <h3 className="text-lg font-mono font-bold text-gray-100 mt-1">T1498: Network Denial of Service</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <div className="data-label">Confidence Score</div>
                <div className="data-value text-accent-red mt-1">96.42%</div>
              </div>
              <div>
                <div className="data-label">Fusion Strategy</div>
                <div className="data-value mt-1">merge_and_unload</div>
              </div>
              <div>
                <div className="data-label">Adapter Source</div>
                <div className="data-value mt-1 text-accent-blue">Global Aggregator</div>
              </div>
              <div>
                <div className="data-label">Action Taken</div>
                <div className="data-value mt-1 text-accent-orange">Quarantine</div>
              </div>
            </div>
          </div>

          {/* RAG Context Block */}
          <div className="panel flex-1 flex flex-col">
            <div className="bg-cyber-card-hover border-b border-cyber-border p-3 flex justify-between items-center">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                <Database className="w-4 h-4 text-gray-500" /> MITRE RAG Advisory (Llama-3)
              </h2>
            </div>
            <div className="p-4 text-sm text-gray-300 leading-relaxed font-mono flex-1 overflow-y-auto">
              <div className="mb-4">
                <span className="text-gray-500">Querying local ChromaDB for technique T1498...</span><br/>
                <span className="text-accent-green">Found 3 historical mitigations. Generating advisory.</span>
              </div>
              
              <div className="space-y-3 pl-3 border-l-2 border-cyber-border">
                <p><strong className="text-gray-100">ANALYSIS:</strong> The anomaly exhibits volumetric flooding characteristics designed to exhaust edge firewall state tables.</p>
                
                <p><strong className="text-gray-100">IMMEDIATE ACTIONS:</strong></p>
                <ul className="list-disc pl-4 space-y-1 text-gray-400">
                  <li>Deploy BGP Flowspec rules to upstream routers to drop traffic matching signature Hash:8f3a2b.</li>
                  <li>Enable strict TCP SYN cookies on border gateway.</li>
                  <li>Isolate subnet 192.168.1.0/24 from mission-critical VLANS.</li>
                </ul>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
