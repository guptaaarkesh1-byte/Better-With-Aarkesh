import React from 'react';
import bgImage from '../../assets/images/empty_library_bg.png';

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
          alt="Library Background" 
          className="w-full h-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      <OverviewSection />
      <ContinueSection />
      <ClosingNavigation />

    </div>
  );
}
