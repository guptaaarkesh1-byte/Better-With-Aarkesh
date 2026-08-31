import React, { useState, useEffect } from 'react';
import { Users, BookOpen, CurrencyDollar, CalendarBlank, CheckCircle, XCircle } from '@phosphor-icons/react';

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments/admin/reschedule-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = action === 'approve' ? 'approve-reschedule' : 'reject-reschedule';
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments/admin/${id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchRequests();
      } else {
        alert("Failed to process request.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    }
  };

  const stats = [
    { label: 'Total Clients', value: '124', icon: <Users size={24} />, trend: '+12% this month' },
    { label: 'Active Articles', value: '45', icon: <BookOpen size={24} />, trend: '+3 this week' },
    { label: 'Upcoming Sessions', value: '8', icon: <CalendarBlank size={24} />, trend: 'Next: Today 2:00 PM' },
    { label: 'Revenue (MTD)', value: '$4,200', icon: <CurrencyDollar size={24} />, trend: '+8% vs last month' },
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
          <h2 className="font-serif text-xl text-white">Reschedule Requests</h2>
          <div className="flex-1 flex flex-col gap-4">
            {loadingRequests ? (
              <div className="flex-1 border border-dashed border-white/10 rounded-lg flex items-center justify-center min-h-[200px]">
                <span className="text-white/30 font-sans text-sm">Loading...</span>
              </div>
            ) : requests.length > 0 ? (
              requests.map(req => (
                <div key={req._id} className="bg-black/40 border border-[#c79c6e]/20 rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif text-white">{req.name}</h4>
                      <p className="font-sans text-xs text-white/50">{req.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/5 p-2 rounded">
                      <span className="text-white/40 block mb-1">Current:</span>
                      <span className="text-white line-through">{req.date} {req.time}</span>
                    </div>
                    <div className="bg-[#c79c6e]/10 p-2 rounded">
                      <span className="text-[#c79c6e]/60 block mb-1">Requested:</span>
                      <span className="text-[#c79c6e]">{req.rescheduleRequest.date} {req.rescheduleRequest.time}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => handleAction(req._id, 'approve')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#c79c6e] hover:bg-[#b98a56] text-black font-sans text-[0.65rem] uppercase tracking-wider font-medium rounded transition-colors"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => handleAction(req._id, 'reject')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-sans text-[0.65rem] uppercase tracking-wider font-medium rounded transition-colors"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 border border-dashed border-white/10 rounded-lg flex items-center justify-center min-h-[200px]">
                <span className="text-white/30 font-sans text-sm">No pending requests</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
