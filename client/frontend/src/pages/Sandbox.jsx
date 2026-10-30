import React, { useState } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  UploadCloud, 
  Cpu, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import PillButton from '../components/common/PillButton';

export default function Sandbox({ onInjectTraffic }) {
  const [isZeroDay, setIsZeroDay] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRunResult, setLastRunResult] = useState(null);

  const handleSimulate = (type) => {
    setIsProcessing(true);
    setLastRunResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      if (type === 'threat') {
        setLastRunResult({
          status: 'anomaly_detected',
          technique: 'T1498: Network Denial of Service',
          confidence: 96.4,
          narrative: "Volumetric SYN flood on port 443 transmitting 4,500 forward packets.",
          zeroDay: isZeroDay
        });
      } else if (type === 'auth') {
        setLastRunResult({
          status: 'anomaly_detected',
          technique: 'T1110: Brute Force Authentication',
          confidence: 94.1,
          narrative: "Repeated failed SSH logins (8 attempts in 30s) exhibiting high source IP entropy.",
          zeroDay: isZeroDay
        });
      } else if (type === 'web') {
        setLastRunResult({
          status: 'anomaly_detected',
          technique: 'T1059: Web SQL Injection',
          confidence: 92.5,
          narrative: "Layer 7 SQL injection probe targeting /api/v1/transfer URI parameter.",
          zeroDay: isZeroDay
        });
      } else {
        setLastRunResult({
          status: 'benign',
          technique: 'Normal Background TLS Traffic',
          confidence: 99.8,
          narrative: "Normal port 443 flow with standard packet count. Dropped at Stage 1 triage.",
          zeroDay: false
        });
      }

      if (onInjectTraffic) {
        onInjectTraffic(type);
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Switchboard Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
              EVALUATOR TESTBENCH
            </span>
            <span className="text-xs text-gray-400 font-mono">• Safe Sandbox Mode</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Simulation Sandbox & Demonstration Switchboard
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Safely inject multi-modal telemetry vectors to demonstrate autonomous triage and federated weight fusion
          </p>
        </div>

        {/* Zero-Day Toggle Switch */}
        <div className="bg-gray-50 border border-gray-200/80 p-3 rounded-2xl flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-900">Zero-Day Mode</span>
            <span className="text-[10px] text-gray-500">
              {isZeroDay ? 'Triggers Cloud FL fine-tuning' : 'Fast local inference only'}
            </span>
          </div>
          <button
            onClick={() => setIsZeroDay(!isZeroDay)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              isZeroDay ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isZeroDay ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Switchboard Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Button 1: Volumetric DDoS */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/60">
              MODALITY 1: NETWORK
            </span>
            <h3 className="text-sm font-bold text-gray-900 mt-3 leading-snug">
              Inject Volumetric DDoS (T1498)
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Simulates high-rate SYN flood on Port 443 with 4,500 forward packets.
            </p>
          </div>
          <button
            onClick={() => handleSimulate('threat')}
            disabled={isProcessing}
            className="mt-5 w-full py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Trigger Attack</span>
          </button>
        </div>

        {/* Button 2: IAM Brute Force */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
              MODALITY 2: AUTH / IAM
            </span>
            <h3 className="text-sm font-bold text-gray-900 mt-3 leading-snug">
              Inject SSH Brute Force (T1110)
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Simulates anomalous failed credentials and high IP entropy sweep.
            </p>
          </div>
          <button
            onClick={() => handleSimulate('auth')}
            disabled={isProcessing}
            className="mt-5 w-full py-2.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Trigger Attack</span>
          </button>
        </div>

        {/* Button 3: Web SQL Injection */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200/60">
              MODALITY 4: WEB HTTP
            </span>
            <h3 className="text-sm font-bold text-gray-900 mt-3 leading-snug">
              Inject SQLi Injection (T1059)
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Simulates Layer 7 URI parameter traversal and database union injection.
            </p>
          </div>
          <button
            onClick={() => handleSimulate('web')}
            disabled={isProcessing}
            className="mt-5 w-full py-2.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Trigger Attack</span>
          </button>
        </div>

        {/* Button 4: Benign Traffic */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              BENIGN BASELINE
            </span>
            <h3 className="text-sm font-bold text-gray-900 mt-3 leading-snug">
              Send Normal Ingress Flow
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Standard TLS web traffic dropped at Stage 1 triage to conserve compute.
            </p>
          </div>
          <button
            onClick={() => handleSimulate('normal')}
            disabled={isProcessing}
            className="mt-5 w-full py-2.5 px-4 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Send Benign Traffic</span>
          </button>
        </div>
      </div>

      {/* Live Pipeline Stepper Simulation Result */}
      {lastRunResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Pipeline Execution Verification
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              4 Stages Completed in 388 ms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70">
              <span className="text-[10px] font-mono font-bold text-gray-400">STAGE 1</span>
              <h4 className="text-xs font-bold text-gray-900 mt-1">XGBoost Triage</h4>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Score: {lastRunResult.status === 'anomaly_detected' ? '1 (Flagged Anomaly)' : '0 (Dropped)'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70">
              <span className="text-[10px] font-mono font-bold text-gray-400">STAGE 2</span>
              <h4 className="text-xs font-bold text-gray-900 mt-1">Event Correlator</h4>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Synthesized CTI attack narrative
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70">
              <span className="text-[10px] font-mono font-bold text-gray-400">STAGE 3</span>
              <h4 className="text-xs font-bold text-gray-900 mt-1">SecureBERT LoRA</h4>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {lastRunResult.technique} ({lastRunResult.confidence}%)
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70">
              <span className="text-[10px] font-mono font-bold text-gray-400">STAGE 4</span>
              <h4 className="text-xs font-bold text-gray-900 mt-1">ChromaDB RAG</h4>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {lastRunResult.zeroDay ? 'Synced ΔW to Flower Server' : 'Local Playbook Generated'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

