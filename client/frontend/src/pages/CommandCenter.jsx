import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Share2, 
  Layers, 
  Database, 
  ArrowUpRight, 
  ChevronDown, 
  Zap, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Radio,
  Clock,
  MoreVertical
} from 'lucide-react';
import DiscreteProgressBar from '../components/common/DiscreteProgressBar';
import PillButton from '../components/common/PillButton';

/**
 * View 1: Command Center
 * Replicates the SaaS light/pastel aesthetic from the user's reference:
 * - KPI Row: Active Threats (pastel red/pink discrete blocks), Ingress Rate (pastel blue blocks), Dark Accent Card
 * - Charts Row: Statistics card with overlapping pastel bars and threshold lines
 * - Modules Grid: 2x2 grid with circular pastel icon backgrounds
 * - Live Event Activity Table in clean light SaaS styling
 */
export default function CommandCenter({ onNavigateTab }) {
  const [timeRange, setTimeRange] = useState('24H');
  const [hoveredBar, setHoveredBar] = useState(null);

  // Hourly velocity data for 24-hour chart
  const hourlyData = [
    { time: '02:00', threats: 45, benign: 120, maxThreshold: 200 },
    { time: '04:00', threats: 30, benign: 90, maxThreshold: 200 },
    { time: '06:00', threats: 65, benign: 140, maxThreshold: 200 },
    { time: '08:00', threats: 120, benign: 260, maxThreshold: 300 },
    { time: '10:00', threats: 180, benign: 310, maxThreshold: 350 },
    { time: '12:00', threats: 210, benign: 340, maxThreshold: 380 },
    { time: '14:00', threats: 450, benign: 410, maxThreshold: 480, isPeak: true },
    { time: '16:00', threats: 290, benign: 320, maxThreshold: 380 },
    { time: '18:00', threats: 160, benign: 240, maxThreshold: 300 },
    { time: '20:00', threats: 95, benign: 180, maxThreshold: 250 },
    { time: '22:00', threats: 70, benign: 150, maxThreshold: 200 },
    { time: '24:00', threats: 50, benign: 110, maxThreshold: 200 },
  ];

  // Recent edge telemetry incidents in light SaaS table format
  const recentEvents = [
    {
      id: 'evt-01',
      status: 'Blocked',
      statusType: 'critical',
      technique: 'T1498 DoS Flood',
      source: '10.0.4.12:51240',
      dest: 'Port 443 / TCP',
      time: '14:32:05',
      confidence: 96,
    },
    {
      id: 'evt-02',
      status: 'Benign',
      statusType: 'normal',
      technique: 'Normal HTTPS Flow',
      source: '172.16.0.44:49812',
      dest: 'Port 443 / TCP',
      time: '14:32:04',
      confidence: 99,
    },
    {
      id: 'evt-03',
      status: 'Blocked',
      statusType: 'warning',
      technique: 'T1110 SSH Brute',
      source: '198.51.100.89:3389',
      dest: 'Port 22 / SSH',
      time: '14:31:58',
      confidence: 94,
    },
    {
      id: 'evt-04',
      status: 'Blocked',
      statusType: 'critical',
      technique: 'T1059 Web SQLi',
      source: '203.0.113.12:8080',
      dest: 'Port 80 / HTTP',
      time: '14:30:42',
      confidence: 91,
    },
  ];

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. TOP KPI ROW (Operations & Data Transfer style cards + Dark Accent Card)
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Active Threats */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Active Threats
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                Action Required
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black text-gray-950 tracking-tight font-sans">
                3
              </span>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                +1 Critical (T1498)
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Triage Severity Load</span>
              <span className="text-xs font-bold text-gray-900 font-mono">3 / 7</span>
            </div>
            {/* Discrete block progress indicator in pastel pink/red */}
            <DiscreteProgressBar total={7} filled={3} variant="pink" size="md" />
            <p className="text-[11px] text-gray-500 mt-2 font-medium">
              143 total threats neutralized across this node
            </p>
          </div>
        </div>

        {/* Card 2: Ingress Rate */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Ingress Rate
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
                5 Sensors Live
              </span>
            </div>

            <div className="flex items-baseline mt-1">
              <span className="text-5xl font-black text-gray-950 tracking-tight font-sans">
                1,420
              </span>
              <span className="text-sm font-semibold text-gray-500 ml-1.5 font-sans">
                / sec
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Sensor Ingress Capacity</span>
              <span className="text-xs font-bold text-gray-900 font-mono">5 / 7</span>
            </div>
            {/* Discrete block progress indicator in pastel blue */}
            <DiscreteProgressBar total={7} filled={5} variant="blue" size="md" />
            <p className="text-[11px] text-gray-500 mt-2 font-medium">
              99.2% benign traffic dropped at Stage 1 triage
            </p>
          </div>
        </div>

        {/* Card 3: Host Status & Security Posture Banner (Dark Accent Card) */}
        <div className="bg-gray-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between group">
          {/* Subtle background glow */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Sentinel Defense Active
                </span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                Score: 98/100
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white leading-snug">
              Autonomous Defense Active
            </h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-medium">
              SecureBERT LoRA v3 fine-tuned on real CTI. Zero raw customer data leaves this node.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-800">
            <span className="text-[11px] font-mono text-gray-400">
              Flower gRPC: Synced
            </span>
            <button
              onClick={() => onNavigateTab && onNavigateTab('federated-mesh')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer active:scale-95"
            >
              <span>View Mesh</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. CHARTS ROW & MODULES GRID (Statistics card & Recommended 2x2 grid)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: 24-Hour Ingress Velocity & Spike Graph (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm flex flex-col justify-between">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Ingress Threat Velocity
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Hourly packet anomaly frequency across edge telemetry streams
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Legend with soft pastel dots */}
              <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
                  Threat Spikes
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-200" />
                  Benign Flows
                </span>
              </div>

              {/* Time Range Selector */}
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 shadow-2xs hover:bg-gray-50 cursor-pointer">
                <span>{timeRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* SVG Bar Chart with Soft Pastel Overlapping Bars & Striped Thresholds */}
          <div className="relative w-full my-1 pt-6 pb-2 select-none">
            <svg viewBox="0 0 600 210" className="w-full h-auto overflow-visible">
              <defs>
                {/* Striped pattern for threshold background bars */}
                <pattern id="stripedThreshold" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#f1f3f7" strokeWidth="4" />
                </pattern>

                {/* Subtle soft shadow filter for peak bar */}
                <filter id="softSpikeShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#f43f5e" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Background horizontal guide lines */}
              {[40, 90, 140].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="#f1f4f8"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              ))}

              {/* Render Bars */}
              {hourlyData.map((item, index) => {
                const totalBars = hourlyData.length;
                const barWidth = 26;
                const spacing = (600 - totalBars * barWidth) / (totalBars + 1);
                const x = spacing + index * (barWidth + spacing);

                // Normalizing bar heights
                const maxVal = 500;
                const benignHeight = Math.min(150, (item.benign / maxVal) * 160);
                const threatHeight = Math.min(150, (item.threats / maxVal) * 160);
                const thresholdHeight = Math.min(160, (item.maxThreshold / maxVal) * 160);

                const isPeak = item.isPeak;

                return (
                  <g
                    key={index}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredBar(item)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* 1. Striped Background Threshold Bar */}
                    <rect
                      x={x}
                      y={170 - thresholdHeight}
                      width={barWidth}
                      height={thresholdHeight}
                      rx="6"
                      fill="url(#stripedThreshold)"
                    />

                    {/* 2. Soft Pastel Blue Bar (Benign Ingress Flow) */}
                    <rect
                      x={x}
                      y={170 - benignHeight}
                      width={barWidth}
                      height={benignHeight}
                      rx="6"
                      fill="#bae6fd"
                      className="opacity-75 group-hover:opacity-100 transition-opacity"
                    />

                    {/* 3. Soft Pastel Pink / Rose Bar (Volumetric Threat Spikes) */}
                    <rect
                      x={x}
                      y={170 - threatHeight}
                      width={barWidth}
                      height={threatHeight}
                      rx="6"
                      fill={isPeak ? "#fb7185" : "#fda4af"}
                      filter={isPeak ? "url(#softSpikeShadow)" : undefined}
                      className="transition-all duration-200"
                    />

                    {/* Peak Tooltip Pill on the 14:00 High-Volume Spike */}
                    {isPeak && (
                      <g transform={`translate(${x + barWidth / 2}, ${170 - threatHeight - 12})`}>
                        <rect
                          x="-60"
                          y="-24"
                          width="120"
                          height="22"
                          rx="11"
                          fill="#111827"
                          className="shadow-md"
                        />
                        <text
                          x="0"
                          y="-9"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="700"
                          textAnchor="middle"
                          fontFamily="Inter, sans-serif"
                        >
                          Peak: 450 threats / hr
                        </text>
                        <polygon points="-4,-2 4,-2 0,3" fill="#111827" />
                      </g>
                    )}

                    {/* Dynamic Hover Tooltip */}
                    {hoveredBar === item && !isPeak && (
                      <g transform={`translate(${x + barWidth / 2}, ${170 - threatHeight - 8})`}>
                        <rect
                          x="-40"
                          y="-20"
                          width="80"
                          height="18"
                          rx="4"
                          fill="#1f2937"
                        />
                        <text
                          x="0"
                          y="-7"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          {item.threats} threats
                        </text>
                      </g>
                    )}

                    {/* X-Axis Time Label */}
                    <text
                      x={x + barWidth / 2}
                      y="190"
                      fill={isPeak ? "#e11d48" : "#94a3b8"}
                      fontSize="10"
                      fontWeight={isPeak ? "700" : "500"}
                      textAnchor="middle"
                      fontFamily="Inter, monospace"
                    >
                      {item.time}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Footer Metrics */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Peak Surge: 14:00 UTC (T1498 Infiltration Flood)
            </span>
            <span className="font-mono text-gray-600 font-semibold">
              Total Ingress: 1,765 incidents evaluated
            </span>
          </div>
        </div>

        {/* Right Column: 2x2 Modules Grid ("Recommended for you" style card - 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                  Security Modules
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Edge intelligence & active correlation engines
                </p>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                4 Active
              </span>
            </div>

            {/* 2x2 Grid of Rounded White Cards with Pastel Circular Icons */}
            <div className="grid grid-cols-2 gap-3.5 my-2">
              {/* Module 1: Critical Incident */}
              <div 
                onClick={() => onNavigateTab && onNavigateTab('incident-hub')}
                className="bg-white hover:bg-rose-50/30 border border-gray-200/80 hover:border-rose-200 rounded-2xl p-4 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-rose-100/90 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                    P1 Critical
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-rose-700 transition-colors">
                    T1498 Flood
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    DoS Anomaly (96%)
                  </p>
                </div>
              </div>

              {/* Module 2: Federated Intelligence Checkpoint */}
              <div 
                onClick={() => onNavigateTab && onNavigateTab('federated-mesh')}
                className="bg-white hover:bg-purple-50/30 border border-gray-200/80 hover:border-purple-200 rounded-2xl p-4 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-purple-100/90 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
                    FLoRA Mesh
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                    Global Round 4
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    Colab Aggregator
                  </p>
                </div>
              </div>

              {/* Module 3: 5 Ingress Sensors */}
              <div 
                onClick={() => onNavigateTab && onNavigateTab('telemetry-matrix')}
                className="bg-white hover:bg-sky-50/30 border border-gray-200/80 hover:border-sky-200 rounded-2xl p-4 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-sky-100/90 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/60">
                    &lt; 2ms
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-sky-700 transition-colors">
                    5 XGB Sensors
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    Network, IAM, Sysmon...
                  </p>
                </div>
              </div>

              {/* Module 4: Local ChromaDB RAG */}
              <div 
                onClick={() => onNavigateTab && onNavigateTab('incident-hub')}
                className="bg-white hover:bg-emerald-50/30 border border-gray-200/80 hover:border-emerald-200 rounded-2xl p-4 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-emerald-100/90 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    858 Chunks
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    ChromaDB Memory
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    Laptop Vector Store
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Client Platform: macOS (arm64)</span>
            <span className="text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1" onClick={() => onNavigateTab && onNavigateTab('incident-hub')}>
              <span>Investigate Playbooks</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. LOWER SECTION: Live Event Telemetry Stream (Clean Light SaaS Table)
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Live Edge Telemetry Ingestion
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                LIVE STREAM
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Real-time classification stream evaluated across the 5 XGBoost edge sensors
            </p>
          </div>

          <PillButton
            size="sm"
            variant="outline"
            onClick={() => onNavigateTab && onNavigateTab('telemetry-matrix')}
          >
            View Telemetry Matrix →
          </PillButton>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-1">Status</th>
                <th className="pb-3">Technique / Label</th>
                <th className="pb-3">Source Entity</th>
                <th className="pb-3">Destination</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Confidence</th>
                <th className="pb-3 text-right pr-1">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
              {recentEvents.map((evt) => {
                const isCritical = evt.statusType === 'critical';
                const isWarning = evt.statusType === 'warning';
                return (
                  <tr key={evt.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="py-3.5 pl-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                        }`} />
                        <span className={`font-semibold ${
                          isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {evt.status}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 font-semibold text-gray-900">
                      {evt.technique}
                    </td>

                    <td className="py-3.5 font-mono text-[11px] text-gray-600">
                      {evt.source}
                    </td>

                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200/60 font-mono text-[11px]">
                        {evt.dest}
                      </span>
                    </td>

                    <td className="py-3.5 font-mono text-[11px] text-gray-500">
                      {evt.time}
                    </td>

                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${evt.confidence}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-gray-700">
                          {evt.confidence}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 pr-1 text-right">
                      <button 
                        onClick={() => onNavigateTab && onNavigateTab('incident-hub')}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

