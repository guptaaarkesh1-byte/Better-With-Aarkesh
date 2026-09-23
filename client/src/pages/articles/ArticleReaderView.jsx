import React, { useEffect } from 'react';
import { ArrowLeft, BookmarkSimple } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export default function ArticleReaderView({ article, onBack }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [article]);

  if (!article) return null;

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/library');
    }
  };

  return (
    <article className="w-full min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4 sm:px-6 md:px-10 lg:px-16 animate-in fade-in duration-500">
      <div className="max-w-[1280px] mx-auto flex flex-col">
        
        {/* Top Back Navigation */}
        <div className="mb-10">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2.5 font-sans text-xs uppercase tracking-[0.25em] font-semibold text-[#c79c6e] hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
            <span>BACK TO LIBRARY</span>
          </button>
        </div>

        {/* =========================================================
            HERO HEADER AREA (2-COLUMN EDITORIAL)
           ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center pb-16 border-b border-white/10">
          
          {/* Left Column: Category, Heading, Subtitle & Meta */}
          <div className="lg:col-span-7 flex flex-col items-start justify-center">
            
            <span className="font-sans text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.25em] font-semibold text-[#c79c6e] mb-4 block">
              {article.category || 'RELATIONSHIPS'}
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.6rem] text-white font-normal leading-[1.12] mb-6 tracking-tight">
              {article.titleMain ? (
                <>
                  {article.titleMain} <br className="hidden sm:inline" />
                  Like <span className="italic text-[#c79c6e] font-serif">{article.titleItalic || 'Love'}</span> {article.titleSuffix || ''}
                </>
              ) : (
                article.title
              )}
            </h1>

            <p className="font-sans text-white/70 text-base sm:text-lg font-light leading-relaxed mb-8 max-w-xl">
              {article.subtitle || article.description || article.excerpt}
            </p>

            <div className="flex flex-col gap-3.5">
              <span className="font-sans text-xs uppercase tracking-[0.2em] text-white/50 font-medium">
                {article.date || '12 SEP 2026'}
              </span>
              <div className="w-12 h-[2px] bg-[#c79c6e]" />
            </div>

          </div>

          {/* Right Column: Framed Dual-Silhouette Glowing Artwork */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[500px] aspect-[16/11] rounded-2xl overflow-hidden border border-[#c79c6e]/30 bg-black shadow-[0_0_50px_rgba(199,156,110,0.15)] relative group">
              <img 
                src={article.image || article.featuredImage || '/library_preview_silhouette.jpg'} 
                alt={article.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </div>

        {/* =========================================================
            ARTICLE BODY CONTENT (CENTERED LUXURY READING)
           ========================================================= */}
        <div className="w-full max-w-3xl mx-auto pt-16 pb-20 px-2 sm:px-4">
          
          {/* First Paragraph with Large Gold Drop Cap */}
          {article.dropCap ? (
            <p className="font-serif text-lg sm:text-xl text-white/80 leading-[1.85] mb-8 font-normal">
              <span className="float-left text-6xl sm:text-7xl font-serif text-[#c79c6e] leading-none pr-3 pt-1 select-none font-normal">
                {article.dropCap}
              </span>
              {article.dropCapText}
            </p>
          ) : null}

          {/* Paragraphs right after Drop Cap */}
          {article.paragraphsAfterDropCap && article.paragraphsAfterDropCap.map((p, idx) => (
            <p key={idx} className="font-serif text-lg sm:text-xl text-white/80 leading-[1.85] mb-8 font-normal">
              {p}
            </p>
          ))}

          {/* Dynamic / Structured Sections */}
          {article.sections && article.sections.map((sec, sIdx) => (
            <div key={sIdx} className="flex flex-col">
              
              {/* Section Subheading */}
              <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal mt-10 mb-6 leading-snug">
                {sec.headingMain}{' '}
                {sec.headingItalic && (
                  <span className="italic text-[#c79c6e] font-serif">{sec.headingItalic}</span>
                )}
              </h2>

              {/* Section Paragraphs */}
              {sec.paragraphs && sec.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="font-serif text-lg sm:text-xl text-white/80 leading-[1.85] mb-8 font-normal">
                  {p}
                </p>
              ))}

              {/* Highlighted Callout Box */}
              {sec.callout && (
                <div className="border-l-2 border-[#c79c6e] pl-6 py-2 my-10 flex flex-col gap-2">
                  <p className="font-serif text-xl sm:text-2xl text-white/90 italic font-normal">
                    {sec.callout.line1}
                  </p>
                  <p className="font-serif text-xl sm:text-2xl text-[#c79c6e] italic font-normal">
                    {sec.callout.line2}
                  </p>
                </div>
              )}

              {/* Follow-up Paragraphs */}
              {sec.followUpParagraphs && sec.followUpParagraphs.map((p, fIdx) => (
                <p key={fIdx} className="font-serif text-lg sm:text-xl text-white/80 leading-[1.85] mb-8 font-normal">
                  {p}
                </p>
              ))}
            </div>
          ))}

          {/* Fallback for standard HTML or database articles */}
          {article.bodyHtml && (
            <div
              className="prose prose-invert prose-lg max-w-none font-serif text-white/80 prose-headings:font-serif prose-headings:text-white/90 prose-p:leading-[1.85] prose-p:my-6 prose-li:text-white/80"
              dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
            />
          )}

        </div>

      </div>
    </article>
  );
}
