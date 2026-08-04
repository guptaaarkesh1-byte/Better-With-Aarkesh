import React from 'react';
import bgImage from '../../assets/images/my-journey-bg.png';

import OverviewSection from './components/OverviewSection';
import ContinueSection from './components/ContinueSection';
import PreparationSection from './components/PreparationSection';
import CompletedSessionsSection from './components/CompletedSessionsSection';
import MyLibrarySection from './components/MyLibrarySection';
import PrivateNotesSection from './components/PrivateNotesSection';
import ClosingNavigation from './components/ClosingNavigation';

export default function MyJourney() {
  return (
    <div className="w-full min-h-screen bg-[#050505] text-white select-none relative font-sans overflow-x-hidden">
      
      {/* Background - Fixed while scrolling */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={bgImage} 
          alt="Dark Library Background" 
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
      </div>

      <OverviewSection />
      <ContinueSection />
      <PreparationSection />
      <CompletedSessionsSection />
      <MyLibrarySection />
      <PrivateNotesSection />
      <ClosingNavigation />

    </div>
  );
}
