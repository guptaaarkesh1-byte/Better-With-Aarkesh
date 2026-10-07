import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, CheckCircle, Scroll } from '@phosphor-icons/react';
import { sanitizeDocumentHtml } from '../../utils/sanitizeHtml';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Default T&C content shown if backend document not found
const DEFAULT_TERMS_HTML = `
<div class="policy-default-content">
  <p><strong>Last updated:</strong> October 2026</p>

  <h3>1. Enrollment & Payment</h3>
  <p>By proceeding with payment, you agree to enroll in the selected Better With Aarkesh masterclass. All payments are processed securely via Razorpay. The course fee is non-refundable once access has been granted, except as required by applicable law.</p>

  <h3>2. Course Access</h3>
  <p>Upon successful payment, you receive lifetime access to the course content for personal, non-commercial use only. Access is bound to your registered email and may not be shared, transferred, or resold.</p>

  <h3>3. Free Coaching Sessions</h3>
  <p>Eligible course enrollees receive 3 complimentary 1-on-1 executive coaching sessions with Aarkesh Gupta. These sessions must be booked within 12 months of enrollment. Sessions have no monetary value and cannot be exchanged for cash or other services.</p>

  <h3>4. Intellectual Property</h3>
  <p>All course content — including videos, worksheets, frameworks, and community resources — is the intellectual property of Better With Aarkesh. You may not reproduce, distribute, or commercially exploit any content without prior written permission.</p>

  <h3>5. Code of Conduct</h3>
  <p>Students are expected to engage respectfully within the course community. Better With Aarkesh reserves the right to revoke access without refund if a student engages in harassment, plagiarism, or other conduct contrary to community standards.</p>

  <h3>6. Privacy</h3>
  <p>Your personal data (name, email, payment details) is collected and processed in accordance with our Privacy Policy. We do not sell your data to third parties.</p>

  <h3>7. Limitation of Liability</h3>
  <p>Better With Aarkesh provides the course content for educational purposes only. Results may vary. We make no guarantees about specific outcomes or achievements. Our liability is limited to the amount paid for the course.</p>

  <h3>8. Governing Law</h3>
  <p>These terms are governed by the laws of India. Any disputes shall be resolved through binding arbitration in accordance with Indian law.</p>

  <p style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(200,120,190,0.2); color: rgba(255,255,255,0.5); font-size: 0.75rem;">
    For queries, contact <a href="mailto:coaching@aarkeshgupta.com" style="color:#E3B8DE;">coaching@aarkeshgupta.com</a>
  </p>
</div>
`;

