import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import { ArrowLeft, ShieldCheck } from '@phosphor-icons/react';
import { sanitizeDocumentHtml } from '../utils/sanitizeHtml';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ─────────────────────────────────────────────────────────────────
   POLICY_STYLES: Injected as a <style> tag directly into the DOM.
   This COMPLETELY bypasses Tailwind's preflight CSS cascade — 
   guaranteeing bullets, spacing, and all rich-text formatting 
   on the live website exactly as shown in the admin editor.
   ───────────────────────────────────────────────────────────────── */
const POLICY_STYLES = `
  .policy-rich-content {
    overflow: visible !important;
    color: #2b2723;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1rem;
    line-height: 1.85;
  }

  .policy-rich-content p {
    margin-top: 0.9rem !important;
    margin-bottom: 0.9rem !important;
    color: #2b2723 !important;
    line-height: 1.85 !important;
    display: block !important;
  }

  .policy-rich-content h1 {
    font-family: 'Fraunces', Georgia, serif !important;
    font-size: 2rem !important;
    font-weight: 700 !important;
    color: #111010 !important;
    margin-top: 2rem !important;
    margin-bottom: 0.85rem !important;
    line-height: 1.25 !important;
    display: block !important;
  }

  .policy-rich-content h2 {
    font-family: 'Fraunces', Georgia, serif !important;
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    color: #111010 !important;
    margin-top: 2rem !important;
    margin-bottom: 0.75rem !important;
    line-height: 1.3 !important;
    display: block !important;
  }

  .policy-rich-content h3 {
    font-family: 'Fraunces', Georgia, serif !important;
    font-size: 1.2rem !important;
    font-weight: 600 !important;
    color: #111010 !important;
    margin-top: 1.5rem !important;
    margin-bottom: 0.6rem !important;
    display: block !important;
  }

  .policy-rich-content h4,
  .policy-rich-content h5,
  .policy-rich-content h6 {
    font-family: 'Fraunces', Georgia, serif !important;
    font-size: 1.05rem !important;
    font-weight: 600 !important;
    color: #111010 !important;
    margin-top: 1.25rem !important;
    margin-bottom: 0.5rem !important;
    display: block !important;
  }

  .policy-rich-content strong,
  .policy-rich-content b {
    font-weight: 700 !important;
    color: #111010 !important;
  }

  .policy-rich-content em,
  .policy-rich-content i {
    font-style: italic !important;
  }

  .policy-rich-content u {
    text-decoration: underline !important;
    text-underline-offset: 3px !important;
  }

  .policy-rich-content s,
  .policy-rich-content strike,
  .policy-rich-content del {
    text-decoration: line-through !important;
  }

  /* ══════════ BULLET POINTS & NUMBERED LISTS — NUCLEAR OVERRIDE ══════════ */
  .policy-rich-content ul {
    list-style: disc !important;
    list-style-type: disc !important;
    list-style-position: outside !important;
    padding-left: 2rem !important;
    margin-top: 1rem !important;
    margin-bottom: 1rem !important;
    display: block !important;
    overflow: visible !important;
  }

  .policy-rich-content ol {
    list-style: decimal !important;
    list-style-type: decimal !important;
    list-style-position: outside !important;
    padding-left: 2rem !important;
    margin-top: 1rem !important;
    margin-bottom: 1rem !important;
    display: block !important;
    overflow: visible !important;
  }

  .policy-rich-content li {
    display: list-item !important;
    margin-top: 0.45rem !important;
    margin-bottom: 0.45rem !important;
    line-height: 1.8 !important;
    color: #2b2723 !important;
    overflow: visible !important;
  }

  .policy-rich-content ul > li {
    list-style-type: disc !important;
    display: list-item !important;
  }

  .policy-rich-content ol > li {
    list-style-type: decimal !important;
    display: list-item !important;
  }

  /* TipTap wraps <li> content inside <p> — MUST be inline so bullet marker shows */
  .policy-rich-content li p,
  .policy-rich-content li > p,
  .policy-rich-content li span,
  .policy-rich-content li > span {
    display: inline !important;
    margin: 0 !important;
    padding: 0 !important;
    line-height: inherit !important;
  }

  /* Nested list levels */
  .policy-rich-content ul ul {
    list-style-type: circle !important;
    margin-top: 0.3rem !important;
    margin-bottom: 0.3rem !important;
    padding-left: 1.75rem !important;
  }
  .policy-rich-content ul ul ul { list-style-type: square !important; }
  .policy-rich-content ol ol { list-style-type: lower-alpha !important; }
  .policy-rich-content ol ol ol { list-style-type: lower-roman !important; }

  .policy-rich-content hr {
    border: none !important;
    border-top: 1px solid rgba(0, 0, 0, 0.12) !important;
    margin: 2rem 0 !important;
    display: block !important;
    height: 0 !important;
  }

  .policy-rich-content a {
    color: #c9542f !important;
    text-decoration: underline !important;
    text-underline-offset: 3px !important;
    font-weight: 500 !important;
    transition: color 0.2s !important;
  }

  .policy-rich-content a:hover { color: #111010 !important; }

  .policy-rich-content blockquote {
    border-left: 3px solid #c9542f !important;
    background: #faf7f0 !important;
    padding: 0.75rem 1.25rem !important;
    margin: 1.25rem 0 !important;
    font-style: italic !important;
    color: #44403c !important;
    border-radius: 0 0.5rem 0.5rem 0 !important;
    display: block !important;
  }

  .policy-rich-content table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 1.5rem 0 !important;
    font-size: 0.95rem !important;
    border: 1px solid rgba(0, 0, 0, 0.12) !important;
  }

  .policy-rich-content th,
  .policy-rich-content td {
    border: 1px solid rgba(0, 0, 0, 0.12) !important;
    padding: 0.65rem 0.9rem !important;
    text-align: left !important;
    vertical-align: top !important;
    line-height: 1.6 !important;
  }

  .policy-rich-content th {
    background: #faf7f0 !important;
    font-weight: 700 !important;
    color: #111010 !important;
    font-family: 'Fraunces', Georgia, serif !important;
  }

  /* Text alignment (from editor toolbar) */
  .policy-rich-content [style*="text-align: center"] { text-align: center !important; }
  .policy-rich-content [style*="text-align: right"] { text-align: right !important; }
  .policy-rich-content [style*="text-align: justify"] { text-align: justify !important; }

  /* Ghost / broken images from clipboard paste — hidden */
  .policy-rich-content img[src=""],
  .policy-rich-content img:not([src]),
  .policy-rich-content img[src*="webkit-fake-url"],
  .policy-rich-content img[src^="about:blank"] {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    width: 0 !important;
  }

  .policy-rich-content img {
    max-width: 100% !important;
    height: auto !important;
    border-radius: 0.75rem !important;
    margin: 1.5rem auto !important;
    display: block !important;
  }
`;

