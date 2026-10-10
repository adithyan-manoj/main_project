import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Bell, 
  SlidersHorizontal, 
  Cpu, 
  Layers, 
  ExternalLink,
  Wifi
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardHeader({ 
  onOpenLeftDrawer, 
  onOpenRightDrawer, 
  searchQuery, 
  setSearchQuery,
  isBackendConnected = true 
}) {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-[#1a1e27]">
      {/* LEFT: Organization Profile & Quick Drawer Toggles */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Alpha Banking Corp
              </h1>
              <span className="text-gray-600 font-light">|</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#12161f] border border-[#1f2533] text-gray-300 font-medium">
                MAC-EDGE-01
              </span>
            </div>
            <p className="text-[11px] text-gray-500 tracking-wide mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Autonomous Sentinel • US-East Cluster</span>
              {isBackendConnected && (
                <span className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-0.5 ml-1">
                  (API Live)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Ingestion Toggle Button (Mobile) */}
        <button
          onClick={onOpenLeftDrawer}
          className="md:hidden flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#0d0f12] border border-[#1a1e27] text-xs text-gray-300 hover:text-white active:scale-95 transition-all"
          title="Open Data Ingestion Inspector"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Streams</span>
        </button>
      </div>

      {/* CENTER: Pill-Shaped Search Input */}
      <div className="w-full md:max-w-md relative flex-1">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search IPs, CVEs, MITRE IDs..."
            className="w-full h-9 bg-[#0d0f12] border border-[#1a1e27] hover:border-[#282f3d] focus:border-emerald-500/80 rounded-full pl-10 pr-12 text-xs text-gray-200 placeholder-gray-500 transition-all outline-none shadow-inner focus:ring-1 focus:ring-emerald-500/30"
          />
          <span className="absolute right-3 text-[10px] text-gray-500 font-mono border border-[#222733] bg-[#12151c] px-1.5 py-0.5 rounded pointer-events-none">
            ⌘K
          </span>
        </div>
      </div>

      {/* RIGHT: Standardized h-9 Action Controls */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
        {/* Multi-Modal Ingestion Button */}
        <button
          onClick={onOpenLeftDrawer}
          className="hidden md:flex items-center gap-2 h-9 px-3.5 rounded-full bg-[#0d0f12] border border-[#1a1e27] hover:border-blue-500/40 text-xs font-medium text-gray-300 hover:text-white transition-all hover:bg-[#131720] active:scale-95 cursor-pointer shadow-sm"
          title="Inspect Multi-Modal Telemetry Streams"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span>Data Ingestion</span>
        </button>

        {/* Glowing Federated Status Badge / Action Button */}
        <button
          onClick={onOpenRightDrawer}
          className="flex items-center gap-2 h-9 px-3.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95 flex-shrink-0"
          title="Click to open Federated Controls & Simulation Deck"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>ONLINE • FEDERATED</span>
          <Cpu className="w-3 h-3 text-emerald-400/80 ml-0.5" />
        </button>

        {/* Global Cloud Aggregator Link */}
        <Link
          to="/cloud"
          className="hidden xl:flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#0d0f12] border border-[#1a1e27] hover:border-gray-700 text-xs font-medium text-gray-400 hover:text-gray-200 transition-all active:scale-95 flex-shrink-0"
          title="Switch to Cloud Aggregator View"
        >
          <span>Cloud View</span>
          <ExternalLink className="w-3 h-3 text-gray-500" />
        </Link>

        {/* Notification Bell */}
        <div className="relative flex-shrink-0">
          <button 
            className="w-9 h-9 rounded-full bg-[#0d0f12] border border-[#1a1e27] hover:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-all active:scale-95 cursor-pointer"
            title="Notifications (3 Active)"
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-[#060709]">
            3
          </span>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-[#1a1e27] flex-shrink-0">
          <div className="relative cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 border border-[#252b38] flex items-center justify-center text-xs font-bold text-white shadow-sm hover:scale-105 transition-transform">
              AM
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#060709]"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
