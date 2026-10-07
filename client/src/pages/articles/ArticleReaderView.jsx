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
    bg: '#c85628',
    ink: '#ffffff',
    inkMuted: 'rgba(255, 255, 255, 0.85)',
    inkFaint: 'rgba(255, 255, 255, 0.5)',
    borderLine: 'rgba(255, 255, 255, 0.18)',
    accent: '#fca283',
    accentLight: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.06)',
    aarkeshColor: '#ffffff',
    btnBg: '#ffffff',
    btnInk: '#c85628',
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
    accent: '#7a2d0f',
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
    
    // Normalize if trailing question mark/exclamation is placed right after asterisk (e.g. *word*? -> *word?*)
    const normalizedStr = str.replace(/\*([^*]+)\*(\?|!)/g, '*$1$2*');
    
    const tokenRegex = /(\*\*(.+?)\*\*|\+\+([^+]+?)\+\+|\+([^+]+?)\+|\*([^*]+?)\*|\[([^\]]+?)\]|_([^_]+?)_)/g;
    
    const elements = [];
    let lastIndex = 0;
    let match;
    let count = 0;

    while ((match = tokenRegex.exec(normalizedStr)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        elements.push(normalizedStr.substring(lastIndex, matchIndex));
      }

      const raw = match[0];
      const key = `${keyPrefix}-${count++}`;

      if (raw.startsWith('**') && raw.endsWith('**')) {
        const inner = raw.slice(2, -2);
        elements.push(
          <strong key={key} className="font-bold font-serif" style={{ color: 'inherit', fontWeight: 700 }}>
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

    if (lastIndex < normalizedStr.length) {
      elements.push(normalizedStr.substring(lastIndex));
    }

    return elements.length > 0 ? elements : normalizedStr;
  };

  return parseTokens(text);
}

export function renderEditorialDropCap(text, themeAccent, themeInk) {
  if (!text || typeof text !== 'string') return null;
  const clean = text.replace(/^\s+/, '');
  if (!clean) return null;

  // Find first alphanumeric character
  const match = clean.match(/[a-zA-Z0-9]/);
  if (!match) {
    return (
      <p className="font-normal break-words" style={{ overflowWrap: 'anywhere' }}>
        {renderFormattedTitle(clean, themeAccent)}
      </p>
    );
  }

  const idx = match.index;
  const letter = match[0].toUpperCase();
  const rest = clean.slice(idx + 1);

  return (
    <p className="font-normal break-words" style={{ color: themeInk, overflowWrap: 'anywhere' }}>
      <span
        style={{
          float: 'left',
          fontFamily: '"Fraunces", "Playfair Display", Georgia, serif',
          color: themeAccent,
          fontWeight: '400',
          lineHeight: '0.85',
          fontSize: '3.85rem',
          marginRight: '0.35rem',
          marginTop: '0.04rem',
          marginBottom: '0.2rem',
          paddingRight: '0.04rem',
          userSelect: 'none',
          display: 'inline-block'
        }}
      >
        {letter}
      </span>
      {renderFormattedTitle(rest, themeAccent)}
    </p>
  );
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
  const baseTheme = THEMES_MAP[rawCat] || THEMES_MAP.relationships;
  const theme = {
    ...baseTheme,
    ...(categoryConfig || {}),
    ink: categoryConfig?.ink || baseTheme.ink,
    inkMuted: categoryConfig?.inkMuted || baseTheme.inkMuted || 'rgba(247, 238, 245, 0.88)',
    inkFaint: categoryConfig?.inkFaint || baseTheme.inkFaint || 'rgba(247, 238, 245, 0.60)',
    bg: categoryConfig?.bg || baseTheme.bg,
    accent: categoryConfig?.accent || baseTheme.accent,
  };

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
    // Always start new/unopened article from the very top
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    const saved = getSavedProgress();
    if (saved && saved.scrollY > 150 && !hasRestoredRef.current) {
      hasRestoredRef.current = true;
      maxProgressRef.current = saved.percentage || 0;
      setProgress(saved.percentage || 0);
      
      const targetY = saved.scrollY;
      setTimeout(() => {
        if (window.lenis) {
          window.lenis.scrollTo(targetY, { immediate: false, duration: 1.0 });
        } else {
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
        setToastMessage(`Resumed reading from ${saved.percentage || 0}%`);
        setResumeToast(true);
        setTimeout(() => setResumeToast(false), 4000);
      }, 350);
    } else {
      maxProgressRef.current = 0;
      setProgress(0);
      hasRestoredRef.current = true;
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
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
          overflow-x: hidden;
          width: 100%;
          max-width: 100vw;
          box-sizing: border-box;
        }

        .themed-reader-view h1,
        .themed-reader-view h2,
        .themed-reader-view h3,
        .themed-reader-view h4,
        .themed-reader-view h5,
        .themed-reader-view h6,
        .themed-reader-view .editorial-body h1,
        .themed-reader-view .editorial-body h2,
        .themed-reader-view .editorial-body h3,
        .themed-reader-view .editorial-body h4,
        .themed-reader-view .editorial-body .prose h1,
        .themed-reader-view .editorial-body .prose h2,
        .themed-reader-view .editorial-body .prose h3,
        .themed-reader-view .editorial-body .prose h4 {
          font-family: 'Fraunces', Georgia, serif;
          color: ${theme.ink};
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .themed-reader-view strong,
        .themed-reader-view b,
        .themed-reader-view .editorial-body strong,
        .themed-reader-view .editorial-body b,
        .themed-reader-view .editorial-body .prose strong,
        .themed-reader-view .editorial-body .prose b {
          font-weight: 700;
        }

        .themed-reader-view .editorial-body {
          width: 100%;
          max-width: 100%;
          margin-left: 0;
          margin-right: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
          box-sizing: border-box;
          color: ${theme.ink};
        }

        .themed-reader-view .editorial-body p,
        .themed-reader-view .editorial-body li,
        .themed-reader-view .editorial-body div,
        .themed-reader-view .editorial-body .prose,
        .themed-reader-view .editorial-body .prose p,
        .themed-reader-view .editorial-body .prose li,
        .themed-reader-view .editorial-body .prose ul,
        .themed-reader-view .editorial-body .prose ol,
        .themed-reader-view .editorial-body .editorial-rich-text,
        .themed-reader-view .editorial-body .editorial-rich-text p,
        .themed-reader-view .editorial-body .editorial-rich-text li {
          font-family: 'Fraunces', Georgia, serif;
          color: ${theme.ink};
          font-size: 1.15rem;
          line-height: 1.65;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .themed-reader-view .editorial-body span,
        .themed-reader-view .editorial-body .editorial-rich-text span {
          font-family: inherit;
        }

        .themed-reader-view .editorial-body mark {
          background-color: #fef08a;
          color: #111010;
          padding: 0.1em 0.3em;
          border-radius: 0.25rem;
        }

        .themed-reader-view .editorial-body span[style*="background-color"],
        .themed-reader-view .editorial-body mark {
          border-radius: 0.2rem;
          display: inline;
        }

        .themed-reader-view .editorial-body p,
        .themed-reader-view .editorial-body .prose p,
        .themed-reader-view .editorial-body .editorial-rich-text p {
          margin-bottom: 0.55rem !important;
        }

        /* Default Drop Cap on first paragraph (Spans full 2-line height so line 2 wraps to the right) */
        .themed-reader-view .editorial-body .editorial-rich-text > p:first-of-type::first-letter {
          font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
          -webkit-initial-letter: 2 2;
          initial-letter: 2 2;
          float: left;
          font-size: 3.85rem;
          line-height: 0.85;
          margin-top: 0.04rem;
          margin-bottom: 0.2rem;
          margin-right: 0.35rem;
          padding-right: 0.04rem;
          color: ${theme.accent};
          font-weight: 400;
        }

        /* If first paragraph is aligned right or center, do NOT float left so letter moves seamlessly with the text */
        .themed-reader-view .editorial-body .editorial-rich-text > p[style*="text-align: right"]:first-of-type::first-letter,
        .themed-reader-view .editorial-body .editorial-rich-text > p[style*="text-align:right"]:first-of-type::first-letter,
        .themed-reader-view .editorial-body .editorial-rich-text > p[style*="text-align: center"]:first-of-type::first-letter,
        .themed-reader-view .editorial-body .editorial-rich-text > p[style*="text-align:center"]:first-of-type::first-letter,
        .themed-reader-view .editorial-body .editorial-rich-text > p[align="right"]:first-of-type::first-letter,
        .themed-reader-view .editorial-body .editorial-rich-text > p[align="center"]:first-of-type::first-letter,
        .themed-reader-view .editorial-body .editorial-rich-text > p.text-right:first-of-type::first-letter,
        .themed-reader-view .editorial-body .editorial-rich-text > p.text-center:first-of-type::first-letter {
          float: none !important;
          display: inline !important;
          padding-right: 0 !important;
          margin-right: 0 !important;
          line-height: inherit !important;
          vertical-align: baseline !important;
        }

        .themed-reader-view .editorial-body em,
        .themed-reader-view .editorial-body i,
        .themed-reader-view .editorial-body .prose em,
        .themed-reader-view .editorial-body .prose i {
          font-family: 'Fraunces', Georgia, serif;
          font-style: italic;
        }

        .themed-reader-view .editorial-body blockquote {
          font-family: 'Fraunces', Georgia, serif;
          font-style: italic;
          border-left: 3px solid ${theme.accent};
          padding-left: 1.5rem;
          margin: 2.5rem 0;
          color: ${theme.ink};
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .themed-reader-view .editorial-body ul {
          list-style-type: disc !important;
          padding-left: 2rem !important;
          margin: 1.5rem 0 !important;
        }

        .themed-reader-view .editorial-body ol {
          list-style-type: decimal !important;
          padding-left: 2rem !important;
          margin: 1.5rem 0 !important;
        }

        .themed-reader-view .editorial-body li {
          margin: 0.5rem 0 !important;
          display: list-item !important;
          font-size: 1.15rem;
          line-height: 1.8;
          color: ${theme.ink};
          overflow-wrap: anywhere;
          word-break: break-word;
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
        className="sticky top-0 z-50 backdrop-blur-md px-6 sm:px-12 py-5 flex items-center justify-between transition-colors duration-300 w-full"
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

        <div className="text-2xl sm:text-[28px] font-semibold tracking-tight hidden md:block" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          <Link to="/" style={{ color: theme.ink }}>
            BetterWith<em style={{ color: theme.aarkeshColor, fontStyle: 'normal', fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, marginLeft: '2px' }}>Aarkesh</em>
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

      <div className="w-full px-6 sm:px-12 pt-12 pb-24 flex flex-col">

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
              {article.category || theme.name.toUpperCase()}
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
            ARTICLE BODY CONTENT (FULL WIDTH EDITORIAL READING)
           ========================================================= */}
        <div className="editorial-body w-full max-w-none pt-16 pb-20">
          
          {/* 1. Modular Blocks Renderer (If article has custom block sequence) */}
          {article.blocks && article.blocks.length > 0 ? (() => {
            let hasRenderedDropCap = false;
            return (
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
                        className="pl-6 py-5 my-10 flex flex-col gap-2.5 rounded-r-2xl border-l-[3px] shadow-sm max-w-full overflow-hidden"
                        style={{ 
                          borderColor: theme.accent,
                          backgroundColor: theme.cardBg,
                          overflowWrap: 'anywhere'
                        }}
                      >
                        {block.line1 && (
                          <p className="text-xl sm:text-2xl italic font-normal break-words m-0" style={{ color: theme.ink, overflowWrap: 'anywhere' }}>
                            {renderFormattedTitle(block.line1, theme.accent)}
                          </p>
                        )}
                        {block.line2 && (
                          <p className="text-xl sm:text-2xl italic font-normal break-words m-0" style={{ color: theme.accent, overflowWrap: 'anywhere' }}>
                            {renderFormattedTitle(block.line2, theme.accent)}
                          </p>
                        )}
                      </div>
                    );
                  }

                  if (block.type === 'dropCap') {
                    hasRenderedDropCap = true;
                    const rawText = (block.text || block.dropCapText || '').trimStart();
                    return (
                      <React.Fragment key={block.id || bIdx}>
                        {renderEditorialDropCap(rawText, theme.accent, theme.ink)}
                      </React.Fragment>
                    );
                  }

                  if (block.type === 'paragraph' || block.type === 'paragraphs') {
                    const text = block.text || '';
                    const hasHtml = /<[a-z][\s\S]*>/i.test(text);

                    if (hasHtml) {
                      return (
                        <div 
                          key={block.id || bIdx}
                          className="mb-8 space-y-4 editorial-rich-text max-w-none clear-both after:content-[''] after:table after:clear-both break-words overflow-hidden"
                          style={{ color: theme.ink, overflowWrap: 'anywhere' }}
                          dangerouslySetInnerHTML={{ __html: text }}
                        />
                      );
                    }

                    const pList = Array.isArray(block.paragraphs) 
                      ? block.paragraphs 
                      : (block.text ? block.text.replace(/\r\n/g, '\n').split(/\n\s*\n/) : []);
                    
                    const validParagraphs = pList.filter(p => p && p.trim());
                    if (validParagraphs.length === 0) return null;

                    return (
                      <React.Fragment key={block.id || bIdx}>
                        {validParagraphs.map((p, pIdx) => {
                          if (!hasRenderedDropCap && pIdx === 0) {
                            hasRenderedDropCap = true;
                            return (
                              <React.Fragment key={pIdx}>
                                {renderEditorialDropCap(p, theme.accent, theme.ink)}
                              </React.Fragment>
                            );
                          }
                          return (
                            <p key={pIdx} className="font-normal break-words" style={{ overflowWrap: 'anywhere' }}>
                              {renderFormattedTitle(p, theme.accent)}
                            </p>
                          );
                        })}
                      </React.Fragment>
                    );
                  }

                  return null;
                })}
              </div>
            );
          })() : (
            <>
              {/* 2. Structured Sections / Drop Cap Legacy Format */}
              {article.dropCap ? (() => {
                const dcLetter = article.dropCap;
                const dcText = article.dropCapText || '';
                const cleanDcText = (dcLetter && dcText.toUpperCase().startsWith(dcLetter.toUpperCase()))
                  ? dcText.slice(dcLetter.length)
                  : dcText;
                return (
                  <p className="font-normal">
                    <span style={{
                      float: 'left',
                      fontFamily: '"Fraunces", "Playfair Display", Georgia, serif',
                      color: theme.accent,
                      fontWeight: '400',
                      lineHeight: '0.85',
                      fontSize: '3.4rem',
                      paddingRight: '0.55rem',
                      paddingTop: '0.05rem',
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
              {article.paragraphsAfterDropCap && article.paragraphsAfterDropCap.map((p, idx) => {
                if (!article.dropCap && idx === 0) {
                  return (
                    <React.Fragment key={idx}>
                      {renderEditorialDropCap(p, theme.accent, theme.ink)}
                    </React.Fragment>
                  );
                }
                return (
                  <p key={idx} className="font-normal">
                    {renderFormattedTitle(p, theme.accent)}
                  </p>
                );
              })}

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
                  {sec.paragraphs && sec.paragraphs.map((p, pIdx) => {
                    const isFirstEver = !article.dropCap && (!article.paragraphsAfterDropCap || article.paragraphsAfterDropCap.length === 0) && sIdx === 0 && pIdx === 0;
                    if (isFirstEver) {
                      return (
                        <React.Fragment key={pIdx}>
                          {renderEditorialDropCap(p, theme.accent, theme.ink)}
                        </React.Fragment>
                      );
                    }
                    return (
                      <p key={pIdx} className="font-normal">
                        {renderFormattedTitle(p, theme.accent)}
                      </p>
                    );
                  })}

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
          {!article.blocks?.length && !article.sections?.length && article.bodyHtml && (
            <div
              className="editorial-rich-text max-w-none mb-8 leading-[1.85]"
              style={{ color: theme.ink }}
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
        </div>

        {/* Bottom Complete Reading Action Bar (Full Width Spanning Screen Ends) */}
        <div 
          className="w-full mt-20 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ borderTop: `1px solid ${theme.borderLine}` }}
        >
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] font-bold transition-opacity hover:opacity-60 cursor-pointer group"
            style={{ color: theme.ink }}
          >
            <ArrowLeft size={16} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
            <span>RETURN TO {theme.name.toUpperCase()} ARTICLES</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSave}
            className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer hover:opacity-90"
            style={{
              backgroundColor: isSaved ? theme.ink : theme.btnBg,
              color: isSaved ? theme.bg : theme.btnInk
            }}
          >
            {isSaved ? 'ARTICLE SAVED IN MY JOURNEY' : 'SAVE ARTICLE TO MY JOURNEY'}
          </button>
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
