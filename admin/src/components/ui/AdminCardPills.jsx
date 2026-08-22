import React from 'react';
import { FileText } from '@phosphor-icons/react';

export default function AdminCardPills({ title, icon, pills, activePill, onPillClick }) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
      <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
        <span className="text-[#c79c6e]">{icon || <FileText size={24} />}</span>
        <h2 className="font-serif text-2xl text-white">{title}</h2>
      </div>
      
      <div className="flex flex-wrap gap-3 mt-2">
        {pills.map((pill, idx) => {
          const isActive = activePill === pill.id;
          return (
            <button
              key={idx}
              onClick={() => onPillClick(pill.id)}
              className={`px-5 py-2.5 rounded-full font-sans text-sm tracking-wide transition-all duration-300 ${
                isActive 
                  ? 'bg-[#c79c6e] text-black font-medium shadow-[0_0_15px_rgba(199,156,110,0.3)]' 
                  : 'bg-[#0a0a0a] border border-white/10 text-white/60 hover:text-white hover:border-white/20'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
