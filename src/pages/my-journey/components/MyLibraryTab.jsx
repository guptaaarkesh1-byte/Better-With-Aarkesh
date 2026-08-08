import React, { useState } from 'react';
import { BookmarkSimple, PlayCircle, Faders } from '@phosphor-icons/react';

export default function MyLibraryTab() {
  const [mainTab, setMainTab] = useState('BOOKMARKED');
  const [subTab, setSubTab] = useState('ALL');

  const mainTabs = ['CONTINUE', 'BOOKMARKED', 'COMPLETED'];
  const subTabs = ['ALL', 'PERSPECTIVES', 'VIDEOS', 'TOOLS'];

  const items = [
    {
      id: 1,
      type: 'PERSPECTIVE',
      title: 'When insight is not enough to create change',
      category: 'Relationships',
      savedDate: '31 July 2026',
      primaryAction: 'CONTINUE',
      icon: BookmarkSimple
    },
    {
      id: 2,
      type: 'VIDEO',
      title: "Attention can feel like love. It isn't.",
      category: 'Relationships',
      savedDate: '29 July 2026',
      primaryAction: 'WATCH',
      icon: PlayCircle
    },
    {
      id: 3,
      type: 'TOOL',
      title: 'Wheel of Life Assessment',
      category: 'Clarity',
      savedDate: '22 July 2026',
      primaryAction: 'OPEN TOOL',
      icon: Faders
    }
  ];

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl border border-[#c79c6e]/40 bg-[#0a0a0a]/70 backdrop-blur-sm p-8 md:p-12 flex flex-col animate-in fade-in duration-500 mb-20 relative overflow-hidden group hover:border-[#c79c6e]/60 transition-colors duration-500 hover:shadow-[0_0_40px_rgba(199,156,110,0.1)]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#c79c6e]/5 rounded-full blur-[100px] pointer-events-none" />
      {/* Header */}
      <div className="mb-10">
        <h2 className="font-serif text-3xl md:text-4xl text-white mb-3 tracking-tight">My Library</h2>
        <p className="font-sans text-white/60 font-light">The Perspectives, videos and tools you chose to return to.</p>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-8 border-b border-white/10 mb-6">
        {mainTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={`pb-4 font-sans text-xs uppercase tracking-[0.15em] font-medium transition-colors relative ${
              mainTab === tab ? 'text-[#c79c6e]' : 'text-white/40 hover:text-white/80'
            }`}
          >
            {tab}
            {mainTab === tab && (
              <span className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-[#c79c6e]" />
            )}
          </button>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-6 mb-8">
        {subTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`font-sans text-[0.65rem] uppercase tracking-[0.15em] font-medium transition-colors ${
              subTab === tab ? 'text-[#c79c6e]' : 'text-white/40 hover:text-white/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {items.map(item => (
          <div key={item.id} className="group/card w-full rounded-xl border border-white/5 bg-[#050505]/60 backdrop-blur-md p-6 flex flex-col hover:border-white/10 transition-all duration-500 ease-out">
            
            {/* Main Visible Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-white/40">
                  <item.icon size={14} weight="light" />
                  <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium">{item.type}</span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl text-white/90 transition-colors group-hover/card:text-white">{item.title}</h3>
              </div>

              <div className="flex flex-col md:text-right shrink-0">
                <span className="font-sans text-[0.7rem] text-white/80 mb-1">{item.category}</span>
                <span className="font-sans text-[0.6rem] text-white/40">Saved {item.savedDate}</span>
              </div>
            </div>

            {/* Expandable Actions on Hover */}
            <div className="max-h-0 overflow-hidden opacity-0 group-hover/card:max-h-[150px] group-hover/card:opacity-100 group-hover/card:mt-6 transition-all duration-500 ease-in-out">
              <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-6">
                <button className="px-5 py-2.5 rounded border border-[#c79c6e]/60 text-[#c79c6e] hover:bg-[#c79c6e]/10 font-sans text-[0.65rem] uppercase tracking-[0.2em] transition-colors">
                  {item.primaryAction}
                </button>
                <button className="px-5 py-2.5 rounded border border-white/5 text-white/40 hover:border-white/20 hover:text-white/80 font-sans text-[0.65rem] uppercase tracking-[0.2em] transition-colors">
                  REMOVE BOOKMARK
                </button>
                <button className="px-5 py-2.5 rounded border border-white/5 text-white/40 hover:border-white/20 hover:text-white/80 font-sans text-[0.65rem] uppercase tracking-[0.2em] transition-colors">
                  MARK COMPLETE
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
