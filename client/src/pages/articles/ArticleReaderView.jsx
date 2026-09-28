import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BookmarkSimple, Check } from '@phosphor-icons/react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';

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

// Category theme palette definitions
export const THEMES_MAP = {
  relationships: {
    id: 'relationships',
    num: '01',
    name: 'Relationships',
    bg: '#3d1b37',
    ink: '#f7eef5',
    inkMuted: 'rgba(247, 238, 245, 0.82)',
    inkFaint: 'rgba(247, 238, 245, 0.45)',
    borderLine: 'rgba(255, 255, 255, 0.16)',
    accent: '#f3a8e2',
    accentLight: '#fcdcf4',
    cardBg: 'rgba(255, 255, 255, 0.06)',
    aarkeshColor: '#f3a8e2',
    btnBg: '#f7eef5',
    btnInk: '#3d1b37',
  },
  self: {
    id: 'self',
    num: '02',
    name: 'Self',
    bg: '#ffffff',
    ink: '#111010',
    inkMuted: 'rgba(17, 16, 16, 0.82)',
    inkFaint: 'rgba(17, 16, 16, 0.45)',
    borderLine: 'rgba(0, 0, 0, 0.12)',
    accent: '#111010',
    accentLight: '#444444',
    cardBg: '#f6f3eb',
    aarkeshColor: '#111010',
    btnBg: '#111010',
    btnInk: '#ffffff',
  },
  change: {
    id: 'change',
    num: '03',
    name: 'Change',
    bg: '#2f4a34',
    ink: '#e9f0e6',
    inkMuted: 'rgba(233, 240, 230, 0.82)',
    inkFaint: 'rgba(233, 240, 230, 0.45)',
    borderLine: 'rgba(255, 255, 255, 0.16)',
    accent: '#8ee09f',
    accentLight: '#cbf5d4',
    cardBg: 'rgba(255, 255, 255, 0.06)',
    aarkeshColor: '#8ee09f',
    btnBg: '#e9f0e6',
    btnInk: '#1d3321',
  },
  decisions: {
    id: 'decisions',
    num: '04',
    name: 'Decisions',
    bg: '#802673',
    ink: '#2b1208',
    inkMuted: 'rgba(43, 18, 8, 0.85)',
    inkFaint: 'rgba(43, 18, 8, 0.5)',
    borderLine: 'rgba(43, 18, 8, 0.18)',
    accent: '#2b1208',
    accentLight: '#fceade',
    cardBg: 'rgba(43, 18, 8, 0.06)',
    aarkeshColor: '#2b1208',
    btnBg: '#2b1208',
    btnInk: '#fceade',
  },
  'difficult-people': {
    id: 'difficult-people',
    num: '05',
    name: 'Difficult People',
    bg: '#f0d9c9',
    ink: '#2b1208',
    inkMuted: 'rgba(43, 18, 8, 0.85)',
    inkFaint: 'rgba(43, 18, 8, 0.45)',
    borderLine: 'rgba(43, 18, 8, 0.14)',
    accent: '#a64117',
    accentLight: '#faeae0',
    cardBg: 'rgba(43, 18, 8, 0.05)',
    aarkeshColor: '#a64117',
    btnBg: '#2b1208',
    btnInk: '#fceade',
  },
  communication: {
    id: 'communication',
    num: '06',
    name: 'Communication',
    bg: '#141314',
    ink: '#f5f1e8',
    inkMuted: 'rgba(245, 241, 232, 0.82)',
    inkFaint: 'rgba(245, 241, 232, 0.45)',
    borderLine: 'rgba(255, 255, 255, 0.14)',
    accent: '#ffffff',
    accentLight: '#e6ba94',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    aarkeshColor: '#ffffff',
    btnBg: '#f5f1e8',
    btnInk: '#141314',
  }
};

