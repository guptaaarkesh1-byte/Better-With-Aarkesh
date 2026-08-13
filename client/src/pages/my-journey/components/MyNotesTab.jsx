import React from 'react';
import { LockKey, MagnifyingGlass, CaretDown, Plus } from '@phosphor-icons/react';

export default function MyNotesTab() {
  const notes = [
    {
      id: 1,
      title: 'What I keep explaining away',
      date: 'Created 2 August 2026',
      attachedTo: 'When insight is not enough to create change'
    },
    {
      id: 2,
      title: 'Before my next conversation',
      date: 'Created 30 July 2026',
      attachedTo: 'Coaching session - 6 August 2026'
    },
    {
      id: 3,
      title: 'Things I know but avoid acting on',
      date: 'Created 24 July 2026',
      attachedTo: 'Standalone note'
    }
  ];

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500 rounded-3xl bg-[#0a0a0a]/40 backdrop-blur-xl border border-[#c79c6e]/10 p-8 md:p-14 shadow-2xl relative overflow-hidden">
      
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c79c6e]/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-2">
            Your Private Notes
          </h2>
          <p className="font-sans text-white/70 text-base font-light">
            A place for the thoughts you want to keep entirely your own.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <LockKey size={14} weight="regular" className="text-[#c79c6e]" />
            <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">
              ONLY VISIBLE TO YOU
            </span>
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-4 rounded border border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e]/5 font-sans text-[0.7rem] uppercase tracking-[0.2em] font-medium transition-colors shrink-0">
          <Plus size={16} />
          <span>CREATE A NOTE</span>
        </button>
      </div>

      {/* Toolbar Area */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            placeholder="Search your notes"
            className="w-full bg-[#0a0a0a]/40 backdrop-blur-md border border-white/10 rounded-lg py-3.5 pl-12 pr-4 text-sm font-sans text-white placeholder-white/40 focus:outline-none focus:border-[#c79c6e]/50 transition-colors"
          />
        </div>
        
        {/* Sort */}
        <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-sans text-[0.7rem] uppercase tracking-[0.2em] font-medium shrink-0">
          <span>SORT: NEWEST</span>
          <CaretDown size={14} />
        </button>
      </div>

      {/* Notes List */}
      <div className="flex flex-col gap-5 mb-10">
        {notes.map((note) => (
          <div 
            key={note.id} 
            className="w-full rounded-2xl border border-white/5 bg-[#0a0a0a]/40 backdrop-blur-md hover:bg-[#0a0a0a]/70 hover:backdrop-blur-lg hover:border-[#c79c6e]/30 transition-all duration-500 p-8 md:p-10 flex flex-col group overflow-hidden"
          >
            {/* Top Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
              {/* Left: Title & Date */}
              <div className="flex flex-col gap-3 flex-1 md:w-1/3">
                <h3 className="font-serif text-2xl md:text-3xl text-white group-hover:text-[#c79c6e] transition-colors leading-tight">
                  {note.title}
                </h3>
                <p className="font-sans text-white/40 text-xs md:text-sm font-light">
                  {note.date}
                </p>
              </div>

              {/* Middle: Attachment */}
              <div className="flex flex-col gap-1 flex-1 md:w-1/3 md:items-center text-left md:text-center mt-2 md:mt-0">
                <span className="font-sans text-[0.7rem] text-white/40">Attached to:</span>
                <span className="font-sans text-sm text-white/90 max-w-[240px] leading-relaxed">
                  {note.attachedTo}
                </span>
              </div>

              {/* Right: Default Action (Fades out on hover) */}
              <div className="shrink-0 mt-4 md:mt-0 md:w-1/3 flex justify-start md:justify-end opacity-100 group-hover:opacity-0 group-hover:pointer-events-none transition-opacity duration-300">
                <button className="px-8 py-3 rounded border border-white/20 text-white/60 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium">
                  OPEN
                </button>
              </div>
            </div>

            {/* Expandable Action Row */}
            <div className="w-full grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-500 ease-in-out">
              <div className="overflow-hidden flex flex-col md:flex-row gap-4 pt-6 mt-4 border-t border-white/5 group-hover:border-[#c79c6e]/20">
                <button className="flex-1 py-4 rounded border border-white/10 hover:border-[#c79c6e]/50 hover:bg-[#c79c6e]/5 text-white/60 hover:text-white font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors">
                  OPEN
                </button>
                <button className="flex-1 py-4 rounded border border-white/10 hover:border-[#c79c6e]/50 hover:bg-[#c79c6e]/5 text-white/60 hover:text-white font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors">
                  EDIT
                </button>
                <button className="flex-1 py-4 rounded border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 text-red-400 hover:text-red-300 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors">
                  DELETE
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* View All */}
      <div className="flex justify-center mt-6">
        <button className="flex items-center gap-2 font-sans text-[0.75rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] hover:text-white transition-colors">
          <span>VIEW ALL NOTES</span>
          <span>&rarr;</span>
        </button>
      </div>

    </div>
  );
}
