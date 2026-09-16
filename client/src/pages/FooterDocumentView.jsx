import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import { ArrowLeft, ShieldCheck } from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function FooterDocumentView({ slug: propSlug }) {
  const { slug: paramSlug } = useParams();
  const location = useLocation();
  
  // Resolve effective slug
  let effectiveSlug = propSlug || paramSlug;
  if (!effectiveSlug) {
    // Extract from path e.g. /terms-and-conditions -> terms-and-conditions
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
          // fallback without course- prefix or with course- prefix
          const altSlug = cleanSlug.replace('course-', '');
          res = await fetch(`${API_URL}/api/footer-documents/${altSlug}`);
        } else if (!res.ok && !cleanSlug.startsWith('course-')) {
          const altSlug = `course-${cleanSlug}`;
          const altRes = await fetch(`${API_URL}/api/footer-documents/${altSlug}`);
          if (altRes.ok) res = altRes;
        }

        if (!res.ok) {
          throw new Error('Document not found');
        }
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
      <div className="w-full min-h-[65vh] flex flex-col items-center justify-center pt-32 pb-24 text-white bg-[#050505]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent-gold mb-4"></div>
        <p className="text-white/50 text-xs font-sans tracking-widest uppercase">Loading policy document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center pt-32 pb-24 text-white bg-[#050505]">
        <div className="p-8 text-center max-w-md">
          <h2 className="font-serif text-2xl text-white mb-2">Document Not Available</h2>
          <p className="font-sans text-xs text-white/50 mb-6 leading-relaxed">
            The requested policy page could not be found or has not been published yet.
          </p>
          <Link
            to={isCourseDoc ? '/course' : '/'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#c79c6e] text-black font-sans text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Return to {isCourseDoc ? 'Course Portal' : 'Homepage'}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] pt-28 sm:pt-32 pb-24 text-white">
      <Container className="max-w-4xl px-4 sm:px-6">
        
        {/* Navigation Breadcrumb / Back Link */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = isCourseDoc ? '/course' : '/';
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-sans text-white/50 hover:text-accent-gold transition-colors group cursor-pointer bg-transparent border-0 p-0"
          >
            <ArrowLeft size={14} weight="bold" className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to {isCourseDoc ? 'The Better Man™ Course' : 'Better With Aarkesh'}</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-10 sm:mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[0.65rem] text-[#c79c6e] font-semibold tracking-widest uppercase">
              {document.category === 'course' ? 'Course Legal Policy' : 'Coaching Legal Policy'}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#F5F2EB] tracking-tight mb-4 font-normal leading-tight">
            {document.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 text-white/40 text-xs font-sans">
            <p className="tracking-wider uppercase text-[0.7rem]">
              Last updated: {new Date(document.updatedAt || document.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="flex items-center gap-1.5 text-white/40 text-[0.7rem]">
              <ShieldCheck size={14} className="text-[#c79c6e]" />
              <span>Official Policy Document</span>
            </div>
          </div>
        </div>
        
        {/* Policy Body HTML */}
        <div 
          className="legal-policy-content max-w-none"
          dangerouslySetInnerHTML={{ __html: document.contentHtml }}
        />
      </Container>
    </div>
  );
}
