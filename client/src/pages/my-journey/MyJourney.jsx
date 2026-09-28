import React from 'react';
import bgImage from '../../assets/images/empty_library_bg.webp';

import OverviewSection from './components/OverviewSection';
import PreparationSection from './components/PreparationSection';
import CompletedSessionsSection from './components/CompletedSessionsSection';
import MyLibrarySection from './components/MyLibrarySection';
import PrivateNotesSection from './components/PrivateNotesSection';
import ClosingNavigation from './components/ClosingNavigation';

export default function MyJourney() {
  return (
    <div className="w-full min-h-screen bg-[#f5f1e8] text-[#111010] select-none relative font-sans">
      
      {/* Background - Clean warm ambient layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src={bgImage} 
          alt="Library Background" 
          className="w-full h-full object-cover object-center opacity-15"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[#f5f1e8]/85" />
      </div>

      <OverviewSection />
      <ClosingNavigation />

    </div>
  );
}
