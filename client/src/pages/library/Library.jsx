import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { List, X, ArrowDown, ArrowRight, Play, User, BookmarkSimple, SignOut, LockKey, CalendarBlank, CaretDown, CaretUp } from '@phosphor-icons/react';
import { CURATED_LIBRARY_ARTICLES } from '../../constants/libraryArticlesData';
import { renderFormattedTitle } from '../articles/ArticleReaderView';
import LoginModal from '../../components/layout/LoginModal';
import PlasmaRingSphere from '../../components/library/PlasmaRingSphere';
import { API_URL } from '../../utils/apiUrl';
import { clearAllAuth, isAnyUserLoggedIn, getEffectiveUser } from '../../utils/authSync';

export default function Library() {
  const navigate = useNavigate();
  const { openBookingModal } = useBooking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(isAnyUserLoggedIn);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchWrapRef = useRef(null);
  const userMenuRef = useRef(null);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const effectiveUser = getEffectiveUser();
  const rawName = effectiveUser?.fullName || effectiveUser?.name || 'User';
  const userFirstName = rawName.trim().split(' ')[0].toUpperCase();
  const userDisplayName = rawName.trim().split(' ')[0];
  const userInitial = (userFirstName[0] || 'U').toUpperCase();

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(isAnyUserLoggedIn());
    };
    handleAuthChange();
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('course-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('course-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  const [heroSettings, setHeroSettings] = useState({
    headingText: 'What are you trying to *understand?*',
    searchPlaceholder: "Describe what you're navigating...",
  });

  const [typography, setTypography] = useState({
    heroHeadingSize: 54,
    heroShiftY: -35,
    searchFontSize: 13,
    searchMaxWidth: 260,
    searchShiftY: -10,
    marqueeFontSize: 16,
    marqueeHeight: 52,
    categoryWordSize: 110,
    viewAllFontSize: 12,
    articleTitleSize: 17,
    articleMetaSize: 10,
    articleCountSize: 11,
    sphereSize: 320,
  });

  // Fetch Hero Heading & Typography & Published Articles from API
  useEffect(() => {
    const fetchLibrarySettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/library-settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.hero) {
            setHeroSettings({
              headingText: data.hero.headingText || 'What are you trying to *understand?*',
              searchPlaceholder: data.hero.searchPlaceholder || "Describe what you're navigating...",
            });
          }
          if (data.typography) {
            setTypography({
              heroHeadingSize: data.typography.heroHeadingSize ?? 54,
              heroShiftY: data.typography.heroShiftY ?? -35,
              searchFontSize: data.typography.searchFontSize ?? 13,
              searchMaxWidth: data.typography.searchMaxWidth ?? 260,
              searchShiftY: data.typography.searchShiftY ?? -10,
              marqueeFontSize: data.typography.marqueeFontSize ?? 16,
              marqueeHeight: data.typography.marqueeHeight ?? 52,
              categoryWordSize: data.typography.categoryWordSize ?? 110,
              viewAllFontSize: data.typography.viewAllFontSize ?? 12,
              articleTitleSize: data.typography.articleTitleSize ?? 17,
              articleMetaSize: data.typography.articleMetaSize ?? 10,
              articleCountSize: data.typography.articleCountSize ?? 11,
              sphereSize: data.typography.sphereSize ?? 320,
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch library settings', err);
      }
    };

    const fetchArticles = async () => {
      try {
        const res = await fetch(`${API_URL}/api/articles/published`);
        if (res.ok) {
          const data = await res.json();
          setPublishedArticles(data);
        }
      } catch (err) {
        console.error('Failed to fetch published articles', err);
      }
    };

    fetchLibrarySettings();
    fetchArticles();
  }, []);

  // Helper to render italicized words in hero heading
  const renderHeroHeading = (text) => {
    if (!text) return <>What are you trying to <em>understand?</em></>;
    // If a question mark/exclamation directly follows an asterisk (e.g. *understand*?), include it inside the italic span
    const normalizedText = text.replace(/\*([^*]+)\*(\?|!)/g, '*$1$2*');
    const parts = normalizedText.split(/(\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategorySlug = (category) => {
    if (!category) return 'relationships';
    const c = category.toLowerCase().trim().replace(/_/g, '-').replace(/\s+/g, '-');
    if (c.includes('relat')) return 'relationships';
    if (c.includes('self')) return 'self';
    if (c.includes('chang')) return 'change';
    if (c.includes('decis')) return 'decisions';
    if (c.includes('diff')) return 'difficult-people';
    if (c.includes('commun')) return 'communication';
    return c;
  };

  const getCategoryColor = (category) => {
    const slug = getCategorySlug(category);
    switch (slug) {
      case 'relationships': return { bg: '#faebf7', color: '#3d1b37' };
      case 'self': return { bg: '#f0eee8', color: '#111010' };
      case 'change': return { bg: '#e5f2e8', color: '#2f4a34' };
      case 'decisions': return { bg: '#faece6', color: '#c85628' };
      case 'difficult-people': return { bg: '#fbf0eb', color: '#a64117' };
      case 'communication': return { bg: '#e8e6e8', color: '#141314' };
      default: return { bg: '#f0eee8', color: '#111010' };
    }
  };

  // Helper to dynamically get and merge DB articles with curated articles per category
  const getCategoryArticles = (categoryId, categoryName) => {
    const targetCatId = categoryId.toLowerCase().replace(/\s+/g, '-');
    const targetCatName = (categoryName || '').toLowerCase();

    const matchingDb = publishedArticles.filter(a => {
      if (a.status === 'Draft') return false;
      const aCatId = (a.categoryId || '').toLowerCase().replace(/\s+/g, '-');
      const aCat = (a.category || '').toLowerCase().replace(/\s+/g, '-');
      return aCatId === targetCatId || aCat === targetCatId || aCat === targetCatName || aCat.includes(targetCatId);
    });

    const sortedDb = [...matchingDb].sort((a, b) => {
      const orderA = typeof a.order === 'number' && a.order > 0 ? a.order : 9999;
      const orderB = typeof b.order === 'number' && b.order > 0 ? b.order : 9999;
      if (orderA !== orderB) return orderA - orderB;
      const timeA = new Date(a.createdAt || a.updatedAt || a.date || 0).getTime();
      const timeB = new Date(b.createdAt || b.updatedAt || b.date || 0).getTime();
      return timeA - timeB;
    });

    const matchingCurated = CURATED_LIBRARY_ARTICLES.filter(c => {
      const cCat = (c.category || '').toLowerCase().replace(/\s+/g, '-');
      return cCat === targetCatId || cCat === targetCatName || cCat.includes(targetCatId);
    });

    const merged = sortedDb.length > 0 ? sortedDb : matchingCurated;

    return merged.map((article, idx) => {
      let displayDate = article.date;
      if (!displayDate && article.createdAt) {
        try {
          const d = new Date(article.createdAt);
          if (!isNaN(d.getTime())) {
            displayDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
          }
        } catch (_) {}
      }
      return {
        ...article,
        id: article._id || article.id || `article-${idx}`,
        slug: article.slug || article._id || article.id || `article-${idx}`,
        readTime: article.readTime || `${5 + (idx * 2)} MIN`,
        date: displayDate || 'MAY 2026'
      };
    });
  };

  // Combine and deduplicate articles (prioritize DB)
  const allArticles = [
    ...publishedArticles,
    ...CURATED_LIBRARY_ARTICLES.filter(
      c => !publishedArticles.some(p => {
        const pCat = (p.categoryId || p.category || '').toLowerCase().replace(/\s+/g, '-');
        const cCat = (c.category || '').toLowerCase().replace(/\s+/g, '-');
        return pCat === cCat;
      })
    )
  ];

  // Helper to extract entire searchable body text from an article (titles, subtitles, HTML body, blocks, excerpts, callouts)
  const extractArticleSearchText = (a) => {
    if (!a) return '';
    const parts = [];
    if (a.title) parts.push(a.title);
    if (a.titleMain) parts.push(a.titleMain);
    if (a.subtitle) parts.push(a.subtitle);
    if (a.excerpt) parts.push(a.excerpt);
    if (a.description) parts.push(a.description);
    if (a.category) parts.push(a.category);
    if (a.categoryId) parts.push(a.categoryId);
    if (a.dropCapText) parts.push(a.dropCapText);
    if (a.endingHighlight) parts.push(a.endingHighlight);
    if (a.quote) parts.push(a.quote);
    if (Array.isArray(a.tags)) parts.push(a.tags.join(' '));

    // Strip HTML from bodyHtml or plain content
    if (a.bodyHtml && typeof a.bodyHtml === 'string') {
      parts.push(a.bodyHtml.replace(/<[^>]+>/g, ' '));
    }
    if (a.content && typeof a.content === 'string') {
      parts.push(a.content.replace(/<[^>]+>/g, ' '));
    }

    // Extract text from custom blocks structure (DB articles)
    if (Array.isArray(a.blocks)) {
      a.blocks.forEach(b => {
        if (!b) return;
        if (b.heading) parts.push(b.heading);
        if (b.text) parts.push(b.text);
        if (b.content) parts.push(b.content);
        if (b.line1) parts.push(b.line1);
        if (b.line2) parts.push(b.line2);
        if (b.dropCapText) parts.push(b.dropCapText);
        if (typeof b.callout === 'string') parts.push(b.callout);
        else if (typeof b.callout === 'object' && b.callout) {
          if (b.callout.line1) parts.push(b.callout.line1);
          if (b.callout.line2) parts.push(b.callout.line2);
          if (b.callout.text) parts.push(b.callout.text);
        }
        if (Array.isArray(b.paragraphs)) parts.push(b.paragraphs.join(' '));
        if (Array.isArray(b.sections)) {
          b.sections.forEach(s => {
            if (s?.heading) parts.push(s.heading);
            if (Array.isArray(s?.paragraphs)) parts.push(s.paragraphs.join(' '));
            if (s?.callout?.line1) parts.push(s.callout.line1);
            if (s?.callout?.line2) parts.push(s.callout.line2);
          });
        }
      });
    }

    return parts.join(' ').toLowerCase().replace(/[*_\[\]\+\#]/g, ' ');
  };

  const searchResults = (searchQuery.trim().length > 0)
    ? allArticles
        .map(a => {
          const q = searchQuery.toLowerCase().trim();
          const qWords = q.split(/\s+/).filter(w => w.length > 0);
          
          const cleanTitle = `${a.title || ''} ${a.titleMain || ''}`.toLowerCase().replace(/[*_\[\]\+\#]/g, '');
          const cleanSubtitle = `${a.subtitle || ''} ${a.excerpt || ''} ${a.description || ''}`.toLowerCase().replace(/[*_\[\]\+\#]/g, '');
          const fullText = extractArticleSearchText(a);

          let score = 0;
          if (cleanTitle.includes(q)) score += 100;
          if (cleanSubtitle.includes(q)) score += 50;
          if (fullText.includes(q)) score += 25;

          // Multi-word / partial matching across deep text
          if (qWords.length > 1) {
            const titleMatches = qWords.filter(w => cleanTitle.includes(w)).length;
            const subtitleMatches = qWords.filter(w => cleanSubtitle.includes(w)).length;
            const fullMatches = qWords.filter(w => fullText.includes(w)).length;
            
            score += titleMatches * 30;
            score += subtitleMatches * 15;
            score += fullMatches * 8;
          } else if (qWords.length === 1) {
            const singleWord = qWords[0];
            if (cleanTitle.includes(singleWord)) score += 40;
            if (cleanSubtitle.includes(singleWord)) score += 20;
            if (fullText.includes(singleWord)) score += 10;
          }

          return { article: a, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.article)
        .slice(0, 5)
    : [];

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      if (window.lenis) {
        window.lenis.scrollTo(el, { offset: -20, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      navigate(`/articles?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleBookClick = (e) => {
    e?.preventDefault();
    navigate('/book');
  };

  return (
    <div
      className="library-root"
      style={{
        '--hero-heading-size': typography?.heroHeadingSize ? `${typography.heroHeadingSize}px` : undefined,
        '--heading-shift-y': typography?.heroShiftY !== undefined ? `${typography.heroShiftY}px` : undefined,
        '--search-font-size': typography?.searchFontSize ? `${typography.searchFontSize}px` : undefined,
        '--search-max-width': typography?.searchMaxWidth ? `${typography.searchMaxWidth}px` : undefined,
        '--search-shift-y': typography?.searchShiftY !== undefined ? `${typography.searchShiftY}px` : undefined,
        '--marquee-font-size': typography?.marqueeFontSize ? `${typography.marqueeFontSize}px` : undefined,
        '--marquee-height': typography?.marqueeHeight ? `${typography.marqueeHeight}px` : undefined,
        '--category-word-size': typography?.categoryWordSize ? `${typography.categoryWordSize}px` : undefined,
        '--viewall-font-size': typography?.viewAllFontSize ? `${typography.viewAllFontSize}px` : undefined,
        '--article-title-size': typography?.articleTitleSize ? `${typography.articleTitleSize}px` : undefined,
        '--article-meta-size': typography?.articleMetaSize ? `${typography.articleMetaSize}px` : undefined,
        '--article-count-size': typography?.articleCountSize ? `${typography.articleCountSize}px` : undefined,
        '--sphere-size': typography?.sphereSize ? `${typography.sphereSize}px` : undefined,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@400;500;600;700;800&display=swap');

        .library-root {
          --ink: #111010;
          --cream: #f5f1e8;
          --rel: #3d1b37;
          --rel-ink: #f7eef5;
          --self: #ffffff;
          --self-ink: #111010;
          --change: #2f4a34;
          --change-ink: #e9f0e6;
          --dec: #c85628;
          --dec-ink: #ffffff;
          --diff: #f0d9c9;
          --diff-ink: #2b1208;
          --comm: #141314;
          --comm-ink: #f5f1e8;
          --line: rgba(0, 0, 0, 0.14);

          width: 100%;
          min-height: 100vh;
          margin: 0;
          background: var(--cream);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: clip;
        }

        .library-root * {
          box-sizing: border-box;
        }

        .library-root a {
          color: inherit;
          text-decoration: none;
        }

        .library-root .disp {
          font-family: 'Archivo Black', sans-serif;
          text-transform: uppercase;
          line-height: 0.92;
          letter-spacing: -0.01em;
        }

        .library-root .serif-i {
          font-family: 'Fraunces', serif;
          font-style: italic;
        }

        /* ---------- NAV ---------- */
        .library-root header.nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px clamp(16px, 3.2vw, 44px);
          border-bottom: 1px solid var(--line);
          position: relative;
          z-index: 1200;
          background: var(--cream);
          width: 100%;
          box-sizing: border-box;
          gap: 16px;
        }

        .library-root .logo {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(20px, 1.8vw, 27px);
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.1;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .library-root .logo em {
          font-style: normal;
          color: #c9542f;
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 600;
          margin-left: 2px;
        }

        .library-root .navlinks {
          display: flex;
          align-items: center;
          gap: clamp(12px, 1.5vw, 24px);
          font-size: clamp(10px, 0.8vw, 11.5px);
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
          flex-shrink: 1;
        }

        .library-root .navlinks a {
          color: #111010;
          transition: all 0.2s ease;
          position: relative;
          padding: 4px 0;
        }

        .library-root .navlinks a:hover {
          color: #c9542f;
          opacity: 1;
        }

        .library-root .navlinks a.active {
          color: #111010;
          text-decoration: underline;
          text-underline-offset: 6px;
          text-decoration-thickness: 2px;
          opacity: 1;
        }

        .library-root .navcta {
          display: flex;
          align-items: center;
          gap: clamp(6px, 0.8vw, 10px);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .library-root .navcta .nav-btn-outline {
          padding: 6.5px clamp(10px, 0.9vw, 14px);
          border-radius: 2px;
          border: 1px solid rgba(0, 0, 0, 0.22);
          color: #111010;
          font-family: 'Inter', sans-serif;
          font-size: clamp(9px, 0.75vw, 10.5px);
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          background: transparent;
          text-decoration: none;
          white-space: nowrap;
        }

        .library-root .navcta .nav-btn-outline:hover {
          border-color: #c9542f;
          color: #c9542f;
          background: #fbf0eb;
        }

        .library-root .navcta .account-wrapper {
          position: relative;
          z-index: 1210;
        }

        .library-root .navcta .account-wrapper:hover .account-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
        }

        .library-root .navcta .account-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          padding-top: 8px;
          width: 210px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(8px);
          transition: all 0.25s ease;
          pointer-events: none;
          z-index: 1220;
        }

        .library-root .navcta .account-card {
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: #ffffff;
          padding: 8px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
          display: flex;
          flex-direction: column;
        }

        .library-root .navcta .account-card .user-title {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.15em;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.5);
          margin: 6px 0 6px 12px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .library-root .navcta .account-card button {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.12em;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.8);
          background: none;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: background 0.15s, color 0.15s;
        }

        .library-root .navcta .account-card button:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #111010;
        }

        .library-root .navcta .account-card button.logout-btn {
          color: #c9542f;
          font-weight: 700;
          margin-top: 4px;
        }

        .library-root .navcta .account-card button.logout-btn:hover {
          background: rgba(201, 84, 47, 0.1);
        }

        .library-root .navcta .book {
          background: var(--ink);
          color: var(--cream);
          padding: 7.5px clamp(12px, 1.1vw, 18px);
          border-radius: 2px;
          font-size: clamp(9.5px, 0.78vw, 11px);
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          transition: transform 0.2s, background 0.2s;
          cursor: pointer;
          display: inline-block;
          border: none;
          white-space: nowrap;
        }

        .library-root .navcta .book:hover {
          background: #c9542f;
          transform: translateY(-1px);
        }

        .library-root .mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--ink);
          padding: 4px;
        }

        .library-root .mobile-drawer {
          display: none;
        }

        @media (max-width: 1080px) {
          .library-root .navlinks { display: none; }
          .library-root header.nav { padding: 14px 20px; }
          .library-root .mobile-toggle { display: block; }
          .library-root .navcta .nav-btn-outline,
          .library-root .navcta .account-wrapper { display: none; }
          .library-root .mobile-drawer {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 24px 20px 30px;
            background: var(--cream);
            border-bottom: 1px solid var(--line);
          }
          .library-root .mobile-drawer a,
          .library-root .mobile-drawer button {
            font-size: 15px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            background: none;
            border: none;
            text-align: left;
            padding: 0;
            cursor: pointer;
            color: inherit;
          }
        }

        /* ---------- MARQUEE STRIP (CLASSIC BLACK WITH COLORFUL DIAMOND SPARKLES) ---------- */
        @keyframes marqueeScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .library-root .marquee {
          background: #111010;
          overflow: hidden;
          width: 100%;
          height: var(--marquee-height, 52px);
          display: flex;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          z-index: 10;
          user-select: none;
          pointer-events: none;
        }

        .library-root .marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          flex-shrink: 0;
          white-space: nowrap;
          will-change: transform;
          animation: marqueeScroll 65s linear infinite !important;
        }

        .library-root .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 28px;
          padding: 0 20px;
          background: transparent;
          color: #ffffff;
          border: none;
          outline: none;
          font-family: 'Archivo Black', sans-serif;
          text-transform: uppercase;
          font-size: var(--marquee-font-size, 16px);
          letter-spacing: 0.14em;
          white-space: nowrap;
          cursor: default;
          margin: 0;
          user-select: none;
          box-shadow: none;
          flex-shrink: 0;
        }

        .library-root .marquee-sparkle {
          font-size: 13px;
          line-height: 1;
          display: inline-block;
          transform: translateY(-0.5px);
        }

        /* ---------- HERO (BALANCED TO SHOW PREVIEW OF FIRST SECTION) ---------- */
        .library-root .hero {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: clamp(24px, 3.8vh, 40px) 20px clamp(16px, 2.4vh, 26px);
          text-align: center;
          max-width: 920px;
          margin: 0 auto;
          position: relative;
          z-index: 80;
          overflow: visible;
          box-sizing: border-box;
        }

        .library-root .hero-ambient-glow {
          position: absolute;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 240px;
          background: radial-gradient(circle, rgba(201, 84, 47, 0.08) 0%, rgba(245, 241, 232, 0) 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .library-root .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--rel);
          background: rgba(201, 84, 47, 0.08);
          border: 1px solid rgba(201, 84, 47, 0.2);
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 14px;
          position: relative;
          z-index: 1;
        }

        .library-root .hero-badge span.dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--rel);
          display: inline-block;
          animation: pulseDot 2s ease-in-out infinite;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .library-root .hero h1 {
          font-size: clamp(32px, 4.8vw, 54px);
          margin: 0 0 14px;
          line-height: 1.1;
          letter-spacing: -0.01em;
          position: relative;
          z-index: 1;
        }

        .library-root .hero p.lead {
          font-size: clamp(14px, 1.5vw, 15.5px);
          color: #4a463e;
          line-height: 1.6;
          margin: 0 auto 22px;
          max-width: 600px;
          position: relative;
          z-index: 1;
        }

        /* ---------- HERO (CLEAN SEARCH & HEADING) ---------- */
        /* =========================================================
           🎛️ POSITION CONTROLS: Upar / Neeche Move Karne Ke Liye
           ========================================================= */
        .library-root .hero {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px 16px 14px;
          text-align: center;
          max-width: 1080px;
          margin: 0 auto;
          position: relative;
          z-index: 80;
          overflow: visible;
          box-sizing: border-box;

          /* ↕️ 'What are you trying...' ko Upar (-) ya Neeche (+) move karein: e.g. '-40px', '-25px', '0px' */
          --heading-shift-y: -35px;

          /* ↕️ Search bar ko Neeche (+) ya Upar (-) move karein: e.g. '-10px', '0px', '+10px' */
          --search-shift-y: -10px;

          /* ↕️ Search bar ka gap */
          --search-margin-top: 14px;
          --search-max-width: 260px;
        }

        .library-root .hero-cloud-stage {
          position: relative;
          width: 100%;
          max-width: 760px;
          min-height: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          margin: 0 auto;
          transform: translateY(var(--heading-shift-y, -35px));
        }

        .library-root .hero-search-wrap {
          transform: translateY(var(--search-shift-y, -10px));
        }

        .library-root .hero-cloud-stage h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: var(--hero-heading-size, clamp(38px, 4.8vw, 64px));
          font-weight: 400;
          font-style: normal;
          color: #111010;
          margin: 0;
          line-height: 1.08;
          letter-spacing: -0.02em;
          position: relative;
          z-index: 5;
          max-width: 620px;
          text-align: center;
        }

        .library-root .hero-cloud-stage h1 em {
          font-family: 'Fraunces', Georgia, serif;
          font-style: italic;
          color: #c9542f;
          font-weight: 400;
        }

        /* Floating Cloud Pills */
        .library-root .cat-cloud-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 16px;
          border-radius: 40px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(0, 0, 0, 0.1);
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
          white-space: nowrap;
          user-select: none;
        }

        /* Desktop: Positioned via easy Control Variables above */
        @media (min-width: 860px) {
          .library-root .cat-cloud-pill {
            position: absolute;
            z-index: 10;
          }
          /* Top Crest - Directly above heading */
          .library-root .cat-cloud-pill.p-rel {
            top: var(--rel-top, -6px);
            left: var(--rel-left, 22%);
            animation: cloudDrift1 5.2s ease-in-out infinite;
          }
          .library-root .cat-cloud-pill.p-self {
            top: var(--self-top, -8px);
            right: var(--self-right, 22%);
            animation: cloudDrift2 6.0s ease-in-out infinite 0.7s;
          }
          /* Mid Flanks - Hugging heading sides closely */
          .library-root .cat-cloud-pill.p-change {
            top: var(--change-top, 40%);
            left: var(--change-left, 2%);
            animation: cloudDrift3 5.6s ease-in-out infinite 1.3s;
          }
          .library-root .cat-cloud-pill.p-dec {
            top: var(--dec-top, 38%);
            right: var(--dec-right, 2%);
            animation: cloudDrift1 6.4s ease-in-out infinite 1.9s;
          }
          /* Bottom Base - Tightly under heading flanking search */
          .library-root .cat-cloud-pill.p-diff {
            bottom: var(--diff-bottom, -8px);
            left: var(--diff-left, 12%);
            animation: cloudDrift2 5.4s ease-in-out infinite 1.0s;
          }
          .library-root .cat-cloud-pill.p-comm {
            bottom: var(--comm-bottom, -8px);
            right: var(--comm-right, 12%);
            animation: cloudDrift3 6.2s ease-in-out infinite 1.6s;
          }
        }

        /* Mobile / Tablet: Graceful Floating Wrap */
        @media (max-width: 859px) {
          .library-root .hero-cloud-stage {
            min-height: auto;
            gap: 16px;
          }
          .library-root .cat-cloud-cluster {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: 8px;
            margin-top: 14px;
            max-width: 480px;
          }
          .library-root .cat-cloud-pill {
            position: static;
          }
        }

        @keyframes cloudDrift1 {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }

        @keyframes cloudDrift2 {
          0%, 100% { transform: translateY(0px) rotate(2deg); }
          50% { transform: translateY(-10px) rotate(-1deg); }
        }

        @keyframes cloudDrift3 {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-7px) rotate(1.5deg); }
        }

        .library-root .cat-cloud-pill.p-rel {
          background: #ece0ea;
          color: #3d1b37;
          border-color: rgba(61, 27, 55, 0.3);
        }
        .library-root .cat-cloud-pill.p-rel:hover {
          background: var(--rel);
          color: #fff;
          transform: scale(1.06) translateY(-3px);
          box-shadow: 0 10px 22px -4px rgba(61, 27, 55, 0.4);
        }

        .library-root .cat-cloud-pill.p-self {
          background: #ffffff;
          color: #111010;
          border-color: rgba(0, 0, 0, 0.22);
        }
        .library-root .cat-cloud-pill.p-self:hover {
          background: #111010;
          color: #ffffff;
          transform: scale(1.06) translateY(-3px);
          box-shadow: 0 10px 22px -4px rgba(0, 0, 0, 0.3);
        }

        .library-root .cat-cloud-pill.p-change {
          background: #e2ebe3;
          color: #1a2f1e;
          border-color: rgba(47, 74, 52, 0.3);
        }
        .library-root .cat-cloud-pill.p-change:hover {
          background: var(--change);
          color: var(--change-ink);
          transform: scale(1.06) translateY(-3px);
          box-shadow: 0 10px 22px -4px rgba(47, 74, 52, 0.4);
        }

        .library-root .cat-cloud-pill.p-dec {
          background: #f0ded6;
          color: #2b1208;
          border-color: rgba(200, 86, 40, 0.3);
        }
        .library-root .cat-cloud-pill.p-dec:hover {
          background: var(--dec);
          color: #fff;
          transform: scale(1.06) translateY(-3px);
          box-shadow: 0 10px 22px -4px rgba(200, 86, 40, 0.4);
        }

        .library-root .cat-cloud-pill.p-diff {
          background: #faeae0;
          color: #2b1208;
          border-color: rgba(138, 106, 74, 0.3);
        }
        .library-root .cat-cloud-pill.p-diff:hover {
          background: #d4b096;
          color: #2b1208;
          transform: scale(1.06) translateY(-3px);
          box-shadow: 0 10px 22px -4px rgba(138, 106, 74, 0.3);
        }

        .library-root .cat-cloud-pill.p-comm {
          background: #e6e3dd;
          color: #141314;
          border-color: rgba(20, 19, 20, 0.25);
        }
        .library-root .cat-cloud-pill.p-comm:hover {
          background: var(--comm);
          color: var(--comm-ink);
          transform: scale(1.06) translateY(-3px);
          box-shadow: 0 10px 22px -4px rgba(20, 19, 20, 0.4);
        }

        /* Reflective Search Exploration Bar - Compact & Sleek */
        .library-root .hero-search-wrap {
          max-width: var(--search-max-width, 330px);
          width: 100%;
          margin: var(--search-margin-top, 16px) auto 0;
          position: relative;
          z-index: 100;
        }

        .library-root .hero-search-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.14);
          padding: 5px 6px 5px 16px;
          border-radius: 50px;
          box-shadow: 0 6px 20px -6px rgba(0, 0, 0, 0.08);
          transition: all 0.25s ease;
        }

        .library-root .hero-search-bar:focus-within {
          border-color: var(--rel);
          box-shadow: 0 8px 24px -4px rgba(201, 84, 47, 0.16);
        }

        .library-root .hero-search-bar input {
          border: none;
          outline: none;
          background: transparent;
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          color: var(--ink);
          width: 100%;
        }

        .library-root .hero-search-bar input::placeholder {
          color: #8c867a;
          font-style: italic;
        }

        .library-root .hero-search-arrow-btn {
          background: var(--ink);
          color: var(--cream);
          border: none;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.2s, background 0.2s;
        }

        .library-root .hero-search-arrow-btn:hover {
          background: var(--rel);
          transform: scale(1.08);
        }

        /* Animated Scroll Indicator - Arrow Only */
        .library-root .scroll-indicator {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 14px;
          color: #555047;
          cursor: pointer;
          transition: all 0.25s ease;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(0, 0, 0, 0.1);
          width: 34px;
          height: 34px;
          padding: 0;
          border-radius: 50%;
          position: relative;
          z-index: 10;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
        }

        .library-root .scroll-indicator:hover {
          color: var(--rel);
          background: #ffffff;
          border-color: rgba(201, 84, 47, 0.3);
          transform: translateY(2px);
          box-shadow: 0 6px 18px rgba(201, 84, 47, 0.14);
        }

        .library-root .scroll-indicator .arrow-icon-wrap {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          animation: floatBounce 1.8s ease-in-out infinite;
          transition: all 0.2s ease;
        }

        .library-root .scroll-indicator:hover .arrow-icon-wrap {
          background: var(--rel);
          transform: translateY(2px);
        }

        @keyframes floatBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(4px);
          }
        }

        /* Search Dropdown Menu - Wide, spacious and responsive */
        .library-root .search-dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          width: min(580px, calc(100vw - 32px));
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 20px;
          box-shadow: 0 30px 70px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          z-index: 200;
          text-align: left;
          animation: dropDownFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes dropDownFadeIn {
          from { opacity: 0; transform: translate(-50%, -8px) scale(0.98); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }

        .library-root .search-dropdown-header {
          padding: 14px 22px 10px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #8c867a;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #faf8f5;
        }

        .library-root .search-dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 22px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: background-color 0.15s ease, padding-left 0.15s ease;
          text-decoration: none;
          color: var(--ink);
          gap: 16px;
        }

        .library-root .search-dropdown-item:last-child {
          border-bottom: none;
        }

        .library-root .search-dropdown-item:hover {
          background-color: #f7f3eb;
          padding-left: 26px;
        }

        .library-root .search-dropdown-item .item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .library-root .search-dropdown-item .item-tag {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: inline-block;
        }

        .library-root .search-dropdown-item .item-title {
          font-family: 'Fraunces', serif;
          font-style: normal;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.35;
          color: var(--ink);
          margin: 0;
          white-space: normal;
          word-break: break-word;
        }

        .library-root .search-dropdown-item .item-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #78716c;
          margin: 0;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .library-root .search-dropdown-item .item-arrow {
          font-size: 15px;
          opacity: 0.4;
          transition: transform 0.2s, opacity 0.2s;
          margin-left: 12px;
          color: var(--ink);
        }

        .library-root .search-dropdown-item:hover .item-arrow {
          opacity: 1;
          transform: translateX(4px);
        }

        .library-root .search-dropdown-footer {
          padding: 12px 20px;
          background: #faf8f5;
          font-size: 11.5px;
          font-weight: 700;
          text-align: center;
          color: var(--rel);
          cursor: pointer;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          transition: background-color 0.15s, color 0.15s;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .library-root .search-dropdown-footer:hover {
          background: #f2ece4;
          color: #111010;
        }

        /* ---------- CATEGORY SECTION (SHARED STACKED CARD EFFECT) ---------- */
        .library-root .cat-sec {
          position: sticky;
          top: 0;
          width: 100%;
          min-height: 100vh;
          padding: clamp(45px, 6vh, 75px) 40px clamp(80px, 12vh, 120px);
          border-top-left-radius: 36px;
          border-top-right-radius: 36px;
          box-shadow: 0 -22px 48px rgba(0, 0, 0, 0.22);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          overflow: hidden;
          box-sizing: border-box;
          transform: translate3d(0, 0, 0);
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .library-root .cat-inner {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          transform: translate3d(0, 0, 0);
        }

        .library-root .cat-top {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 24px;
        }

        .library-root .cat-top .viewall {
          font-size: var(--viewall-font-size, 12px);
          font-weight: 700;
          text-transform: uppercase;
          border-bottom: 1px solid currentColor;
          padding-bottom: 2px;
          transition: opacity 0.2s;
        }

        .library-root .cat-top .viewall:hover {
          opacity: 0.75;
        }

        /* 2-Column Edge-to-Edge Layout (Word & Ball on Opposite Ends) */
        .library-root .cat-layout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(20px, 4vw, 60px);
          min-height: 300px;
          width: 100%;
        }

        .library-root .cat-word {
          font-size: var(--category-word-size, clamp(48px, 7.8vw, 126px));
          margin: 0;
          line-height: 0.92;
          flex: 1;
          min-width: 0;
        }

        .library-root .cat-word.left {
          text-align: left;
        }

        .library-root .cat-word.right {
          text-align: right;
        }

        /* 3D Plasma Sphere - Positioned at Full Edges */
        .library-root .circle-reveal {
          width: var(--sphere-size, clamp(260px, 26vw, 360px));
          height: var(--sphere-size, clamp(260px, 26vw, 360px));
          border-radius: 50%;
          overflow: visible;
          position: relative;
          margin: 0;
          flex-shrink: 0;
          background: transparent;
          box-shadow: none;
          transition: transform 0.4s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
        }

        .library-root .circle-reveal:hover {
          transform: scale(1.05);
        }

        /* Article List & Rows */
        .library-root .art-list {
          display: flex;
          flex-direction: column;
          margin-top: 36px;
          margin-bottom: 24px;
        }

        .library-root .art-list-head {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-line);
        }

        .library-root .art-count {
          font-family: 'Inter', sans-serif;
          font-size: var(--article-count-size, 11px);
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.65;
        }

        .library-root .art-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          padding: 18px 0;
          border-bottom: 1px solid var(--border-line);
          transition: background-color 0.2s, padding-left 0.2s;
        }

        .library-root .art-row:hover {
          padding-left: 6px;
        }

        .library-root .art-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          width: 100%;
        }

        .library-root .art-row h4 {
          font-family: 'Fraunces', serif;
          font-style: normal;
          font-weight: 500;
          font-size: var(--article-title-size, 17px);
          margin: 0;
          line-height: 1.35;
        }

        .library-root .art-row .meta {
          font-family: 'Inter', sans-serif;
          font-size: var(--article-meta-size, 9.5px);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.65;
          white-space: nowrap;
        }

        /* Pure Plasma Containers */
        .library-root .g1,
        .library-root .g2,
        .library-root .g3,
        .library-root .g4,
        .library-root .g5,
        .library-root .g6 {
          background: transparent;
        }

        /* 6 Section Color Themes & Stacking Z-Indices */
        .library-root #rel {
          background: var(--rel);
          color: var(--rel-ink);
          --border-line: rgba(255, 255, 255, 0.16);
          z-index: 1;
        }
        .library-root #rel .cat-top {
          color: var(--rel-ink);
        }

        .library-root #self {
          background: var(--self);
          color: var(--self-ink);
          --border-line: rgba(0, 0, 0, 0.12);
          box-shadow: 0 -22px 48px rgba(0, 0, 0, 0.12);
          z-index: 2;
        }
        .library-root #self .viewall, .library-root #self .n {
          color: #111010;
        }

        .library-root #change {
          background: var(--change);
          color: var(--change-ink);
          --border-line: rgba(255, 255, 255, 0.16);
          z-index: 3;
        }
        .library-root #change .cat-top {
          color: var(--change-ink);
        }

        .library-root #dec {
          background: var(--dec);
          color: var(--dec-ink);
          --border-line: rgba(43, 18, 8, 0.18);
          box-shadow: 0 -22px 48px rgba(0, 0, 0, 0.22);
          z-index: 4;
        }
        .library-root #dec .viewall, .library-root #dec .n {
          color: var(--dec-ink);
        }

        .library-root #diff {
          background: var(--diff);
          color: var(--diff-ink);
          --border-line: rgba(43, 18, 8, 0.14);
          z-index: 5;
        }

        .library-root #comm {
          background: var(--comm);
          color: var(--comm-ink);
          --border-line: rgba(255, 255, 255, 0.14);
          z-index: 6;
        }

        /* ---------- CTA SECTION (FINAL STACKED CARD TRANSITION) ---------- */
        .library-root .cta-wrapper {
          position: sticky;
          top: 0;
          z-index: 7;
          width: 100%;
          min-height: 100vh;
          background: radial-gradient(circle at 50% 40%, #1c1722 0%, #0d0c0e 100%);
          color: var(--cream);
          border-top-left-radius: 36px;
          border-top-right-radius: 36px;
          box-shadow: 0 -28px 60px rgba(0, 0, 0, 0.55);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: clamp(60px, 10vh, 100px) 24px;
          box-sizing: border-box;
          overflow: hidden;
          transform: translate3d(0, 0, 0);
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .library-root .cta-ambient-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 580px;
          height: 320px;
          background: radial-gradient(circle, rgba(201, 84, 47, 0.2) 0%, rgba(13, 12, 14, 0) 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .library-root .cta-nav {
          width: 100%;
          max-width: 1280px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--cream);
        }

        .library-root .cta-nav .logo {
          font-family: 'Fraunces', serif;
          font-size: 21px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--cream);
        }

        .library-root .cta-nav .logo em {
          font-style: normal;
          color: #fca283;
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 600;
          margin-left: 2px;
        }

        .library-root .cta-nav .navlinks {
          display: flex;
          gap: 28px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .library-root .cta-nav .navlinks a {
          color: #b8b3a8;
          transition: color 0.2s;
        }

        .library-root .cta-nav .navlinks a:hover,
        .library-root .cta-nav .navlinks a.active {
          color: #ffffff;
        }

        .library-root .cta-nav .navcta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .library-root .cta-nav .navcta .my-journey-btn {
          color: #b8b3a8;
          transition: color 0.2s;
        }

        .library-root .cta-nav .navcta .my-journey-btn:hover {
          color: #ffffff;
        }

        .library-root .cta-nav .navcta .nav-book-btn {
          background: var(--cream);
          color: var(--ink);
          padding: 9px 18px;
          border-radius: 2px;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          transition: transform 0.2s, background 0.2s;
          cursor: pointer;
          border: none;
        }

        .library-root .cta-nav .navcta .nav-book-btn:hover {
          background: #ffffff;
          transform: translateY(-1px);
        }

        .library-root .cta-content {
          max-width: 680px;
          margin: auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 0;
        }

        .library-root .cta-content h2 {
          font-size: clamp(36px, 5.5vw, 68px);
          margin: 0 0 20px;
          line-height: 0.95;
        }

        .library-root .cta-content p {
          font-size: 15px;
          color: #c9c4b8;
          margin: 0 0 34px;
          line-height: 1.6;
        }

        .library-root .cta-content .book {
          display: inline-block;
          background: var(--cream);
          color: var(--ink);
          padding: 16px 36px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 3px;
          transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;
          cursor: pointer;
          width: auto;
        }

        .library-root .cta-content .book:hover {
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.15);
        }

        .library-root footer {
          width: 100%;
          max-width: 1280px;
          color: #8a857a;
          padding: 24px 0 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11.5px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .library-root footer a {
          transition: color 0.2s;
        }

        .library-root footer a:hover {
          color: #f5f1e8;
        }

        @media (max-width: 980px) {
          .library-root .cta-nav .navlinks { display: none; }
          .library-root .cta-nav .navcta .my-journey-btn { display: none; }
        }

        @media (max-width: 980px) {
          .library-root .cat-layout {
            flex-direction: column;
            gap: 24px;
            text-align: center;
          }
          .library-root .cat-word.left,
          .library-root .cat-word.right {
            text-align: center;
          }
          .library-root .circle-reveal {
            order: -1;
            width: 220px;
            height: 220px;
            margin: 0 auto;
          }
          .library-root footer {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>

      {/* ---------- NAV ---------- */}
      <header className="nav">
        <div className="logo">
          <Link to="/">BetterWith<em>Aarkesh</em></Link>
        </div>

        <nav className="navlinks">
          <Link to="/">Home</Link>
          <Link to="/#coaching">Coaching</Link>
          <Link to="/#meet-aarkesh">About</Link>
          <Link to="/#testimonials">Testimonials</Link>
          <Link to="/library" className="active">Library</Link>
          <Link to="/#faq">FAQ</Link>
        </nav>

        <div className="navcta flex items-center gap-2.5">
          {/* Course Button */}
          <button 
            type="button"
            onClick={() => navigate('/course')} 
            className="bg-[#c8512d] hover:bg-[#b3461f] text-white rounded-full px-4 lg:px-5 py-2 text-[12.5px] font-medium flex items-center gap-1.5 shadow-[0_2px_8px_rgba(200,81,45,0.25)] transition-all cursor-pointer"
          >
            <Play size={13} weight="fill" className="text-white" />
            <span>Course</span>
          </button>

          {/* Book a Session Button */}
          <button 
            type="button" 
            onClick={handleBookClick} 
            className="bg-[#c8512d] hover:bg-[#b3461f] text-white rounded-full px-4 lg:px-5 py-2 text-[12.5px] font-medium flex items-center gap-2 shadow-[0_2px_8px_rgba(200,81,45,0.25)] transition-all cursor-pointer"
          >
            <CalendarBlank size={15} weight="bold" className="text-white" />
            <span>Book a session</span>
          </button>

          {/* Login / User Account */}
          {!isLoggedIn ? (
            <button 
              type="button"
              onClick={() => setShowLoginModal(true)} 
              className="bg-white border border-[#1c1714] hover:border-[#c8512d] hover:text-[#c8512d] text-[#1c1714] rounded-full px-4 py-2 text-[12px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <User size={14} weight="bold" />
              <span>LOGIN</span>
            </button>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button 
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)} 
                className="bg-white border border-[#1c1714] rounded-full pl-1.5 pr-3.5 py-1 flex items-center gap-2.5 font-bold text-[12px] uppercase tracking-wider text-[#1c1714] shadow-xs hover:border-[#c8512d] transition-all cursor-pointer select-none"
              >
                <div className="relative w-7 h-7 rounded-full bg-[#c8512d] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                  {effectiveUser?.photoUrl ? (
                    <img 
                      src={effectiveUser.photoUrl} 
                      alt="" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                      className="w-full h-full object-cover rounded-full absolute inset-0" 
                    />
                  ) : null}
                  <span>{userInitial}</span>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22c55e] border-2 border-white rounded-full z-10" />
                </div>
                <span>{userFirstName}</span>
                {dropdownOpen ? (
                  <CaretUp size={13} weight="bold" className="text-[#1c1714]" />
                ) : (
                  <CaretDown size={13} weight="bold" className="text-[#1c1714]" />
                )}
              </button>

              {/* Luxury Account Dropdown Card */}
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-[320px] bg-[#faf8f6] border border-[#e4dfd9] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden z-[200] animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                  <div className="p-6 pb-4">
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-[46px] h-[46px] rounded-full bg-[#c8512d] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm overflow-hidden relative border border-[#e4dfd9]">
                        {effectiveUser?.photoUrl ? (
                          <img 
                            src={effectiveUser.photoUrl} 
                            alt="" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                            className="w-full h-full object-cover rounded-full absolute inset-0" 
                          />
                        ) : null}
                        <span>{userInitial}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[#c8512d] text-[10.5px] font-bold tracking-[0.18em] uppercase mb-0.5">
                          WELCOME BACK
                        </p>
                        <h3 
                          className="text-[22px] font-semibold text-[#1c1714] leading-tight capitalize truncate"
                          style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                        >
                          {userDisplayName}
                        </h3>
                      </div>
                    </div>

                    {/* Black CTA Pill */}
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/my-journey');
                      }}
                      className="w-full h-11 rounded-full bg-[#1c1714] hover:bg-black text-white font-bold text-[11px] tracking-[0.14em] uppercase flex items-center justify-center gap-3 transition-colors cursor-pointer mt-2"
                    >
                      <span>CONTINUE YOUR JOURNEY</span>
                      <span className="text-base leading-none">→</span>
                    </button>

                    {/* Nav Items - Only Profile */}
                    <div className="flex flex-col gap-1 mt-3 pt-1">
                      <button 
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate('/my-journey?tab=profile');
                        }}
                        className="flex items-center gap-3 py-2.5 text-[#1c1714] hover:text-[#c8512d] text-[14px] font-medium transition-colors w-full text-left cursor-pointer"
                      >
                        <User size={18} className="text-[#1c1714]" />
                        <span>Profile</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Logout Row */}
                  <div className="border-t border-[#e4dfd9] px-6 py-3 bg-[#faf8f6]">
                    <button 
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        clearAllAuth();
                        setIsLoggedIn(false);
                        navigate('/library');
                      }}
                      className="flex items-center gap-2.5 text-[#9a918a] hover:text-[#c8512d] text-[13.5px] font-medium transition-colors w-full text-left cursor-pointer"
                    >
                      <SignOut size={18} />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button 
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/#coaching" onClick={() => setMobileMenuOpen(false)}>Coaching</Link>
          <Link to="/#meet-aarkesh" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link to="/#testimonials" onClick={() => setMobileMenuOpen(false)}>Testimonials</Link>
          <Link to="/library" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'underline' }}>Library</Link>
          <Link to="/#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
          <Link to="/course" onClick={() => setMobileMenuOpen(false)}>Course</Link>
          {!isLoggedIn ? (
            <button 
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowLoginModal(true);
              }}
            >
              Login
            </button>
          ) : (
            <Link to="/my-journey" onClick={() => setMobileMenuOpen(false)}>My Journey</Link>
          )}
        </div>
      )}

      {/* ---------- MARQUEE STRIP (BLACK STRIP WITH COLORFUL DIAMOND SPARKLES) ---------- */}
      <div className="marquee">
        <div className="marquee-track">
          {[...Array(8)].flatMap((_, setIdx) => [
            <button key={`rel-${setIdx}`} type="button" onClick={() => handleScrollTo('rel')} className="marquee-item">
              <span>RELATIONSHIPS</span>
              <span className="marquee-sparkle" style={{ color: '#e288c4' }}>✦</span>
            </button>,
            <button key={`self-${setIdx}`} type="button" onClick={() => handleScrollTo('self')} className="marquee-item">
              <span>SELF</span>
              <span className="marquee-sparkle" style={{ color: '#ffffff' }}>✦</span>
            </button>,
            <button key={`change-${setIdx}`} type="button" onClick={() => handleScrollTo('change')} className="marquee-item">
              <span>CHANGE</span>
              <span className="marquee-sparkle" style={{ color: '#4ade80' }}>✦</span>
            </button>,
            <button key={`dec-${setIdx}`} type="button" onClick={() => handleScrollTo('dec')} className="marquee-item">
              <span>DECISIONS</span>
              <span className="marquee-sparkle" style={{ color: '#fb923c' }}>✦</span>
            </button>,
            <button key={`diff-${setIdx}`} type="button" onClick={() => handleScrollTo('diff')} className="marquee-item">
              <span>DIFFICULT PEOPLE</span>
              <span className="marquee-sparkle" style={{ color: '#fed7aa' }}>✦</span>
            </button>,
            <button key={`comm-${setIdx}`} type="button" onClick={() => handleScrollTo('comm')} className="marquee-item">
              <span>COMMUNICATION</span>
              <span className="marquee-sparkle" style={{ color: '#94a3b8' }}>✦</span>
            </button>
          ])}
        </div>
      </div>

      {/* ---------- HERO (CLEAN SEARCH & HEADING) ---------- */}
      <section className="hero">
        <div className="hero-ambient-glow" />
        
        {/* Center Stage: Title */}
        <div className="hero-cloud-stage">
          <h1 className="hero-heading">
            {renderHeroHeading(heroSettings.headingText)}
          </h1>
        </div>

        {/* Reflective Exploration Search */}
        <div className="hero-search-wrap" ref={searchWrapRef}>
          <form onSubmit={handleSearchSubmit} className="hero-search-bar">
            <input 
              type="text" 
              placeholder={heroSettings.searchPlaceholder || "Describe what you're navigating..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
            />
            <button type="submit" className="hero-search-arrow-btn" aria-label="Search">
              <ArrowRight size={13} weight="bold" />
            </button>
          </form>

          {/* Autocomplete Dropdown - Maximum 4 Articles */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="search-dropdown-menu">
              <div className="search-dropdown-header">
                <span>{searchResults.length > 0 ? `${searchResults.length} Matching Articles` : 'No direct matches'}</span>
              </div>

              {searchResults.length > 0 ? (
                <>
                  {searchResults.map((article, idx) => {
                    const catSlug = getCategorySlug(article.categoryId || article.category);
                    const catTag = getCategoryColor(article.category);
                    const cleanTitle = (article.title || article.titleMain || 'Untitled')
                      .replace(/\*/g, '')
                      .replace(/_/g, '')
                      .replace(/\[|\]/g, '');

                    return (
                      <div
                        key={article.id || article.slug || idx}
                        className="search-dropdown-item"
                        onClick={() => {
                          navigate(`/articles?article=${article.slug || article.id}&category=${catSlug}`);
                          setIsSearchFocused(false);
                        }}
                      >
                        <div className="item-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span 
                              className="item-tag" 
                              style={{ 
                                background: catTag.bg, 
                                color: catTag.color,
                                padding: '2px 8px',
                                borderRadius: '12px'
                              }}
                            >
                              {article.category || 'PERSPECTIVE'}
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#8a857a', fontWeight: 500 }}>
                              {article.readTime || '6 MIN READ'}
                            </span>
                          </div>
                          <h4 className="item-title">
                            {cleanTitle}
                          </h4>
                          {article.subtitle && (
                            <p className="item-subtitle">
                              {article.subtitle.replace(/[*_\[\]\+\#]/g, '')}
                            </p>
                          )}
                        </div>
                        <span className="item-arrow">→</span>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div style={{ padding: '16px 20px', fontSize: '13px', color: '#8a857a', textAlign: 'center' }}>
                  No articles found matching "{searchQuery}". Press Enter to search archive.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Animated Scroll Down Indicator Button */}
        <button 
          type="button" 
          onClick={() => handleScrollTo('rel')} 
          className="scroll-indicator"
          aria-label="Scroll down to explore categories"
        >
          <div className="arrow-icon-wrap">
            <ArrowDown size={13} weight="bold" />
          </div>
        </button>
      </section>

      {/* ---------- RELATIONSHIPS (WORD LEFT, SPHERE RIGHT) ---------- */}
      {(() => {
        const catArticles = getCategoryArticles('relationships', 'Relationships');
        return (
          <section className="cat-sec" id="rel">
            <div className="cat-inner">
              <div className="cat-top">
                <Link className="viewall" to="/articles?category=relationships">VIEW ALL →</Link>
              </div>
              <div className="cat-layout">
                <h2 className="disp cat-word left">RELATION<br />SHIPS</h2>
                <div className="circle-reveal g1">
                  <PlasmaRingSphere colors={['#f3a8e2', '#d97fc8', '#993388', '#ff44aa']} scale={76} speed={85} />
                </div>
              </div>
              <div className="art-list">
                <div className="art-list-head">
                  <span className="art-count">{catArticles.length} ARTICLES</span>
                </div>
                {catArticles.slice(0, 3).map((art, idx) => (
                  <Link 
                    key={art.slug || art.id || idx} 
                    className="art-row" 
                    to={`/articles?article=${art.slug || art.id}&category=relationships`}
                  >
                    <div className="art-content">
                      <h4>{renderFormattedTitle(art.title, '#d97fc8')}</h4>
                      <span className="meta">{art.readTime} · {art.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ---------- SELF (SPHERE LEFT, WORD RIGHT) ---------- */}
      {(() => {
        const catArticles = getCategoryArticles('self', 'Self');
        return (
          <section className="cat-sec" id="self">
            <div className="cat-inner">
              <div className="cat-top">
                <Link className="viewall" to="/articles?category=self">VIEW ALL →</Link>
              </div>
              <div className="cat-layout">
                <div className="circle-reveal g2">
                  <PlasmaRingSphere colors={['#111010', '#1c1c22', '#2d2d38', '#000000']} scale={76} speed={85} />
                </div>
                <h2 className="disp cat-word right">SELF</h2>
              </div>
              <div className="art-list">
                <div className="art-list-head">
                  <span className="art-count">{catArticles.length} ARTICLES</span>
                </div>
                {catArticles.slice(0, 3).map((art, idx) => (
                  <Link 
                    key={art.slug || art.id || idx} 
                    className="art-row" 
                    to={`/articles?article=${art.slug || art.id}&category=self`}
                  >
                    <div className="art-content">
                      <h4>{renderFormattedTitle(art.title, '#111010')}</h4>
                      <span className="meta">{art.readTime} · {art.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ---------- CHANGE (WORD LEFT, SPHERE RIGHT) ---------- */}
      {(() => {
        const catArticles = getCategoryArticles('change', 'Change');
        return (
          <section className="cat-sec" id="change">
            <div className="cat-inner">
              <div className="cat-top">
                <Link className="viewall" to="/articles?category=change">VIEW ALL →</Link>
              </div>
              <div className="cat-layout">
                <h2 className="disp cat-word left">CHANGE</h2>
                <div className="circle-reveal g3">
                  <PlasmaRingSphere colors={['#8fca9c', '#48b868', '#1e6830', '#a8f0b8']} scale={76} speed={85} />
                </div>
              </div>
              <div className="art-list">
                <div className="art-list-head">
                  <span className="art-count">{catArticles.length} ARTICLES</span>
                </div>
                {catArticles.slice(0, 3).map((art, idx) => (
                  <Link 
                    key={art.slug || art.id || idx} 
                    className="art-row" 
                    to={`/articles?article=${art.slug || art.id}&category=change`}
                  >
                    <div className="art-content">
                      <h4>{renderFormattedTitle(art.title, '#8ee09f')}</h4>
                      <span className="meta">{art.readTime} · {art.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ---------- DECISIONS (SPHERE LEFT, WORD RIGHT) ---------- */}
      {(() => {
        const catArticles = getCategoryArticles('decisions', 'Decisions');
        return (
          <section className="cat-sec" id="dec">
            <div className="cat-inner">
              <div className="cat-top">
                <Link className="viewall" to="/articles?category=decisions">VIEW ALL →</Link>
              </div>
              <div className="cat-layout">
                <div className="circle-reveal g4">
                  <PlasmaRingSphere colors={['#ff8c5a', '#fca283', '#d85c35', '#ff4500']} scale={76} speed={85} />
                </div>
                <h2 className="disp cat-word right">DECISIONS</h2>
              </div>
              <div className="art-list">
                <div className="art-list-head">
                  <span className="art-count">{catArticles.length} ARTICLES</span>
                </div>
                {catArticles.slice(0, 3).map((art, idx) => (
                  <Link 
                    key={art.slug || art.id || idx} 
                    className="art-row" 
                    to={`/articles?article=${art.slug || art.id}&category=decisions`}
                  >
                    <div className="art-content">
                      <h4>{renderFormattedTitle(art.title, '#ffffff')}</h4>
                      <span className="meta">{art.readTime} · {art.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ---------- DIFFICULT PEOPLE (WORD LEFT, SPHERE RIGHT) ---------- */}
      {(() => {
        const catArticles = getCategoryArticles('difficult-people', 'Difficult People');
        return (
          <section className="cat-sec" id="diff">
            <div className="cat-inner">
              <div className="cat-top">
                <Link className="viewall" to="/articles?category=difficult-people">VIEW ALL →</Link>
              </div>
              <div className="cat-layout">
                <h2 className="disp cat-word left">DIFFICULT<br />PEOPLE</h2>
                <div className="circle-reveal g5">
                  <PlasmaRingSphere colors={['#fceade', '#e09865', '#9e5225', '#ff9966']} scale={76} speed={85} />
                </div>
              </div>
              <div className="art-list">
                <div className="art-list-head">
                  <span className="art-count">{catArticles.length} ARTICLES</span>
                </div>
                {catArticles.slice(0, 3).map((art, idx) => (
                  <Link 
                    key={art.slug || art.id || idx} 
                    className="art-row" 
                    to={`/articles?article=${art.slug || art.id}&category=difficult-people`}
                  >
                    <div className="art-content">
                      <h4>{renderFormattedTitle(art.title, '#7a2d0f')}</h4>
                      <span className="meta">{art.readTime} · {art.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ---------- COMMUNICATION (SPHERE LEFT, WORD RIGHT) ---------- */}
      {(() => {
        const catArticles = getCategoryArticles('communication', 'Communication');
        return (
          <section className="cat-sec" id="comm">
            <div className="cat-inner">
              <div className="cat-top">
                <Link className="viewall" to="/articles?category=communication">VIEW ALL →</Link>
              </div>
              <div className="cat-layout">
                <div className="circle-reveal g6">
                  <PlasmaRingSphere colors={['#a4abb8', '#ffffff', '#505460', '#8899aa']} scale={76} speed={85} />
                </div>
                <h2 className="disp cat-word right">COMMUNICA<br />TION</h2>
              </div>
              <div className="art-list">
                <div className="art-list-head">
                  <span className="art-count">{catArticles.length} ARTICLES</span>
                </div>
                {catArticles.slice(0, 3).map((art, idx) => (
                  <Link 
                    key={art.slug || art.id || idx} 
                    className="art-row" 
                    to={`/articles?article=${art.slug || art.id}&category=communication`}
                  >
                    <div className="art-content">
                      <h4>{renderFormattedTitle(art.title, '#ffffff')}</h4>
                      <span className="meta">{art.readTime} · {art.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ---------- CTA SECTION (READY TO GO DEEPER) ---------- */}
      <section className="cta-wrapper">
        <div className="cta-ambient-glow"></div>
        <div className="cta-content">
          <h2 className="disp">Ready to go<br />deeper?</h2>
          <p>Reading is a start. A session helps you actually apply it to your life.</p>
          <button onClick={handleBookClick} className="book" style={{ border: 'none', cursor: 'pointer' }}>
            Book a 1:1 →
          </button>
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
