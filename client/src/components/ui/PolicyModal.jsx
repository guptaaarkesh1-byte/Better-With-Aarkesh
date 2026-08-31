import React, { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PolicyModal({ isOpen, onClose, slug, title, onAgree, onDecline, showActions = true }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && slug) {
      setLoading(true);
      fetch(`${API_URL}/api/footer-documents/slug/${slug}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.contentHtml) {
            setContent(data.contentHtml);
          } else {
            setContent('<p>Document not found.</p>');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch document:', err);
          setContent('<p>Failed to load document.</p>');
          setLoading(false);
        });
    }
  }, [isOpen, slug]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <h2 className="text-2xl font-serif text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-4">
              <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/50 text-sm">Loading document...</p>
            </div>
          ) : (
            <div 
              className="prose prose-invert prose-p:text-white/70 prose-headings:text-white max-w-none prose-a:text-accent-gold"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>

        {/* Footer Actions */}
        {showActions && (
          <div className="p-6 border-t border-white/10 flex items-center justify-end gap-4 shrink-0 bg-[#0a0a0a]">
            <button
              onClick={() => {
                if (onDecline) onDecline();
                onClose();
              }}
              className="px-6 py-3 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-semibold tracking-wide transition-colors"
            >
              DENY
            </button>
            <button
              onClick={() => {
                if (onAgree) onAgree();
                onClose();
              }}
              className="px-8 py-3 rounded-lg bg-accent-gold text-black hover:bg-white text-sm font-semibold tracking-wide transition-colors"
            >
              ALLOW
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
