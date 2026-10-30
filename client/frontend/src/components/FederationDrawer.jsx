import React from 'react';
import { 
  X, 
  Cpu, 
  Server, 
  ShieldCheck, 
  Zap, 
  Radio, 
  CheckCircle2, 
  Lock, 
  ArrowDownUp, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function FederationDrawer({
  isOpen,
  onClose,
  isZeroDay,
  setIsZeroDay,
  onInjectTraffic,
  isProcessing
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#0a0c10] border-l border-[#1a1e27] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1a1e27]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Federation & Simulation Controls
              </h3>
              <p className="text-[11px] text-gray-500">
                Cloud Aggregator Sync & Edge Injection Deck
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#12151c] hover:bg-[#1a1f29] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Federated Node Status Card */}
          <div className="bg-[#0d0f12] border border-[#1a1e27] rounded-xl p-4.5 space-y-3.5 shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                Federation Mesh Status
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
                <span>FLoRA Sync Active</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#141822]">
                <span className="text-gray-400">Aggregator Server</span>
                <span className="font-mono text-gray-200">Google Colab (Flower 1.13)</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#141822]">
                <span className="text-gray-400">Tunnel Gateway</span>
                <span className="font-mono text-emerald-400">ngrok.app:8080 (gRPC)</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#141822]">
                <span className="text-gray-400">Global FL Round</span>
                <span className="font-mono text-white font-bold">Round 4 of 10</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#141822]">
                <span className="text-gray-400">Differential Privacy</span>
                <span className="font-mono text-purple-400">ε = 0.5 • δ = 10⁻⁵</span>
              </div>
            </div>

            {/* Privacy Guarantee Pill */}
            <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-[11px] text-emerald-400">
              <Lock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Zero Raw Data Leaves Edge • Parameters Only</span>
            </div>
          </div>

          {/* Section 2: Interactive Simulation Deck */}
          <div className="bg-[#0d0f12] border border-[#1a1e27] rounded-xl p-4.5 space-y-4 shadow-md">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">
              Simulation Switchboard
            </span>

            {/* Minimal Toggle Switch for Zero-Day Federation */}
            <div className="bg-[#07080b] border border-[#181c24] p-3.5 rounded-xl flex flex-col gap-1.5">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs font-semibold text-gray-200">
                  Zero-Day Federation
                </span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={isZeroDay} 
                    onChange={() => setIsZeroDay(!isZeroDay)} 
                  />
                  <div className={`block w-10 h-5 rounded-full transition-colors ${
                    isZeroDay ? 'bg-purple-600 shadow-[0_0_12px_rgba(139,92,246,0.5)]' : 'bg-[#1e2330]'
                  }`}></div>
                  <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                    isZeroDay ? 'translate-x-5' : ''
                  }`}></div>
                </div>
              </label>
              <p className="text-[11px] text-gray-500 leading-snug">
                {isZeroDay 
                  ? "Routes detected anomaly to Cloud Server for collaborative FLoRA adapter fine-tuning." 
                  : "Bypasses Federation. Uses fast local XGBoost & SecureBERT models only."
                }
              </p>
            </div>

            {/* Simulation Action Buttons */}
            <div className="space-y-2.5">
              <button 
                onClick={() => onInjectTraffic('threat')}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Executing 4 ML Stages...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Inject Threat Payload (DDoS Flood)</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => onInjectTraffic('normal')}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-[#0a0c10] border border-[#1e2432] hover:border-gray-600 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Send Benign Telemetry Flow</span>
              </button>
            </div>
          </div>

          {/* Section 3: 4-Stage Pipeline Execution Tracker */}
          <div className="bg-[#0d0f12] border border-[#1a1e27] rounded-xl p-4.5 space-y-3 shadow-md">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">
              Multi-Stage ML Execution Latency
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#07080b] border border-[#181c24]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-gray-300">Stage 1: XGBoost Triage</span>
                </div>
                <span className="font-mono text-emerald-400 font-medium">1.2 ms</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#07080b] border border-[#181c24]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span className="text-gray-300">Stage 2: Event Correlator NLP</span>
                </div>
                <span className="font-mono text-blue-400 font-medium">3.5 ms</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#07080b] border border-[#181c24]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  <span className="text-gray-300">Stage 3: SecureBERT + LoRA</span>
                </div>
                <span className="font-mono text-purple-400 font-medium">42.8 ms</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#07080b] border border-[#181c24]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span className="text-gray-300">Stage 4: Llama-3 RAG Advisory</span>
                </div>
                <span className="font-mono text-amber-400 font-medium">340.5 ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1a1e27] bg-[#07080b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141822] hover:bg-[#1e2330] text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Close Controls
          </button>
        </div>
      </div>
    </div>
  );
}
