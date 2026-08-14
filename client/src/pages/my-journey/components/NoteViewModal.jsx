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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="relative w-full max-w-2xl h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 md:px-10 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3 text-[#c79c6e]">
            <LockKey size={16} weight="regular" />
            <span className="font-sans text-[0.7rem] uppercase tracking-[0.2em] font-semibold">
              VIEW NOTE
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-2 -mr-2"
          >
            <X size={20} weight="light" />
          </button>
        </div>

        {/* Scrollable Area */}
        <div 
          className="flex-1 w-full p-6 md:p-10 flex flex-col gap-6 overflow-y-auto overflow-x-hidden overscroll-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          data-lenis-prevent="true"
        >
          
          {/* Title and Meta */}
          <div className="flex flex-col gap-3 mb-4">
            <h1 className="font-serif text-4xl text-white leading-tight">
              {note.title}
            </h1>
            <p className="font-sans text-sm text-white/50">
              Created {formatDate(note.createdAt)} • {note.attachedTo || 'Standalone note'}
            </p>
          </div>

          {/* Note Content Box */}
          <div className="flex-1 border border-white/10 rounded-xl flex flex-col overflow-hidden relative min-h-0">
            <div 
              className="p-6 md:p-8 flex-1 overflow-y-auto overflow-x-hidden overscroll-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] break-words"
              data-lenis-prevent="true"
            >
              <div 
                className="prose prose-invert prose-base max-w-full break-words
                  prose-headings:font-serif prose-headings:font-normal prose-headings:text-white 
                  prose-p:font-sans prose-p:font-light prose-p:text-white/80 prose-p:leading-relaxed prose-p:whitespace-pre-wrap prose-p:break-words
                  prose-a:text-[#c79c6e] hover:prose-a:text-[#d4b08c] prose-a:break-all
                  prose-strong:text-white prose-strong:font-semibold
                  prose-ul:list-disc prose-ol:list-decimal
                  prose-li:text-white/80 prose-li:font-light prose-li:marker:text-white/40"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            </div>
            
            {/* Meta Footer inside the box */}
            <div className="px-6 py-4 flex justify-between items-center text-xs font-sans text-white/40 bg-white/[0.02] border-t border-white/5 shrink-0">
              <span>Last edited {formatDate(note.updatedAt || note.createdAt)} at {formatTime(note.updatedAt || note.createdAt)}</span>
              <span>{wordCount} words</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 md:px-10 border-t border-white/10 shrink-0 flex justify-end bg-[#0a0a0a]">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded border border-white/10 bg-[#111111] text-white/90 hover:bg-white/5 font-sans text-[0.7rem] uppercase tracking-[0.2em] font-medium transition-colors"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
