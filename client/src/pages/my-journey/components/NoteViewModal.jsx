import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, LockKey } from '@phosphor-icons/react';

export default function NoteViewModal({ isOpen, onClose, note }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !note) return null;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const wordCount = note.content ? note.content.replace(/<[^>]*>?/gm, ' ').trim().split(/\s+/).filter(Boolean).length : 0;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="relative w-full max-w-2xl h-full bg-[#f5f1e8] text-[#111010] border-l border-black/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 md:px-10 border-b border-black/10 shrink-0 bg-[#ede7d8]">
          <div className="flex items-center gap-2 sm:gap-3 text-[#802673]">
            <LockKey size={15} weight="bold" />
            <span className="font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold">
              VIEW NOTE
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-[#7a756b] hover:text-[#111010] transition-colors p-1.5 sm:p-2 -mr-1 sm:-mr-2 cursor-pointer"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Scrollable Area */}
        <div 
          className="flex-1 w-full p-4 sm:p-6 md:p-10 flex flex-col gap-4 sm:gap-6 overflow-y-auto overflow-x-hidden overscroll-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          data-lenis-prevent="true"
        >
          
          {/* Title and Meta */}
          <div className="flex flex-col gap-2 sm:gap-3 mb-2 sm:mb-4">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#111010] leading-tight font-medium">
              {note.title}
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#555047]">
              Created {formatDate(note.createdAt)} • {note.attachedTo || 'Standalone note'}
            </p>
          </div>

          {/* Note Content Box */}
          <div className="flex-1 bg-white border border-black/10 rounded-2xl flex flex-col overflow-hidden relative min-h-0 shadow-xs">
            <div 
              className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto overflow-x-hidden overscroll-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] break-words"
              data-lenis-prevent="true"
            >
              <div 
                className="prose prose-sm sm:prose-base max-w-full break-words
                  prose-headings:font-serif prose-headings:font-medium prose-headings:text-[#111010] 
                  prose-p:font-sans prose-p:font-light prose-p:text-[#111010] prose-p:leading-relaxed prose-p:whitespace-pre-wrap prose-p:break-words
                  prose-a:text-[#802673] hover:prose-a:text-[#962e87] prose-a:break-all
                  prose-strong:text-[#111010] prose-strong:font-semibold
                  prose-ul:list-disc prose-ol:list-decimal
                  prose-li:text-[#3d3832] prose-li:font-light prose-li:marker:text-[#802673]"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            </div>
            
            {/* Meta Footer inside the box */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[0.7rem] sm:text-xs font-sans text-[#7a756b] bg-[#faf8f5] border-t border-black/10 shrink-0 gap-1 sm:gap-0">
              <span>Last edited {formatDate(note.updatedAt || note.createdAt)} at {formatTime(note.updatedAt || note.createdAt)}</span>
              <span>{wordCount} words</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 md:px-10 border-t border-black/10 shrink-0 flex justify-end bg-[#ede7d8]">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl border border-black/15 bg-white text-[#111010] hover:bg-[#f6eaf4] font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold transition-all text-center cursor-pointer shadow-2xs"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
