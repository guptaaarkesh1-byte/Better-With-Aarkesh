import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { 
  CalendarBlank, 
  Books, 
  Path,
  UserFocus
} from '@phosphor-icons/react';
import AdminUsers from './AdminUsers';
import AdminContent from './AdminContent';
import AdminSettings from './AdminSettings';

export default function AdminCoaching() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'appointments' || tabParam === 'bookings' || tabParam === 'users') return 'appointments';
    if (tabParam === 'library' || tabParam === 'content' || tabParam === 'articles') return 'library';
    if (tabParam === 'journey' || tabParam === 'settings') return 'journey';
    if (location.pathname.startsWith('/library')) return 'library';
    if (location.pathname.startsWith('/journey')) return 'journey';
    if (location.pathname.startsWith('/appointments')) return 'appointments';
    return 'appointments';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'appointments' || tabParam === 'bookings' || tabParam === 'users') {
      setActiveTab('appointments');
    } else if (tabParam === 'library' || tabParam === 'content' || tabParam === 'articles') {
      setActiveTab('library');
    } else if (tabParam === 'journey' || tabParam === 'settings') {
      setActiveTab('journey');
    } else if (location.pathname.startsWith('/library')) {
      setActiveTab('library');
    } else if (location.pathname.startsWith('/journey')) {
      setActiveTab('journey');
    } else if (location.pathname.startsWith('/appointments')) {
      setActiveTab('appointments');
    }
  }, [searchParams, location.pathname]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Sub Navigation Bar for Coaching Vertical */}
      <div className="w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Appointments */}
          <button
            id="tab-btn-appointments"
            onClick={() => handleTabSwitch('appointments')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-[#c79c6e] text-black shadow-lg shadow-[#c79c6e]/15'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <CalendarBlank size={15} weight={activeTab === 'appointments' ? 'bold' : 'regular'} />
            <span>Appointments</span>
          </button>

          {/* 2. Library */}
          <button
            id="tab-btn-library"
            onClick={() => handleTabSwitch('library')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-[#c79c6e] text-black shadow-lg shadow-[#c79c6e]/15'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Books size={15} weight={activeTab === 'library' ? 'bold' : 'regular'} />
            <span>Library</span>
          </button>

          {/* 3. My Journey */}
          <button
            id="tab-btn-journey"
            onClick={() => handleTabSwitch('journey')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'journey'
                ? 'bg-[#c79c6e] text-black shadow-lg shadow-[#c79c6e]/15'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Path size={15} weight={activeTab === 'journey' ? 'bold' : 'regular'} />
            <span>My Journey</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1">
        {activeTab === 'appointments' ? (
          <AdminUsers />
        ) : activeTab === 'library' ? (
          <AdminContent />
        ) : (
          <AdminSettings />
        )}
      </div>
    </div>
  );
}