export default function PolicyModal({ 
  isOpen, 
  onClose, 
  slug, 
  title, 
  onAgree, 
  onDecline, 
  showActions = true,
  accentColor = '#C878BE',
  accentLight = '#E3B8DE',
  gradientFrom = '#6A1B60',
  gradientTo = '#300E32',
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
              setContent(DEFAULT_TERMS_HTML);
            }
          } else {
            setContent(DEFAULT_TERMS_HTML);
          }
        } catch (err) {
          console.error('Failed to fetch document:', err);
          setContent(DEFAULT_TERMS_HTML);
        } finally {
          setLoading(false);
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
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
      style={{ background: 'rgba(5,3,10,0.80)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
      onClick={onClose}
    >
      {/* Ambient glow behind modal */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div style={{ background: `${accentColor}18`, filter: 'blur(130px)' }} className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full" />
        <div style={{ background: `${gradientFrom}14`, filter: 'blur(100px)' }} className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] rounded-full" />
      </div>

      {/* Modal Card */}
      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl z-10"
        style={{
          background: 'linear-gradient(160deg, #120b1c 0%, #0c0718 60%, #090510 100%)',
          border: `1px solid ${accentColor}35`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.9), 0 0 60px ${accentColor}18, inset 0 1px 0 ${accentColor}20`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}80, ${accentColor}, ${accentColor}80, transparent)` }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 sm:px-8 py-5 shrink-0"
          style={{ borderBottom: `1px solid ${accentColor}20`, background: `linear-gradient(180deg, ${accentColor}08 0%, transparent 100%)` }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${gradientFrom} 0%, ${gradientTo} 100%)`,
                border: `1px solid ${accentColor}40`,
                boxShadow: `0 4px 16px ${accentColor}30`,
              }}
            >
              <Scroll size={20} weight="fill" style={{ color: accentLight }} />
            </div>
            <div>
              <h2
                className="text-lg sm:text-xl font-bold text-white leading-tight"
                style={{ fontFamily: 'var(--head, Georgia, serif)', letterSpacing: '-0.02em' }}
              >
                {docTitle}
              </h2>
              <span
                className="text-[0.6rem] uppercase tracking-[0.2em] font-semibold font-sans"
                style={{ color: accentLight }}
              >
                Official Legal Policy
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${accentColor}20`; e.currentTarget.style.color = accentLight; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          data-lenis-prevent="true"
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-56 space-y-4">
              <div
                className="w-9 h-9 rounded-full border-2 animate-spin"
                style={{ borderColor: `${accentColor}25`, borderTopColor: accentColor }}
              />
              <p className="text-white/40 text-[0.7rem] font-sans uppercase tracking-widest">Loading document...</p>
            </div>
          ) : (
            <div
              className="px-6 sm:px-8 py-6 policy-modal-dark-content"
              dangerouslySetInnerHTML={{ __html: sanitizeDocumentHtml(content) }}
              style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, fontSize: '0.875rem' }}
            />
          )}
        </div>

        {/* Footer Actions */}
        {showActions ? (
          <div
            className="px-6 sm:px-8 py-4 shrink-0 flex items-center justify-end gap-3"
            style={{ borderTop: `1px solid ${accentColor}18`, background: 'rgba(0,0,0,0.3)' }}
          >
            <p className="text-white/30 text-[0.65rem] font-sans mr-auto hidden sm:block">
              Read before proceeding
            </p>

            {/* Decline */}
            <button
              type="button"
              onClick={() => {
                if (onDecline) onDecline();
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.55)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
            >
              Decline
            </button>

            {/* Allow / Agree */}
            <button
              type="button"
              onClick={() => {
                if (onAgree) onAgree();
                onClose();
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${gradientFrom} 0%, ${accentColor} 100%)`,
                border: `1px solid ${accentColor}50`,
                color: '#fff',
                boxShadow: `0 4px 20px ${accentColor}40`,
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
            >
              <CheckCircle size={15} weight="fill" />
              I Agree & Allow
            </button>
          </div>
        ) : (
          <div
            className="px-6 sm:px-8 py-3.5 flex items-center justify-between shrink-0"
            style={{ borderTop: `1px solid ${accentColor}18`, background: 'rgba(0,0,0,0.3)' }}
          >
            <span className="text-white/30 text-[0.65rem] font-sans">Better With Aarkesh • Legal Document</span>
            <button
              type="button"
              onClick={onClose}
              className="font-semibold text-xs cursor-pointer transition-colors"
              style={{ color: accentLight }}
              onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={e => { e.currentTarget.style.textDecoration = ''; }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Dark theme prose styles scoped */}
      <style>{`
        .policy-modal-dark-content h2,
        .policy-modal-dark-content h3,
        .policy-modal-dark-content h4 {
          color: #ffffff;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
          font-size: 0.95rem;
          letter-spacing: -0.01em;
        }
        .policy-modal-dark-content h3 {
          color: ${accentLight};
        }
        .policy-modal-dark-content p {
          color: rgba(255,255,255,0.70);
          margin-bottom: 0.9rem;
          line-height: 1.8;
        }
        .policy-modal-dark-content ul,
        .policy-modal-dark-content ol {
          color: rgba(255,255,255,0.68);
          padding-left: 1.4rem;
          margin-bottom: 0.9rem;
        }
        .policy-modal-dark-content li {
          margin-bottom: 0.35rem;
          line-height: 1.75;
        }
        .policy-modal-dark-content a {
          color: ${accentLight};
          text-decoration: underline;
        }
        .policy-modal-dark-content strong {
          color: rgba(255,255,255,0.9);
          font-weight: 600;
        }
        .policy-modal-dark-content hr {
          border-color: rgba(200,120,190,0.2);
          margin: 1.25rem 0;
        }
        .policy-default-content h3 {
          color: ${accentLight};
          font-size: 0.875rem;
          font-weight: 700;
          margin-top: 1.4rem;
          margin-bottom: 0.35rem;
          letter-spacing: 0.01em;
          text-transform: uppercase;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
        }
        .policy-default-content p {
          color: rgba(255,255,255,0.68);
          font-size: 0.845rem;
          line-height: 1.8;
          margin-bottom: 0.75rem;
        }
      `}</style>
    </div>,
    document.body
  );
}
