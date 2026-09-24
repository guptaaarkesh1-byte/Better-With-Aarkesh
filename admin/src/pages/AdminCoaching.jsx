import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { 
  CalendarBlank, 
  Books, 
  UserCircle
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
    if (tabParam === 'profile' || tabParam === 'journey' || tabParam === 'settings') return 'profile';
    if (location.pathname.startsWith('/profile') || location.pathname.startsWith('/journey')) return 'profile';
    if (location.pathname.startsWith('/appointments')) return 'appointments';
    
    try {
      const saved = localStorage.getItem('bwa_admin_coaching_tab');
      if (saved && ['appointments', 'profile'].includes(saved)) return saved;
    } catch (e) {}

    return 'appointments';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'appointments' || tabParam === 'bookings' || tabParam === 'users') {
      setActiveTab('appointments');
    } else if (tabParam === 'profile' || tabParam === 'journey' || tabParam === 'settings') {
      setActiveTab('profile');
    } else if (location.pathname.startsWith('/profile') || location.pathname.startsWith('/journey')) {
      setActiveTab('profile');
    } else if (location.pathname.startsWith('/appointments')) {
      setActiveTab('appointments');
    }
  }, [searchParams, location.pathname]);

  // Persist tab to localStorage and sync URL
  useEffect(() => {
    try {
      localStorage.setItem('bwa_admin_coaching_tab', activeTab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }, [activeTab]);

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

          {/* 2. Profile */}
          <button
            id="tab-btn-profile"
            onClick={() => handleTabSwitch('profile')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#c79c6e] text-black shadow-lg shadow-[#c79c6e]/15'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <UserCircle size={16} weight={activeTab === 'profile' ? 'bold' : 'regular'} />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1">
        {activeTab === 'appointments' ? (
          <AdminUsers />
        ) : (
          <AdminSettings />
        )}
      </div>
    </div>
  );
}
