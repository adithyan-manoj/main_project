import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  MoreVertical, 
  ExternalLink,
  Copy,
  Ban,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

const INITIAL_EVENTS = [
  {
    id: 'evt-01',
    status: 'threat',
    statusText: 'Blocked',
    timestamp: '14:32:05.102',
    src: '10.0.4.12:51240',
    dst: '192.168.1.1:443',
    protocol: 'TCP / 443',
    confidence: 98,
    isVolumetric: true,
    category: 'T1498 DoS Flood'
  },
  {
    id: 'evt-02',
    status: 'benign',
    statusText: 'Benign',
    timestamp: '14:32:04.882',
    src: '172.16.0.44:49812',
    dst: '192.168.1.1:443',
    protocol: 'TCP / 443',
    confidence: 99,
    isVolumetric: false,
    category: 'Normal TLS'
  },
  {
    id: 'evt-03',
    status: 'threat',
    statusText: 'Blocked',
    timestamp: '14:32:03.415',
    src: '198.51.100.89:3389',
    dst: '192.168.1.1:3389',
    protocol: 'TCP / 3389',
    confidence: 94,
    isVolumetric: true,
    category: 'T1110 Brute Force'
  },
  {
    id: 'evt-04',
    status: 'benign',
    statusText: 'Benign',
    timestamp: '14:32:02.190',
    src: '10.0.2.15:53210',
    dst: '192.168.1.1:53',
    protocol: 'UDP / 53',
    confidence: 97,
    isVolumetric: false,
    category: 'DNS Query'
  },
  {
    id: 'evt-05',
    status: 'anomaly',
    statusText: 'Anomaly',
    timestamp: '14:32:00.045',
    src: '203.0.113.12:8080',
    dst: '192.168.1.1:80',
    protocol: 'TCP / 80',
    confidence: 91,
    isVolumetric: true,
    category: 'Zero-Day Probe'
  },
  {
    id: 'evt-06',
    status: 'benign',
    statusText: 'Benign',
    timestamp: '14:31:58.761',
    src: '10.0.1.200:44120',
    dst: '192.168.1.1:443',
    protocol: 'TCP / 443',
    confidence: 100,
    isVolumetric: false,
    category: 'Normal HTTPS'
  }
];

