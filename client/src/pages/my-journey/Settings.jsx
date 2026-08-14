import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Bell, LockKey, CaretLeft } from '@phosphor-icons/react';
import bgImage from '../../assets/images/my-journey-bg.png';

import ProfileTab from './components/settings/ProfileTab';
import NotificationsTab from './components/settings/NotificationsTab';
import SecurityPrivacyTab from './components/settings/SecurityPrivacyTab';

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'PROFILE');

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/my-journey/settings?tab=${tab}`, { replace: true });
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white select-none relative font-sans overflow-x-hidden pt-32 pb-24">
      
      {/* Background - Fixed while scrolling */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={bgImage} 
          alt="Dark Library Background" 
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-12 lg:gap-24">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col">
          <div className="mb-12">
            <button 
              onClick={() => navigate('/my-journey')}
              className="flex items-center gap-2 text-white/60 hover:text-white font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors mb-8"
            >
              <CaretLeft size={14} weight="bold" /> BACK
            </button>
            <div className="flex items-center gap-2 text-white/50 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium mb-4">
              <span className="text-[#c79c6e]">MY JOURNEY</span>
              <span>/</span>
              <span className="text-white">SETTINGS</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-white tracking-tight leading-[1.1] mb-2">
              Profile & Settings
            </h1>
            <p className="font-sans text-white/60 text-xs tracking-wide">
              {activeTab === 'PROFILE' && "Manage your details, preferences and account."}
              {activeTab === 'NOTIFICATIONS' && "Manage how and when you would like to hear from us."}
              {activeTab === 'SECURITY' && "Contribute to your account and understand what remains private."}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => handleTabChange('PROFILE')}
              className={`flex items-center gap-4 px-6 py-4 rounded-lg font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-all ${
                activeTab === 'PROFILE' 
                  ? 'border border-[#c79c6e] text-[#c79c6e] bg-[#c79c6e]/5 shadow-[0_0_20px_rgba(199,156,110,0.1)]' 
                  : 'border border-transparent text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <User size={16} weight={activeTab === 'PROFILE' ? 'regular' : 'light'} /> PROFILE
            </button>
            <button 
              onClick={() => handleTabChange('NOTIFICATIONS')}
              className={`flex items-center gap-4 px-6 py-4 rounded-lg font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-all ${
                activeTab === 'NOTIFICATIONS' 
                  ? 'border border-[#c79c6e] text-[#c79c6e] bg-[#c79c6e]/5 shadow-[0_0_20px_rgba(199,156,110,0.1)]' 
                  : 'border border-transparent text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bell size={16} weight={activeTab === 'NOTIFICATIONS' ? 'regular' : 'light'} /> NOTIFICATIONS
            </button>
            <button 
              onClick={() => handleTabChange('SECURITY')}
              className={`flex items-center gap-4 px-6 py-4 rounded-lg font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-all ${
                activeTab === 'SECURITY' 
                  ? 'border border-[#c79c6e] text-[#c79c6e] bg-[#c79c6e]/5 shadow-[0_0_20px_rgba(199,156,110,0.1)]' 
                  : 'border border-transparent text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <LockKey size={16} weight={activeTab === 'SECURITY' ? 'regular' : 'light'} /> SECURITY & PRIVACY
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full flex flex-col md:pt-[104px]">
          {activeTab === 'PROFILE' && <ProfileTab />}
          {activeTab === 'NOTIFICATIONS' && <NotificationsTab />}
          {activeTab === 'SECURITY' && <SecurityPrivacyTab />}
        </div>
      </div>
    </div>
  );
}
