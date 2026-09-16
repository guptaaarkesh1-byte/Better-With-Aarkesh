import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck } from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PolicyModal({ 
  isOpen, 
  onClose, 
  slug, 
  title, 
  onAgree, 
  onDecline, 
  showActions = true 
}) {
  const [content, setContent] = useState('');
  const [docTitle, setDocTitle] = useState(title || 'Terms & Conditions');
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (title) setDocTitle(title);
  }, [title]);

  // Lock background body scroll when open and handle Escape key
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          if (onClose) onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // Fetch document by slug
  useEffect(() => {
    if (isOpen && slug) {
      setLoading(true);
      const cleanSlug = slug.replace(/^\/+/, '');
      
      const fetchDoc = async () => {
        try {
          let res = await fetch(`${API_URL}/api/footer-documents/${cleanSlug}`);
          if (!res.ok && cleanSlug.startsWith('course-')) {
            const altSlug = cleanSlug.replace('course-', '');
            res = await fetch(`${API_URL}/api/footer-documents/${altSlug}`);
          } else if (!res.ok && !cleanSlug.startsWith('course-')) {
            const altSlug = `course-${cleanSlug}`;
            const altRes = await fetch(`${API_URL}/api/footer-documents/${altSlug}`);
            if (altRes.ok) res = altRes;
          }

          if (res.ok) {
            const data = await res.json();
            if (data && data.contentHtml) {
              setContent(data.contentHtml);
              if (data.title) setDocTitle(data.title);
            } else {
              setContent('<p class="text-white/60">Document content is currently unavailable.</p>');
            }
          } else {
            setContent('<p class="text-white/60">Failed to load policy document.</p>');
          }
        } catch (err) {
          console.error('Failed to fetch document:', err);
          setContent('<p class="text-white/60">Network error loading policy document.</p>');
        } finally {
          setLoading(false);
          // Scroll to top of content on load
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
          }
        }
      };

      fetchDoc();
    }
  }, [isOpen, slug]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div 
        className="bg-[#0c0c0c] border border-white/15 rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_25px_90px_rgba(0,0,0,0.95)] overflow-hidden animate-in zoom-in-95 duration-200 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/10 shrink-0 bg-[#0a0a0a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#c79c6e]/15 border border-[#c79c6e]/30 flex items-center justify-center text-[#c79c6e] shrink-0">
              <ShieldCheck size={18} weight="fill" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif text-white leading-tight">{docTitle}</h2>
              <span className="text-[0.62rem] uppercase tracking-widest text-[#c79c6e] font-sans font-semibold">
                Official Legal Policy
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/15 text-white/60 hover:text-white transition-all cursor-pointer shrink-0"
            title="Close modal (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div 
          ref={scrollContainerRef}
          data-lenis-prevent="true"
          className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 overscroll-contain scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <div className="w-9 h-9 border-2 border-[#c79c6e] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/50 text-xs font-sans uppercase tracking-widest">Loading document...</p>
            </div>
          ) : (
            <div 
              className="prose prose-invert prose-p:text-white/75 prose-p:leading-relaxed prose-headings:text-white prose-headings:font-serif prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:text-[#c79c6e] prose-h2:mt-6 prose-h2:mb-3 prose-h2:font-normal prose-h3:text-base prose-h3:text-white prose-ul:text-white/70 prose-li:my-1.5 prose-strong:text-white prose-a:text-[#c79c6e] hover:prose-a:underline max-w-none text-sm sm:text-base font-sans"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>

        {/* Footer Actions */}
        {showActions ? (
          <div className="px-6 sm:px-8 py-4 border-t border-white/10 flex items-center justify-end gap-3 sm:gap-4 shrink-0 bg-[#080808]">
            <button
              type="button"
              onClick={() => {
                if (onDecline) onDecline();
                onClose();
              }}
              className="px-5 sm:px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => {
                if (onAgree) onAgree();
                onClose();
              }}
              className="px-6 sm:px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#c79c6e] to-[#dfb98f] hover:brightness-110 text-black font-semibold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(199,156,110,0.25)] cursor-pointer"
            >
              I Agree &amp; Understand
            </button>
          </div>
        ) : (
          <div className="px-6 sm:px-8 py-3.5 border-t border-white/10 flex items-center justify-between text-xs font-sans text-white/40 shrink-0 bg-[#080808]">
            <span>Better With Aarkesh • Legal Document</span>
            <button
              type="button"
              onClick={onClose}
              className="text-[#c79c6e] hover:underline font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
