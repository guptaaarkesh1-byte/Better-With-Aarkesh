import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { List, X } from '@phosphor-icons/react';
import { CURATED_LIBRARY_ARTICLES } from '../../constants/libraryArticlesData';

export default function Library() {
  const navigate = useNavigate();
  const { openBookingModal } = useBooking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchWrapRef = useRef(null);

  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  // Fetch published articles from API to enrich search
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/articles/published`);
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
      case 'decisions': return { bg: '#faece6', color: '#c9542f' };
      case 'difficult-people': return { bg: '#faede4', color: '#a64117' };
      case 'communication': return { bg: '#e8e6e8', color: '#141314' };
      default: return { bg: '#f0eee8', color: '#111010' };
    }
  };

  // Combine and deduplicate articles
  const allArticles = [
    ...CURATED_LIBRARY_ARTICLES,
    ...publishedArticles.filter(p => !CURATED_LIBRARY_ARTICLES.some(c => c.slug === p.slug))
  ];

  const searchResults = (searchQuery.trim().length > 0)
    ? allArticles.filter(a => {
        const q = searchQuery.toLowerCase().trim();
        const cleanTitle = `${a.title || ''} ${a.titleMain || ''}`
          .toLowerCase()
          .replace(/[*_\[\]\+\#]/g, '');
        return cleanTitle.includes(q);
      }).slice(0, 4)
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
    <div className="library-root">
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
          --dec: #c9542f;
          --dec-ink: #2b1208;
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
          padding: 22px 40px;
          border-bottom: 1px solid var(--line);
          position: relative;
          z-index: 10;
          background: var(--cream);
        }

        .library-root .logo {
          font-family: 'Fraunces', serif;
          font-size: 21px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .library-root .logo em {
          font-style: italic;
          color: var(--rel);
          font-family: 'Fraunces', serif;
        }

        .library-root .navlinks {
          display: flex;
          gap: 28px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .library-root .navlinks a {
          transition: opacity 0.2s;
        }

        .library-root .navlinks a:hover {
          opacity: 0.7;
        }

        .library-root .navlinks a.active {
          text-decoration: underline;
          text-underline-offset: 5px;
          opacity: 1;
        }

        .library-root .navcta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .library-root .navcta .my-journey-btn {
          transition: opacity 0.2s;
        }

        .library-root .navcta .my-journey-btn:hover {
          opacity: 0.7;
        }

        .library-root .navcta .book {
          background: var(--ink);
          color: var(--cream);
          padding: 11px 20px;
          border-radius: 2px;
          transition: transform 0.2s, background 0.2s;
          cursor: pointer;
          display: inline-block;
        }

        .library-root .navcta .book:hover {
          background: #2a2828;
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

        @media (max-width: 980px) {
          .library-root .navlinks { display: none; }
          .library-root header.nav { padding: 16px 20px; }
          .library-root .mobile-toggle { display: block; }
          .library-root .navcta .my-journey-btn { display: none; }
          .library-root .mobile-drawer {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 24px 20px 30px;
            background: var(--cream);
            border-bottom: 1px solid var(--line);
          }
          .library-root .mobile-drawer a {
            font-size: 15px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
        }

        /* ---------- MARQUEE STRIP (6 TOPICS EXACT) ---------- */
        .library-root .marquee {
          background: var(--ink);
          color: var(--cream);
          overflow: hidden;
          padding: 16px 0;
          border-bottom: 1px solid var(--line);
        }

        .library-root .marquee-track {
          display: flex;
          gap: 36px;
          width: max-content;
          animation: mq 26s linear infinite;
        }

        .library-root .marquee-track span {
          font-family: 'Archivo Black', sans-serif;
          text-transform: uppercase;
          font-size: 19px;
          white-space: nowrap;
        }

        .library-root .marquee-track .sep {
          font-size: 17px;
          margin: 0 4px;
          display: inline-block;
        }
        .library-root .marquee-track .sep.s-rel { color: #d97fc8; }
        .library-root .marquee-track .sep.s-self { color: #ffffff; }
        .library-root .marquee-track .sep.s-change { color: #63d17e; }
        .library-root .marquee-track .sep.s-dec { color: #f2734b; }
        .library-root .marquee-track .sep.s-diff { color: #f2ba8f; }
        .library-root .marquee-track .sep.s-comm { color: #a4abb8; }

        @keyframes mq {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* ---------- HERO (FITS 100VH VIEWPORT) ---------- */
        .library-root .hero {
          min-height: calc(100vh - 125px);
          min-height: calc(100dvh - 125px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 24px 24px 36px;
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

        /* Hero Quick Category Jumps (All 6 Exact) */
        .library-root .hero-cat-pills {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-bottom: 22px;
          position: relative;
          z-index: 1;
          max-width: 820px;
        }

        .library-root .cat-jump-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 40px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }

        .library-root .cat-jump-pill.p-rel {
          background: #ece0ea;
          color: #3d1b37;
          border-color: rgba(61, 27, 55, 0.3);
        }
        .library-root .cat-jump-pill.p-rel:hover {
          background: var(--rel);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 18px -6px rgba(61, 27, 55, 0.4);
        }

        .library-root .cat-jump-pill.p-self {
          background: #ffffff;
          color: #111010;
          border-color: rgba(0, 0, 0, 0.22);
        }
        .library-root .cat-jump-pill.p-self:hover {
          background: #111010;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 18px -6px rgba(0, 0, 0, 0.3);
        }

        .library-root .cat-jump-pill.p-change {
          background: #e2ebe3;
          color: #1a2f1e;
          border-color: rgba(47, 74, 52, 0.3);
        }
        .library-root .cat-jump-pill.p-change:hover {
          background: var(--change);
          color: var(--change-ink);
          transform: translateY(-2px);
          box-shadow: 0 8px 18px -6px rgba(47, 74, 52, 0.4);
        }

        .library-root .cat-jump-pill.p-dec {
          background: #f0ded6;
          color: #2b1208;
          border-color: rgba(201, 84, 47, 0.3);
        }
        .library-root .cat-jump-pill.p-dec:hover {
          background: var(--dec);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 18px -6px rgba(201, 84, 47, 0.4);
        }

        .library-root .cat-jump-pill.p-diff {
          background: #faeae0;
          color: #2b1208;
          border-color: rgba(138, 106, 74, 0.3);
        }
        .library-root .cat-jump-pill.p-diff:hover {
          background: #d4b096;
          color: #2b1208;
          transform: translateY(-2px);
          box-shadow: 0 8px 18px -6px rgba(138, 106, 74, 0.3);
        }

        .library-root .cat-jump-pill.p-comm {
          background: #e6e3dd;
          color: #141314;
          border-color: rgba(20, 19, 20, 0.25);
        }
        .library-root .cat-jump-pill.p-comm:hover {
          background: var(--comm);
          color: var(--comm-ink);
          transform: translateY(-2px);
          box-shadow: 0 8px 18px -6px rgba(20, 19, 20, 0.4);
        }

        .library-root .cat-jump-pill span.num {
          font-family: 'Archivo Black', sans-serif;
          font-size: 10px;
          opacity: 0.65;
        }

        /* Reflective Search Exploration Bar */
        .library-root .hero-search-wrap {
          max-width: 540px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 100;
        }

        .library-root .hero-search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.14);
          padding: 8px 16px 8px 20px;
          border-radius: 50px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
          transition: all 0.25s ease;
        }

        .library-root .hero-search-bar:focus-within {
          border-color: var(--rel);
          box-shadow: 0 12px 35px -8px rgba(201, 84, 47, 0.18);
        }

        .library-root .hero-search-bar input {
          border: none;
          outline: none;
          background: transparent;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: var(--ink);
          width: 100%;
        }

        .library-root .hero-search-bar input::placeholder {
          color: #8c867a;
          font-style: italic;
        }

        .library-root .hero-search-btn {
          background: var(--ink);
          color: var(--cream);
          border: none;
          border-radius: 50px;
          padding: 8px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          white-space: nowrap;
          transition: transform 0.2s, background 0.2s;
        }

        .library-root .hero-search-btn:hover {
          background: var(--rel);
          transform: scale(1.03);
        }

        /* Search Dropdown Menu */
        .library-root .search-dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 20px;
          box-shadow: 0 30px 70px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          z-index: 200;
          text-align: left;
          animation: dropDownFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes dropDownFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .library-root .search-dropdown-header {
          padding: 14px 20px 10px;
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
          padding: 13px 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: background-color 0.15s ease, padding-left 0.15s ease;
          text-decoration: none;
          color: var(--ink);
        }

        .library-root .search-dropdown-item:last-child {
          border-bottom: none;
        }

        .library-root .search-dropdown-item:hover {
          background-color: #f7f3eb;
          padding-left: 24px;
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
          font-style: italic;
          font-size: 15px;
          font-weight: 500;
          color: var(--ink);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
          padding: clamp(45px, 6vh, 75px) 40px clamp(100px, 14vh, 150px);
          border-top-left-radius: 36px;
          border-top-right-radius: 36px;
          box-shadow: 0 -22px 48px rgba(0, 0, 0, 0.22);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          overflow: hidden;
          box-sizing: border-box;
        }

        .library-root .cat-inner {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          position: relative;
        }

        .library-root .cat-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .library-root .cat-top .idx {
          font-family: 'Archivo Black', sans-serif;
          font-size: 14px;
        }

        .library-root .cat-top .viewall {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          border-bottom: 1px solid currentColor;
          padding-bottom: 2px;
          transition: opacity 0.2s;
        }

        .library-root .cat-top .viewall:hover {
          opacity: 0.75;
        }

        /* 3-Column Alternating Grid Layout */
        .library-root .cat-layout {
          display: grid;
          grid-template-columns: 1fr 320px 1fr;
          align-items: center;
          gap: 20px;
          min-height: 300px;
        }

        .library-root .cat-word {
          font-size: clamp(60px, 9vw, 140px);
          margin: 0;
          line-height: 0.92;
        }

        .library-root .cat-word.left {
          text-align: right;
        }

        .library-root .cat-word.right {
          text-align: left;
        }

        /* 3D Sphere Reveal */
        .library-root .circle-reveal {
          width: 300px;
          height: 300px;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          margin: 0 auto;
          box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.35);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          display: block;
        }

        .library-root .circle-reveal:hover {
          transform: scale(1.03);
          box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 0.45);
        }

        .library-root .circle-reveal .viewbtn {
          position: absolute;
          right: 26px;
          bottom: 26px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--ink);
          color: var(--cream);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        .library-root .circle-reveal:hover .viewbtn {
          transform: scale(1.08);
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
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.65;
        }

        .library-root .art-row {
          display: grid;
          grid-template-columns: 44px 1fr;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border-line);
          transition: background-color 0.2s, padding-left 0.2s;
        }

        .library-root .art-row:hover {
          padding-left: 6px;
        }

        .library-root .art-row .n {
          font-family: 'Archivo Black', sans-serif;
          font-size: 11.5px;
          padding-top: 2px;
          opacity: 0.85;
        }

        .library-root .art-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .library-root .art-row h4 {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 17px;
          margin: 0;
          line-height: 1.35;
        }

        .library-root .art-row .meta {
          font-family: 'Inter', sans-serif;
          font-size: 9.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.65;
          white-space: nowrap;
        }

        /* 6 Photographic Gradient Spheres matching section themes */
        .library-root .g1 {
          background: radial-gradient(circle at 35% 25%, #c87ab9 0%, #7d2c72 35%, #481541 70%, #1c061a 100%);
        }
        .library-root .g2 {
          background: radial-gradient(circle at 35% 25%, #ffffff 0%, #e2e2ec 35%, #9fa0b5 70%, #4a4b60 100%);
        }
        .library-root .g3 {
          background: radial-gradient(circle at 35% 25%, #8fca9c 0%, #3d6b46 35%, #1e3a24 70%, #0a1c0e 100%);
        }
        .library-root .g4 {
          background: radial-gradient(circle at 35% 25%, #fca283 0%, #d85c35 35%, #8a2e12 70%, #3e1205 100%);
        }
        .library-root .g5 {
          background: radial-gradient(circle at 35% 25%, #fceade 0%, #d9aa86 35%, #8f5c35 70%, #462812 100%);
        }
        .library-root .g6 {
          background: radial-gradient(circle at 35% 25%, #5a5a5a 0%, #323232 35%, #181818 70%, #080808 100%);
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

        /* ---------- CTA SECTION (TRANSITIONS INTO FOOTER) ---------- */
        .library-root .cta-wrapper {
          position: relative;
          z-index: 7;
          width: 100%;
          min-height: auto;
          background: var(--ink);
          color: var(--cream);
          border-top-left-radius: 36px;
          border-top-right-radius: 36px;
          box-shadow: 0 -25px 50px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 80px 24px 70px;
          box-sizing: border-box;
          overflow: hidden;
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
          font-style: italic;
          color: #fca283;
          font-family: 'Fraunces', serif;
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
            grid-template-columns: 1fr;
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
          }
          .library-root .art-row {
            grid-template-columns: 36px 1fr;
            gap: 12px;
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

        <div className="navcta">
          <Link to="/my-journey" className="my-journey-btn">My Journey</Link>
          <button onClick={handleBookClick} className="book" style={{ border: 'none' }}>Book a Session</button>
          
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

      {/* ---------- MARQUEE STRIP (EXACT 6 TOPICS) ---------- */}
      <div className="marquee">
        <div className="marquee-track">
          <span>Relationships</span><span className="sep s-rel">✦</span>
          <span>Self</span><span className="sep s-self">✦</span>
          <span>Change</span><span className="sep s-change">✦</span>
          <span>Decisions</span><span className="sep s-dec">✦</span>
          <span>Difficult People</span><span className="sep s-diff">✦</span>
          <span>Communication</span><span className="sep s-comm">✦</span>

          <span>Relationships</span><span className="sep s-rel">✦</span>
          <span>Self</span><span className="sep s-self">✦</span>
          <span>Change</span><span className="sep s-change">✦</span>
          <span>Decisions</span><span className="sep s-dec">✦</span>
          <span>Difficult People</span><span className="sep s-diff">✦</span>
          <span>Communication</span><span className="sep s-comm">✦</span>

          <span>Relationships</span><span className="sep s-rel">✦</span>
          <span>Self</span><span className="sep s-self">✦</span>
          <span>Change</span><span className="sep s-change">✦</span>
          <span>Decisions</span><span className="sep s-dec">✦</span>
          <span>Difficult People</span><span className="sep s-diff">✦</span>
          <span>Communication</span><span className="sep s-comm">✦</span>
        </div>
      </div>

      {/* ---------- HERO (CREATIVE & INTERACTIVE) ---------- */}
      <section className="hero">
        <div className="hero-ambient-glow" />
        
        <div className="hero-badge">
          <span className="dot" />
          <span>The Knowledge Archive · 6 Curated Topics</span>
        </div>

        <h1 className="serif-i">What are you trying to <em>understand</em>?</h1>
        <p className="lead">Articles, videos and reflective tools for the parts of life that are difficult to see clearly while you're living through them.</p>

        {/* Quick-Jump Category Navigation Pills (Exact 6 Order) */}
        <div className="hero-cat-pills">
          <button type="button" onClick={() => handleScrollTo('rel')} className="cat-jump-pill p-rel">
            <span className="num">01</span>
            <span>Relationships</span>
          </button>
          <button type="button" onClick={() => handleScrollTo('self')} className="cat-jump-pill p-self">
            <span className="num">02</span>
            <span>Self</span>
          </button>
          <button type="button" onClick={() => handleScrollTo('change')} className="cat-jump-pill p-change">
            <span className="num">03</span>
            <span>Change</span>
          </button>
          <button type="button" onClick={() => handleScrollTo('dec')} className="cat-jump-pill p-dec">
            <span className="num">04</span>
            <span>Decisions</span>
          </button>
          <button type="button" onClick={() => handleScrollTo('diff')} className="cat-jump-pill p-diff">
            <span className="num">05</span>
            <span>Difficult People</span>
          </button>
          <button type="button" onClick={() => handleScrollTo('comm')} className="cat-jump-pill p-comm">
            <span className="num">06</span>
            <span>Communication</span>
          </button>
        </div>

        {/* Reflective Exploration Search */}
        <div className="hero-search-wrap" ref={searchWrapRef}>
          <form onSubmit={handleSearchSubmit} className="hero-search-bar">
            <input 
              type="text" 
              placeholder="Describe what you're navigating right now..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
            />
            <button type="submit" className="hero-search-btn">
              Explore →
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
                        </div>
                        <span className="item-arrow">→</span>
                      </div>
                    );
                  })}

                  <div 
                    className="search-dropdown-footer"
                    onClick={handleSearchSubmit}
                  >
                    View all results for "{searchQuery}" →
                  </div>
                </>
              ) : (
                <div style={{ padding: '16px 20px', fontSize: '13px', color: '#8a857a', textAlign: 'center' }}>
                  No articles found matching "{searchQuery}". Press Explore to search archive.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ---------- (01) RELATIONSHIPS (WORD LEFT, SPHERE RIGHT) ---------- */}
      <section className="cat-sec" id="rel">
        <div className="cat-inner">
          <div className="cat-top">
            <span className="idx">(01) RELATIONSHIPS</span>
            <Link className="viewall" to="/articles?category=relationships">VIEW ALL →</Link>
          </div>
          <div className="cat-layout">
            <h2 className="disp cat-word left">RELATION<br />SHIPS</h2>
            <Link to="/articles?category=relationships" className="circle-reveal g1">
              <span className="viewbtn">VIEW</span>
            </Link>
            <div></div>
          </div>
          <div className="art-list">
            <div className="art-list-head">
              <span className="art-count">3 ARTICLES</span>
            </div>
            <Link className="art-row" to="/articles?article=attention-feels-like-love&category=relationships">
              <span className="n">01</span>
              <div className="art-content">
                <h4>It's Not Always About Finding the Right Person</h4>
                <span className="meta">6 min · May 12</span>
              </div>
            </Link>
            <Link className="art-row" to="/articles?article=the-problem-with-closure&category=relationships">
              <span className="n">02</span>
              <div className="art-content">
                <h4>How to Let Go (Without Losing Yourself)</h4>
                <span className="meta">7 min · May 6</span>
              </div>
            </Link>
            <Link className="art-row" to="/articles?article=a-kinder-way-to-disagree&category=relationships">
              <span className="n">03</span>
              <div className="art-content">
                <h4>Why Attachment Styles Aren't Destiny</h4>
                <span className="meta">5 min · Apr 21</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- (02) SELF (SPHERE LEFT, WORD RIGHT) ---------- */}
      <section className="cat-sec" id="self">
        <div className="cat-inner">
          <div className="cat-top">
            <span className="idx">(02) SELF</span>
            <Link className="viewall" to="/articles?category=self">VIEW ALL →</Link>
          </div>
          <div className="cat-layout">
            <div></div>
            <Link to="/articles?category=self" className="circle-reveal g2">
              <span className="viewbtn">VIEW</span>
            </Link>
            <h2 className="disp cat-word right">SELF</h2>
          </div>
          <div className="art-list">
            <div className="art-list-head">
              <span className="art-count">3 ARTICLES</span>
            </div>
            <Link className="art-row" to="/articles?article=you-dont-have-a-career-problem&category=self">
              <span className="n">01</span>
              <div className="art-content">
                <h4>The Quiet Practice of Knowing Who You Are</h4>
                <span className="meta">6 min · May 15</span>
              </div>
            </Link>
            <Link className="art-row" to="/articles?article=you-have-a-waiting-problem&category=self">
              <span className="n">02</span>
              <div className="art-content">
                <h4>Overcoming the Need for External Validation</h4>
                <span className="meta">5 min · May 8</span>
              </div>
            </Link>
            <Link className="art-row" to="/articles?article=discomfort-is-a-sign-youre-growing&category=self">
              <span className="n">03</span>
              <div className="art-content">
                <h4>Reclaiming Inner Peace in a Noisy World</h4>
                <span className="meta">7 min · Apr 29</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- (03) CHANGE (WORD LEFT, SPHERE RIGHT) ---------- */}
      <section className="cat-sec" id="change">
        <div className="cat-inner">
          <div className="cat-top">
            <span className="idx">(03) CHANGE</span>
            <Link className="viewall" to="/articles?category=change">VIEW ALL →</Link>
          </div>
          <div className="cat-layout">
            <h2 className="disp cat-word left">CHANGE</h2>
            <Link to="/articles?category=change" className="circle-reveal g3">
              <span className="viewbtn">VIEW</span>
            </Link>
            <div></div>
          </div>
          <div className="art-list">
            <div className="art-list-head">
              <span className="art-count">3 ARTICLES</span>
            </div>
            <Link className="art-row" to="/articles?article=everybody-says-theyve-changed&category=change">
              <span className="n">01</span>
              <div className="art-content">
                <h4>Starting Over Before You Feel Ready</h4>
                <span className="meta">6 min · May 10</span>
              </div>
            </Link>
            <Link className="art-row" to="/articles?article=the-in-between-is-a-part-of-the-process&category=change">
              <span className="n">02</span>
              <div className="art-content">
                <h4>The Grief of Outgrowing Familiar Spaces</h4>
                <span className="meta">7 min · May 3</span>
              </div>
            </Link>
            <Link className="art-row" to="/articles?article=you-can-be-both&category=change">
              <span className="n">03</span>
              <div className="art-content">
                <h4>Becoming Someone You'd Want to Meet</h4>
                <span className="meta">6 min · Apr 27</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- (04) DECISIONS (SPHERE LEFT, WORD RIGHT) ---------- */}
      <section className="cat-sec" id="dec">
        <div className="cat-inner">
          <div className="cat-top">
            <span className="idx">(04) DECISIONS</span>
            <Link className="viewall" to="/articles?category=decisions">VIEW ALL →</Link>
          </div>
          <div className="cat-layout">
            <div></div>
            <Link to="/articles?category=decisions" className="circle-reveal g4">
              <span className="viewbtn">VIEW</span>
            </Link>
            <h2 className="disp cat-word right">DECISIONS</h2>
          </div>
          <div className="art-list">
            <div className="art-list-head">
              <span className="art-count">3 ARTICLES</span>
            </div>
            <Link className="art-row" to="/articles?article=more-options-a-less-happy-you&category=decisions">
              <span className="n">01</span>
              <div className="art-content">
                <h4>Choosing What Matters Over What Feels Easy</h4>
                <span className="meta">6 min · May 14</span>
              </div>
            </Link>
            <Link className="art-row" to="/articles?article=the-cost-of-a-safe-decision&category=decisions">
              <span className="n">02</span>
              <div className="art-content">
                <h4>How to Make Peace with Trade-Offs</h4>
                <span className="meta">5 min · May 5</span>
              </div>
            </Link>
            <Link className="art-row" to="/articles?article=clarity-comes-after-action&category=decisions">
              <span className="n">03</span>
              <div className="art-content">
                <h4>Overcoming Chronic Indecision and Overthinking</h4>
                <span className="meta">7 min · Apr 25</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- (05) DIFFICULT PEOPLE (WORD LEFT, SPHERE RIGHT) ---------- */}
      <section className="cat-sec" id="diff">
        <div className="cat-inner">
          <div className="cat-top">
            <span className="idx">(05) DIFFICULT PEOPLE</span>
            <Link className="viewall" to="/articles?category=difficult-people">VIEW ALL →</Link>
          </div>
          <div className="cat-layout">
            <h2 className="disp cat-word left">DIFFICULT<br />PEOPLE</h2>
            <Link to="/articles?category=difficult-people" className="circle-reveal g5">
              <span className="viewbtn" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>VIEW</span>
            </Link>
            <div></div>
          </div>
          <div className="art-list">
            <div className="art-list-head">
              <span className="art-count">3 ARTICLES</span>
            </div>
            <Link className="art-row" to="/articles?article=when-understanding-becomes-an-excuse&category=difficult-people">
              <span className="n">01</span>
              <div className="art-content">
                <h4>Small Steps, Big Changes</h4>
                <span className="meta">7 min · May 8</span>
              </div>
            </Link>
            <Link className="art-row" to="/articles?article=the-peace-in-not-reacting&category=difficult-people">
              <span className="n">02</span>
              <div className="art-content">
                <h4>Saying No Without the Guilt</h4>
                <span className="meta">4 min · Apr 15</span>
              </div>
            </Link>
            <Link className="art-row" to="/articles?article=you-cant-make-everyone-like-you&category=difficult-people">
              <span className="n">03</span>
              <div className="art-content">
                <h4>The Boundary You Keep Breaking First</h4>
                <span className="meta">5 min · Apr 2</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- (06) COMMUNICATION (SPHERE LEFT, WORD RIGHT) ---------- */}
      <section className="cat-sec" id="comm">
        <div className="cat-inner">
          <div className="cat-top">
            <span className="idx">(06) COMMUNICATION</span>
            <Link className="viewall" to="/articles?category=communication">VIEW ALL →</Link>
          </div>
          <div className="cat-layout">
            <div></div>
            <Link to="/articles?category=communication" className="circle-reveal g6">
              <span className="viewbtn">VIEW</span>
            </Link>
            <h2 className="disp cat-word right">COMMUNI<br />CATION</h2>
          </div>
          <div className="art-list">
            <div className="art-list-head">
              <span className="art-count">3 ARTICLES</span>
            </div>
            <Link className="art-row" to="/articles?article=say-less-say-better&category=communication">
              <span className="n">01</span>
              <div className="art-content">
                <h4>The Art of Honest Communication</h4>
                <span className="meta">6 min · May 4</span>
              </div>
            </Link>
            <Link className="art-row" to="/articles?article=its-not-what-you-say-how-they-receive&category=communication">
              <span className="n">02</span>
              <div className="art-content">
                <h4>The Pattern Repeats Until It's Named</h4>
                <span className="meta">6 min · Apr 18</span>
              </div>
            </Link>
            <Link className="art-row" to="/articles?article=honesty-can-be-kind&category=communication">
              <span className="n">03</span>
              <div className="art-content">
                <h4>Reading the Signs Before the Story Changes</h4>
                <span className="meta">5 min · Apr 9</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- CTA SECTION (READY TO GO DEEPER) ---------- */}
      <section className="cta-wrapper">
        <div className="cta-content">
          <h2 className="disp">Ready to go<br />deeper?</h2>
          <p>Reading is a start. A session helps you actually apply it to your life.</p>
          <button onClick={handleBookClick} className="book" style={{ border: 'none', cursor: 'pointer' }}>
            Book a 1:1 →
          </button>
        </div>
      </section>
    </div>
  );
}
