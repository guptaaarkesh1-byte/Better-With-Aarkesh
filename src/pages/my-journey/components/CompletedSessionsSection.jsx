import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, LockKey } from '@phosphor-icons/react';

export default function CompletedSessionsSection() {
  const [activeSessionId, setActiveSessionId] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        const yOffset = -80; 
        const y = containerRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 100);
    }
  }, [activeSessionId]);

  return (
    <section ref={containerRef} className="relative z-10 w-full min-h-[100dvh] flex flex-col px-4 md:px-8 py-24 mx-auto border-t border-white/5">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full flex-1">
        
        {!activeSessionId ? (
          // Frame A & B: Completed Sessions List
          <div className="flex flex-col w-full">
            {/* Header */}
            <div className="mb-12">
              <span className="font-sans text-[0.7rem] md:text-[0.8rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-4 block">
                YOUR COACHING JOURNEY
              </span>
              <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-[1.1] mb-4">
                Conversations you can<br/>return to.
              </h2>
              <p className="font-sans text-white/70 text-base md:text-lg font-light leading-relaxed max-w-md">
                A record of your completed sessions and anything intentionally shared with you.
              </p>
            </div>

            {/* Sessions List */}
            <div className="flex flex-col w-full max-w-3xl">
              
              {/* Row 1 (With Notes) */}
              <div className="group flex flex-col w-full border-t border-b border-white/10 hover:border-[#c79c6e] hover:bg-[#c79c6e]/5 transition-colors duration-500 cursor-pointer p-6 relative overflow-hidden min-h-[120px]">
                
                {/* Default Visible Content */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 z-10 relative">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-sans text-xs uppercase tracking-[0.2em] font-medium text-white/60 group-hover:text-white transition-colors">28 JULY 2026</span>
                      <span className="font-sans text-xs uppercase tracking-[0.2em] font-medium text-white/40">· 90-MINUTE CONVERSATION</span>
                    </div>
                    <h3 className="font-serif text-xl text-white">Making a decision without waiting for certainty</h3>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">NOTES SHARED</span>
                    <button 
                      onClick={() => setActiveSessionId(1)}
                      className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] hover:text-white transition-colors flex items-center gap-2"
                    >
                      VIEW SESSION <span className="text-sm leading-none">→</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Content on Hover */}
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out w-full z-10 relative">
                  <div className="overflow-hidden">
                    <div className="pt-6 flex flex-col gap-6">
                      <div>
                        <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-2 block">SHARED AFTER THIS CONVERSATION</span>
                        <p className="font-sans text-white/70 text-sm font-light">You do not need perfect certainty to make an honest decision.</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <button 
                          onClick={() => setActiveSessionId(1)}
                          className="px-6 py-3 border border-white/20 rounded text-[0.65rem] uppercase tracking-widest font-medium text-white/80 transition-colors hover:border-[#c79c6e] hover:text-[#c79c6e]"
                        >
                          VIEW SESSION
                        </button>
                        <button 
                          onClick={() => setActiveSessionId(1)}
                          className="px-6 py-3 border border-[#c79c6e] rounded text-[0.65rem] uppercase tracking-widest font-medium text-[#c79c6e] transition-colors hover:bg-[#c79c6e] hover:text-black"
                        >
                          OPEN SHARED NOTES
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtle Glow */}
                <div className="absolute left-0 bottom-0 w-64 h-32 bg-[#c79c6e]/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>

              {/* Row 2 (With Notes) */}
              <div className="group flex flex-col w-full border-b border-white/10 hover:border-[#c79c6e] hover:bg-[#c79c6e]/5 transition-colors duration-500 cursor-pointer p-6 relative overflow-hidden min-h-[120px]">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 z-10 relative">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-sans text-xs uppercase tracking-[0.2em] font-medium text-white/60 group-hover:text-white transition-colors">14 JULY 2026</span>
                      <span className="font-sans text-xs uppercase tracking-[0.2em] font-medium text-white/40">· 90-MINUTE CONVERSATION</span>
                    </div>
                    <h3 className="font-serif text-xl text-white">Recognising the pattern beneath the conflict</h3>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">NOTES SHARED</span>
                    <button className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] hover:text-white transition-colors flex items-center gap-2">
                      VIEW SESSION <span className="text-sm leading-none">→</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3 (Completed, no notes) */}
              <div className="group flex flex-col w-full border-b border-white/10 hover:border-white/30 hover:bg-white/5 transition-colors duration-500 cursor-pointer p-6 relative overflow-hidden min-h-[120px]">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 z-10 relative">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-sans text-xs uppercase tracking-[0.2em] font-medium text-white/60 group-hover:text-white transition-colors">30 JUNE 2026</span>
                      <span className="font-sans text-xs uppercase tracking-[0.2em] font-medium text-white/40">· INTRODUCTORY CONVERSATION</span>
                    </div>
                    <h3 className="font-serif text-xl text-white/80 group-hover:text-white transition-colors">What feels important right now</h3>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-white/60">COMPLETED</span>
                    <button className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] hover:text-white transition-colors flex items-center gap-2">
                      VIEW SESSION <span className="text-sm leading-none">→</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          // Frame C: Session Opened View
          <div className="flex flex-col w-full animate-in fade-in duration-500">
            
            {/* Header Badge & Back Button */}
            <div className="flex flex-col items-start gap-4 mb-6">
              <div className="flex items-center gap-2 text-white/60 font-sans text-xs uppercase tracking-[0.2em] font-medium">
                <span>28 JULY 2026</span>
                <span>·</span>
                <span>90-MINUTE CONVERSATION</span>
                <span>·</span>
                <span className="text-white">COMPLETED</span>
              </div>
              
              <button 
                onClick={() => setActiveSessionId(null)}
                className="flex items-center gap-2 text-[#c79c6e] hover:text-white transition-colors text-xs uppercase tracking-widest font-medium"
              >
                <ArrowLeft size={16} /> BACK TO COACHING JOURNEY
              </button>
            </div>

            {/* Title */}
            <h2 className="font-serif text-3xl md:text-4xl text-white tracking-tight leading-[1.1] mb-6">
              Making a decision without<br/>waiting for certainty
            </h2>

            {/* Session Cards */}
            <div className="flex flex-col gap-6 w-full max-w-3xl">
              
              {/* SHARED SUMMARY Card */}
              <div className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 backdrop-blur-md p-6 md:p-8">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-3 block">
                  SHARED SUMMARY
                </span>
                <p className="font-serif text-white/80 text-base md:text-lg leading-relaxed font-light">
                  We explored the difference between wanting certainty and having enough clarity to choose. The aim was not to remove doubt, but to decide which trade-offs you are willing to own.
                </p>
              </div>

              {/* COACH-SHARED NOTES Card */}
              <div className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 backdrop-blur-md p-6 md:p-8 mb-6">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4 block">
                  COACH-SHARED NOTES
                </span>
                
                <ul className="flex flex-col gap-2 font-serif text-white/80 text-base md:text-lg leading-relaxed font-light mb-6 list-disc pl-5 marker:text-[#c79c6e]">
                  <li>Revisit the values you identified before making the final choice.</li>
                  <li>Notice when anxiety is being treated as evidence.</li>
                </ul>

                <p className="font-sans text-white/40 text-sm font-light">
                  These are notes Aarkesh deliberately shared with you.<br/>
                  His confidential coaching notes are not shown here.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button className="px-6 py-4 border border-[#c79c6e] rounded-lg text-xs uppercase tracking-widest font-medium text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black transition-colors flex items-center justify-center gap-3">
                  <LockKey size={16} /> ADD A PRIVATE NOTE
                </button>
                <button className="font-sans text-xs uppercase tracking-widest font-medium text-[#c79c6e] hover:text-white transition-colors">
                  VIEW MY PRIVATE NOTES
                </button>
              </div>
              
              <p className="font-sans text-white/40 text-xs font-light mt-4">
                Private notes are visible only in My Notes.
              </p>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
