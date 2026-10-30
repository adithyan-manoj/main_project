import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

const TIME_RANGES = ['1H', '24H', '7D', '1W', '1M'];

const FALLBACK_HOURLY_DATA = [
  { time: '02:00', value: 45, isPeak: false },
  { time: '04:00', value: 30, isPeak: false },
  { time: '06:00', value: 65, isPeak: false },
  { time: '08:00', value: 120, isPeak: false },
  { time: '10:00', value: 180, isPeak: false },
  { time: '12:00', value: 210, isPeak: false },
  { time: '14:00', value: 450, isPeak: true },
  { time: '16:00', value: 290, isPeak: false },
  { time: '18:00', value: 160, isPeak: false },
  { time: '20:00', value: 95, isPeak: false },
  { time: '22:00', value: 70, isPeak: false },
  { time: '24:00', value: 50, isPeak: false },
];

export default function TemporalVolumeBarChart({ refreshTrigger }) {
  const [activeRange, setActiveRange] = useState('24H');
  const [hoveredBar, setHoveredBar] = useState(null);
  const [timelineData, setTimelineData] = useState(FALLBACK_HOURLY_DATA);
  const [peakDetails, setPeakDetails] = useState({ hour: '14:00', value: 450 });
  const [totalInPeriod, setTotalInPeriod] = useState(1765);

  // Fetch real temporal attack graph from backend
  useEffect(() => {
    let isMounted = true;
    const fetchVolume = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/temporal_volume?time_range=${activeRange}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.data && data.data.length > 0) {
            setTimelineData(data.data);
            if (data.peak_hour && data.peak_value) {
              setPeakDetails({ hour: data.peak_hour, value: data.peak_value });
            }
            if (data.total_in_period) {
              setTotalInPeriod(data.total_in_period);
            }
          }
        }
      } catch {
        // Fallback intact if backend offline
      }
    };

    fetchVolume();
  }, [activeRange, refreshTrigger]);

  const maxValue = Math.max(...timelineData.map(d => d.value), 500);
  const chartHeight = 175;

  return (
    <div className="bg-[#0d0f12] border border-[#1a1e27] hover:border-[#262d3a] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-md h-full">
      {/* Header with Title and Time Filter Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Temporal Attack Volume
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real Ingress Incident Velocity & Historical Spikes
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1 bg-[#07080b] p-1 rounded-xl border border-[#1a1e27]">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                activeRange === range
                  ? 'bg-[#181d27] text-white shadow-sm border border-[#262d3a]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Bar Chart with Glowing Spike */}
      <div className="relative w-full my-2 pt-6 pb-2">
        <svg 
          viewBox="0 0 600 220" 
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Glowing Gradient for Active Spike Bar */}
            <linearGradient id="emeraldSpikeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="60%" stopColor="#05df72" stopOpacity="0.85" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.15)" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="emeraldGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Standard Bar Gradient */}
            <linearGradient id="darkBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#252b38" />
              <stop offset="100%" stopColor="#131720" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[50, 100, 150].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="600"
              y2={y}
              stroke="#161a22"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}

          {/* Render Bars */}
          {timelineData.map((item, index) => {
            const barWidth = 24;
            const barSpacing = (600 - timelineData.length * barWidth) / (timelineData.length + 1);
            const x = barSpacing + index * (barWidth + barSpacing);
            const barHeight = Math.max(6, (item.value / maxValue) * chartHeight);
            const y = 190 - barHeight;
            const isHighlighted = item.isPeak;

            return (
              <g 
                key={index} 
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredBar(item)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Background column highlight on hover */}
                <rect
                  x={x - 4}
                  y="20"
                  width={barWidth + 8}
                  height={170}
                  fill="white"
                  fillOpacity="0"
                  className="hover:fill-white/5 transition-colors rounded-lg"
                />

                {/* The Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  ry="6"
                  fill={isHighlighted ? "url(#emeraldSpikeGradient)" : "url(#darkBarGradient)"}
                  filter={isHighlighted ? "url(#emeraldGlow)" : undefined}
                  className="transition-all duration-300"
                />

                {/* Tooltip Badge for the Peak Spike */}
                {isHighlighted && (
                  <g transform={`translate(${x + barWidth / 2}, ${y - 12})`}>
                    <rect
                      x="-65"
                      y="-26"
                      width="130"
                      height="24"
                      rx="12"
                      fill="#10b981"
                      className="shadow-lg"
                    />
                    <text
                      x="0"
                      y="-10"
                      fill="#060709"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="Inter, sans-serif"
                    >
                      High Volume: {item.value} threats
                    </text>
                    <polygon
                      points="-4,-2 4,-2 0,4"
                      fill="#10b981"
                    />
                  </g>
                )}

                {/* Dynamic hover tooltip for other bars */}
                {hoveredBar === item && !isHighlighted && (
                  <g transform={`translate(${x + barWidth / 2}, ${y - 8})`}>
                    <rect
                      x="-38"
                      y="-22"
                      width="76"
                      height="20"
                      rx="4"
                      fill="#1c222e"
                      stroke="#2b3345"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="-8"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                      fontFamily="Inter, sans-serif"
                    >
                      {item.value} threats
                    </text>
                  </g>
                )}

                {/* X-Axis Time Label */}
                <text
                  x={x + barWidth / 2}
                  y="208"
                  fill={isHighlighted ? "#10b981" : "#64748b"}
                  fontSize="11"
                  fontWeight={isHighlighted ? "bold" : "normal"}
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
      <div className="flex items-center justify-between pt-3 border-t border-[#1a1e27] text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Peak Spike: {peakDetails.hour} ({peakDetails.value} Ingress Events)
        </span>
        <span className="font-mono text-gray-400">
          Period Total: {totalInPeriod} threats
        </span>
      </div>
    </div>
  );
}
