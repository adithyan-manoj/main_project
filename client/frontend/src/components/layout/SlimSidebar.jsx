import React from 'react';
import { 
  Home, 
  Share2, 
  Puzzle, 
  ShieldCheck, 
  Layers,
  Activity,
  User
} from 'lucide-react';

/**
 * Slim dark persistent sidebar matching professional SOC standards:
 * - Dark/charcoal background (#111215)
 * - Slim width (~68px)
 * - Primary navigation icons with tooltips & active indicators
 * - Functional User Profile Avatar at the bottom (routes to Operator Profile)
 * - Zero redundant dummy buttons
 */
export default function SlimSidebar({ activeTab, onSelectTab, onOpenConfig }) {
  const topNavItems = [
    { id: 'command-center', label: 'Command Center', icon: Home },
    { id: 'incident-hub', label: 'Incident Hub', icon: ShieldCheck },
    { id: 'telemetry-matrix', label: 'Telemetry Matrix', icon: Layers },
    { id: 'federated-mesh', label: 'Federated Mesh', icon: Share2 },
    { id: 'host-health', label: 'Host Health', icon: Activity },
    { id: 'sandbox', label: 'Simulation Sandbox', icon: Puzzle },
  ];

  const isProfileActive = activeTab === 'profile';

  return (
    <aside className="w-[68px] bg-[#111215] text-gray-400 flex flex-col items-center justify-between py-6 flex-shrink-0 z-20 h-full select-none">
      {/* Top Section: Logo & Primary Nav */}
      <div className="flex flex-col items-center gap-7 w-full">
        {/* Brand Shield Logo */}
        <div 
          onClick={() => onSelectTab && onSelectTab('command-center')}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-900 to-gray-800 border border-gray-700/60 flex items-center justify-center text-emerald-400 shadow-sm cursor-pointer hover:border-emerald-500/50 transition-colors"
          title="FedThreat Sentinel"
        >
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>

        {/* Primary View Icons */}
        <nav className="flex flex-col items-center gap-2.5 w-full px-2">
          {topNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab && onSelectTab(item.id)}
                title={item.label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative group cursor-pointer ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-md scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {/* Tooltip on hover */}
                <div className="absolute left-14 bg-gray-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-gray-800">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Operator Profile Avatar (Direct link to Profile page) */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        {/* Subtle separator */}
        <div className="w-8 h-[1px] bg-gray-800/80 mb-1" />

        {/* User Profile Avatar */}
        <button
          onClick={() => onSelectTab && onSelectTab('profile')}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center relative group cursor-pointer transition-all duration-150 ${
            isProfileActive
              ? 'ring-2 ring-emerald-400 bg-white/10 shadow-lg scale-105'
              : 'hover:ring-1 hover:ring-white/30'
          }`}
          title="Operator Profile: Adithyan Manoj"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-emerald-400 flex items-center justify-center text-xs font-black text-white shadow-sm">
            AM
          </div>
          {/* Active online green badge */}
          <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#111215]" />

          {/* Tooltip */}
          <div className="absolute left-14 bg-gray-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-gray-800">
            Operator Profile (Adithyan Manoj)
          </div>
        </button>
      </div>
    </aside>
  );
}
