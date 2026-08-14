import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { 
  SquaresFour, 
  Users, 
  FileText, 
  CalendarBlank, 
  CurrencyDollar,
  CurrencyInr,
  SignOut,
  LockKey,
  Gear
} from '@phosphor-icons/react';

// --- Login Component ---
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Temporary hardcoded admin credentials for UI purposes
    if (email === 'admin@betterwithaarkesh.com' && password === 'admin123') {
      localStorage.setItem('adminToken', 'temp-admin-token');
      onLogin(true);
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#c79c6e]/10 border border-[#c79c6e]/30 flex items-center justify-center mb-6">
          <LockKey size={32} className="text-[#c79c6e]" weight="light" />
        </div>
        
        <h1 className="font-serif text-3xl text-white mb-2 text-center">Admin Portal</h1>
        <p className="font-sans text-sm text-white/50 mb-8 text-center">Enter your credentials to access the dashboard.</p>
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs uppercase tracking-widest text-white/40">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors"
              placeholder="admin@betterwithaarkesh.com"
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs uppercase tracking-widest text-white/40">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <span className="text-red-500 text-xs font-sans mt-[-8px]">{error}</span>}

          <button 
            type="submit"
            className="w-full mt-2 py-4 rounded bg-[#c79c6e] text-black hover:bg-[#b0885e] font-sans text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Dashboard Component ---
function AdminDashboard() {
  const stats = [
    { label: 'Total Clients', value: '124', icon: <Users size={24} />, trend: '+12% this month' },
    { label: 'Active Articles', value: '45', icon: <FileText size={24} />, trend: '+3 this week' },
    { label: 'Upcoming Sessions', value: '8', icon: <CalendarBlank size={24} />, trend: 'Next: Today 2:00 PM' },
    { label: 'Revenue (MTD)', value: '₹3,50,000', icon: <CurrencyInr size={24} />, trend: '+8% vs last month' },
  ];

  return (
    <div className="p-8 md:p-12 w-full max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl md:text-4xl text-white">Dashboard Overview</h1>
        <p className="font-sans text-sm text-white/50">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col gap-4 hover:border-[#c79c6e]/30 transition-colors">
            <div className="flex justify-between items-start text-[#c79c6e]">
              {stat.icon}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans text-3xl font-light text-white">{stat.value}</span>
              <span className="font-sans text-xs uppercase tracking-widest text-white/40">{stat.label}</span>
            </div>
            <div className="mt-2 pt-4 border-t border-white/5">
              <span className="font-sans text-xs text-white/30">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col gap-6">
          <h2 className="font-serif text-xl text-white">Recent Signups</h2>
          <div className="flex-1 border border-dashed border-white/10 rounded-lg flex items-center justify-center min-h-[200px]">
            <span className="text-white/30 font-sans text-sm">User list will appear here</span>
          </div>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col gap-6">
          <h2 className="font-serif text-xl text-white">Today's Schedule</h2>
          <div className="flex-1 border border-dashed border-white/10 rounded-lg flex items-center justify-center min-h-[200px]">
            <span className="text-white/30 font-sans text-sm">Appointments will appear here</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Layout Component ---
function AdminLayout({ children, onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: <SquaresFour size={20} /> },
    { path: '/users', label: 'Users', icon: <Users size={20} /> },
    { path: '/content', label: 'Content', icon: <FileText size={20} /> },
    { path: '/appointments', label: 'Appointments', icon: <CalendarBlank size={20} /> },
    { path: '/transactions', label: 'Transactions', icon: <CurrencyDollar size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Gear size={20} /> },
  ];

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col shrink-0 relative z-20 h-screen sticky top-0">
        <div className="p-8 border-b border-white/5">
          <h2 className="font-serif text-2xl text-[#c79c6e]">BWA Admin</h2>
          <span className="text-white/40 text-[0.65rem] uppercase tracking-widest mt-1 block">Dashboard</span>
        </div>
        <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-[#c79c6e]/10 text-[#c79c6e] font-medium' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span className="text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-white/5 flex flex-col gap-2">
          <button 
            onClick={onLogout}
            className="flex items-center w-full gap-4 px-4 py-3 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <SignOut size={20} />
            <span className="text-sm tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

// --- Protected Route Wrapper ---
function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';

// --- Main App Route Setup ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in (using temp token for now)
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (loading) return <div className="min-h-screen bg-[#050505]" />; // blank while checking

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <AdminLogin onLogin={setIsAuthenticated} />
          } 
        />
        
        <Route 
          path="/*" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminLayout onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/users" element={<AdminUsers />} />
                  <Route path="/settings" element={<AdminSettings />} />
                  {/* More admin routes will go here */}
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App;
