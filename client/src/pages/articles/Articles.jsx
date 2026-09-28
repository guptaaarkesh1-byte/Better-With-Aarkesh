import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookmarkSimple, List, X, Sparkle } from '@phosphor-icons/react';
import { useBooking } from '../../context/BookingContext';
import ArticleReaderView from './ArticleReaderView';
import { CURATED_LIBRARY_ARTICLES, getCuratedArticle } from '../../constants/libraryArticlesData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    bg: '#c9542f',
    ink: '#2b1208',
    borderLine: 'rgba(43, 18, 8, 0.18)',
    cardBg: 'rgba(43, 18, 8, 0.06)',
    cardBorder: 'rgba(43, 18, 8, 0.16)',
    accent: '#f2734b',
    aarkeshColor: '#2b1208',
    btnBg: '#2b1208',
    btnInk: '#fceade',
    btnHoverBg: '#140803',
    btnHoverInk: '#ffffff',
    pillBg: '#f0ded6',
    pillColor: '#2b1208',
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
    accent: '#f2ba8f',
    aarkeshColor: '#a64117',
    btnBg: '#2b1208',
    btnInk: '#fceade',
    btnHoverBg: '#140803',
    btnHoverInk: '#ffffff',
    pillBg: '#faeae0',
    pillColor: '#2b1208',
    sphereGrad: 'radial-gradient(circle at 35% 25%, #fceade 0%, #d9aa86 35%, #8f5c35 70%, #462812 100%)',
    tagline: 'Holding unwavering boundaries without guilt, distinguishing empathy from excusing, and preserving peace.'
  },
  communication: {
    id: 'communication',
    num: '06',
    name: 'Communication',
    displayWords: ['COMMUNI', 'CATION'],
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

export default function Articles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openBookingModal } = useBooking();

  const [publishedArticles, setPublishedArticles] = useState([]);
  const [savedArticleIds, setSavedArticleIds] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const rawCat = searchParams.get('category')?.toLowerCase().trim();
  const categoryKey = CATEGORY_CONFIGS[rawCat] ? rawCat : 'relationships';
  const currentCat = CATEGORY_CONFIGS[categoryKey];

  const articleParam = searchParams.get('article');
  const searchQuery = searchParams.get('search')?.toLowerCase().trim() || '';

  // Scroll to top on category change
  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [categoryKey, articleParam]);

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
    fetchArticles();
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

  // If viewing a specific article, show Reader View
  if (articleParam) {
    const curated = getCuratedArticle(articleParam);
    const dbMatch = publishedArticles.find(a => a._id === articleParam || a.slug === articleParam);
    const mergedArticle = dbMatch ? { ...curated, ...dbMatch, image: dbMatch.featuredImage || curated.image } : curated;

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

  // Filter curated articles for current category
  const curatedCategoryArticles = CURATED_LIBRARY_ARTICLES.filter(
    a => a.category.toLowerCase().replace('_', ' ').replace('-', ' ') === currentCat.name.toLowerCase()
  );

  // Combine with matching published articles from backend
  const apiMatchingArticles = publishedArticles.filter(
    a => (a.categoryId?.toLowerCase() === currentCat.id || a.category?.toLowerCase() === currentCat.name.toLowerCase())
  );

  // Unified list of articles
  const allCategoryArticles = curatedCategoryArticles.map((curated, idx) => {
    const fallbackImage = FALLBACK_COVERS[currentCat.id]?.[idx] || '/library_preview_silhouette.jpg';
    const apiMatch = apiMatchingArticles.find(a => a.slug === curated.slug || a.title?.toLowerCase() === curated.title?.toLowerCase());
    return {
      ...curated,
      ...(apiMatch || {}),
      id: apiMatch?._id || curated.id || `curated-${idx}`,
      slug: curated.slug || apiMatch?.slug || curated.id,
      image: apiMatch?.featuredImage || curated.image || fallbackImage,
      readTime: curated.readTime || `${5 + (idx * 2)} MIN`,
      date: curated.date || 'MAY 2026'
    };
  });

  // Apply search filtering if user came from search query
  const displayedArticles = searchQuery
    ? allCategoryArticles.filter(a =>
        a.title?.toLowerCase().includes(searchQuery) ||
        a.subtitle?.toLowerCase().includes(searchQuery) ||
        a.titleMain?.toLowerCase().includes(searchQuery)
      )
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

        /* Top Nav (Matching Main Navbar) */
        .themed-category-root header.cat-page-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 40px;
          border-bottom: 1px solid ${currentCat.borderLine};
          position: sticky;
          top: 0;
          z-index: 90;
          background: ${currentCat.bg};
        }

        .themed-category-root .logo {
          font-family: 'Fraunces', serif;
          font-size: 21px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: ${currentCat.ink};
        }

        .themed-category-root .logo em {
          font-style: italic;
          color: ${currentCat.aarkeshColor};
          font-family: 'Fraunces', serif;
        }

        .themed-category-root .navlinks {
          display: flex;
          gap: 28px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
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
          gap: 16px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .themed-category-root .navcta .my-journey-btn {
          color: ${currentCat.ink};
          opacity: 0.85;
          transition: opacity 0.2s;
        }

        .themed-category-root .navcta .my-journey-btn:hover {
          opacity: 0.6;
        }

        .themed-category-root .navcta .book-pill {
          background: ${currentCat.btnBg};
          color: ${currentCat.btnInk};
          padding: 11px 20px;
          border-radius: 2px;
          transition: transform 0.2s, background-color 0.2s, color 0.2s;
          cursor: pointer;
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          display: inline-block;
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

        @media (max-width: 980px) {
          .themed-category-root .navlinks { display: none; }
          .themed-category-root header.cat-page-nav { padding: 16px 20px; }
          .themed-category-root .mobile-toggle { display: block; }
          .themed-category-root .navcta .my-journey-btn { display: none; }
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
          padding: 70px 40px 50px;
          max-width: 1280px;
          margin: 0 auto;
        }

        .themed-category-root .cat-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .themed-category-root .cat-header-top .idx {
          font-family: 'Archivo Black', sans-serif;
          font-size: 14px;
          letter-spacing: 0.05em;
        }

        /* 3-Column Alternating Showcase */
        .themed-category-root .cat-showcase-layout {
          display: grid;
          grid-template-columns: 1fr 320px 1fr;
          align-items: center;
          gap: 20px;
          min-height: 300px;
          margin-bottom: 40px;
        }

        .themed-category-root .cat-big-word {
          font-size: clamp(60px, 9vw, 140px);
          margin: 0;
          line-height: 0.92;
        }

        .themed-category-root .cat-big-word.left { text-align: right; }
        .themed-category-root .cat-big-word.right { text-align: left; }

        .themed-category-root .cat-sphere {
          width: 300px;
          height: 300px;
          border-radius: 50%;
          margin: 0 auto;
          box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.4);
          background: ${currentCat.sphereGrad};
          display: block;
          position: relative;
        }

        /* Topic Switcher Bar */
        .themed-category-root .topic-switcher-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 24px 0 36px;
          border-top: 1px solid ${currentCat.borderLine};
          border-bottom: 1px solid ${currentCat.borderLine};
          margin-bottom: 60px;
          align-items: center;
          justify-content: flex-start;
        }

        .themed-category-root .topic-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 40px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border: 1px solid ${currentCat.borderLine};
          transition: all 0.25s ease;
          cursor: pointer;
          color: inherit;
        }

        .themed-category-root .topic-pill:hover,
        .themed-category-root .topic-pill.active {
          background: ${currentCat.ink};
          color: ${currentCat.bg};
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .themed-category-root .topic-pill span.num {
          font-family: 'Archivo Black', sans-serif;
          font-size: 10px;
          opacity: 0.7;
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
          font-style: italic;
          font-size: 20px;
          font-weight: 400;
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
            grid-template-columns: 1fr;
            text-align: center;
          }
          .themed-category-root .cat-big-word.left,
          .themed-category-root .cat-big-word.right {
            text-align: center;
          }
        }

        @media (max-width: 640px) {
          .themed-category-root header.cat-page-nav { padding: 16px 20px; }
          .themed-category-root .category-hero { padding: 40px 20px; }
          .themed-category-root .articles-cards-grid { grid-template-columns: 1fr; }
          .themed-category-root footer.cat-page-footer { flex-direction: column; gap: 14px; text-align: center; padding: 24px 20px; }
          .themed-category-root .cat-sphere { width: 200px; height: 200px; }
        }
      `}</style>

      {/* ---------- TOP NAVIGATION (MAIN NAVBAR WITH THEMED AARKESH & BUTTON) ---------- */}
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
            <span className="idx">({currentCat.num}) {currentCat.name.toUpperCase()}</span>
          </div>
          <div></div>
        </div>

        {/* 3-Column Alternating Layout matching Library section exactly without side tagline texts */}
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
              <div className={`cat-sphere ${currentCat.sphereClass}`} />
              <div></div>
            </>
          ) : (
            <>
              <div></div>
              <div className={`cat-sphere ${currentCat.sphereClass}`} />
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

        {/* Topic Switcher Pills */}
        <div className="topic-switcher-bar">
          {Object.values(CATEGORY_CONFIGS).map((cat) => (
            <Link
              key={cat.id}
              to={`/articles?category=${cat.id}`}
              className={`topic-pill ${cat.id === currentCat.id ? 'active' : ''}`}
            >
              <span className="num">{cat.num}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>

        {/* Section Count Header */}
        <div className="cards-section-head">
          <span className="cards-count-label">
            {displayedArticles.length} ARTICLES
          </span>
        </div>

        {/* ---------- ARTICLES CARD GRID ---------- */}
        <div className="articles-cards-grid">
          {displayedArticles.map((article, index) => {
            const isSaved = savedArticleIds.includes(article.id) || savedArticleIds.includes(article._id);

            return (
              <div
                key={article.id || article.slug || index}
                className="article-card"
                onClick={() => {
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
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span>{article.date || 'MAY 2026'}</span>
                  </div>

                  <h3 className="card-title">
                    {article.title}
                  </h3>

                  <p className="card-excerpt">
                    {article.subtitle || article.description || 'A reflective perspective exploring deeper emotional understanding and self-clarity.'}
                  </p>

                  <div className="card-read-action">
                    <span>Read Essay</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