// Helper function to render italic highlight, bold, and larger text formatting with dynamic accent color
export function renderFormattedTitle(text, accentColor = '#f3a8e2') {
  if (!text || typeof text !== 'string') return text;

  const parseTokens = (str, keyPrefix = 'rt') => {
    if (!str) return [];
    
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
          <strong key={key} className="font-bold font-serif" style={{ color: 'inherit' }}>
            {parseTokens(inner, key)}
          </strong>
        );
      } else if (raw.startsWith('++') && raw.endsWith('++')) {
        const inner = raw.slice(2, -2);
        elements.push(
          <span key={key} className="text-2xl sm:text-3xl font-serif leading-relaxed font-normal" style={{ color: 'inherit' }}>
            {parseTokens(inner, key)}
          </span>
        );
      } else if (raw.startsWith('+') && raw.endsWith('+')) {
        const inner = raw.slice(1, -1);
        elements.push(
          <span key={key} className="text-xl sm:text-2xl font-serif leading-relaxed font-normal" style={{ color: 'inherit' }}>
            {parseTokens(inner, key)}
          </span>
        );
      } else if ((raw.startsWith('*') && raw.endsWith('*')) || (raw.startsWith('[') && raw.endsWith(']'))) {
        const inner = raw.slice(1, -1);
        elements.push(
          <span key={key} className="italic font-serif font-normal" style={{ color: accentColor }}>
            {parseTokens(inner, key)}
          </span>
        );
      } else if (raw.startsWith('_') && raw.endsWith('_')) {
        const inner = raw.slice(1, -1);
        elements.push(
          <em key={key} className="italic font-serif font-normal" style={{ opacity: 0.95 }}>
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


export default function ArticleReaderView({ article, categoryConfig, onBack }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isFromMyJourney = searchParams.get('from') === 'my-journey' || location.state?.from === 'my-journey';

  // Compute active theme from prop, query parameter, or article category
  const rawCat = searchParams.get('category')?.toLowerCase().trim() ||
    (article?.category ? article.category.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-') : '') ||
    'relationships';
  const theme = categoryConfig || THEMES_MAP[rawCat] || THEMES_MAP.relationships;

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
    
    const maxPct = Math.max(currentPct, maxProgressRef.current || 0);
    const keys = getArticleKeys();
    keys.forEach(key => {
      localStorage.setItem(`article_progress_${key}`, JSON.stringify({
        scrollY: scrollTop,
        percentage: maxPct,
        lastRead: new Date().toISOString()
      }));
    });
  };

  // Restore reading progress on mount
  useEffect(() => {
    const saved = getSavedProgress();
    if (saved && saved.scrollY > 100 && !hasRestoredRef.current) {
      hasRestoredRef.current = true;
      maxProgressRef.current = saved.percentage || 0;
      setProgress(saved.percentage || 0);
      
      const targetY = saved.scrollY;
      setTimeout(() => {
        if (window.lenis) {
          window.lenis.scrollTo(targetY, { immediate: false, duration: 1.2 });
        } else {
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
        setToastMessage(`Resumed reading from ${saved.percentage || 0}%`);
        setResumeToast(true);
        setTimeout(() => setResumeToast(false), 4000);
      }, 300);
    } else {
      maxProgressRef.current = 0;
      setProgress(0);
      hasRestoredRef.current = true;
    }
  }, [article?._id, article?.id, article?.slug]);

  // Track scroll and compute reading percentage
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
    
    if (isFromMyJourney) {
      navigate('/my-journey', { state: { activeTab: 'MY LIBRARY' } });
      return;
    }

    if (typeof onBack === 'function') {
      try {
        onBack();
      } catch (err) {
        navigate(`/articles?category=${theme.id}`);
      }
    } else {
      navigate(`/articles?category=${theme.id}`);
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
    <article 
      className="themed-reader-view w-full min-h-screen select-none relative transition-colors duration-400"
      style={{ backgroundColor: theme.bg, color: theme.ink }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@400;500;600;700;800&display=swap');

        .themed-reader-view {
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .themed-reader-view h1,
        .themed-reader-view h2,
        .themed-reader-view h3,
        .themed-reader-view h4 {
          font-family: 'Fraunces', serif;
        }

        .themed-reader-view .editorial-body p,
        .themed-reader-view .editorial-body li {
          font-family: 'Fraunces', serif;
          font-size: 1.18rem;
          line-height: 1.85;
          color: ${theme.inkMuted};
        }

        .themed-reader-view .editorial-body blockquote {
          font-family: 'Fraunces', serif;
          font-style: italic;
          border-left: 2px solid ${theme.accent};
          padding-left: 1.5rem;
          margin: 2.5rem 0;
          color: ${theme.ink};
        }
      `}</style>
      
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-[9999] bg-black/10 pointer-events-none">
        <div 
          className="h-full transition-[width] duration-150 ease-out shadow-sm"
          style={{ width: `${progress}%`, backgroundColor: theme.accent }}
        />
      </div>

      {/* Top Themed Header Bar */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-md px-6 sm:px-12 py-5 flex items-center justify-between transition-colors duration-300"
        style={{ 
          backgroundColor: `${theme.bg}ee`, 
          borderBottom: `1px solid ${theme.borderLine}` 
        }}
      >
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] font-bold transition-opacity hover:opacity-60 cursor-pointer group"
          style={{ color: theme.ink }}
        >
          <ArrowLeft size={16} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
          <span>{isFromMyJourney ? 'BACK TO MY JOURNEY' : `BACK TO ${theme.name.toUpperCase()}`}</span>
        </button>

        <div className="text-lg font-semibold tracking-tight hidden md:block" style={{ fontFamily: 'Fraunces, serif' }}>
          <Link to="/" style={{ color: theme.ink }}>
            BetterWith<em style={{ color: theme.aarkeshColor, fontStyle: 'italic', fontFamily: 'Fraunces, serif' }}>Aarkesh</em>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {progress > 0 && (
            <span 
              className="text-xs uppercase tracking-[0.15em] font-bold px-3 py-1.5 rounded-full border hidden sm:inline-block"
              style={{ 
                borderColor: theme.borderLine, 
                backgroundColor: theme.cardBg, 
                color: theme.ink 
              }}
            >
              {progress}% READ
            </span>
          )}
          {/* Bookmark / Save Button */}
          <button
            type="button"
            onClick={handleToggleSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer text-xs uppercase tracking-widest font-semibold shadow-sm"
            style={{
              borderColor: theme.borderLine,
              backgroundColor: isSaved ? theme.ink : theme.cardBg,
              color: isSaved ? theme.bg : theme.ink
            }}
            title={isSaved ? 'Saved in My Journey' : 'Save to My Journey'}
          >
            <BookmarkSimple size={16} weight={isSaved ? "fill" : "regular"} />
            <span>{isSaved ? 'SAVED' : 'SAVE ARTICLE'}</span>
          </button>
        </div>
      </header>

      <div className="max-w-[1240px] mx-auto pt-12 pb-24 px-6 sm:px-10 lg:px-14 flex flex-col">

        {/* =========================================================
            HERO HEADER AREA (2-COLUMN EDITORIAL MATCHING REFERENCE)
           ========================================================= */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center pb-16"
          style={{ borderBottom: `1px solid ${theme.borderLine}` }}
        >
          
          {/* Left Column: Category, Heading, Subtitle & Meta */}
          <div className="lg:col-span-7 flex flex-col items-start justify-center">
            
            <span 
              className="text-[0.72rem] uppercase tracking-[0.28em] font-bold mb-4 block"
              style={{ color: theme.accent }}
            >
              ({theme.num}) {article.category || theme.name.toUpperCase()}
            </span>

            <h1 
              className="text-4xl sm:text-5xl lg:text-[3.8rem] font-normal leading-[1.12] mb-6 tracking-tight"
              style={{ color: theme.ink }}
            >
              {renderFormattedTitle(article.title, theme.accent)}
            </h1>

            <p 
              className="text-base sm:text-lg font-normal leading-relaxed mb-8 max-w-xl"
              style={{ color: theme.inkMuted, fontFamily: 'Fraunces, serif' }}
            >
              {renderFormattedTitle(
                article.subtitle || 
                (article.excerpt ? `${article.excerpt}${article.highlightText ? ` *${article.highlightText}*` : ''}` : '') ||
                article.description || '',
                theme.accent
              )}
            </p>

            <div className="flex flex-col gap-3.5">
              <span 
                className="text-xs uppercase tracking-[0.2em] font-semibold"
                style={{ color: theme.inkFaint }}
              >
                {article.date || 'MAY 2026'} · {article.readTime || '6 MIN READ'}
              </span>
              <div className="w-12 h-[2px]" style={{ backgroundColor: theme.accent }} />
            </div>

          </div>

          {/* Right Column: Framed Dual-Silhouette Glowing Artwork */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div 
              className="w-full max-w-[500px] aspect-[16/11] rounded-2xl overflow-hidden border shadow-2xl relative group"
              style={{ 
                borderColor: theme.borderLine,
                backgroundColor: theme.cardBg 
              }}
            >
              <img 
                src={resolveImageUrl(article.image || article.featuredImage, '/library_preview_silhouette.jpg')} 
                alt={article.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

        </div>

        {/* =========================================================
            ARTICLE BODY CONTENT (CENTERED LUXURY READING)
           ========================================================= */}
        <div className="editorial-body w-full max-w-3xl mx-auto pt-16 pb-20 px-2 sm:px-4">
          
          {/* 1. Modular Blocks Renderer (If article has custom block sequence) */}
          {article.blocks && article.blocks.length > 0 ? (
            <div className="flex flex-col">
              {article.blocks.map((block, bIdx) => {
                if (block.type === 'heading') {
                  return (
                    <h2 
                      key={block.id || bIdx} 
                      className="text-3xl sm:text-4xl font-normal mt-14 mb-6 leading-snug"
                      style={{ color: theme.ink }}
                    >
                      {renderFormattedTitle(block.text || block.heading, theme.accent)}
                    </h2>
                  );
                }

                if (block.type === 'callout') {
                  return (
                    <div 
                      key={block.id || bIdx} 
                      className="pl-6 py-4 my-10 flex flex-col gap-2 rounded-r-xl"
                      style={{ 
                        borderLeft: `3px solid ${theme.accent}`,
                        backgroundColor: theme.cardBg 
                      }}
                    >
                      {block.line1 && (
                        <p className="text-xl sm:text-2xl italic font-normal" style={{ color: theme.ink }}>
                          {block.line1}
                        </p>
                      )}
                      {block.line2 && (
                        <p className="text-xl sm:text-2xl italic font-normal" style={{ color: theme.accent }}>
                          {block.line2}
                        </p>
                      )}
                    </div>
                  );
                }

                if (block.type === 'dropCap') {
                  const rawText = (block.text || block.dropCapText || '').trimStart();
                  const letter = block.letter || (rawText ? rawText.charAt(0).toUpperCase() : '');
                  let remainingText = rawText;
                  if (letter && rawText) {
                    if (rawText.toUpperCase().startsWith(letter.toUpperCase())) {
                      remainingText = rawText.slice(letter.length);
                    }
                  }

                  return (
                    <p key={block.id || bIdx} className="mb-8 font-normal">
                      {letter && (
                        <span style={{
                          float: 'left',
                          fontFamily: '"Fraunces", "Playfair Display", Georgia, serif',
                          color: theme.accent,
                          fontWeight: '400',
                          lineHeight: '0.78',
                          fontSize: '4.2rem',
                          paddingRight: '0.75rem',
                          paddingTop: '0.15rem',
                          userSelect: 'none',
                          display: 'block'
                        }}>
                          {letter}
                        </span>
                      )}
                      {renderFormattedTitle(remainingText || rawText, theme.accent)}
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
                        className="mb-8 space-y-4 prose max-w-none clear-both after:content-[''] after:table after:clear-both"
                        style={{ color: theme.inkMuted }}
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
                        <p key={pIdx} className="mb-8 font-normal">
                          {renderFormattedTitle(p, theme.accent)}
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
              {article.dropCap ? (() => {
                const dcLetter = article.dropCap;
                const dcText = article.dropCapText || '';
                const cleanDcText = (dcLetter && dcText.toUpperCase().startsWith(dcLetter.toUpperCase()))
                  ? dcText.slice(dcLetter.length)
                  : dcText;
                return (
                  <p className="mb-8 font-normal">
                    <span style={{
                      float: 'left',
                      fontFamily: '"Fraunces", "Playfair Display", Georgia, serif',
                      color: theme.accent,
                      fontWeight: '400',
                      lineHeight: '0.78',
                      fontSize: '4.2rem',
                      paddingRight: '0.75rem',
                      paddingTop: '0.15rem',
                      userSelect: 'none',
                      display: 'block'
                    }}>
                      {dcLetter}
                    </span>
                    {renderFormattedTitle(cleanDcText, theme.accent)}
                  </p>
                );
              })() : null}

              {/* Paragraphs right after Drop Cap */}
              {article.paragraphsAfterDropCap && article.paragraphsAfterDropCap.map((p, idx) => (
                <p key={idx} className="mb-8 font-normal">
                  {renderFormattedTitle(p, theme.accent)}
                </p>
              ))}

              {/* Dynamic / Structured Sections */}
              {article.sections && article.sections.map((sec, sIdx) => (
                <div key={sIdx} className="flex flex-col">
                  
                  {/* Section Subheading */}
                  {(sec.heading || sec.headingMain) && (
                    <h2 
                      className="text-3xl sm:text-4xl font-normal mt-14 mb-6 leading-snug"
                      style={{ color: theme.ink }}
                    >
                      {sec.headingMain ? (
                        <>
                          {sec.headingMain} <span className="italic font-normal" style={{ color: theme.accent }}>{sec.headingItalic || ''}</span> {sec.headingSuffix || ''}
                        </>
                      ) : (
                        renderFormattedTitle(sec.heading, theme.accent)
                      )}
                    </h2>
                  )}

                  {/* Section Paragraphs */}
                  {sec.paragraphs && sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="mb-8 font-normal">
                      {renderFormattedTitle(p, theme.accent)}
                    </p>
                  ))}

                  {/* Highlighted Callout Box */}
                  {sec.callout && (
                    <div 
                      className="pl-6 py-4 my-10 flex flex-col gap-2 rounded-r-xl"
                      style={{ 
                        borderLeft: `3px solid ${theme.accent}`,
                        backgroundColor: theme.cardBg 
                      }}
                    >
                      {sec.callout.line1 && (
                        <p className="text-xl sm:text-2xl italic font-normal" style={{ color: theme.ink }}>
                          {renderFormattedTitle(sec.callout.line1, theme.accent)}
                        </p>
                      )}
                      {sec.callout.line2 && (
                        <p className="text-xl sm:text-2xl italic font-normal" style={{ color: theme.accent }}>
                          {renderFormattedTitle(sec.callout.line2, theme.accent)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Follow-up Paragraphs */}
                  {sec.followUpParagraphs && sec.followUpParagraphs.map((p, fIdx) => (
                    <p key={fIdx} className="mb-8 font-normal">
                      {renderFormattedTitle(p, theme.accent)}
                    </p>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* Fallback for standard HTML or database articles */}
          {!article.blocks?.length && !article.sections?.length && !article.dropCap && article.bodyHtml && (
            <div
              className="prose max-w-none mb-8 leading-[1.85]"
              style={{ color: theme.inkMuted }}
              dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
            />
          )}

          {/* Graceful Editorial Fallback for Curated Directory Articles */}
          {!article.blocks?.length && !article.sections?.length && !article.dropCap && !article.bodyHtml && (
            <div className="flex flex-col gap-6">
              <p className="text-xl sm:text-2xl leading-relaxed font-normal mb-4" style={{ color: theme.ink }}>
                <span style={{
                  float: 'left',
                  fontFamily: '"Fraunces", "Playfair Display", Georgia, serif',
                  color: theme.accent,
                  fontWeight: '400',
                  lineHeight: '0.78',
                  fontSize: '4.2rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.15rem',
                  userSelect: 'none',
                  display: 'block'
                }}>
                  {(article.excerpt || article.description || article.title || 'W').charAt(0)}
                </span>
                {renderFormattedTitle((article.excerpt || article.description || article.title || '').slice(1), theme.accent)}
                {article.highlightText && (
                  <span className="italic" style={{ color: theme.accent }}> {article.highlightText}</span>
                )}
              </p>

              {article.quote && (
                <div 
                  className="pl-6 py-4 my-8 rounded-r-xl"
                  style={{ 
                    borderLeft: `3px solid ${theme.accent}`,
                    backgroundColor: theme.cardBg 
                  }}
                >
                  <p className="text-xl sm:text-2xl italic font-normal leading-relaxed" style={{ color: theme.accent }}>
                    {renderFormattedTitle(article.quote, theme.accent)}
                  </p>
                </div>
              )}

              <p className="mb-8 font-normal">
                Most meaningful transformations begin not with a loud public declaration, but with a quiet internal shift. When we slow down enough to examine our default patterns of thinking, relating, and choosing, we create space for a kinder and braver reality to emerge.
              </p>

              <h2 className="text-3xl sm:text-4xl font-normal mt-10 mb-4 leading-snug" style={{ color: theme.ink }}>
                The Anatomy of <span className="italic" style={{ color: theme.accent }}>Quiet Clarity</span>
              </h2>

              <p className="mb-8 font-normal">
                True progress is rarely linear. It is verified in daily, unremarkable choices when no one is watching. By returning to first principles and honoring your emotional sovereignty, the confusion dissolves into purposeful momentum.
              </p>
            </div>
          )}

          {/* Bottom Complete Reading Action Bar */}
          <div 
            className="mt-16 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{ borderTop: `1px solid ${theme.borderLine}` }}
          >
            <button
              type="button"
              onClick={handleGoBack}
              className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] font-bold transition-opacity hover:opacity-60 cursor-pointer"
              style={{ color: theme.ink }}
            >
              <ArrowLeft size={16} weight="bold" />
              <span>RETURN TO {theme.name.toUpperCase()} ARTICLES</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSave}
              className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
              style={{
                backgroundColor: isSaved ? theme.ink : theme.btnBg,
                color: isSaved ? theme.bg : theme.btnInk
              }}
            >
              {isSaved ? 'ARTICLE SAVED IN MY JOURNEY' : 'SAVE ARTICLE TO MY JOURNEY'}
            </button>
          </div>

        </div>

      </div>

      {/* Resumed Toast */}
      <div 
        className={`fixed bottom-8 right-8 z-[300] backdrop-blur-xl px-6 py-4 rounded-xl shadow-2xl transition-all duration-500 ease-out transform ${
          resumeToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: theme.bg,
          border: `1px solid ${theme.borderLine}`,
          color: theme.ink
        }}
      >
        <p className="text-xs uppercase tracking-[0.2em] flex items-center gap-3 font-semibold" style={{ color: theme.accent }}>
          <BookmarkSimple size={18} weight="fill" />
          {toastMessage}
        </p>
      </div>

    </article>
  );
}
