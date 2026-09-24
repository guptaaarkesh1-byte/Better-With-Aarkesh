import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BookmarkSimple, Check } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function resolveImageUrl(url, fallback = '') {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    return `${API_URL}${url}`;
  }
  if (url.startsWith('uploads/')) {
    return `${API_URL}/${url}`;
  }
  return url;
}

// Helper function to render gold italic highlight, bold, and larger text formatting
export function renderFormattedTitle(text) {
  if (!text || typeof text !== 'string') return text;

  // Function to recursively parse formatting tokens
  const parseTokens = (str, keyPrefix = 'rt') => {
    if (!str) return [];
    
    // Match bold (**...**), extra large (++...++), large (+...+), gold italic (*...* or [...]), italic (_..._)
    const tokenRegex = /(\*\*(.+?)\*\*|\+\+([^+]+?)\+\+|\+([^+]+?)\+|\*([^*]+?)\*|\[([^\]]+?)\]|_([^_]+?)_)/g;
    
    const elements = [];
    let lastIndex = 0;
    let match;
    let count = 0;

    while ((match = tokenRegex.exec(str)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        elements.push(str.substring(lastIndex, matchIndex));
      }

      const raw = match[0];
      const key = `${keyPrefix}-${count++}`;

      if (raw.startsWith('**') && raw.endsWith('**')) {
        const inner = raw.slice(2, -2);
        elements.push(
          <strong key={key} className="text-white font-bold font-serif">
            {parseTokens(inner, key)}
          </strong>
        );
      } else if (raw.startsWith('++') && raw.endsWith('++')) {
        const inner = raw.slice(2, -2);
        elements.push(
          <span key={key} className="text-2xl sm:text-3xl text-white font-serif leading-relaxed font-normal">
            {parseTokens(inner, key)}
          </span>
        );
      } else if (raw.startsWith('+') && raw.endsWith('+')) {
        const inner = raw.slice(1, -1);
        elements.push(
          <span key={key} className="text-xl sm:text-2xl text-white font-serif leading-relaxed font-normal">
            {parseTokens(inner, key)}
          </span>
        );
      } else if ((raw.startsWith('*') && raw.endsWith('*')) || (raw.startsWith('[') && raw.endsWith(']'))) {
        const inner = raw.slice(1, -1);
        elements.push(
          <span key={key} className="italic text-[#c79c6e] font-serif font-normal">
            {parseTokens(inner, key)}
          </span>
        );
      } else if (raw.startsWith('_') && raw.endsWith('_')) {
        const inner = raw.slice(1, -1);
        elements.push(
          <em key={key} className="italic text-white/95 font-serif font-normal">
            {parseTokens(inner, key)}
          </em>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < str.length) {
      elements.push(str.substring(lastIndex));
    }

    return elements.length > 0 ? elements : str;
  };

  return parseTokens(text);
}


export default function ArticleReaderView({ article, onBack }) {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resumeToast, setResumeToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const maxProgressRef = useRef(0);
  const scrollTimeoutRef = useRef(null);
  const hasRestoredRef = useRef(false);

  const getArticleKeys = () => {
    if (!article) return [];
    const keys = [];
    if (article._id) keys.push(article._id);
    if (article.id) keys.push(article.id);
    if (article.slug) keys.push(article.slug);
    return Array.from(new Set(keys));
  };

  const getSavedProgress = () => {
    const keys = getArticleKeys();
    for (const key of keys) {
      const data = localStorage.getItem(`article_progress_${key}`);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed && typeof parsed.percentage === 'number') {
            return parsed;
          }
        } catch (e) {
          const num = parseInt(data);
          if (!isNaN(num) && num > 0) {
            return { scrollY: num, percentage: 0 };
          }
        }
      }
    }
    return null;
  };

  const saveCurrentProgress = () => {
    if (!article) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight || document.documentElement.clientHeight;
    const maxScroll = scrollHeight - clientHeight;
    
    let currentPct = 0;
    if (maxScroll > 0) {
      currentPct = Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));
    }

    if (currentPct > maxProgressRef.current) {
      maxProgressRef.current = currentPct;
    }

    const effectivePct = Math.max(maxProgressRef.current, currentPct);

    const keys = getArticleKeys();
    const payload = JSON.stringify({
      scrollY: scrollTop,
      percentage: effectivePct,
      updatedAt: Date.now()
    });

    keys.forEach(k => {
      localStorage.setItem(`article_progress_${k}`, payload);
    });

    setProgress(effectivePct);
  };

  // Restore scroll position or scroll top on load
  useEffect(() => {
    hasRestoredRef.current = false;
    const saved = getSavedProgress();

    if (saved && (saved.percentage > 0 || saved.scrollY > 80)) {
      const initialMax = saved.percentage || 0;
      maxProgressRef.current = initialMax;
      setProgress(initialMax);

      if (saved.scrollY > 80) {
        const timer = setTimeout(() => {
          if (window.lenis) {
            window.lenis.scrollTo(saved.scrollY, { duration: 1.2 });
          } else {
            window.scrollTo({ top: saved.scrollY, behavior: 'smooth' });
          }
          hasRestoredRef.current = true;
          setToastMessage(`Resumed where you left off (${initialMax}% read)`);
          setResumeToast(true);
          setTimeout(() => setResumeToast(false), 4000);
        }, 250);

        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      maxProgressRef.current = 0;
      setProgress(0);
      hasRestoredRef.current = true;
    }
  }, [article?._id, article?.id, article?.slug]);

  // Track scroll and compute reading percentage accurately without decreasing on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      
      if (maxScroll > 0) {
        const currentPct = Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));
        if (currentPct > maxProgressRef.current) {
          maxProgressRef.current = currentPct;
          setProgress(currentPct);
        }
      }

      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        saveCurrentProgress();
      }, 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', saveCurrentProgress);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', saveCurrentProgress);
      clearTimeout(scrollTimeoutRef.current);
      saveCurrentProgress();
    };
  }, [article?._id, article?.id, article?.slug]);

  // Check saved status
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && article) {
      const artId = article._id || article.id;
      fetch(`${API_URL}/api/users/saved-articles`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          const found = (data || []).some(a => (a._id || a.id) === artId);
          setIsSaved(found);
        })
        .catch(err => console.error('Error fetching saved article status:', err));
    }
  }, [article?._id, article?.id]);

  if (!article) return null;

  const handleGoBack = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      saveCurrentProgress();
    } catch (err) {
      console.warn('Progress save failed on back navigation:', err);
    }
    
    if (typeof onBack === 'function') {
      try {
        onBack();
      } catch (err) {
        navigate('/library');
      }
    } else {
      navigate('/library');
    }
  };

  const handleToggleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const articleId = article._id || article.id;
    if (!articleId) return;

    setIsSaved(prev => !prev);

    try {
      await fetch(`${API_URL}/api/users/save-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ articleId })
      });
    } catch (err) {
      console.error('Error saving article:', err);
    }
  };

  return (
    <article className="w-full min-h-screen bg-[#050505] text-white pt-[118px] sm:pt-[122px] lg:pt-[124px] pb-16 px-4 sm:px-6 md:px-10 lg:px-16 animate-in fade-in duration-500 select-none relative">
      
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-[9999] bg-white/5 pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-[#c79c6e]/60 via-[#c79c6e] to-[#e8caa4] transition-[width] duration-150 ease-out shadow-[0_0_10px_rgba(199,156,110,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-[1280px] mx-auto flex flex-col">
        
        {/* Top Back & Save Navigation */}
        <div className="mb-10 flex items-center justify-between">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2.5 font-sans text-xs uppercase tracking-[0.25em] font-semibold text-[#c79c6e] hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
            <span>BACK TO LIBRARY</span>
          </button>

          <div className="flex items-center gap-4">
            {progress > 0 && (
              <span className="font-sans text-xs uppercase tracking-[0.15em] font-bold text-[#c79c6e]/90 bg-[#121212] px-3 py-1.5 rounded-full border border-white/10 hidden sm:inline-block">
                {progress}% READ
              </span>
            )}
            {/* Bookmark / Save Button */}
            <button
              type="button"
              onClick={handleToggleSave}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer text-xs uppercase tracking-widest font-medium shadow-md ${
                isSaved
                  ? 'border-[#c79c6e] bg-[#c79c6e]/15 text-[#c79c6e]'
                  : 'border-white/15 bg-black/40 text-white/70 hover:text-white hover:border-white/30'
              }`}
              title={isSaved ? 'Saved in My Journey' : 'Save to My Journey'}
            >
              <BookmarkSimple size={16} weight={isSaved ? "fill" : "regular"} className={isSaved ? "text-[#c79c6e]" : ""} />
              <span>{isSaved ? 'SAVED' : 'SAVE ARTICLE'}</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            HERO HEADER AREA (2-COLUMN EDITORIAL MATCHING REFERENCE)
           ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center pb-16 border-b border-white/10">
          
          {/* Left Column: Category, Heading, Subtitle & Meta */}
          <div className="lg:col-span-7 flex flex-col items-start justify-center">
            
            <span className="font-sans text-[0.68rem] sm:text-[0.72rem] uppercase tracking-[0.28em] font-semibold text-[#c79c6e] mb-3 block">
              {article.category || 'RELATIONSHIPS'}
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.8rem] text-white font-normal leading-[1.1] mb-5 tracking-tight">
              {renderFormattedTitle(article.title)}
            </h1>

            <p className="font-serif text-white/75 text-base sm:text-lg font-normal leading-relaxed mb-6 max-w-xl">
              {renderFormattedTitle(
                article.subtitle || 
                (article.excerpt ? `${article.excerpt}${article.highlightText ? ` *${article.highlightText}*` : ''}` : '') ||
                article.description || ''
              )}
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
            <div className="w-full max-w-[500px] aspect-[16/11] rounded-none overflow-hidden border border-[#c79c6e]/40 bg-black shadow-[0_0_60px_rgba(199,156,110,0.22)] relative group">
              <img 
                src={resolveImageUrl(article.image || article.featuredImage, '/library_preview_silhouette.jpg')} 
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
          
          {/* 1. Modular Blocks Renderer (If article has custom block sequence) */}
          {article.blocks && article.blocks.length > 0 ? (
            <div className="flex flex-col">
              {article.blocks.map((block, bIdx) => {
                if (block.type === 'heading') {
                  return (
                    <h2 key={block.id || bIdx} className="font-serif text-3xl sm:text-4xl text-white font-normal mt-12 mb-6 leading-snug">
                      {renderFormattedTitle(block.text || block.heading)}
                    </h2>
                  );
                }

                if (block.type === 'callout') {
                  return (
                    <div key={block.id || bIdx} className="border-l-2 border-[#c79c6e] pl-6 py-2 my-10 flex flex-col gap-2">
                      {block.line1 && (
                        <p className="font-serif text-xl sm:text-2xl text-white/90 italic font-normal">
                          {block.line1}
                        </p>
                      )}
                      {block.line2 && (
                        <p className="font-serif text-xl sm:text-2xl text-[#c79c6e] italic font-normal">
                          {block.line2}
                        </p>
                      )}
                    </div>
                  );
                }

                if (block.type === 'dropCap') {
                  const rawText = (block.text || block.dropCapText || '').trimStart();
                  const letter = block.letter || (rawText ? rawText.charAt(0).toUpperCase() : '');
                  const remainingText = block.letter && rawText.startsWith(block.letter)
                    ? rawText.slice(block.letter.length)
                    : (rawText.length > 1 && !block.dropCapText ? rawText.slice(1) : rawText);

                  return (
                    <p key={block.id || bIdx} className="font-serif text-lg sm:text-xl text-white/80 leading-[1.85] mb-8 font-normal">
                      {letter && (
                        <span className="float-left text-6xl sm:text-7xl font-serif text-[#c79c6e] leading-none pr-3 pt-1 select-none font-normal">
                          {letter}
                        </span>
                      )}
                      {renderFormattedTitle(remainingText || rawText)}
                    </p>
                  );
                }

                if (block.type === 'paragraph' || block.type === 'paragraphs') {
                  const text = block.text || '';
                  const hasHtml = /<[a-z][\s\S]*>/i.test(text);

                  if (hasHtml) {
                    return (
                      <div 
                        key={block.id || bIdx}
                        className="font-serif text-lg sm:text-xl text-white/80 leading-[1.85] mb-8 space-y-4 prose prose-invert max-w-none prose-headings:font-serif prose-headings:text-white prose-p:my-3 [&_strong]:text-inherit [&_strong]:font-bold [&_b]:text-inherit [&_b]:font-bold [&_[data-gold]]:!text-[#c79c6e] [&_.text-gold]:!text-[#c79c6e] prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-1.5 prose-blockquote:border-l-2 prose-blockquote:border-[#c79c6e] prose-blockquote:pl-4 prose-blockquote:italic clear-both after:content-[''] after:table after:clear-both"
                        dangerouslySetInnerHTML={{ __html: text }}
                      />
                    );
                  }

                  const pList = Array.isArray(block.paragraphs) 
                    ? block.paragraphs 
                    : (block.text ? block.text.split('\n\n') : []);
                  return (
                    <React.Fragment key={block.id || bIdx}>
                      {pList.map((p, pIdx) => p?.trim() ? (
                        <p key={pIdx} className="font-serif text-lg sm:text-xl text-white/80 leading-[1.85] mb-8 font-normal">
                          {renderFormattedTitle(p)}
                        </p>
                      ) : null)}
                    </React.Fragment>
                  );
                }

                return null;
              })}
            </div>
          ) : (
            <>
              {/* 2. Structured Sections / Drop Cap Legacy Format */}
              {/* First Paragraph with Large Gold Drop Cap */}
              {article.dropCap ? (
                <p className="font-serif text-lg sm:text-xl text-white/80 leading-[1.85] mb-8 font-normal">
                  <span className="float-left text-6xl sm:text-7xl font-serif text-[#c79c6e] leading-none pr-3 pt-1 select-none font-normal">
                    {article.dropCap}
                  </span>
                  {renderFormattedTitle(article.dropCapText)}
                </p>
              ) : null}

              {/* Paragraphs right after Drop Cap */}
              {article.paragraphsAfterDropCap && article.paragraphsAfterDropCap.map((p, idx) => (
                <p key={idx} className="font-serif text-lg sm:text-xl text-white/80 leading-[1.85] mb-8 font-normal">
                  {renderFormattedTitle(p)}
                </p>
              ))}

              {/* Dynamic / Structured Sections */}
              {article.sections && article.sections.map((sec, sIdx) => (
                <div key={sIdx} className="flex flex-col">
                  
                  {/* Section Subheading */}
                  {(sec.heading || sec.headingMain) && (
                    <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal mt-12 mb-6 leading-snug">
                      {sec.headingMain ? (
                        <>
                          {sec.headingMain} <span className="italic text-[#c79c6e] font-serif font-normal">{sec.headingItalic || ''}</span> {sec.headingSuffix || ''}
                        </>
                      ) : (
                        renderFormattedTitle(sec.heading)
                      )}
                    </h2>
                  )}

                  {/* Section Paragraphs */}
                  {sec.paragraphs && sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="font-serif text-lg sm:text-xl text-white/80 leading-[1.85] mb-8 font-normal">
                      {renderFormattedTitle(p)}
                    </p>
                  ))}

                  {/* Highlighted Callout Box */}
                  {sec.callout && (
                    <div className="border-l-2 border-[#c79c6e] pl-6 py-2 my-10 flex flex-col gap-2">
                      {sec.callout.line1 && (
                        <p className="font-serif text-xl sm:text-2xl text-white/90 italic font-normal">
                          {renderFormattedTitle(sec.callout.line1)}
                        </p>
                      )}
                      {sec.callout.line2 && (
                        <p className="font-serif text-xl sm:text-2xl text-[#c79c6e] italic font-normal">
                          {renderFormattedTitle(sec.callout.line2)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Follow-up Paragraphs */}
                  {sec.followUpParagraphs && sec.followUpParagraphs.map((p, fIdx) => (
                    <p key={fIdx} className="font-serif text-lg sm:text-xl text-white/80 leading-[1.85] mb-8 font-normal">
                      {renderFormattedTitle(p)}
                    </p>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* Fallback for standard HTML or database articles */}
          {!article.blocks?.length && !article.sections?.length && !article.dropCap && article.bodyHtml && (
            <div
              className="prose prose-invert prose-lg max-w-none font-serif text-white/80 prose-headings:font-serif prose-headings:text-white/90 prose-p:leading-[1.85] prose-p:my-6 [&_strong]:text-inherit [&_strong]:font-bold [&_b]:text-inherit [&_b]:font-bold prose-li:text-white/80"
              dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
            />
          )}

          {/* Graceful Editorial Fallback for Curated Directory Articles */}
          {!article.blocks?.length && !article.sections?.length && !article.dropCap && !article.bodyHtml && (
            <div className="flex flex-col gap-6 font-serif text-lg sm:text-xl text-white/80 leading-[1.85]">
              <p className="font-serif text-xl sm:text-2xl text-white/95 leading-relaxed font-normal mb-4">
                <span className="float-left text-6xl sm:text-7xl font-serif text-[#c79c6e] leading-none pr-3 pt-1 select-none font-normal">
                  {(article.excerpt || article.description || article.title || 'W').charAt(0)}
                </span>
                {renderFormattedTitle((article.excerpt || article.description || article.title || '').slice(1))}
                {article.highlightText && (
                  <span className="text-[#c79c6e] italic font-serif"> {article.highlightText}</span>
                )}
              </p>

              {article.quote && (
                <div className="border-l-2 border-[#c79c6e] pl-6 py-3 my-8 bg-white/[0.02] rounded-r-xl">
                  <p className="font-serif text-xl sm:text-2xl text-[#f6cb90] italic font-normal leading-relaxed">
                    {renderFormattedTitle(article.quote)}
                  </p>
                </div>
              )}

              <p className="font-serif text-lg sm:text-xl text-white/80 leading-[1.85]">
                Most meaningful transformations begin not with a loud public declaration, but with a quiet internal shift. When we slow down enough to examine our default patterns of thinking, relating, and choosing, we create space for a kinder and braver reality to emerge.
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal mt-10 mb-4 leading-snug">
                The Anatomy of <span className="italic text-[#c79c6e]">Quiet Clarity</span>
              </h2>

              <p className="font-serif text-lg sm:text-xl text-white/80 leading-[1.85]">
                True progress is rarely linear. It is verified in daily, unremarkable choices when no one is watching. By returning to first principles and honoring your emotional sovereignty, the confusion dissolves into purposeful momentum.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Resumed Toast */}
      <div 
        className={`fixed bottom-8 right-8 z-[300] bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#c79c6e]/40 px-6 py-4 rounded-xl shadow-[0_0_40px_rgba(199,156,110,0.2)] transition-all duration-500 ease-out transform ${
          resumeToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#c79c6e] flex items-center gap-3 font-semibold">
          <BookmarkSimple size={18} weight="fill" className="text-[#c79c6e]" />
          {toastMessage}
        </p>
      </div>

    </article>
  );
}
