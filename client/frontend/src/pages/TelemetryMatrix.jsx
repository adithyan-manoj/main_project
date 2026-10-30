import React, { useState } from 'react';
import { 
  Network, 
  KeyRound, 
  Terminal, 
  Globe, 
  Cloud, 
  Search, 
  SlidersHorizontal, 
  MoreVertical, 
  Copy, 
  Check, 
  X,
  Cpu,
  Layers
} from 'lucide-react';
import DiscreteProgressBar from '../components/common/DiscreteProgressBar';
import PillButton from '../components/common/PillButton';

export default function TelemetryMatrix() {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSensor, setSelectedSensor] = useState('all');
  const [selectedPayload, setSelectedPayload] = useState(null);
  const [copied, setCopied] = useState(false);

  // 5 Specialized Ingress Triage Sensors (Phase 3 Models)
  const sensors = [
    {
      id: 'network',
      name: 'Network Flow Sensor',
      dataset: 'CIC-IDS2018',
      icon: Network,
      rate: '1,240 pkts/s',
      latency: '1.8 ms',
      accuracy: '99.82%',
      status: 'Active',
      color: 'blue',
      topFeatures: 'Dst Port, Flow Duration, Packets/s'
    },
    {
      id: 'auth',
      name: 'Auth & IAM Sensor',
      dataset: 'BGL / Syslog',
      icon: KeyRound,
      rate: '14 events/min',
      latency: '1.2 ms',
      accuracy: '99.41%',
      status: 'Active',
      color: 'pink',
      topFeatures: 'failed_attempts, ip_entropy, hour'
    },
    {
      id: 'sysmon',
      name: 'Host Sysmon Sensor',
      dataset: 'DARPA TC / Sysmon',
      icon: Terminal,
      rate: '94 logs/s',
      latency: '1.4 ms',
      accuracy: '99.18%',
      status: 'Active',
      color: 'purple',
      topFeatures: 'process_depth, privileged_syscall'
    },
    {
      id: 'web',
      name: 'Web HTTP / API Sensor',
      dataset: 'CSIC 2010',
      icon: Globe,
      rate: '45 req/s',
      latency: '1.1 ms',
      accuracy: '99.64%',
      status: 'Active',
      color: 'green',
      topFeatures: 'payload_entropy, sqli_signature'
    },
    {
      id: 'cloud',
      name: 'Cloud Audit Sensor',
      dataset: 'AWS CloudTrail',
      icon: Cloud,
      rate: '8 events/min',
      latency: '1.5 ms',
      accuracy: '99.55%',
      status: 'Active',
      color: 'amber',
      topFeatures: 'AssumeRoleCount, error_rate'
    },
  ];

  const streamEvents = [
    {
      id: 'flow-101',
      sensor: 'network',
      sensorName: 'Network Sensor',
      status: 'Blocked',
      statusType: 'critical',
      timestamp: '14:32:05.102',
      source: '10.0.4.12:51240',
      destination: '192.168.1.1:443 (TCP)',
      classification: 'T1498 SYN Flood',
      confidence: 96,
      payload: {
        Dst_Port: 443,
        Protocol: "TCP",
        Tot_Fwd_Pkts: 4500,
        Tot_Bwd_Pkts: 10,
        Flow_Duration: 12000,
        Fwd_Pkt_Len_Max: 1460,
        XGBoost_Score: 1
      }
    },
    {
      id: 'flow-102',
      sensor: 'auth',
      sensorName: 'Auth Sensor',
      status: 'Blocked',
      statusType: 'warning',
      timestamp: '14:32:03.415',
      source: '198.51.100.89',
      destination: 'Internal LDAP / SSH',
      classification: 'T1110 Failed Login Spike',
      confidence: 94,
      payload: {
        Service: "SSH",
        Failed_Attempts: 8,
        Time_Window_Sec: 30,
        IP_Entropy: 3.42,
        XGBoost_Score: 1
      }
    },
    {
      id: 'flow-103',
      sensor: 'network',
      sensorName: 'Network Sensor',
      status: 'Benign',
      statusType: 'normal',
      timestamp: '14:32:01.882',
      source: '172.16.0.44:49812',
      destination: '192.168.1.1:443 (TCP)',
      classification: 'Standard TLS Handshake',
      confidence: 99,
      payload: {
        Dst_Port: 443,
        Protocol: "TCP",
        Tot_Fwd_Pkts: 12,
        Tot_Bwd_Pkts: 14,
        Flow_Duration: 140,
        XGBoost_Score: 0
      }
    },
    {
      id: 'flow-104',
      sensor: 'web',
      sensorName: 'Web HTTP',
      status: 'Blocked',
      statusType: 'critical',
      timestamp: '14:31:45.020',
      source: '203.0.113.12',
      destination: 'API /api/v1/transfer',
      classification: 'T1059 SQL Injection Probe',
      confidence: 92,
      payload: {
        Method: "POST",
        URI: "/api/v1/transfer",
        Payload_Entropy: 4.89,
        Matched_Pattern: "UNION SELECT password_hash",
        XGBoost_Score: 1
      }
    },
  ];

  const handleCopyJson = () => {
    if (selectedPayload) {
      navigator.clipboard.writeText(JSON.stringify(selectedPayload.payload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredEvents = streamEvents.filter(evt => {
    const matchesSensor = selectedSensor === 'all' || evt.sensor === selectedSensor;
    const matchesSearch = evt.source.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          evt.classification.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          evt.destination.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesSensor && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Sensor Ingress Suite Grid (5 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Ingress Sensor Matrix
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              5 localized XGBoost classifiers running &lt; 2ms triage across edge telemetry channels
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            ALL 5 SENSORS ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {sensors.map((sensor) => {
            const Icon = sensor.icon;
            const isSelected = selectedSensor === sensor.id;
            return (
              <div
                key={sensor.id}
                onClick={() => setSelectedSensor(selectedSensor === sensor.id ? 'all' : sensor.id)}
                className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between ${
                  isSelected ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      {sensor.latency}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-gray-900 leading-tight">
                    {sensor.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{sensor.dataset}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[11px] text-gray-500 font-medium">Throughput</span>
                    <span className="text-xs font-bold text-gray-900 font-mono">{sensor.rate}</span>
                  </div>
                  <DiscreteProgressBar total={6} filled={4} variant={sensor.color} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Stream Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Ingress Telemetry Stream
              </h3>
              <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200/60">
                {filteredEvents.length} Captured
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Filtered by: <span className="font-semibold text-gray-700 uppercase">{selectedSensor}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter IP, port, technique..."
                className="bg-gray-50 border border-gray-200 text-xs rounded-full pl-8 pr-3 py-1.5 outline-none focus:border-gray-400 text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-1">Status</th>
                <th className="pb-3">Sensor Channel</th>
                <th className="pb-3">Classification</th>
                <th className="pb-3">Source Entity</th>
                <th className="pb-3">Destination</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Confidence</th>
                <th className="pb-3 text-right pr-1">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 pl-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      evt.statusType === 'critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        : evt.statusType === 'warning'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}>
                      {evt.status}
                    </span>
                  </td>

                  <td className="py-3.5 font-semibold text-gray-900">
                    {evt.sensorName}
                  </td>

                  <td className="py-3.5 font-medium text-gray-800">
                    {evt.classification}
                  </td>

                  <td className="py-3.5 font-mono text-[11px] text-gray-600">
                    {evt.source}
                  </td>

                  <td className="py-3.5 font-mono text-[11px] text-gray-600">
                    {evt.destination}
                  </td>

                  <td className="py-3.5 font-mono text-[11px] text-gray-500">
                    {evt.timestamp}
                  </td>

                  <td className="py-3.5 font-bold font-mono text-gray-800">
                    {evt.confidence}%
                  </td>

                  <td className="py-3.5 pr-1 text-right">
                    <button
                      onClick={() => setSelectedPayload(evt)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                    >
                      Inspect JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Payload Inspector Modal / Drawer */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-gray-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-gray-900">
                  Raw Ingress Payload Inspector ({selectedPayload.sensorName})
                </h4>
              </div>
              <button 
                onClick={() => setSelectedPayload(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-950 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72">
              <pre>{JSON.stringify(selectedPayload.payload, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-gray-500 font-medium">
                Normalized 15-feature numeric tensor evaluated by Stage 1
              </span>
              <PillButton
                size="sm"
                variant="outline"
                icon={copied ? Check : Copy}
                onClick={handleCopyJson}
              >
                {copied ? 'Copied' : 'Copy JSON'}
              </PillButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

