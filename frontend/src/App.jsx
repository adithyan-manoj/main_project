import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import EdgeDashboard from './pages/EdgeDashboard';
import CloudDashboard from './pages/CloudDashboard';
import { Activity, Cloud, ShieldCheck } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="border-b border-cyber-border bg-cyber-bg px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-accent-blue w-5 h-5" />
        <h1 className="text-lg font-bold tracking-tight text-gray-100">
          FEDTHREAT<span className="text-gray-600 font-normal ml-1">ENTERPRISE</span>
        </h1>
      </div>
      
      <div className="flex gap-2">
        <Link 
          to="/" 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors border ${
            location.pathname === '/' 
              ? 'bg-cyber-card border-cyber-border text-white' 
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          EDGE NODE
        </Link>
        <Link 
          to="/cloud" 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors border ${
            location.pathname === '/cloud' 
              ? 'bg-cyber-card border-cyber-border text-white' 
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          GLOBAL AGGREGATOR
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-cyber-bg">
        <Navigation />
        <main className="flex-1 p-4 lg:p-6 overflow-hidden">
          <Routes>
            <Route path="/" element={<EdgeDashboard />} />
            <Route path="/cloud" element={<CloudDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
