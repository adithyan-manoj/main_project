import React from 'react';
import { 
  Cpu, 
  HardDrive, 
  Zap, 
  Activity, 
  Clock, 
  Database, 
  Thermometer, 
  ShieldCheck, 
  CheckCircle2,
  Layers
} from 'lucide-react';
import DiscreteProgressBar from '../components/common/DiscreteProgressBar';

export default function HostHealth() {
  const latencyStages = [
    { stage: 'Stage 1: Multi-Sensor XGBoost Triage', latency: '1.4 ms', role: 'Filters 99% benign flows locally', color: 'green', filled: 1 },
    { stage: 'Stage 2: Cross-Sensor Event Correlator', latency: '3.5 ms', role: '5-min rolling window CTI narrative synthesis', color: 'blue', filled: 2 },
    { stage: 'Stage 3: SecureBERT LoRA Classifier', latency: '42.8 ms', role: 'MPS GPU Accelerated sequence classification', color: 'purple', filled: 4 },
    { stage: 'Stage 4: Private ChromaDB RAG Advisory', latency: '340.5 ms', role: 'MITRE technique & mitigation retrieval', color: 'pink', filled: 6 },
  ];

  const storageItems = [
    { name: 'ChromaDB MITRE Vector Store', size: '45.2 MB', desc: '858 STIX 2.1 ATT&CK vector chunks' },
    { name: 'Client Node Local Profile', size: '1.8 MB', desc: 'Host laptop memory & localized attack vectors' },
    { name: 'SecureBERT LoRA Weights', size: '3.55 MB', desc: 'PEFT Low-Rank Adapter weights (safetensors)' },
    { name: '5x XGBoost Ingress Models', size: '1.24 MB', desc: 'Serialized trees & feature normalization scalers' },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Hardware KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CPU Load */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                CPU Usage
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                8 Cores
              </span>
            </div>
            <h3 className="text-4xl font-black text-gray-950 tracking-tight mt-1">
              24.5%
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Real-time load • Load avg: 1.42
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-gray-100">
            <DiscreteProgressBar total={7} filled={2} variant="green" size="md" />
          </div>
        </div>

        {/* Memory RAM */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Unified Memory
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
                38.7%
              </span>
            </div>
            <h3 className="text-4xl font-black text-gray-950 tracking-tight mt-1">
              6.2 GB
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              of 16.0 GB total system RAM
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-gray-100">
            <DiscreteProgressBar total={7} filled={3} variant="blue" size="md" />
          </div>
        </div>

        {/* GPU / MPS VRAM */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                GPU / MPS VRAM
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                Apple Silicon
              </span>
            </div>
            <h3 className="text-4xl font-black text-gray-950 tracking-tight mt-1">
              3.1 GB
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Metal Performance Shaders (MPS) active
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-gray-100">
            <DiscreteProgressBar total={7} filled={3} variant="purple" size="md" />
          </div>
        </div>

        {/* System Uptime */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                System Uptime
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Stable
              </span>
            </div>
            <h3 className="text-4xl font-black text-gray-950 tracking-tight mt-1">
              142.9h
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Thermal profile: <span className="text-emerald-700 font-semibold">Normal • 48°C</span>
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-gray-100">
            <DiscreteProgressBar total={7} filled={6} variant="green" size="md" />
          </div>
        </div>
      </div>

      {/* Latency Benchmark Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              4-Stage Machine Learning Pipeline Profiler
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Empirical execution latency measured locally on Apple Silicon MPS hardware
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-gray-900 text-white">
            Total Latency: &lt; 390 ms
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {latencyStages.map((stage, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 leading-tight block">
                  {stage.stage}
                </span>
                <p className="text-[11px] text-gray-500 mt-1 font-medium leading-snug">
                  {stage.role}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                <span className="text-lg font-black text-gray-950 font-mono">
                  {stage.latency}
                </span>
                <DiscreteProgressBar total={7} filled={stage.filled} variant={stage.color} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disk & Vector Database Footprint */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Storage & Local Vector Memory Footprint
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Compact disk footprint optimized for constrained edge environments
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Total on Disk: 51.79 MB
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {storageItems.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-2xs">
              <span className="text-xs font-bold text-gray-800 block">{item.name}</span>
              <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{item.desc}</p>
              <div className="text-base font-mono font-bold text-indigo-700 mt-3 pt-2 border-t border-gray-100">
                {item.size}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