export default function TelemetryTable({ externalEvent, onInspectPayload }) {
  const [filterQuery, setFilterQuery] = useState('');
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const menuRef = useRef(null);

  // Close kebab menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Prepend live event from backend / demo trigger
  useEffect(() => {
    if (externalEvent) {
      const isThreat = externalEvent.status === 'anomaly_detected' || externalEvent.xgboost_score === 1;
      const newEntry = {
        id: `evt-${Date.now()}`,
        status: isThreat ? 'threat' : 'benign',
        statusText: isThreat ? 'Blocked' : 'Benign',
        timestamp: new Date().toLocaleTimeString() + '.' + Math.floor(Math.random() * 900 + 100),
        src: '192.168.1.100:54210',
        dst: `192.168.1.1:${externalEvent.dstPort || 443}`,
        protocol: `${externalEvent.protocol || 'TCP'} / ${externalEvent.dstPort || 443}`,
        confidence: externalEvent.securebert_confidence 
          ? Math.round(externalEvent.securebert_confidence * 100) 
          : (isThreat ? 96 : 100),
        isVolumetric: isThreat,
        category: externalEvent.securebert_classification || (isThreat ? 'T1498 DoS Flood' : 'Normal Flow')
      };
      setEvents(prev => [newEntry, ...prev.slice(0, 8)]);
    }
  }, [externalEvent]);

  const filteredEvents = events.filter(e => 
    e.src.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.dst.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.protocol.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleCopyIp = (src, id) => {
    navigator.clipboard.writeText(src);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    setActiveMenuId(null);
  };

  return (
    <div className="bg-[#0d0f12] border border-[#1a1e27] hover:border-[#262d3a] rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-md">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Live Event Telemetry
            </h2>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#12151c] border border-[#1f2533] text-gray-400">
              {filteredEvents.length} Captured
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time Edge Sensor Telemetry Stream (XGBoost Stage 1 Filter)
          </p>
        </div>

        {/* Search, Filter, and Streaming Indicator (All standardized h-8.5) */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter IP, port, technique..."
              className="w-full h-8.5 bg-[#07080b] border border-[#1a1e27] hover:border-gray-700 focus:border-emerald-500 rounded-xl pl-8 pr-3 text-xs text-gray-200 placeholder-gray-500 outline-none transition-all"
            />
          </div>

          {/* Filter Button */}
          <button className="flex items-center gap-1.5 h-8.5 px-3 rounded-xl bg-[#07080b] border border-[#1a1e27] hover:border-gray-700 text-xs text-gray-400 hover:text-gray-200 transition-colors active:scale-95 cursor-pointer">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Streaming Status Pill */}
          <div className="flex items-center gap-1.5 h-8.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden sm:inline">LIVE</span>
          </div>
        </div>
      </div>

      {/* The Data Table */}
      <div className="overflow-x-auto min-h-[300px]" ref={menuRef}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1a1e27] text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
              <th className="pb-3 pl-2">Status</th>
              <th className="pb-3">Timestamp</th>
              <th className="pb-3">Source / Destination</th>
              <th className="pb-3">Protocol</th>
              <th className="pb-3">Telemetry Wave</th>
              <th className="pb-3">AI Confidence</th>
              <th className="pb-3 pr-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141822]">
            {filteredEvents.map((evt, index) => {
              const isThreat = evt.status === 'threat';
              const isAnomaly = evt.status === 'anomaly';
              const isMenuOpen = activeMenuId === evt.id;

              return (
                <tr 
                  key={evt.id}
                  className="hover:bg-[#12161f]/70 transition-colors group text-xs text-gray-300"
                >
                  {/* Status Column */}
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        isThreat 
                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' 
                          : isAnomaly
                          ? 'bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]'
                          : 'bg-emerald-500'
                      }`}></span>
                      <span className={`font-semibold ${
                        isThreat ? 'text-rose-400' : isAnomaly ? 'text-purple-400' : 'text-emerald-400'
                      }`}>
                        {evt.statusText}
                      </span>
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3.5 font-mono text-[11px] text-gray-400">
                    {evt.timestamp}
                  </td>

                  {/* Source / Dest */}
                  <td className="py-3.5 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5 text-gray-200">
                      <span className="text-gray-300">{evt.src}</span>
                      <span className="text-gray-600">→</span>
                      <span className="text-gray-400">{evt.dst}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 block">
                      {evt.category}
                    </span>
                  </td>

                  {/* Protocol */}
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded bg-[#13161f] border border-[#1f2430] text-[11px] font-mono text-gray-300">
                      {evt.protocol}
                    </span>
                  </td>

                  {/* Telemetry Sparkline Wave */}
                  <td className="py-3.5">
                    <div className="w-20 h-5">
                      <svg viewBox="0 0 60 16" className="w-full h-full">
                        <path
                          d={evt.isVolumetric 
                            ? "M0,14 Q8,2 15,10 T30,2 T45,12 T60,1" 
                            : "M0,10 Q10,8 20,9 T40,8 T60,10"
                          }
                          fill="none"
                          stroke={isThreat ? "#ef4444" : isAnomaly ? "#8b5cf6" : "#10b981"}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </td>

                  {/* AI Confidence Progress Bar */}
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-24 bg-[#141822] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isThreat ? 'bg-rose-500' : isAnomaly ? 'bg-purple-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${evt.confidence}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-[11px] text-gray-300 font-medium">
                        {evt.confidence}%
                      </span>
                    </div>
                  </td>

                  {/* Action Kebab Menu */}
                  <td className="py-3.5 pr-2 text-right relative">
                    <button
                      onClick={() => setActiveMenuId(isMenuOpen ? null : evt.id)}
                      className="w-7 h-7 rounded-lg hover:bg-[#1a202c] text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center ml-auto active:scale-95 cursor-pointer"
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover Menu (positioned above if on bottom rows) */}
                    {isMenuOpen && (
                      <div className={`absolute right-2 z-40 bg-[#12151c] border border-[#262e3d] rounded-xl shadow-2xl p-1.5 w-44 text-left animate-in fade-in ${
                        index > 3 ? 'bottom-8' : 'top-10'
                      }`}>
                        <button
                          onClick={() => handleCopyIp(evt.src, evt.id)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          {copiedId === evt.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          <span>{copiedId === evt.id ? 'Copied IP' : 'Copy Source IP'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onInspectPayload) onInspectPayload(evt);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                          <span>Inspect Payload</span>
                        </button>

                        <button
                          onClick={() => {
                            alert(`Quarantined IP: ${evt.src}`);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5 text-rose-400" />
                          <span>Block & Quarantine</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
