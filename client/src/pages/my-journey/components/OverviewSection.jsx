import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookmarkSimple, ChatCircleText, Notebook, CheckCircle, FileText } from '@phosphor-icons/react';
import Button from '../../../components/ui/Button';
import MyLibraryTab from './MyLibraryTab';
import CoachingTab from './CoachingTab';
import MyNotesTab from './MyNotesTab';

export default function OverviewSection() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'COACHING'); // Pre-select coaching for Frame C

  // Listen to changes in location state (e.g. going forward/back)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <section className="relative z-10 w-full min-h-[100dvh] flex flex-col px-4 sm:px-6 md:px-8 pt-20 md:pt-24 pb-8 mx-auto border-b border-white/5">
      
      {/* Header Section */}
      <div className="w-full max-w-2xl flex flex-col items-start justify-center mb-6 md:mb-8">
        <span className="font-sans text-[0.65rem] sm:text-[0.7rem] md:text-[0.8rem] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-medium text-[#c79c6e] mb-3 md:mb-4 block">
          MY JOURNEY
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-[1.15] mb-3 md:mb-4">
          Welcome back, Aarkesh.
        </h1>
        <p className="font-sans text-white/70 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-lg">
          Your Perspectives, conversations and private reflections — gathered in one place.
        </p>
      </div>

      {/* Frame C Layout: Top Tabs + Main Content */}
      <div className="flex flex-col gap-6 md:gap-8 w-full flex-1 min-h-0">
        
        {/* Top Tabs Menu */}
        <div className="w-full rounded-xl md:rounded-2xl border border-white/15 shrink-0 sticky top-[65px] md:top-[71px] z-40 bg-[#080808]/95 p-1.5 sm:p-2 md:py-3.5 md:px-6 shadow-xl will-change-transform">
         
          <div className="flex flex-row overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-1.5 sm:gap-2 md:gap-3 w-full">
            {/* Tab 1: MY LIBRARY */}
            <button 
              onClick={() => setActiveTab('MY LIBRARY')}
              className={`flex-1 min-w-[110px] sm:min-w-0 flex justify-center items-center gap-1.5 sm:gap-2 md:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-3.5 rounded-lg transition-colors duration-200 border ${
                activeTab === 'MY LIBRARY' 
                  ? 'border-[#c79c6e] bg-[#121212] text-[#c79c6e] shadow-[0_0_15px_rgba(199,156,110,0.12)]' 
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookmarkSimple size={20} weight="light" className={`shrink-0 ${activeTab === 'MY LIBRARY' ? 'text-[#c79c6e]' : ''}`} />
              <span className="font-sans text-[0.65rem] sm:text-xs md:text-sm uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] font-medium whitespace-nowrap">MY LIBRARY</span>
            </button>

            {/* Tab 2: COACHING */}
            <button 
              onClick={() => setActiveTab('COACHING')}
              className={`flex-1 min-w-[110px] sm:min-w-0 flex justify-center items-center gap-1.5 sm:gap-2 md:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-3.5 rounded-lg transition-colors duration-200 border ${
                activeTab === 'COACHING' 
                  ? 'border-[#c79c6e] bg-[#121212] text-[#c79c6e] shadow-[0_0_15px_rgba(199,156,110,0.12)]' 
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <ChatCircleText size={20} weight="light" className={`shrink-0 ${activeTab === 'COACHING' ? 'text-[#c79c6e]' : ''}`} />
              <span className="font-sans text-[0.65rem] sm:text-xs md:text-sm uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] font-medium whitespace-nowrap">COACHING</span>
            </button>

            {/* Tab 3: MY NOTES */}
            <button 
              onClick={() => setActiveTab('MY NOTES')}
              className={`flex-1 min-w-[110px] sm:min-w-0 flex justify-center items-center gap-1.5 sm:gap-2 md:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-3.5 rounded-lg transition-colors duration-200 border ${
                activeTab === 'MY NOTES' 
                  ? 'border-[#c79c6e] bg-[#121212] text-[#c79c6e] shadow-[0_0_15px_rgba(199,156,110,0.12)]' 
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Notebook size={20} weight="light" className={`shrink-0 ${activeTab === 'MY NOTES' ? 'text-[#c79c6e]' : ''}`} />
              <span className="font-sans text-[0.65rem] sm:text-xs md:text-sm uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] font-medium whitespace-nowrap">MY NOTES</span>
            </button>
          </div>
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

      </div>

      {/* Footer Text */}
      <div className="mt-auto pt-6 text-white/40 font-serif text-base md:text-xl italic tracking-wide pb-4 text-center sm:text-left">
        Scroll down to continue where you left off.
      </div>
    </section>
  );
}
