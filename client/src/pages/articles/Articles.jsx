import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookmarkSimple, List, X, Sparkle, Play } from '@phosphor-icons/react';
import { useBooking } from '../../context/BookingContext';
import ArticleReaderView, { renderFormattedTitle } from './ArticleReaderView';
import { CURATED_LIBRARY_ARTICLES, getCuratedArticle } from '../../constants/libraryArticlesData';
import PlasmaRingSphere from '../../components/library/PlasmaRingSphere';
import { API_URL } from '../../utils/apiUrl';

const CATEGORY_CONFIGS = {
  relationships: {
    id: 'relationships',
    num: '01',
    name: 'Relationships',
    displayWords: ['RELATION', 'SHIPS'],
    wordClass: 'left',
    sphereClass: 'g1',
    bg: '#3d1b37',
    ink: '#f7eef5',
    borderLine: 'rgba(255, 255, 255, 0.16)',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(255, 255, 255, 0.14)',
    accent: '#d97fc8',
    aarkeshColor: '#f3a8e2',
    btnBg: '#f7eef5',
    btnInk: '#3d1b37',
    btnHoverBg: '#ffffff',
    btnHoverInk: '#3d1b37',
    pillBg: '#ece0ea',
    pillColor: '#3d1b37',
    plasmaColors: ['#f3a8e2', '#d97fc8', '#993388', '#ff44aa'],
    sphereGrad: 'radial-gradient(circle at 35% 25%, #c87ab9 0%, #7d2c72 35%, #481541 70%, #1c061a 100%)',
    tagline: 'Essays on connection, boundaries, projection, and the quiet courage of honest intimacy.'
  },
  self: {
    id: 'self',
    num: '02',
    name: 'Self',
    displayWords: ['SELF'],
    wordClass: 'right',
    sphereClass: 'g2',
    bg: '#ffffff',
    ink: '#111010',
    borderLine: 'rgba(0, 0, 0, 0.12)',
    cardBg: '#f6f3eb',
    cardBorder: 'rgba(0, 0, 0, 0.12)',
    accent: '#111010',
    aarkeshColor: '#111010',
    btnBg: '#111010',
    btnInk: '#ffffff',
    btnHoverBg: '#2b1208',
    btnHoverInk: '#ffffff',
    pillBg: '#111010',
    pillColor: '#ffffff',
    plasmaColors: ['#111010', '#1c1c22', '#2d2d38', '#000000'],
    sphereGrad: 'radial-gradient(circle at 35% 25%, #ffffff 0%, #e2e2ec 35%, #9fa0b5 70%, #4a4b60 100%)',
    tagline: 'Perspectives on inner alignment, silencing the need for approval, and returning home to who you are.'
  },
  change: {
    id: 'change',
    num: '03',
    name: 'Change',
    displayWords: ['CHANGE'],
    wordClass: 'left',
    sphereClass: 'g3',
    bg: '#2f4a34',
    ink: '#e9f0e6',
    borderLine: 'rgba(255, 255, 255, 0.16)',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(255, 255, 255, 0.14)',
    accent: '#63d17e',
    aarkeshColor: '#8ee09f',
    btnBg: '#e9f0e6',
    btnInk: '#1d3321',
    btnHoverBg: '#ffffff',
    btnHoverInk: '#1d3321',
    pillBg: '#e2ebe3',
    pillColor: '#1a2f1e',
    plasmaColors: ['#8fca9c', '#48b868', '#1e6830', '#a8f0b8'],
    sphereGrad: 'radial-gradient(circle at 35% 25%, #8fca9c 0%, #3d6b46 35%, #1e3a24 70%, #0a1c0e 100%)',
    tagline: 'Navigating life transitions, the grief of outgrowing old spaces, and starting before you feel ready.'
  },
  decisions: {
    id: 'decisions',
    num: '04',
    name: 'Decisions',
    displayWords: ['DECISIONS'],
    wordClass: 'right',
    sphereClass: 'g4',
    bg: '#c85628',
    ink: '#ffffff',
    borderLine: 'rgba(255, 255, 255, 0.18)',
    cardBg: 'rgba(255, 255, 255, 0.06)',
    cardBorder: 'rgba(255, 255, 255, 0.16)',
    accent: '#fca283',
    aarkeshColor: '#ffffff',
    btnBg: '#ffffff',
    btnInk: '#c85628',
    btnHoverBg: '#111010',
    btnHoverInk: '#ffffff',
    pillBg: 'rgba(255, 255, 255, 0.15)',
    pillColor: '#ffffff',
    plasmaColors: ['#ff8c5a', '#fca283', '#d85c35', '#ff4500'],
    sphereGrad: 'radial-gradient(circle at 35% 25%, #fca283 0%, #d85c35 35%, #8a2e12 70%, #3e1205 100%)',
    tagline: 'Tools for cutting through analysis paralysis, weighing trade-offs, and committing wholeheartedly.'
  },
  'difficult-people': {
    id: 'difficult-people',
    num: '05',
    name: 'Difficult People',
    displayWords: ['DIFFICULT', 'PEOPLE'],
    wordClass: 'left',
    sphereClass: 'g5',
    bg: '#f0d9c9',
    ink: '#2b1208',
    borderLine: 'rgba(43, 18, 8, 0.14)',
    cardBg: 'rgba(43, 18, 8, 0.05)',
    cardBorder: 'rgba(43, 18, 8, 0.14)',
    accent: '#7a2d0f',
    aarkeshColor: '#a64117',
    btnBg: '#2b1208',
    btnInk: '#fceade',
    btnHoverBg: '#140803',
    btnHoverInk: '#ffffff',
    pillBg: '#faeae0',
    pillColor: '#2b1208',
    plasmaColors: ['#fceade', '#e09865', '#9e5225', '#ff9966'],
    sphereGrad: 'radial-gradient(circle at 35% 25%, #fceade 0%, #d9aa86 35%, #8f5c35 70%, #462812 100%)',
    tagline: 'Holding unwavering boundaries without guilt, distinguishing empathy from excusing, and preserving peace.'
  },
  communication: {
    id: 'communication',
    num: '06',
    name: 'Communication',
    displayWords: ['COMMUNICA', 'TION'],
    wordClass: 'right',
    sphereClass: 'g6',
    bg: '#141314',
    ink: '#f5f1e8',
    borderLine: 'rgba(255, 255, 255, 0.14)',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(255, 255, 255, 0.12)',
    accent: '#a4abb8',
    aarkeshColor: '#ffffff',
    btnBg: '#f5f1e8',
    btnInk: '#141314',
    btnHoverBg: '#ffffff',
    btnHoverInk: '#141314',
    pillBg: '#e6e3dd',
    pillColor: '#141314',
    plasmaColors: ['#a4abb8', '#ffffff', '#505460', '#8899aa'],
    sphereGrad: 'radial-gradient(circle at 35% 25%, #5a5a5a 0%, #323232 35%, #181818 70%, #080808 100%)',
    tagline: 'The art of honest conversation, speaking hard truths with gentle hands, and naming repeating patterns.'
  }
};

