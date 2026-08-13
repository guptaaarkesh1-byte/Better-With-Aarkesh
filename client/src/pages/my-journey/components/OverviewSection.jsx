import React, { useState } from 'react';
import { BookmarkSimple, ChatCircleText, Notebook, CheckCircle, FileText } from '@phosphor-icons/react';
import Button from '../../../components/ui/Button';
import MyLibraryTab from './MyLibraryTab';
import CoachingTab from './CoachingTab';
import MyNotesTab from './MyNotesTab';

export default function OverviewSection() {
  const [activeTab, setActiveTab] = useState('COACHING'); // Pre-select coaching for Frame C

  return (
    <section className="relative z-10 w-full min-h-[100dvh] flex flex-col px-4 md:px-8 pt-24 pb-6 mx-auto border-b border-white/5">
      
      {/* Header Section */}
      <div className="w-full max-w-2xl flex flex-col items-start justify-center mb-8">
        <span className="font-sans text-[0.7rem] md:text-[0.8rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-4 block">
          MY JOURNEY
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-[1.1] mb-4">
          Welcome back, Aarkesh.
        </h1>
        <p className="font-sans text-white/70 text-base md:text-lg font-light leading-relaxed max-w-lg">
          Your Perspectives, conversations and private reflections — gathered in one place.
        </p>
      </div>

      {/* Frame C Layout: Sidebar + Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full max-w-7xl flex-1 min-h-0">
        
        {/* Sidebar Menu */}
        <div className="w-full lg:w-72 shrink-0">
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e]/80 block mb-6 px-4">
            OVERVIEW
          </span>
          
          <div className="flex flex-col gap-2">
            {/* Tab 1: MY LIBRARY */}
            <button 
              onClick={() => setActiveTab('MY LIBRARY')}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-300 border ${
                activeTab === 'MY LIBRARY' 
                  ? 'border-[#c79c6e] bg-[#0a0a0a]/70 backdrop-blur-sm text-[#c79c6e] shadow-[0_0_20px_rgba(199,156,110,0.1)]' 
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookmarkSimple size={24} weight="light" className={activeTab === 'MY LIBRARY' ? 'text-[#c79c6e]' : ''} />
              <span className="font-sans text-sm uppercase tracking-[0.2em] font-medium">MY LIBRARY</span>
            </button>

            {/* Tab 2: COACHING */}
            <button 
              onClick={() => setActiveTab('COACHING')}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-300 border ${
                activeTab === 'COACHING' 
                  ? 'border-[#c79c6e] bg-[#0a0a0a]/70 backdrop-blur-sm text-[#c79c6e] shadow-[0_0_20px_rgba(199,156,110,0.1)]' 
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <ChatCircleText size={24} weight="light" className={activeTab === 'COACHING' ? 'text-[#c79c6e]' : ''} />
              <span className="font-sans text-sm uppercase tracking-[0.2em] font-medium">COACHING</span>
            </button>

            {/* Tab 3: MY NOTES */}
            <button 
              onClick={() => setActiveTab('MY NOTES')}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-300 border ${
                activeTab === 'MY NOTES' 
                  ? 'border-[#c79c6e] bg-[#0a0a0a]/70 backdrop-blur-sm text-[#c79c6e] shadow-[0_0_20px_rgba(199,156,110,0.1)]' 
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Notebook size={24} weight="light" className={activeTab === 'MY NOTES' ? 'text-[#c79c6e]' : ''} />
              <span className="font-sans text-sm uppercase tracking-[0.2em] font-medium">MY NOTES</span>
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
      <div className="mt-auto pt-6 text-white/40 font-serif text-lg md:text-xl italic tracking-wide pb-4">
        Scroll down to continue where you left off.
      </div>
    </section>
  );
}
