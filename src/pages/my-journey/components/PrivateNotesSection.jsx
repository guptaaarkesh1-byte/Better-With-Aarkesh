import React, { useState } from 'react';
import { LockKey, Plus, MagnifyingGlass, CaretDown, ArrowRight, ArrowLeft } from '@phosphor-icons/react';

export default function PrivateNotesSection() {
  const [activeNoteId, setActiveNoteId] = useState(null);

  return (
    <section className="relative z-10 w-full min-h-[100dvh] flex flex-col px-4 md:px-8 py-24 mx-auto border-t border-white/5 bg-[#050505]">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full flex-1">
        
        {!activeNoteId ? (
          // Frame A & B: Private Notes List
          <div className="flex flex-col w-full flex-1">
            
            {/* Header & Create Note Button */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="flex flex-col items-start">
                <span className="font-sans text-[0.7rem] md:text-[0.8rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-4 block">
                  MY JOURNEY
                </span>
                <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-[1.1] mb-4">
                  Your Private Notes
                </h2>
                <p className="font-sans text-white/70 text-base md:text-lg font-light leading-relaxed max-w-lg mb-6">
                  A place for the thoughts you want to keep entirely your own.
                </p>
                <div className="inline-flex items-center gap-2 text-[#c79c6e] text-[0.65rem] uppercase tracking-[0.2em] font-medium">
                  <LockKey size={14} weight="bold" /> ONLY VISIBLE TO YOU
                </div>
              </div>
              
              <button className="flex items-center gap-2 px-6 py-3 border border-[#c79c6e] rounded text-[#c79c6e] text-xs uppercase tracking-widest font-medium hover:bg-[#c79c6e] hover:text-black transition-colors shrink-0">
                <Plus size={16} /> CREATE A NOTE
              </button>
            </div>

            {/* Search and Sort Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <div className="relative w-full max-w-md">
                <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Search your notes" 
                  className="w-full bg-transparent border border-white/10 rounded-lg pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e]/60 transition-colors placeholder:text-white/40"
                />
              </div>
              <button className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-medium text-white/50 hover:text-white transition-colors shrink-0">
                SORT: NEWEST <CaretDown size={14} weight="bold" />
              </button>
            </div>

            {/* Notes List */}
            <div className="flex flex-col w-full max-w-4xl flex-1">
              
              {/* Note Row 1 (Expands on Hover) */}
              <div className="group flex flex-col w-full border border-white/10 rounded-lg hover:border-[#c79c6e] hover:bg-[#c79c6e]/5 transition-colors duration-500 cursor-pointer p-6 relative overflow-hidden mb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 z-10 relative">
                  <div className="flex flex-col gap-2 flex-1">
                    <h3 className="font-serif text-2xl text-white pr-4">What I keep explaining away</h3>
                    <div className="flex flex-wrap items-center gap-1 font-sans text-xs text-white/50">
                      <span>Created 2 August 2026</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">· Last edited 3 August 2026</span>
                    </div>
                  </div>
                  
                  {/* Default Middle Column (Fades out on hover) */}
                  <div className="flex flex-col text-left shrink-0 w-48 transition-opacity duration-300 group-hover:opacity-0 group-hover:invisible">
                    <span className="font-sans text-xs text-white/60">Attached to:</span>
                    <span className="font-sans text-xs text-white/80">When insight is not enough to create change</span>
                  </div>

                  {/* Default Right Column (Fades out on hover) */}
                  <div className="flex items-center gap-4 shrink-0 justify-end w-24">
                    <div className="flex transition-all duration-300 group-hover:opacity-0 group-hover:invisible group-hover:pointer-events-none">
                      <button 
                        onClick={() => setActiveNoteId(1)}
                        className="px-6 py-2 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium"
                      >
                        OPEN
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Hover Area */}
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out w-full z-10 relative">
                  <div className="overflow-hidden">
                    <div className="pt-4 flex flex-col gap-6">
                      
                      <div className="flex flex-col gap-1">
                        <span className="font-sans text-xs text-white/60">Attached to:</span>
                        <span className="font-sans text-xs text-white/80">When insight is not enough to create change</span>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => setActiveNoteId(1)}
                          className="px-6 py-3 border border-[#c79c6e] rounded text-[0.65rem] uppercase tracking-widest font-medium text-[#c79c6e] transition-colors hover:bg-[#c79c6e] hover:text-black"
                        >
                          OPEN NOTE
                        </button>
                        <button className="text-[#c79c6e] text-[0.65rem] uppercase tracking-widest font-medium hover:text-white transition-colors">
                          EDIT
                        </button>
                        <button className="text-[#c79c6e] text-[0.65rem] uppercase tracking-widest font-medium hover:text-white transition-colors">
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Subtle Glow */}
                <div className="absolute left-0 bottom-0 w-64 h-32 bg-[#c79c6e]/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>

              {/* Note Row 2 */}
              <div className="group flex flex-col w-full border border-white/10 rounded-lg hover:border-[#c79c6e] hover:bg-[#c79c6e]/5 transition-colors duration-500 cursor-pointer p-6 relative overflow-hidden mb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 z-10 relative">
                  <div className="flex flex-col gap-2 flex-1">
                    <h3 className="font-serif text-2xl text-white pr-4">Before my next conversation</h3>
                    <span className="font-sans text-xs text-white/50">Created 30 July 2026</span>
                  </div>
                  
                  <div className="flex flex-col text-left md:text-center shrink-0 w-48">
                    <span className="font-sans text-xs text-white/60">Attached to:</span>
                    <span className="font-sans text-xs text-white/80">Coaching session - 6 August 2026</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-end w-24">
                    <button className="px-6 py-2 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium group-hover:bg-[#c79c6e] group-hover:text-black transition-colors">OPEN</button>
                  </div>
                </div>
              </div>

              {/* Note Row 3 */}
              <div className="group flex flex-col w-full border border-white/10 rounded-lg hover:border-[#c79c6e] hover:bg-[#c79c6e]/5 transition-colors duration-500 cursor-pointer p-6 relative overflow-hidden mb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 z-10 relative">
                  <div className="flex flex-col gap-2 flex-1">
                    <h3 className="font-serif text-2xl text-white pr-4">Things I know but avoid acting on</h3>
                    <span className="font-sans text-xs text-white/50">Created 24 July 2026</span>
                  </div>
                  
                  <div className="flex flex-col text-left md:text-center shrink-0 w-48">
                    <span className="font-sans text-xs text-white/80">Standalone note</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-end w-24">
                    <button className="px-6 py-2 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium group-hover:bg-[#c79c6e] group-hover:text-black transition-colors">OPEN</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center mt-12 w-full max-w-4xl">
              <button className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] font-medium text-[#c79c6e] hover:text-white transition-colors">
                VIEW ALL NOTES <ArrowRight size={16} />
              </button>
            </div>

          </div>
        ) : (
          // Frame C: Note Editor
          <div className="flex flex-col w-full animate-in fade-in duration-500 flex-1">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-2 text-white/50 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium">
                <span className="text-[#c79c6e]">MY NOTES</span>
                <span>/</span>
                <span className="text-white">EDIT NOTE</span>
              </div>
              
              <div className="inline-flex items-center gap-2 text-[#c79c6e] text-[0.65rem] uppercase tracking-[0.2em] font-medium">
                <LockKey size={14} weight="bold" /> ONLY VISIBLE TO YOU
              </div>
            </div>

            {/* Title */}
            <h2 className="font-serif text-3xl md:text-4xl text-white tracking-tight leading-[1.1] mb-8">
              What I keep explaining away
            </h2>

            {/* Editor Box */}
            <div className="w-full max-w-5xl rounded-xl border border-[#c79c6e]/40 bg-[#0a0a0a]/60 backdrop-blur-md p-8 md:p-12 mb-6 flex flex-col shadow-[0_0_20px_rgba(199,156,110,0.05)]">
              
              <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4 block">
                HEADING
              </span>
              <input 
                type="text" 
                defaultValue="What I keep explaining away"
                className="w-full bg-transparent border-b border-white/10 pb-4 mb-8 font-serif text-2xl text-white/90 focus:outline-none focus:border-[#c79c6e]/60 transition-colors"
              />
              
              <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4 block">
                NOTE
              </span>
              <textarea 
                defaultValue={`I notice how quickly I find an explanation for behaviour that leaves me unsettled.\n\nUnderstanding where it comes from does not mean I have to keep accepting it.\n\nWhat would change if I trusted the discomfort before explaining it away?`}
                className="w-full bg-transparent min-h-[200px] font-serif text-lg text-white/80 leading-relaxed focus:outline-none resize-none"
              />
            </div>

            {/* Footer Metadata */}
            <div className="flex flex-col gap-2 max-w-5xl w-full mb-12">
              <div className="flex items-center gap-2 text-white/50 font-sans text-xs">
                <span>Created 2 August 2026</span>
                <span>·</span>
                <span>Last edited 3 August 2026</span>
              </div>
              <div className="flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium mt-2">
                <span className="text-[#c79c6e]">ATTACHED TO</span>
                <span className="text-white/80">When insight is not enough to create change</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center w-full max-w-5xl mt-auto">
              <button 
                onClick={() => setActiveNoteId(null)}
                className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] font-medium text-[#c79c6e] hover:text-white transition-colors"
              >
                <ArrowLeft size={16} /> BACK TO MY NOTES
              </button>
              
              <div className="flex items-center gap-6">
                <span className="font-sans text-xs uppercase tracking-widest text-white/40 font-medium">SAVED</span>
                <button 
                  onClick={() => setActiveNoteId(null)}
                  className="px-8 py-3 border border-[#c79c6e] rounded text-xs uppercase tracking-[0.2em] font-medium text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black transition-colors"
                >
                  DONE
                </button>
              </div>
            </div>

          </div>
        )}
        
      </div>
    </section>
  );
}
