import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ClientDashboard from './pages/ClientDashboard';
import CloudDashboard from './pages/CloudDashboard';
import { ArrowLeft, Server } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#eaecf0] text-gray-800 font-sans flex flex-col">
        <Routes>
          <Route path="/" element={<ClientDashboard />} />
          <Route 
            path="/cloud" 
            element={
              <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-700 hover:text-black transition-all shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Edge Sentinel</span>
                  </Link>

                  <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
                    <Server className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Google Colab Global Aggregator (FLoRA)</span>
                  </div>
                </div>
                <CloudDashboard />
              </div>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