export default function FooterDocumentView({ slug: propSlug }) {
  const { slug: paramSlug } = useParams();
  const location = useLocation();
  
  // Resolve effective slug
  let effectiveSlug = propSlug || paramSlug;
  if (!effectiveSlug) {
    const cleanPath = location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
    if (cleanPath && !cleanPath.startsWith('legal/')) {
      effectiveSlug = cleanPath;
    }
  }

  // Handle common aliases
  if (effectiveSlug === 'refund-policy') {
    effectiveSlug = 'refund-and-cancellation';
  }

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        const cleanSlug = (effectiveSlug || '').replace(/^\/+/, '');
        let res = await fetch(`${API_URL}/api/footer-documents/${cleanSlug}`);
        
        if (!res.ok && cleanSlug.startsWith('course-')) {
          const altSlug = cleanSlug.replace('course-', '');
          res = await fetch(`${API_URL}/api/footer-documents/${altSlug}`);
        } else if (!res.ok && !cleanSlug.startsWith('course-')) {
          const altSlug = `course-${cleanSlug}`;
          const altRes = await fetch(`${API_URL}/api/footer-documents/${altSlug}`);
          if (altRes.ok) res = altRes;
        }

        if (!res.ok) throw new Error('Document not found');
        const data = await res.json();
        setDocument(data);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Document not found');
      } finally {
        setLoading(false);
      }
    };

    if (effectiveSlug) {
      fetchDocument();
    } else {
      setLoading(false);
      setError('Invalid URL');
    }
  }, [effectiveSlug]);

  const isCourseDoc = document?.category === 'course' || effectiveSlug?.startsWith('course-');

  if (loading) {
    return (
      <div className="w-full min-h-[65vh] flex flex-col items-center justify-center pt-32 pb-24 text-[#111010] bg-[#f5f1e8]">
        <div className="w-9 h-9 border-2 border-[#c9542f]/20 border-t-[#c9542f] rounded-full animate-spin mb-4"></div>
        <p className="text-[#7a756b] text-xs font-sans tracking-widest uppercase">Loading policy document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center pt-32 pb-24 text-[#111010] bg-[#f5f1e8]">
        <div className="p-8 text-center max-w-md bg-[#fbfbf9] border border-[#eadcd3] rounded-3xl shadow-sm">
          <h2 className="font-serif text-2xl text-[#111010] mb-2 font-normal">Document Not Available</h2>
          <p className="font-sans text-xs text-[#555047] mb-6 leading-relaxed">
            The requested policy page could not be found or has not been published yet.
          </p>
          <Link
            to={isCourseDoc ? '/course' : '/'}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#111010] hover:bg-[#c9542f] text-white font-sans text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Return to {isCourseDoc ? 'Course Portal' : 'Homepage'}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f5f1e8] pt-32 sm:pt-40 pb-24 text-[#111010]">
      {/* Scoped <style> tag — bypasses Tailwind preflight, guarantees formatting */}
      <style dangerouslySetInnerHTML={{ __html: POLICY_STYLES }} />

      <Container className="max-w-4xl px-4 sm:px-6">
        
        {/* Back Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = isCourseDoc ? '/course' : '/';
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-sans text-[#7a756b] hover:text-[#c9542f] transition-colors group cursor-pointer bg-transparent border-0 p-0 font-medium"
          >
            <ArrowLeft size={14} weight="bold" className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to {isCourseDoc ? 'The Better Man™ Course' : 'Better With Aarkesh'}</span>
          </button>
        </div>

        {/* Page Card */}
        <div className="bg-[#fbfbf9] border border-[#eadcd3] rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm" style={{ overflow: 'visible' }}>
          {/* Page Header */}
          <div className="mb-8 sm:mb-10 border-b border-[#eadcd3] pb-6 sm:pb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-[#fbf0eb] border border-[#e8c4e2] text-[0.68rem] text-[#c9542f] font-bold tracking-widest uppercase">
                {document.category === 'course' ? 'Course Legal Policy' : 'Coaching Legal Policy'}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#111010] tracking-tight mb-4 font-normal leading-tight">
              {document.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 text-[#7a756b] text-xs font-sans">
              <p className="tracking-wider uppercase text-[0.7rem]">
                Last updated: {new Date(document.updatedAt || document.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div className="flex items-center gap-1.5 text-[#7a756b] text-[0.7rem]">
                <ShieldCheck size={16} className="text-[#c9542f]" weight="fill" />
                <span>Official Policy Document</span>
              </div>
            </div>
          </div>
          
          {/* Rich Text Body — uses .policy-rich-content class styled via inline <style> tag above */}
          <div 
            className="policy-rich-content"
            style={{ overflow: 'visible' }}
            dangerouslySetInnerHTML={{ __html: sanitizeDocumentHtml(document.contentHtml) }}
          />
        </div>
      </Container>
    </div>
  );
}
