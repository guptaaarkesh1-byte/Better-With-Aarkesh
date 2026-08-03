import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { BookmarkSimple, ClockCounterClockwise, Notepad, ArrowRight, Target, Stack, Recycle } from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

export default function LibraryInvitationSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.invitation-elem', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }
    );
  }, { scope: containerRef });

  const handleLogin = () => {
    gsap.to(contentRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      onComplete: () => {
        setIsLoggedIn(true);
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 }
        );
      }
    });
  };

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-32 pb-32 flex flex-col items-center px-6 md:px-16 lg:px-24 border-t border-white/5">
      
      <div ref={contentRef} className="w-full max-w-5xl flex flex-col w-full h-full relative">
        
        {!isLoggedIn ? (
          // STATE 1: NOT LOGGED IN
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-12 lg:gap-24 w-full mt-12">
            
            {/* Left Column: Text */}
            <div className="w-full md:w-1/2 flex flex-col items-start invitation-elem">
              <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4">
                CONTINUE EXPLORING
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light tracking-tight leading-[1.1] mb-6">
                Keep what deserves<br />
                another look.
              </h2>
              <p className="font-sans text-[0.8rem] font-light leading-relaxed text-white/60 max-w-sm">
                Create My Library to save Perspectives, return to unfinished content, and keep notes worth revisiting.
              </p>
            </div>

            {/* Right Column: Card */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-end invitation-elem relative">
              <div 
                className={`w-full max-w-md rounded-md bg-[#050505]/60 backdrop-blur-md border p-8 flex flex-col transition-all duration-500 z-10 relative
                  ${isHovered ? 'border-[#c79c6e]/80 shadow-[0_0_30px_rgba(199,156,110,0.1)]' : 'border-white/10'}
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Features List */}
                <div className="flex flex-col gap-6 mb-10">
                  <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#c79c6e]">
                      <BookmarkSimple size={18} weight="light" />
                    </div>
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium text-white/80">SAVE PERSPECTIVES</span>
                  </div>
                  
                  <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#c79c6e]">
                      <ClockCounterClockwise size={18} weight="light" />
                    </div>
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium text-white/80">CONTINUE WHERE YOU LEFT OFF</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#c79c6e]">
                      <Notepad size={18} weight="light" />
                    </div>
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium text-white/80">KEEP PRIVATE NOTES</span>
                  </div>
                </div>

                {/* Buttons */}
                <button 
                  onClick={handleLogin}
                  className={`w-full py-4 rounded-sm border transition-all duration-500 mb-4 font-sans text-[0.65rem] uppercase tracking-widest font-semibold
                    ${isHovered 
                      ? 'border-transparent text-black bg-gradient-to-r from-[#c79c6e] via-[#e6c49a] to-[#c79c6e] shadow-[0_0_20px_rgba(199,156,110,0.3)]' 
                      : 'border-[#c79c6e] text-[#c79c6e] bg-transparent hover:bg-[#c79c6e]/5'
                    }
                  `}
                >
                  CREATE MY LIBRARY
                </button>
                
                <button className="w-full py-2 font-sans text-[0.65rem] uppercase tracking-widest font-medium text-[#c79c6e] hover:text-white transition-colors">
                  SIGN IN
                </button>
              </div>
              
              {/* Tooltip Text below card */}
              <div className={`absolute -bottom-10 right-0 w-full max-w-md text-center transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                <span className="font-serif text-[0.8rem] italic text-white/40">
                  Your Library grows only with what you choose to keep.
                </span>
              </div>
            </div>

          </div>
        ) : (
          // STATE 2: LOGGED IN (MY LIBRARY PREVIEW)
          <div className="flex flex-col w-full">
            
            {/* Header */}
            <div className="flex flex-col items-start mb-12">
              <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4">
                WELCOME BACK
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light tracking-tight leading-[1.1]">
                Continue from where you left it.
              </h2>
            </div>

            {/* 3-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr] gap-6 items-start">
              
              {/* Column 1: Continue */}
              <div className="flex flex-col gap-4">
                <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-[#c79c6e]">CONTINUE</span>
                <div className="w-full p-8 rounded-md bg-[#050505]/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors cursor-pointer flex flex-col justify-between min-h-[220px]">
                  
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full border border-white/5 bg-black flex items-center justify-center shrink-0 text-white/30 overflow-hidden relative">
                       {/* Placeholder Diagram */}
                       <Target size={40} weight="thin" className="text-[#c79c6e]/40" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-serif text-[1.2rem] text-white/90">The Thinking Cycle</h4>
                      <span className="font-sans text-[0.6rem] uppercase tracking-widest text-white/40">A Perspective on Awareness</span>
                    </div>
                  </div>

                  <div className="w-full flex flex-col gap-2 mt-auto">
                    <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                      <div className="absolute top-0 left-0 h-full w-[64%] bg-[#c79c6e]" />
                    </div>
                    <div className="w-full flex justify-end">
                      <span className="font-sans text-[0.65rem] text-white/50">64%</span>
                    </div>
                  </div>

                </div>
                
                <button className="flex items-center justify-center gap-3 px-8 py-4 mt-2 bg-transparent border border-[#c79c6e] rounded-sm hover:bg-[#c79c6e]/10 transition-colors w-fit group">
                  <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-[#c79c6e]">VIEW MY LIBRARY</span>
                  <ArrowRight size={14} weight="bold" className="text-[#c79c6e] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Column 2: Saved */}
              <div className="flex flex-col gap-4">
                <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-[#c79c6e]">SAVED</span>
                <div className="flex flex-col gap-4">
                  {/* Item 1 */}
                  <div className="w-full p-5 rounded-md bg-[#050505]/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-white/5 bg-black flex items-center justify-center shrink-0">
                      <Stack size={20} weight="thin" className="text-[#c79c6e]/40" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-serif text-[1rem] text-white/90 leading-tight">Choosing Clarity</h4>
                      <span className="font-sans text-[0.55rem] uppercase tracking-widest text-white/40">A Perspective on Decisions</span>
                    </div>
                  </div>
                  {/* Item 2 */}
                  <div className="w-full p-5 rounded-md bg-[#050505]/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-white/5 bg-black flex items-center justify-center shrink-0">
                      <Recycle size={20} weight="thin" className="text-[#c79c6e]/40" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-serif text-[1rem] text-white/90 leading-tight">Inner Alignment</h4>
                      <span className="font-sans text-[0.55rem] uppercase tracking-widest text-white/40">A Perspective on Values</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Recently Viewed */}
              <div className="flex flex-col gap-4">
                <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-[#c79c6e]">RECENTLY VIEWED</span>
                <div className="w-full p-5 rounded-md bg-[#050505]/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors cursor-pointer flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-white/5 bg-black flex items-center justify-center shrink-0">
                    <Target size={20} weight="thin" className="text-[#c79c6e]/40" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-serif text-[1rem] text-white/90 leading-tight">Patterns in Mind</h4>
                    <span className="font-sans text-[0.55rem] uppercase tracking-widest text-white/40">A Perspective on Habits</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
