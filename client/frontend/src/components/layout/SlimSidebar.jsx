import React from 'react';
import { 
  Home, 
  Share2, 
  Puzzle, 
  Link2, 
  Globe, 
  Settings, 
  ShieldCheck, 
  Layers,
  Activity
} from 'lucide-react';

/**
 * Slim dark persistent sidebar matching the reference layout:
 * - Dark/charcoal background (#121316)
 * - Slim width (~68px)
 * - Navigation icons with tooltips & active indicators
 * - User avatar at the bottom
 */
export default function SlimSidebar({ activeTab, onSelectTab }) {
  const topNavItems = [
    { id: 'command-center', label: 'Command Center', icon: Home },
    { id: 'incident-hub', label: 'Incident Hub', icon: ShieldCheck },
    { id: 'telemetry-matrix', label: 'Telemetry Matrix', icon: Layers },
    { id: 'federated-mesh', label: 'Federated Mesh', icon: Share2 },
    { id: 'host-health', label: 'Host Health', icon: Activity },
    { id: 'sandbox', label: 'Simulation Sandbox', icon: Puzzle },
  ];

  const bottomNavItems = [
    { id: 'links', label: 'Cloud Gateway', icon: Link2 },
    { id: 'network', label: 'Federated Network', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[68px] bg-[#111215] text-gray-400 flex flex-col items-center justify-between py-6 flex-shrink-0 z-20 h-full select-none">
      {/* Top Section: Logo & Primary Nav */}
      <div className="flex flex-col items-center gap-7 w-full">
        {/* Brand Shield Logo */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-900 to-gray-800 border border-gray-700/60 flex items-center justify-center text-emerald-400 shadow-sm cursor-pointer hover:border-emerald-500/50 transition-colors">
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

      {/* Bottom Section: Secondary Tools & User Avatar */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              title={item.label}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors relative group cursor-pointer"
            >
              <Icon className="w-4 h-4" />
              <div className="absolute left-14 bg-gray-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-gray-800">
                {item.label}
              </div>
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-8 h-[1px] bg-gray-800 my-1" />

        {/* User Profile Avatar */}
        <div 
          className="relative cursor-pointer group"
          title="Security Operator: Adithyan Manoj"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-sm hover:ring-2 hover:ring-emerald-400 transition-all">
            AM
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#111215]" />
          <div className="absolute left-14 bg-gray-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-gray-800">
            Adithyan Manoj (Sentinel Admin)
          </div>
        </div>
      </div>
    </aside>
  );
}

