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
    <div className="w-full min-h-screen bg-[#f5f1e8] pt-28 sm:pt-36 pb-24 text-[#111010]">
      <Container className="max-w-4xl px-4 sm:px-6">
        
        {/* Navigation Breadcrumb / Back Link */}
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

        {/* Page Card Container */}
        <div className="bg-[#fbfbf9] border border-[#eadcd3] rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm">
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
          
          {/* Policy Body HTML */}
          <div 
            className="legal-policy-content-light max-w-none"
            dangerouslySetInnerHTML={{ __html: document.contentHtml }}
          />
        </div>
      </Container>
    </div>
  );
}
