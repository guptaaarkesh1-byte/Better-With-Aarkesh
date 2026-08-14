import React from 'react';
import { Users, BookOpen, CurrencyDollar, CalendarBlank } from '@phosphor-icons/react';

export default function AdminDashboard() {
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
          <h2 className="font-serif text-xl text-white">Today's Schedule</h2>
          <div className="flex-1 border border-dashed border-white/10 rounded-lg flex items-center justify-center min-h-[200px]">
            <span className="text-white/30 font-sans text-sm">Appointments will appear here</span>
          </div>
        </div>

      </div>

    </div>
  );
}
