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
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div 
        className="bg-[#fbfbf9] border border-[#eadcd3] rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#eadcd3] shrink-0 bg-[#fbfbf9]/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#fbf0eb] border border-[#e8c4e2] flex items-center justify-center text-[#c9542f] shrink-0 shadow-xs">
              <ShieldCheck size={20} weight="fill" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif text-[#111010] leading-tight font-normal">{docTitle}</h2>
              <span className="text-[0.62rem] uppercase tracking-widest text-[#c9542f] font-sans font-bold">
                Official Legal Policy
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#7a756b] hover:text-[#111010] hover:bg-[#fbf0eb] transition-all cursor-pointer shrink-0"
            title="Close modal (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div 
          ref={scrollContainerRef}
          data-lenis-prevent="true"
          className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 overscroll-contain scroll-smooth custom-scrollbar bg-[#fbfbf9]"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <div className="w-8 h-8 border-2 border-[#c9542f]/20 border-t-[#c9542f] rounded-full animate-spin"></div>
              <p className="text-[#7a756b] text-xs font-sans uppercase tracking-widest">Loading document...</p>
            </div>
          ) : (
            <div 
              className="legal-policy-content-light max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>

        {/* Footer Actions */}
        {showActions ? (
          <div className="px-6 sm:px-8 py-4 border-t border-[#eadcd3] flex items-center justify-end gap-3 sm:gap-4 shrink-0 bg-white">
            <button
              type="button"
              onClick={() => {
                if (onDecline) onDecline();
                onClose();
              }}
              className="px-5 sm:px-6 py-2.5 rounded-full border border-black/15 text-[#555047] hover:text-[#111010] hover:bg-[#fbf0eb] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => {
                if (onAgree) onAgree();
                onClose();
              }}
              className="px-6 sm:px-8 py-2.5 rounded-full bg-[#111010] hover:bg-[#c9542f] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              I Agree &amp; Understand
            </button>
          </div>
        ) : (
          <div className="px-6 sm:px-8 py-3.5 border-t border-[#eadcd3] flex items-center justify-between text-xs font-sans text-[#7a756b] shrink-0 bg-white">
            <span>Better With Aarkesh • Legal Document</span>
            <button
              type="button"
              onClick={onClose}
              className="text-[#c9542f] hover:underline font-semibold cursor-pointer"
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
