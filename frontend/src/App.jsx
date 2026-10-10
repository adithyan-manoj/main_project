import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import EdgeDashboard from './pages/EdgeDashboard';
import CloudDashboard from './pages/CloudDashboard';
import { ArrowLeft, Server } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#060709] text-gray-300 flex flex-col selection:bg-emerald-500/20 selection:text-white">
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<EdgeDashboard />} />
            <Route 
              path="/cloud" 
              element={
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#1a1e27]">
                    <Link 
                      to="/" 
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d0f12] border border-[#1a1e27] hover:border-emerald-500/40 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-all shadow-sm"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Edge Sentinel</span>
                    </Link>

                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                      <Server className="w-3.5 h-3.5 text-blue-400" />
                      <span>Google Colab Global Aggregator (FLoRA)</span>
                    </div>
                  </div>
                  <CloudDashboard />
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