// Curated category fallback covers
const FALLBACK_COVERS = {
  relationships: [
    '/library_preview_silhouette.jpg',
    '/library_celestial_column.jpg',
    '/course_hero_bg.jpg'
  ],
  self: [
    '/library_celestial_column.jpg',
    '/library_preview_silhouette.jpg',
    '/course_hero_bg.jpg'
  ],
  change: [
    '/library_preview_silhouette.jpg',
    '/library_celestial_column.jpg',
    '/course_hero_bg.jpg'
  ],
  decisions: [
    '/library_preview_silhouette.jpg',
    '/course_hero_bg.jpg',
    '/library_celestial_column.jpg'
  ],
  'difficult-people': [
    '/library_preview_silhouette.jpg',
    '/library_celestial_column.jpg',
    '/course_hero_bg.jpg'
  ],
  communication: [
    '/library_celestial_column.jpg',
    '/library_preview_silhouette.jpg',
    '/course_hero_bg.jpg'
  ]
};

// Helper to immediately get cached published articles for instant zero-flicker render
const getInitialPublishedArticles = () => {
  if (typeof window !== 'undefined' && window.__BWA_CACHED_PUBLISHED_ARTICLES__?.length > 0) {
    return window.__BWA_CACHED_PUBLISHED_ARTICLES__;
  }
  try {
    const cached = sessionStorage.getItem('bwa_published_articles_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof window !== 'undefined') window.__BWA_CACHED_PUBLISHED_ARTICLES__ = parsed;
        return parsed;
      }
    }
  } catch (_) {}
  return [];
};

