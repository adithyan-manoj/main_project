import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldAlert } from 'lucide-react';

const FALLBACK_THREAT_DATA = [
  { name: 'Denial of Service (DoS)', value: 41, count: 58, color: '#ef4444' },
  { name: 'Port Scanning & Recon', value: 25, count: 35, color: '#f97316' },
  { name: 'Brute Force / IAM', value: 15, count: 22, color: '#f59e0b' },
  { name: 'Zero-Day / Novelty', value: 12, count: 17, color: '#8b5cf6' },
  { name: 'Web / API Injection', value: 7, count: 10, color: '#10b981' },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#12151c] border border-[#222733] rounded-lg p-2.5 shadow-xl text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }}></span>
          <span className="font-semibold text-white">{data.name}</span>
        </div>
        <div className="text-gray-400">
          Distribution: <span className="text-white font-mono font-medium">{data.value}%</span> ({data.count} incidents)
        </div>
      </div>
    );
  }
  return null;
};

export default function ThreatDistributionDonut({ totalBlocked, refreshTrigger }) {
  const [categories, setCategories] = useState(FALLBACK_THREAT_DATA);
  const [displayTotal, setDisplayTotal] = useState(totalBlocked || 142);

  // Fetch real threat distribution from backend
  useEffect(() => {
    let isMounted = true;
    const fetchDistribution = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/threat_distribution');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.categories && data.categories.length > 0) {
              setCategories(data.categories);
            }
            if (data.total_blocked) {
              setDisplayTotal(data.total_blocked);
            }
          }
        }
      } catch {
        // Keeps graceful fallback if backend is offline
      }
    };

    fetchDistribution();
  }, [refreshTrigger, totalBlocked]);

  return (
    <div className="bg-[#0d0f12] border border-[#1a1e27] hover:border-[#262d3a] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-md h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            Threat Distribution
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Local ChromaDB Vector Incident Memory
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#13161f] border border-[#1f2430] text-purple-400">
          ChromaDB RAG
        </span>
      </div>

      {/* Donut Chart with Center Text */}
      <div className="relative w-full h-56 flex items-center justify-center my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={categories}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={92}
              paddingAngle={4}
              dataKey="value"
              stroke="#0d0f12"
              strokeWidth={3}
            >
              {categories.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="transition-all hover:opacity-80 cursor-pointer"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text (Total Blocked Events) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-white tracking-tight font-sans">
            {displayTotal}
          </span>
          <span className="text-[10px] tracking-widest font-semibold uppercase text-gray-400 mt-0.5">
            TOTAL BLOCKED
          </span>
        </div>
      </div>

      {/* Legend Matching Reference Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-[#1a1e27]">
        {categories.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <span 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-gray-300 truncate font-medium">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 font-mono text-[11px]">
              <span className="text-white font-semibold">{item.value}%</span>
              <span className="text-gray-600">({item.count})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
