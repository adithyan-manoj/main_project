import React, { useState } from 'react';
import SlimSidebar from '../components/layout/SlimSidebar';
import DashboardHeader from '../components/layout/DashboardHeader';
import CommandCenter from './CommandCenter';
import IncidentHub from './IncidentHub';
import TelemetryMatrix from './TelemetryMatrix';
import FederatedMesh from './FederatedMesh';
import HostHealth from './HostHealth';
import Sandbox from './Sandbox';

/**
 * Main Client Dashboard Layout Shell
 * Follows the Light SaaS aesthetic:
 * - Subtle light grey dotted grid pattern on soft greenish/grey backdrop
 * - Slim dark persistent sidebar on the left
 * - Large, heavily rounded-3xl white workspace container
 * - Responsive view switching between the 6 specification views
 */
export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('command-center');
  const [configOpen, setConfigOpen] = useState(false);

  // Dynamic host identity matching user's system
  const hostInfo = {
    title: "Adithyan's MacBook Air",
    nodeId: "Adithyans-MacBook-Air",
    os: "macOS Darwin (arm64)",
    role: "Autonomous Sentinel"
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#eef1f5] text-gray-800 font-sans select-none">
      {/* 1. Left Persistent Slim Dark Sidebar */}
      <SlimSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* 2. Main Outer Canvas with Subtle Dotted Grid Pattern */}
      <div className="flex-1 h-full overflow-hidden p-3 sm:p-4 lg:p-5 bg-dotted-pattern flex flex-col">
        {/* 3. Main Workspace Container (Large, heavily rounded-3xl white container with soft shadow) */}
        <main className="flex-1 h-full overflow-y-auto bg-white/95 backdrop-blur-md rounded-3xl sm:rounded-[32px] border border-gray-200/80 shadow-md p-6 sm:p-8 lg:p-9 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header & View Navigation Pill Tabs */}
            <DashboardHeader
              hostTitle={hostInfo.title}
              nodeId={hostInfo.nodeId}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              onOpenConfig={() => setConfigOpen(!configOpen)}
            />

            {/* Config Banner (if opened) */}
            {configOpen && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">Sentinel Configuration:</span>
                  <span>Port 8000 • Ingress Triage: 5 Classifiers • ChromaDB Memory: Enabled</span>
                </div>
                <button
                  onClick={() => setConfigOpen(false)}
                  className="font-semibold text-slate-500 hover:text-slate-800"
                >
                  Close
                </button>
              </div>
            )}

            {/* View Routing */}
            <div className="pt-2">
              {activeTab === 'command-center' && (
                <CommandCenter onNavigateTab={setActiveTab} />
              )}
              {activeTab === 'incident-hub' && (
                <IncidentHub />
              )}
              {activeTab === 'telemetry-matrix' && (
                <TelemetryMatrix />
              )}
              {activeTab === 'federated-mesh' && (
                <FederatedMesh />
              )}
              {activeTab === 'host-health' && (
                <HostHealth />
              )}
              {activeTab === 'sandbox' && (
                <Sandbox />
              )}
            </div>
          </div>

          {/* Clean Light Footer */}
          <footer className="pt-8 mt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-medium gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>FedThreat Sentinel Client v3.2</span>
              <span>•</span>
              <span className="font-mono text-gray-600">Local Vector Memory (ChromaDB)</span>
            </div>
            <div className="font-mono text-[11px] text-gray-500">
              100% Parameter Isolation • Zero Raw Telemetry Transmitted
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

