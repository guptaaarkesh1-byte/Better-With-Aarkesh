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
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// --- Login Component ---
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        onLogin(true);
      } else {
        setError(data.message || 'Invalid admin credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again later.');
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
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/appointments/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          const today = new Date();
          const formattedData = data.map(app => {
            const appDateObj = new Date(app.date);
            const isToday = appDateObj.getDate() === today.getDate() &&
                            appDateObj.getMonth() === today.getMonth() &&
                            appDateObj.getFullYear() === today.getFullYear();
            
            let calculatedStatus = app.status || 'Upcoming';
            if (calculatedStatus.toLowerCase() !== 'completed' && isToday) {
              calculatedStatus = 'Today';
            }
            return { ...app, status: calculatedStatus };
          });
          setAppointments(formattedData);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const stats = [
    { label: 'Total Clients', value: '124', icon: <Users size={24} />, trend: '+12% this month' },
    { label: 'Active Articles', value: '45', icon: <FileText size={24} />, trend: '+3 this week' },
    { label: 'Upcoming Sessions', value: appointments.filter(a => a.status !== 'Completed').length || '0', icon: <CalendarBlank size={24} />, trend: 'Based on bookings' },
    { label: 'Revenue (MTD)', value: '₹3,50,000', icon: <CurrencyInr size={24} />, trend: '+8% vs last month' },
  ];

  // Get upcoming appointments, sorted by closest date and time
  const now = new Date();
  
  const upcomingAppointments = appointments
    .filter(a => {
      if (a.status === 'Completed') return false;
      const appDate = new Date(`${a.date} ${a.time}`);
      // Only include if appointment is today or in the future
      // We compare with 'now' - optionally zeroing out hours if we want to show missed ones from earlier today
      return appDate >= new Date(now.setHours(0, 0, 0, 0)); 
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    })
    .slice(0, 4);

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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Revenue Graph */}
        <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col gap-6">
          <h2 className="font-serif text-xl text-white">Revenue Overview</h2>
          <div className="w-full h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'Jan', revenue: 40000 },
                  { name: 'Feb', revenue: 30000 },
                  { name: 'Mar', revenue: 60000 },
                  { name: 'Apr', revenue: 50000 },
                  { name: 'May', revenue: 90000 },
                  { name: 'Jun', revenue: 85000 },
                  { name: 'Jul', revenue: 120000 },
                ]}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c79c6e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#c79c6e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#c79c6e' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#c79c6e" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Schedule Pie Chart */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col gap-6">
          <h2 className="font-serif text-xl text-white">Schedule Status</h2>
          <div className="w-full h-[300px] flex flex-col items-center justify-center">
            {loading ? (
              <span className="text-white/30 font-sans text-sm">Loading data...</span>
            ) : appointments.length === 0 ? (
               <span className="text-white/30 font-sans text-sm">No schedule data available</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: appointments.filter(a => a.status === 'Completed').length },
                      { name: 'Upcoming', value: appointments.filter(a => a.status !== 'Completed').length }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell key="cell-0" fill="#222" />
                    <Cell key="cell-1" fill="#c79c6e" />
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}

import AdminLayout from './layouts/AdminLayout';

// --- Protected Route Wrapper ---
function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import AdminContent from './pages/AdminContent';
import AdminFooterDocuments from './pages/AdminFooterDocuments';

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
                  <Route path="/appointments" element={<AdminUsers />} />
                  <Route path="/journey/settings" element={<AdminSettings />} />
                  <Route path="/library/content" element={<AdminContent />} />
                  <Route path="/footer-documents" element={<AdminFooterDocuments />} />
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
