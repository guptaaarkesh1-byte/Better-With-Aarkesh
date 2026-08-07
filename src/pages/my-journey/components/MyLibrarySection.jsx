import React, { useState } from 'react';
import { CaretDown, BookmarkSimple, PlayCircle, Faders } from '@phosphor-icons/react';

export default function MyLibrarySection() {
  const [libraryTab, setLibraryTab] = useState('BOOKMARKED');
  const [libraryFilter, setLibraryFilter] = useState('ALL');

  return (
    <section className="relative z-10 w-full min-h-[100dvh] flex flex-col px-4 md:px-8 py-24 mx-auto border-t border-white/5 bg-[#050505]/40 backdrop-blur-sm">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full flex-1">
        
        {/* Header */}
        <div className="mb-12">
          <span className="font-sans text-[0.7rem] md:text-[0.8rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-4 block">
            MY JOURNEY
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-[1.1] mb-4">
            My Library
          </h2>
          <p className="font-sans text-white/70 text-base md:text-lg font-light leading-relaxed max-w-lg">
            The Perspectives, videos and tools you chose to return to.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="w-full flex items-center border-b border-white/10 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button 
            onClick={() => setLibraryTab('CONTINUE')}
            className={`px-6 md:px-8 py-3 md:py-4 font-sans text-xs uppercase tracking-widest font-medium transition-colors relative ${libraryTab === 'CONTINUE' ? 'text-[#c79c6e]' : 'text-white/50 hover:text-white'}`}
          >
            CONTINUE
            {libraryTab === 'CONTINUE' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c79c6e]" />}
          </button>
          <button 
            onClick={() => setLibraryTab('BOOKMARKED')}
            className={`px-6 md:px-8 py-3 md:py-4 font-sans text-xs uppercase tracking-widest font-medium transition-colors relative ${libraryTab === 'BOOKMARKED' ? 'text-[#c79c6e]' : 'text-white/50 hover:text-white'}`}
          >
            BOOKMARKED
            {libraryTab === 'BOOKMARKED' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c79c6e]" />}
          </button>
          <button 
            onClick={() => setLibraryTab('COMPLETED')}
            className={`px-6 md:px-8 py-3 md:py-4 font-sans text-xs uppercase tracking-widest font-medium transition-colors relative ${libraryTab === 'COMPLETED' ? 'text-[#c79c6e]' : 'text-white/50 hover:text-white'}`}
          >
            COMPLETED
            {libraryTab === 'COMPLETED' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c79c6e]" />}
          </button>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between w-full mb-10 gap-6">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {['ALL', 'PERSPECTIVES', 'VIDEOS', 'TOOLS'].map((filter) => (
              <button
                key={filter}
                onClick={() => setLibraryFilter(filter)}
                className={`font-sans text-xs uppercase tracking-widest font-medium transition-colors ${libraryFilter === filter ? 'text-[#c79c6e]' : 'text-white/50 hover:text-white'}`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-medium text-white/50 hover:text-white transition-colors">
            SORT: NEWEST <CaretDown size={14} weight="bold" />
          </button>
        </div>

        {/* Library Content List */}
        <div className="flex flex-col w-full max-w-4xl">
          
          {libraryTab === 'BOOKMARKED' && (
            <>
              {/* Row 1: Perspective */}
              <div className="group flex flex-col w-full border border-white/10 rounded-lg hover:border-[#c79c6e] hover:bg-[#c79c6e]/5 transition-colors duration-500 cursor-pointer p-6 relative overflow-hidden mb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 z-10 relative">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2 text-white/50 group-hover:text-[#c79c6e] transition-colors">
                      <BookmarkSimple size={16} weight="regular" />
                      <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium">PERSPECTIVE</span>
                    </div>
                    <h3 className="font-serif text-2xl text-white pr-4">When insight is not enough to create change</h3>
                  </div>
                  
                  <div className="flex flex-col text-left md:text-center shrink-0 w-32">
                    <span className="font-sans text-xs text-white/60">Relationships</span>
                    <span className="font-sans text-xs text-white/40">Saved 31 July 2026</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-start md:justify-end">
                    <div className="flex gap-4 transition-all duration-300 group-hover:opacity-0 group-hover:invisible group-hover:pointer-events-none">
                      <button className="px-5 py-2 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium">CONTINUE</button>
                      <button className="px-5 py-2 border border-white/10 text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium">REMOVE</button>
                    </div>
                  </div>
                </div>

                {/* Expanded Hover Area */}
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out w-full z-10 relative">
                  <div className="overflow-hidden">
                    <div className="pt-8 flex flex-col gap-6">
                      <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] block">LAST OPENED 31 JULY 2026</span>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <button className="px-6 py-3 border border-[#c79c6e] rounded text-[0.65rem] uppercase tracking-widest font-medium text-[#c79c6e] transition-colors hover:bg-[#c79c6e] hover:text-black">
                          CONTINUE READING
                        </button>
                        <button className="px-6 py-3 border border-white/10 rounded text-[0.65rem] uppercase tracking-widest font-medium text-[#c79c6e] transition-colors hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/5">
                          REMOVE BOOKMARK
                        </button>
                        <button className="px-6 py-3 border border-white/10 rounded text-[0.65rem] uppercase tracking-widest font-medium text-[#c79c6e] transition-colors hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/5">
                          MARK COMPLETE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Subtle Glow */}
                <div className="absolute left-0 bottom-0 w-64 h-32 bg-[#c79c6e]/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>

              {/* Row 2: Video */}
              <div className="group flex flex-col w-full border border-white/10 rounded-lg hover:border-white/30 hover:bg-white/5 transition-colors duration-500 cursor-pointer p-6 relative overflow-hidden mb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 z-10 relative">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors">
                      <PlayCircle size={16} weight="regular" />
                      <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium">VIDEO</span>
                    </div>
                    <h3 className="font-serif text-2xl text-white pr-4">Attention can feel like love. It isn't.</h3>
                  </div>
                  
                  <div className="flex flex-col text-left md:text-center shrink-0 w-32">
                    <span className="font-sans text-xs text-white/60">Relationships</span>
                    <span className="font-sans text-xs text-white/40">Saved 29 July 2026</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-start md:justify-end">
                    <button className="px-5 py-2 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium group-hover:bg-[#c79c6e] group-hover:text-black transition-colors">WATCH</button>
                    <button className="px-5 py-2 border border-white/10 text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium group-hover:border-[#c79c6e]/40 group-hover:bg-[#c79c6e]/5 transition-colors">REMOVE</button>
                  </div>
                </div>
              </div>

              {/* Row 3: Tool */}
              <div className="group flex flex-col w-full border border-white/10 rounded-lg hover:border-white/30 hover:bg-white/5 transition-colors duration-500 cursor-pointer p-6 relative overflow-hidden mb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 z-10 relative">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors">
                      <Faders size={16} weight="regular" />
                      <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium">TOOL</span>
                    </div>
                    <h3 className="font-serif text-2xl text-white pr-4">Wheel of Life Assessment</h3>
                  </div>
                  
                  <div className="flex flex-col text-left md:text-center shrink-0 w-32">
                    <span className="font-sans text-xs text-white/60">Clarity</span>
                    <span className="font-sans text-xs text-white/40">Saved 22 July 2026</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-start md:justify-end">
                    <button className="px-5 py-2 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium group-hover:bg-[#c79c6e] group-hover:text-black transition-colors">OPEN TOOL</button>
                    <button className="px-5 py-2 border border-white/10 text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium group-hover:border-[#c79c6e]/40 group-hover:bg-[#c79c6e]/5 transition-colors">REMOVE</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {libraryTab === 'COMPLETED' && (
            <div className="animate-in fade-in duration-300">
              <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] block mb-6">MARKED COMPLETE</span>
              
              {/* Completed Row 1 */}
              <div className="group flex flex-col w-full border border-white/10 rounded-lg hover:border-[#c79c6e] hover:bg-[#c79c6e]/5 transition-colors duration-500 cursor-pointer p-6 relative overflow-hidden mb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 z-10 relative">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2 text-white/50 group-hover:text-[#c79c6e] transition-colors">
                      <BookmarkSimple size={16} weight="regular" />
                      <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium">PERSPECTIVE</span>
                    </div>
                    <h3 className="font-serif text-2xl text-white pr-4">When insight is not enough to create change</h3>
                  </div>
                  
                  <div className="flex flex-col text-left md:text-center shrink-0 w-40">
                    <span className="font-sans text-xs text-white/60">Relationships</span>
                    <span className="font-sans text-xs text-white/40">Completed 3 August 2026</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-start md:justify-end">
                    <button className="px-5 py-2 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium group-hover:bg-[#c79c6e] group-hover:text-black transition-colors">REVISIT</button>
                    <button className="px-5 py-2 border border-white/10 text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium group-hover:border-[#c79c6e]/40 group-hover:bg-[#c79c6e]/5 transition-colors">MARK INCOMPLETE</button>
                  </div>
                </div>
              </div>

              {/* Completed Row 2 */}
              <div className="group flex flex-col w-full border border-white/10 rounded-lg hover:border-white/30 hover:bg-white/5 transition-colors duration-500 cursor-pointer p-6 relative overflow-hidden mb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 z-10 relative">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors">
                      <BookmarkSimple size={16} weight="regular" />
                      <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium">PERSPECTIVE</span>
                    </div>
                    <h3 className="font-serif text-2xl text-white pr-4">Making a decision without waiting for certainty</h3>
                  </div>
                  
                  <div className="flex flex-col text-left md:text-center shrink-0 w-40">
                    <span className="font-sans text-xs text-white/60">Decisions</span>
                    <span className="font-sans text-xs text-white/40">Completed 26 July 2026</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-start md:justify-end">
                    <button className="px-5 py-2 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium group-hover:bg-[#c79c6e] group-hover:text-black transition-colors">REVISIT</button>
                    <button className="px-5 py-2 border border-white/10 text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium group-hover:border-[#c79c6e]/40 group-hover:bg-[#c79c6e]/5 transition-colors">MARK INCOMPLETE</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>

      </div>
    </section>
  );
}
