import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  SquaresFour, 
  Books, 
  Path, 
  CalendarBlank,
  CaretDown,
  CaretRight,
  SignOut,
  FolderOpen
} from '@phosphor-icons/react';

export default function AdminLayout({ children, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Determine active top tab based on route
  const getActiveTab = () => {
    if (currentPath.startsWith('/library')) return 'library';
    if (currentPath.startsWith('/journey')) return 'journey';
    if (currentPath.startsWith('/appointments')) return 'appointments';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const topTabs = [
    { id: 'overview', label: 'Overview', icon: <SquaresFour size={18} />, path: '/' },
    { id: 'library', label: 'Library', icon: <Books size={18} />, path: '/library/content' },
    { id: 'journey', label: 'My Journey', icon: <Path size={18} />, path: '/journey/settings' },
    { id: 'appointments', label: 'Appointments', icon: <CalendarBlank size={18} />, path: '/appointments' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      {/* Top Bar (Header + Tabs) */}
      <header className="w-full bg-[#0a0a0a] border-b border-white/5 flex flex-col z-30 sticky top-0">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded bg-[#c79c6e]/10 border border-[#c79c6e]/30 flex items-center justify-center">
              <span className="text-[#c79c6e] font-serif font-bold text-lg leading-none">B</span>
            </div>
            <h2 className="font-serif text-xl text-[#c79c6e]">BWA Admin</h2>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors text-sm"
          >
            <SignOut size={16} />
            <span className="hidden md:inline tracking-wide">Logout</span>
          </button>
        </div>
        
        {/* Horizontal Tabs */}
        <div className="px-6 flex items-center gap-1 overflow-x-auto scrollbar-hide border-t border-white/5 bg-[#050505]/50">
          {topTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'border-[#c79c6e] text-[#c79c6e] bg-[#c79c6e]/5' 
                    : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="text-sm font-medium tracking-wide">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#050505] relative">
          {children}
        </main>
      </div>
    </div>
  );
}
