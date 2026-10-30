import React from 'react';
import { TrendingUp, Cpu, HardDrive, Clock, Activity, Zap } from 'lucide-react';

export default function HardwareKpiCards({ sysStatus }) {
  const cpu = sysStatus?.cpu_usage ?? 24.5;
  const ramPercent = sysStatus?.ram_usage ?? 38.7;
  const ramGB = ((ramPercent / 100) * 16.0).toFixed(1);
  const uptime = sysStatus?.uptime_hours ?? 14.8;
  const vramGB = sysStatus?.vram_usage ?? 3.1;

  // Mini sparkline SVG paths
  const cpuSparklinePoints = "M0,18 Q8,5 16,14 T32,8 T48,15 T64,4";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
      {/* CARD 1: CPU UTILIZATION */}
      <div className="bg-[#0d0f12] border border-[#1a1e27] hover:border-[#262d3a] rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-md group">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-medium text-gray-400 tracking-wide">
            CPU Usage
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+2.4%</span>
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tight text-white font-sans">
              {cpu.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
              <span>Real-time load</span>
              <span className="text-gray-700">•</span>
              <span className="text-gray-400 font-mono text-[11px]">8 Cores</span>
            </p>
          </div>

          {/* Micro Sparkline */}
          <div className="w-16 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 64 24" className="w-full h-full overflow-visible">
              <path
                d={cpuSparklinePoints}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="64" cy="4" r="2.5" fill="#10b981" className="animate-pulse" />
            </svg>
          </div>
        </div>
      </div>

      {/* CARD 2: RAM USAGE */}
      <div className="bg-[#0d0f12] border border-[#1a1e27] hover:border-[#262d3a] rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-md group">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-medium text-gray-400 tracking-wide">
            Memory (RAM)
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold">
            <HardDrive className="w-3 h-3" />
            <span>+{ramPercent.toFixed(0)}%</span>
          </div>
        </div>

        <div>
          <div className="text-3xl font-bold tracking-tight text-white font-sans">
            {ramGB} GB
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              of 16.0 GB total
            </p>
            <div className="w-20 bg-[#161a22] rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${ramPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: GPU / VRAM */}
      <div className="bg-[#0d0f12] border border-[#1a1e27] hover:border-[#262d3a] rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-md group">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-medium text-gray-400 tracking-wide">
            Accelerator VRAM
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-semibold">
            <Zap className="w-3 h-3" />
            <span>MPS Core</span>
          </div>
        </div>

        <div>
          <div className="text-3xl font-bold tracking-tight text-white font-sans">
            {vramGB.toFixed(1)} GB
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <span className="text-purple-400 font-medium">SecureBERT</span>
            <span className="text-gray-700">•</span>
            <span>LoRA active</span>
          </p>
        </div>
      </div>

      {/* CARD 4: UPTIME & SYSTEM HEALTH */}
      <div className="bg-[#0d0f12] border border-[#1a1e27] hover:border-[#262d3a] rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-md group">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-medium text-gray-400 tracking-wide">
            System Uptime
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
            <Activity className="w-3 h-3" />
            <span>Stable</span>
          </div>
        </div>

        <div>
          <div className="text-3xl font-bold tracking-tight text-white font-sans">
            {uptime}h
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Normal
            </span>
            <span className="text-gray-700">•</span>
            <span className="text-gray-400 font-mono text-[11px]">48°C</span>
          </p>
        </div>
      </div>
    </div>
  );
}