export default function Articles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openBookingModal } = useBooking();

  const [publishedArticles, setPublishedArticles] = useState(getInitialPublishedArticles);
  const [isArticlesLoading, setIsArticlesLoading] = useState(() => getInitialPublishedArticles().length === 0);
  const [savedArticleIds, setSavedArticleIds] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const rawCat = searchParams.get('category')?.toLowerCase().trim();
  const categoryKey = CATEGORY_CONFIGS[rawCat] ? rawCat : 'relationships';
  const currentCat = CATEGORY_CONFIGS[categoryKey];

  const articleParam = searchParams.get('article');
  const searchQuery = searchParams.get('search')?.toLowerCase().trim() || '';

  // Track category changes and maintain scroll position when returning from an article
  const prevCategoryRef = useRef(categoryKey);

  // Scroll to top ONLY when user changes category tab
  useEffect(() => {
    if (prevCategoryRef.current !== categoryKey) {
      prevCategoryRef.current = categoryKey;
      sessionStorage.setItem(`articles_scroll_${categoryKey}`, '0');
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }, [categoryKey]);

  // Continuously track scroll position when browsing the category articles grid
  useEffect(() => {
    if (articleParam) return;

    let timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const currentY = window.scrollY || document.documentElement.scrollTop || 0;
        sessionStorage.setItem(`articles_scroll_${categoryKey}`, String(currentY));
      }, 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, [articleParam, categoryKey]);

  // Restore scroll position when returning from an article reader back to the articles grid
  useEffect(() => {
    if (!articleParam) {
      const savedY = sessionStorage.getItem(`articles_scroll_${categoryKey}`);
      if (savedY !== null && savedY !== undefined) {
        const targetY = parseFloat(savedY);
        if (!isNaN(targetY) && targetY > 0) {
          const restore = () => {
            if (window.lenis) {
              window.lenis.scrollTo(targetY, { immediate: true });
            } else {
              window.scrollTo({ top: targetY, behavior: 'instant' });
            }
          };

          restore();
          const t1 = setTimeout(restore, 50);
          const t2 = setTimeout(restore, 150);
          const t3 = setTimeout(restore, 350);

          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
          };
        }
      }
    }
  }, [articleParam, categoryKey]);

  // Fetch saved articles from user profile
  useEffect(() => {
    const fetchSaved = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/users/saved-articles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSavedArticleIds(data.map(a => typeof a === 'object' ? a._id : a));
        }
      } catch (err) {
        console.error('Failed to fetch saved articles', err);
      }
    };
    fetchSaved();
  }, []);

  // Fetch published articles from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      try {
        const res = await fetch(`${API_URL}/api/articles/published`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPublishedArticles(data);
            if (typeof window !== 'undefined') window.__BWA_CACHED_PUBLISHED_ARTICLES__ = data;
            try {
              sessionStorage.setItem('bwa_published_articles_cache', JSON.stringify(data));
            } catch (_) {}
          }
        }
      } catch (err) {
        console.error('Failed to fetch published articles', err);
      } finally {
        if (isMounted) setIsArticlesLoading(false);
      }
    };
    fetchArticles();
    return () => { isMounted = false; };
  }, []);

  const handleToggleSave = async (articleId, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to save articles to your library.");
      return;
    }

    const isCurrentlySaved = savedArticleIds.includes(articleId);
    setSavedArticleIds(prev => 
      isCurrentlySaved ? prev.filter(id => id !== articleId) : [...prev, articleId]
    );

    try {
      await fetch(`${API_URL}/api/users/save-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookClick = (e) => {
    e?.preventDefault();
    navigate('/book');
  };

  const resolveImageUrl = (url, fallback = '/library_preview_silhouette.jpg') => {
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
  };

  // If viewing a specific article, show Reader View
  if (articleParam) {
    const curated = getCuratedArticle(articleParam);
    const dbMatch = publishedArticles.find(
      a => a._id === articleParam || a.slug === articleParam || (a.title && a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === articleParam)
    );
    const mergedArticle = dbMatch 
      ? { ...curated, ...dbMatch, image: resolveImageUrl(dbMatch.featuredImage || dbMatch.image || curated?.image) } 
      : curated;

    if (mergedArticle) {
      return (
        <ArticleReaderView
          article={mergedArticle}
          categoryConfig={currentCat}
          onBack={() => {
            searchParams.delete('article');
            setSearchParams(searchParams);
          }}
        />
      );
    }
  }

  // 1. Filter published DB articles for current category (excluding drafts)
  const targetCatId = currentCat.id.toLowerCase().replace(/\s+/g, '-');
  const targetCatName = currentCat.name.toLowerCase();

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

  // 2. Filter curated articles for current category (fallback only if DB is empty after load)
  const matchingCurated = CURATED_LIBRARY_ARTICLES.filter(c => {
    const cCat = (c.category || '').toLowerCase().replace(/\s+/g, '-');
    return cCat === targetCatId || cCat === targetCatName || cCat.includes(targetCatId);
  });

  // 3. Merge: If DB articles are loaded from server, use DB articles exclusively
  const mergedArticlesList = publishedArticles.length > 0 
    ? sortedDb 
    : (isArticlesLoading ? [] : (sortedDb.length > 0 ? sortedDb : matchingCurated));

  // 4. Build unified list of articles
  const allCategoryArticles = mergedArticlesList.map((article, idx) => {
    const fallbackImage = FALLBACK_COVERS[currentCat.id]?.[idx] || '/library_preview_silhouette.jpg';
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
      image: resolveImageUrl(article.featuredImage || article.image, fallbackImage),
      readTime: article.readTime || `${5 + (idx * 2)} MIN`,
      date: displayDate || 'MAY 2026'
    };
  });

  // Helper to extract full body text for search
  const extractArticleSearchText = (a) => {
    if (!a) return '';
    const parts = [
      a.title,
      a.titleMain,
      a.subtitle,
      a.excerpt,
      a.description,
      a.category,
      a.quote,
      a.endingHighlight
    ];

    if (a.bodyHtml && typeof a.bodyHtml === 'string') {
      parts.push(a.bodyHtml.replace(/<[^>]+>/g, ' '));
    }
    if (a.content && typeof a.content === 'string') {
      parts.push(a.content.replace(/<[^>]+>/g, ' '));
    }
    if (Array.isArray(a.blocks)) {
      a.blocks.forEach(b => {
        if (!b) return;
        if (b.heading) parts.push(b.heading);
        if (b.text) parts.push(b.text);
        if (b.content) parts.push(b.content);
        if (b.line1) parts.push(b.line1);
        if (b.line2) parts.push(b.line2);
        if (Array.isArray(b.paragraphs)) parts.push(b.paragraphs.join(' '));
      });
    }
    return parts.filter(Boolean).join(' ').toLowerCase().replace(/[*_\[\]\+\#]/g, ' ');
  };

  // Apply search filtering if user came from search query (checks titles, subtitles, AND entire body content)
  const displayedArticles = searchQuery
    ? allCategoryArticles.filter(a => {
        const fullText = extractArticleSearchText(a);
        const qWords = searchQuery.split(/\s+/).filter(Boolean);
        return fullText.includes(searchQuery) || (qWords.length > 1 && qWords.every(w => fullText.includes(w)));
      })
    : allCategoryArticles;

  return (
    <div className="themed-category-root" style={{ background: currentCat.bg, color: currentCat.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@400;500;600;700;800&display=swap');

        .themed-category-root {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: clip;
          transition: background-color 0.4s ease, color 0.4s ease;
        }

        .themed-category-root * {
          box-sizing: border-box;
        }

        .themed-category-root a {
          color: inherit;
          text-decoration: none;
        }

        .themed-category-root .disp {
          font-family: 'Archivo Black', sans-serif;
          text-transform: uppercase;
          line-height: 0.92;
          letter-spacing: -0.01em;
        }

        .themed-category-root .serif-i {
          font-family: 'Fraunces', serif;
          font-style: italic;
        }

        /* Sticky Top Header (Navbar + Category Switcher Bar) */
        .themed-category-root .cat-sticky-header {
          position: sticky;
          top: 0;
          z-index: 90;
          background: ${currentCat.bg};
          border-bottom: 1px solid ${currentCat.borderLine};
        }

        .themed-category-root header.cat-page-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 48px;
          border-bottom: 1px solid ${currentCat.borderLine};
          background: ${currentCat.bg};
        }

        .themed-category-root header.cat-page-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px clamp(16px, 3.2vw, 44px);
          border-bottom: 1px solid ${currentCat.borderLine};
          background: ${currentCat.bg};
          width: 100%;
          box-sizing: border-box;
          gap: 16px;
        }

        .themed-category-root .logo {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(20px, 1.8vw, 27px);
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: ${currentCat.ink};
          white-space: nowrap;
          flex-shrink: 0;
        }

        .themed-category-root .logo em {
          font-style: normal;
          color: ${currentCat.aarkeshColor};
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 600;
          margin-left: 2px;
        }

        .themed-category-root .navlinks {
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

        .themed-category-root .navlinks a {
          color: ${currentCat.ink};
          opacity: 0.85;
          transition: opacity 0.2s;
        }

        .themed-category-root .navlinks a:hover {
          opacity: 0.6;
        }

        .themed-category-root .navlinks a.active {
          text-decoration: underline;
          text-underline-offset: 5px;
          opacity: 1;
        }

        .themed-category-root .navcta {
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

        .themed-category-root .navcta .course-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6.5px clamp(10px, 0.9vw, 14px);
          border-radius: 2px;
          border: 1px solid ${currentCat.borderLine};
          color: ${currentCat.ink};
          font-family: 'Inter', sans-serif;
          font-size: clamp(9px, 0.75vw, 10.5px);
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          transition: all 0.2s ease;
          background: transparent;
          text-decoration: none;
          cursor: pointer;
          white-space: nowrap;
        }

        .themed-category-root .navcta .course-pill-btn:hover {
          border-color: ${currentCat.accent};
          color: ${currentCat.accent};
          transform: translateY(-1px);
        }

        .themed-category-root .navcta .my-journey-btn {
          color: ${currentCat.ink};
          opacity: 0.85;
          font-size: clamp(9.5px, 0.75vw, 11px);
          letter-spacing: 0.1em;
          transition: opacity 0.2s;
          padding: 6.5px clamp(10px, 0.9vw, 14px);
          border-radius: 2px;
          border: 1px solid ${currentCat.borderLine};
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
        }

        .themed-category-root .navcta .my-journey-btn:hover {
          border-color: ${currentCat.accent};
          color: ${currentCat.accent};
        }

        .themed-category-root .navcta .book-pill {
          background: ${currentCat.btnBg};
          color: ${currentCat.btnInk};
          padding: 7.5px clamp(12px, 1.1vw, 18px);
          border-radius: 2px;
          transition: transform 0.2s, background-color 0.2s, color 0.2s;
          cursor: pointer;
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: clamp(9.5px, 0.78vw, 11px);
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          display: inline-block;
          white-space: nowrap;
        }

        .themed-category-root .navcta .book-pill:hover {
          background: ${currentCat.btnHoverBg};
          color: ${currentCat.btnHoverInk};
          transform: translateY(-1px);
        }

        .themed-category-root .mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: ${currentCat.ink};
          padding: 4px;
        }

        .themed-category-root .mobile-drawer {
          display: none;
        }

        @media (max-width: 1080px) {
          .themed-category-root .navlinks { display: none; }
          .themed-category-root header.cat-page-nav { padding: 14px 20px; }
          .themed-category-root .mobile-toggle { display: block; }
          .themed-category-root .navcta .my-journey-btn,
          .themed-category-root .navcta .course-pill-btn { display: none; }
          .themed-category-root .mobile-drawer {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 24px 20px 30px;
            background: ${currentCat.bg};
            border-bottom: 1px solid ${currentCat.borderLine};
          }
          .themed-category-root .mobile-drawer a {
            font-size: 15px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
        }

        /* Category Hero Banner */
        .themed-category-root .category-hero {
          padding: 0 48px 50px;
          max-width: 1380px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .themed-category-root .cat-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 28px;
          margin-bottom: 30px;
        }

        /* 2-Column Edge-to-Edge Layout */
        .themed-category-root .cat-showcase-layout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(20px, 4vw, 60px);
          min-height: 300px;
          margin-bottom: 40px;
          width: 100%;
        }

        .themed-category-root .cat-big-word {
          font-size: clamp(48px, 7.8vw, 126px);
          margin: 0;
          line-height: 0.92;
          flex: 1;
          min-width: 0;
        }

        .themed-category-root .cat-big-word.left { text-align: left; }
        .themed-category-root .cat-big-word.right { text-align: right; }

        .themed-category-root .cat-sphere {
          width: clamp(260px, 26vw, 360px);
          height: clamp(260px, 26vw, 360px);
          border-radius: 50%;
          margin: 0;
          flex-shrink: 0;
          background: transparent;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: grab;
          overflow: visible;
        }

        /* Topic Switcher Bar - Inside Sticky Header */
        .themed-category-root .topic-switcher-wrapper {
          padding: 10px 48px 14px;
          max-width: 1380px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .themed-category-root .topic-switcher-bar {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }

        .themed-category-root .topic-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 14px;
          border-radius: 50px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: 1px solid ${currentCat.borderLine};
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          color: inherit;
          text-align: center;
          white-space: nowrap;
          box-sizing: border-box;
        }

        .themed-category-root .topic-pill:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
          border-color: ${currentCat.ink};
        }

        .themed-category-root .topic-pill.active {
          background: ${currentCat.ink};
          color: ${currentCat.bg};
          transform: translateY(-2px);
          box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.25);
          border-color: ${currentCat.ink};
        }

        .themed-category-root .topic-pill span.num {
          font-family: 'Archivo Black', sans-serif;
          font-size: 11px;
          opacity: 0.8;
          letter-spacing: 0.04em;
        }

        /* Section Total Articles Header */
        .themed-category-root .cards-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .themed-category-root .cards-count-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.7;
        }

        /* 3-Column Articles Card Grid */
        .themed-category-root .articles-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          margin-bottom: 100px;
        }

        .themed-category-root .article-card {
          display: flex;
          flex-direction: column;
          background: ${currentCat.cardBg};
          border: 1px solid ${currentCat.cardBorder};
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s ease;
          position: relative;
          cursor: pointer;
        }

        .themed-category-root .article-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.3);
          border-color: ${currentCat.ink};
        }

        /* Card Image Container */
        .themed-category-root .card-image-wrap {
          width: 100%;
          height: 220px;
          position: relative;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.1);
        }

        .themed-category-root .card-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .themed-category-root .article-card:hover .card-image-wrap img {
          transform: scale(1.06);
        }

        .themed-category-root .card-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .themed-category-root .card-save-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.18);
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .themed-category-root .card-save-btn:hover {
          transform: scale(1.1);
          background: #ffffff;
          color: #111010;
        }

        /* Card Content Body */
        .themed-category-root .card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .themed-category-root .card-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.65;
        }

        .themed-category-root .card-title {
          font-family: 'Fraunces', serif;
          font-style: normal;
          font-size: 20px;
          font-weight: 500;
          line-height: 1.3;
          margin: 0 0 12px;
          color: inherit;
        }

        .themed-category-root .card-excerpt {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          line-height: 1.6;
          opacity: 0.75;
          margin: 0 0 20px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .themed-category-root .card-read-action {
          font-family: 'Inter', sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-top: 1px solid ${currentCat.borderLine};
          padding-top: 14px;
          margin-top: auto;
          transition: gap 0.2s ease;
        }

        .themed-category-root .article-card:hover .card-read-action {
          gap: 10px;
        }

        /* Footer */
        .themed-category-root footer.cat-page-footer {
          border-top: 1px solid ${currentCat.borderLine};
          padding: 30px 40px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          opacity: 0.75;
          max-width: 1280px;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .themed-category-root .articles-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .themed-category-root .cat-showcase-layout {
            flex-direction: column;
            gap: 24px;
            text-align: center;
          }
          .themed-category-root .cat-big-word.left,
          .themed-category-root .cat-big-word.right {
            text-align: center;
          }
          .themed-category-root .topic-switcher-bar {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
        }

        @media (max-width: 640px) {
          .themed-category-root header.cat-page-nav { padding: 16px 20px; }
          .themed-category-root .category-hero { padding: 0 20px 40px; }
          .themed-category-root .articles-cards-grid { grid-template-columns: 1fr; }
          .themed-category-root footer.cat-page-footer { flex-direction: column; gap: 14px; text-align: center; padding: 24px 20px; }
          .themed-category-root .topic-switcher-wrapper {
            padding: 8px 20px 12px;
          }
          .themed-category-root .topic-switcher-bar {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          .themed-category-root .topic-pill {
            padding: 9px 8px;
            font-size: 11px;
          }
        }
      `}</style>

      {/* ---------- STICKY TOP HEADER (NAVBAR + CATEGORY PILLS BAR) ---------- */}
      <div className="cat-sticky-header">
        <header className="cat-page-nav">
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

          <div className="navcta">
            <Link to="/course" className="course-pill-btn">
              <Play size={12} weight="fill" /> Course
            </Link>
            <Link to="/my-journey" className="my-journey-btn">My Journey</Link>
            <button onClick={handleBookClick} className="book-pill">Book a Session</button>

            <button 
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </header>

        {/* Topic Switcher Pills (Sticky with Navbar) */}
        <div className="topic-switcher-wrapper">
          <div className="topic-switcher-bar">
            {Object.values(CATEGORY_CONFIGS).map((cat) => (
              <Link
                key={cat.id}
                to={`/articles?category=${cat.id}`}
                className={`topic-pill ${cat.id === currentCat.id ? 'active' : ''}`}
                onClick={() => {
                  if (cat.id !== currentCat.id) {
                    sessionStorage.setItem(`articles_scroll_${cat.id}`, '0');
                    if (window.lenis) {
                      window.lenis.scrollTo(0, { immediate: true });
                    } else {
                      window.scrollTo(0, 0);
                    }
                  }
                }}
              >
                <span>{cat.name.toUpperCase()}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/#coaching" onClick={() => setMobileMenuOpen(false)}>Coaching</Link>
          <Link to="/#meet-aarkesh" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link to="/#testimonials" onClick={() => setMobileMenuOpen(false)}>Testimonials</Link>
          <Link to="/library" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'underline' }}>Library</Link>
          <Link to="/#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
          <Link to="/my-journey" onClick={() => setMobileMenuOpen(false)}>My Journey</Link>
          <Link to="/course" onClick={() => setMobileMenuOpen(false)}>Course</Link>
        </div>
      )}

      {/* ---------- CATEGORY SHOWCASE & HERO ---------- */}
      <main className="category-hero">

        <div className="cat-header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link 
              to="/library" 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: 0.85,
                padding: '6px 14px',
                borderRadius: '20px',
                border: `1px solid ${currentCat.borderLine}`,
                transition: 'all 0.2s ease',
                color: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateX(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.85';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <ArrowLeft size={14} weight="bold" />
              <span>BACK</span>
            </Link>
          </div>
          <div></div>
        </div>

        {/* Edge-to-Edge Layout matching Library section */}
        <div className="cat-showcase-layout">
          {currentCat.wordClass === 'left' ? (
            <>
              <h1 className="disp cat-big-word left">
                {currentCat.displayWords.map((w, i) => (
                  <React.Fragment key={i}>
                    {w}
                    {i < currentCat.displayWords.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h1>
              <div className="cat-sphere">
                <PlasmaRingSphere colors={currentCat.plasmaColors} scale={76} speed={85} />
              </div>
            </>
          ) : (
            <>
              <div className="cat-sphere">
                <PlasmaRingSphere colors={currentCat.plasmaColors} scale={76} speed={85} />
              </div>
              <h1 className="disp cat-big-word right">
                {currentCat.displayWords.map((w, i) => (
                  <React.Fragment key={i}>
                    {w}
                    {i < currentCat.displayWords.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h1>
            </>
          )}
        </div>

        {/* Section Count Header */}
        <div className="cards-section-head">
          <span className="cards-count-label">
            {isArticlesLoading && displayedArticles.length === 0 ? 'LOADING ARTICLES...' : `${displayedArticles.length} ARTICLES`}
          </span>
        </div>

        {/* ---------- ARTICLES CARD GRID ---------- */}
        <div className="articles-cards-grid">
          {isArticlesLoading && displayedArticles.length === 0 ? (
            Array.from({ length: 12 }).map((_, idx) => (
              <div key={`skel-${idx}`} className="article-card animate-pulse opacity-60 pointer-events-none">
                <div className="card-image-wrap bg-white/5" style={{ aspectRatio: '16/10' }} />
                <div className="card-body-content p-6 space-y-3">
                  <div className="h-3 w-20 bg-white/10 rounded" />
                  <div className="h-5 w-4/5 bg-white/10 rounded" />
                  <div className="h-3 w-full bg-white/5 rounded" />
                </div>
              </div>
            ))
          ) : (
            displayedArticles.map((article, index) => {
            const isSaved = savedArticleIds.includes(article.id) || savedArticleIds.includes(article._id);

            return (
              <div
                key={article.id || article.slug || index}
                className="article-card"
                onClick={() => {
                  const currentY = window.scrollY || document.documentElement.scrollTop || 0;
                  sessionStorage.setItem(`articles_scroll_${categoryKey}`, String(currentY));
                  if (window.lenis) {
                    window.lenis.scrollTo(0, { immediate: true });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }
                  setSearchParams({ category: currentCat.id, article: article.slug || article.id });
                }}
              >
                <div className="card-image-wrap">
                  <img
                    src={article.image || '/library_preview_silhouette.jpg'}
                    alt={article.title}
                    loading="lazy"
                  />
                  <div className="card-badge">
                    {article.readTime || '6 MIN READ'}
                  </div>
                  <button
                    className="card-save-btn"
                    onClick={(e) => handleToggleSave(article.id || article._id, e)}
                    aria-label="Save article"
                  >
                    <BookmarkSimple size={16} weight={isSaved ? "fill" : "regular"} />
                  </button>
                </div>

                <div className="card-body">
                  <div className="card-meta-row">
                    <span>{article.date || 'MAY 2026'}</span>
                  </div>

                  <h3 className="card-title">
                    {renderFormattedTitle(article.title, currentCat.accent)}
                  </h3>

                  <p className="card-excerpt">
                    {renderFormattedTitle(article.subtitle || article.description || 'A reflective perspective exploring deeper emotional understanding and self-clarity.', currentCat.accent)}
                  </p>

                  <div className="card-read-action">
                    <span>Read Essay</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            );
          }))}
        </div>
      </main>
    </div>
  );
}
