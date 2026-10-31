import React from 'react';
import { Settings, ShieldCheck, Cpu } from 'lucide-react';
import PillButton from '../common/PillButton';

/**
 * Top Header & Pill Navigation Shell
 * Replicates the SaaS reference header with host identity, pill tabs, and top-right actions.
 */
export default function DashboardHeader({
  hostTitle = "Adithyan's MacBook Air",
  nodeId = "Adithyans-MacBook-Air",
  arch = "arm64 • Apple Silicon",
  isFederated = true,
  activeTab = "command-center",
  onSelectTab,
  onOpenConfig,
}) {
  const tabs = [
    { id: 'command-center', label: 'Command Center' },
    { id: 'incident-hub', label: 'Incident Hub' },
    { id: 'telemetry-matrix', label: 'Telemetry Matrix' },
    { id: 'federated-mesh', label: 'Federated Mesh' },
    { id: 'host-health', label: 'Host Health' },
    { id: 'sandbox', label: 'Sandbox' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="flex flex-col gap-5 pb-6 border-b border-gray-200/70">
      {/* Top Row: Host Identity & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Host Title & Architecture pill */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">
              Edge Sentinel Node
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200/60">
              {nodeId}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1 flex items-center gap-3">
            <span>{hostTitle}</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60 font-mono">
              {arch}
            </span>
          </h1>
        </div>

        {/* Right: Actions (Config + Federated Connectivity Badge) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* ⚙ Config Pill Button */}
          <PillButton
            variant="outline"
            icon={Settings}
            onClick={onOpenConfig}
            className="hover:shadow-sm"
          >
            Config
          </PillButton>

          {/* ● ONLINE • FEDERATED Status Badge (Clickable: opens Federated Mesh view) */}
          <div 
            onClick={() => onSelectTab && onSelectTab('federated-mesh')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide border shadow-2xs select-none cursor-pointer transition-all active:scale-95 ${
              isFederated 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70' 
                : 'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/70'
            }`}
            title="Click to view Federated Intelligence & Mesh"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isFederated ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isFederated ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <span>{isFederated ? 'ONLINE • FEDERATED' : 'OFFLINE • STANDBY'}</span>
            <Cpu className={`w-3.5 h-3.5 ml-0.5 ${isFederated ? 'text-emerald-600/80' : 'text-amber-600/80'}`} />
          </div>
        </div>
      </div>

      {/* Bottom Row: View Navigation Pill Tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab && onSelectTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200/80 shadow-2xs'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

