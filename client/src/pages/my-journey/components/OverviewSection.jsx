import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookmarkSimple, ChatCircleText, Notebook } from '@phosphor-icons/react';
import MyLibraryTab from './MyLibraryTab';
import CoachingTab from './CoachingTab';
import MyNotesTab from './MyNotesTab';

export default function OverviewSection() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'COACHING');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('userInfo');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.fullName) {
          setUserName(parsed.fullName.split(' ')[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Listen to changes in location state (e.g. going forward/back)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <div className="relative z-10 w-full flex flex-col pt-[62px] md:pt-[109px]">
      
      {/* ─── STICKY SUBNAV TABS STRIP (Cleanly pinned below navbar, scrolls away with section) ─── */}
      <div className="sticky top-[62px] md:top-[109px] left-0 right-0 z-30 bg-[#f5f1e8] border-b border-black/10 shadow-xs h-14 md:h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full flex items-center justify-center">
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 w-full max-w-2xl mx-auto">
            {/* Tab 1: MY LIBRARY */}
            <button 
              onClick={() => setActiveTab('MY LIBRARY')}
              className={`flex-1 h-9 sm:h-10 flex justify-center items-center gap-2 px-3 sm:px-5 rounded-xl transition-all duration-200 border cursor-pointer ${
                activeTab === 'MY LIBRARY' 
                  ? 'border-[#c9542f] bg-[#fbf0eb] text-[#c9542f] shadow-xs font-semibold' 
                  : 'border-transparent text-[#555047] hover:text-[#111010] hover:bg-black/5 font-medium'
              }`}
            >
              <BookmarkSimple size={18} weight={activeTab === 'MY LIBRARY' ? 'fill' : 'regular'} className={`shrink-0 ${activeTab === 'MY LIBRARY' ? 'text-[#c9542f]' : ''}`} />
              <span className="font-sans text-[0.68rem] sm:text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] whitespace-nowrap leading-none">MY LIBRARY</span>
            </button>

            {/* Tab 2: COACHING */}
            <button 
              onClick={() => setActiveTab('COACHING')}
              className={`flex-1 h-9 sm:h-10 flex justify-center items-center gap-2 px-3 sm:px-5 rounded-xl transition-all duration-200 border cursor-pointer ${
                activeTab === 'COACHING' 
                  ? 'border-[#c9542f] bg-[#fbf0eb] text-[#c9542f] shadow-xs font-semibold' 
                  : 'border-transparent text-[#555047] hover:text-[#111010] hover:bg-black/5 font-medium'
              }`}
            >
              <ChatCircleText size={18} weight={activeTab === 'COACHING' ? 'fill' : 'regular'} className={`shrink-0 ${activeTab === 'COACHING' ? 'text-[#c9542f]' : ''}`} />
              <span className="font-sans text-[0.68rem] sm:text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] whitespace-nowrap leading-none">COACHING</span>
            </button>

            {/* Tab 3: MY NOTES */}
            <button 
              onClick={() => setActiveTab('MY NOTES')}
              className={`flex-1 h-9 sm:h-10 flex justify-center items-center gap-2 px-3 sm:px-5 rounded-xl transition-all duration-200 border cursor-pointer ${
                activeTab === 'MY NOTES' 
                  ? 'border-[#c9542f] bg-[#fbf0eb] text-[#c9542f] shadow-xs font-semibold' 
                  : 'border-transparent text-[#555047] hover:text-[#111010] hover:bg-black/5 font-medium'
              }`}
            >
              <Notebook size={18} weight={activeTab === 'MY NOTES' ? 'fill' : 'regular'} className={`shrink-0 ${activeTab === 'MY NOTES' ? 'text-[#c9542f]' : ''}`} />
              <span className="font-sans text-[0.68rem] sm:text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] whitespace-nowrap leading-none">MY NOTES</span>
            </button>
          </div>
        </div>
      </div>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-12 pb-16 flex flex-col flex-1">
        {/* Header Section */}
        <div className="w-full max-w-2xl flex flex-col items-start justify-center mb-8 md:mb-10">
          <span className="font-sans text-[0.65rem] sm:text-[0.7rem] md:text-[0.75rem] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-bold text-[#c9542f] mb-2 md:mb-3 block">
            MY JOURNEY
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#111010] tracking-tight leading-[1.15] mb-2 md:mb-3 font-medium">
            Welcome back{userName ? `, ${userName}` : ''}.
          </h1>
          <p className="font-sans text-[#555047] text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-lg">
            Your perspectives, conversations and private reflections — gathered in one place.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full">
          {activeTab === 'COACHING' && (
            <CoachingTab />
          )}
          
          {activeTab === 'MY LIBRARY' && (
            <MyLibraryTab />
          )}

          {activeTab === 'MY NOTES' && (
            <MyNotesTab />
          )}
        </div>
      </section>

    </div>
  );
}
