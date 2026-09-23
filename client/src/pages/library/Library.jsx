import React, { useState, useEffect } from 'react';
import continuousBg from '../../assets/PerspectivePage/BG/library_day_bg.webp';
import LibraryDirectorySection from '../../components/library/LibraryDirectorySection';
import FormatExploreSection from '../../components/library/FormatExploreSection';

export default function Library() {
  const [isRestoringScroll, setIsRestoringScroll] = useState(!!sessionStorage.getItem('library_scroll_position'));

  // Smart scroll restoration
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('library_scroll_position');
    if (savedScroll) {
      setTimeout(() => {
        const targetScroll = parseInt(savedScroll, 10);
        if (window.lenis) {
          window.lenis.scrollTo(targetScroll, { immediate: true });
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'instant' });
        }
        sessionStorage.removeItem('library_scroll_position');
        
        // Small additional delay to allow browser paint before fading in
        setTimeout(() => setIsRestoringScroll(false), 50);
      }, 300);
    } else {
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#050505] overflow-x-clip text-white select-none">
      {/* SECTION 1: 6 Topics Directory with Search & Live Hover Preview */}
      <LibraryDirectorySection />

      {/* SECTION 2: Explore By Format */}
      <div className="relative w-full bg-[#050505]">
        <FormatExploreSection />
      </div>
    </div>
  );
}

