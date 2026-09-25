import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookmarkSimple, ChatCircleText, Notebook } from '@phosphor-icons/react';
import MyLibraryTab from './MyLibraryTab';
import CoachingTab from './CoachingTab';
import MyNotesTab from './MyNotesTab';

export default function OverviewSection() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'COACHING');

  // Listen to changes in location state (e.g. going forward/back)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <section className="relative z-10 w-full min-h-[100dvh] flex flex-col px-4 sm:px-6 md:px-8 pt-44 sm:pt-48 md:pt-52 pb-16 mx-auto border-b border-white/5">
      
      {/* ─── FIXED SUBNAV TABS STRIP (Directly joined flush under Navbar with zero gap) ─── */}
      <div className="fixed top-[58px] sm:top-[62px] md:top-[102px] left-0 right-0 z-40 bg-[#060606]/95 backdrop-blur-2xl border-b border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.9)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-2 sm:py-2.5">
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 w-full max-w-2xl mx-auto">
            {/* Tab 1: MY LIBRARY */}
            <button 
              onClick={() => setActiveTab('MY LIBRARY')}
              className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all duration-200 border cursor-pointer ${
                activeTab === 'MY LIBRARY' 
                  ? 'border-[#c79c6e] bg-[#14120e] text-[#c79c6e] shadow-[0_0_15px_rgba(199,156,110,0.15)] font-semibold' 
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <BookmarkSimple size={18} weight="light" className={`shrink-0 ${activeTab === 'MY LIBRARY' ? 'text-[#c79c6e]' : ''}`} />
              <span className="font-sans text-[0.68rem] sm:text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] whitespace-nowrap">MY LIBRARY</span>
            </button>

            {/* Tab 2: COACHING */}
            <button 
              onClick={() => setActiveTab('COACHING')}
              className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all duration-200 border cursor-pointer ${
                activeTab === 'COACHING' 
                  ? 'border-[#c79c6e] bg-[#14120e] text-[#c79c6e] shadow-[0_0_15px_rgba(199,156,110,0.15)] font-semibold' 
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <ChatCircleText size={18} weight="light" className={`shrink-0 ${activeTab === 'COACHING' ? 'text-[#c79c6e]' : ''}`} />
              <span className="font-sans text-[0.68rem] sm:text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] whitespace-nowrap">COACHING</span>
            </button>

            {/* Tab 3: MY NOTES */}
            <button 
              onClick={() => setActiveTab('MY NOTES')}
              className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all duration-200 border cursor-pointer ${
                activeTab === 'MY NOTES' 
                  ? 'border-[#c79c6e] bg-[#14120e] text-[#c79c6e] shadow-[0_0_15px_rgba(199,156,110,0.15)] font-semibold' 
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <Notebook size={18} weight="light" className={`shrink-0 ${activeTab === 'MY NOTES' ? 'text-[#c79c6e]' : ''}`} />
              <span className="font-sans text-[0.68rem] sm:text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] whitespace-nowrap">MY NOTES</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="w-full max-w-2xl flex flex-col items-start justify-center mb-8 md:mb-10">
        <span className="font-sans text-[0.65rem] sm:text-[0.7rem] md:text-[0.8rem] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-medium text-[#c79c6e] mb-2 md:mb-3 block">
          MY JOURNEY
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-[1.15] mb-2 md:mb-3">
          Welcome back, Aarkesh.
        </h1>
        <p className="font-sans text-white/70 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-lg">
          Your Perspectives, conversations and private reflections — gathered in one place.
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

      {/* Footer Text */}
      <div className="mt-auto pt-6 text-white/40 font-serif text-base md:text-xl italic tracking-wide pb-4 text-center sm:text-left">
        Scroll down to continue where you left off.
      </div>
    </section>
  );
}
