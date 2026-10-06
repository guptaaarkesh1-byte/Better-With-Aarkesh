import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Bell, LockKey, CaretLeft } from '@phosphor-icons/react';
import bgImageLocal from '../../assets/images/my-journey-bg.webp';
import { CDN_IMAGES } from '../../utils/cdnAssets';

const bgImage = CDN_IMAGES.MY_JOURNEY_BG || bgImageLocal;

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
    <div className="w-full min-h-screen bg-[#f5f1e8] text-[#111010] select-none relative font-sans overflow-x-hidden pt-28 sm:pt-36 pb-16 sm:pb-24">
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-24">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col">
          <div className="mb-6 md:mb-12">
            <button 
              onClick={() => navigate('/my-journey')}
              className="flex items-center gap-2 text-[#7a756b] hover:text-[#c9542f] font-sans text-[0.65rem] uppercase tracking-[0.2em] font-bold transition-colors mb-4 sm:mb-8 cursor-pointer"
            >
              <CaretLeft size={14} weight="bold" /> BACK
            </button>
            <div className="flex items-center gap-2 text-[#7a756b] font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.2em] font-bold mb-3 sm:mb-4">
              <span className="text-[#c9542f]">MY JOURNEY</span>
              <span>/</span>
              <span className="text-[#111010]">SETTINGS</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#111010] tracking-tight leading-[1.15] mb-2 font-medium">
              Profile & Settings
            </h1>
            <p className="font-sans text-[#555047] text-xs sm:text-sm tracking-wide font-light">
              {activeTab === 'PROFILE' && "Manage your details, preferences and account."}
              {activeTab === 'NOTIFICATIONS' && "Manage how and when you would like to hear from us."}
              {activeTab === 'SECURITY' && "Contribute to your account and understand what remains private."}
            </p>
          </div>

          <div className="flex flex-row md:flex-col overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-2 pb-2 md:pb-0">
            <button 
              onClick={() => handleTabChange('PROFILE')}
              className={`flex items-center justify-center md:justify-start gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold transition-all shrink-0 md:shrink cursor-pointer ${
                activeTab === 'PROFILE' 
                  ? 'border border-[#c9542f] text-[#c9542f] bg-[#fbf0eb] shadow-xs' 
                  : 'border border-transparent text-[#555047] hover:text-[#111010] hover:bg-black/5'
              }`}
            >
              <User size={16} weight={activeTab === 'PROFILE' ? 'bold' : 'regular'} /> PROFILE
            </button>
            <button 
              onClick={() => handleTabChange('NOTIFICATIONS')}
              className={`flex items-center justify-center md:justify-start gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold transition-all shrink-0 md:shrink cursor-pointer ${
                activeTab === 'NOTIFICATIONS' 
                  ? 'border border-[#c9542f] text-[#c9542f] bg-[#fbf0eb] shadow-xs' 
                  : 'border border-transparent text-[#555047] hover:text-[#111010] hover:bg-black/5'
              }`}
            >
              <Bell size={16} weight={activeTab === 'NOTIFICATIONS' ? 'bold' : 'regular'} /> NOTIFICATIONS
            </button>
            <button 
              onClick={() => handleTabChange('SECURITY')}
              className={`flex items-center justify-center md:justify-start gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold transition-all shrink-0 md:shrink cursor-pointer ${
                activeTab === 'SECURITY' 
                  ? 'border border-[#c9542f] text-[#c9542f] bg-[#fbf0eb] shadow-xs' 
                  : 'border border-transparent text-[#555047] hover:text-[#111010] hover:bg-black/5'
              }`}
            >
              <LockKey size={16} weight={activeTab === 'SECURITY' ? 'bold' : 'regular'} /> SECURITY & PRIVACY
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
