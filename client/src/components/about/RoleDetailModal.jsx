import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  YoutubeLogo, 
  InstagramLogo, 
  CalendarCheck
} from '@phosphor-icons/react';
import MuxPlayer from '@mux/mux-player-react';
import { MEDIA_DATA, CATEGORIES, GRADIENTS, INTRO_VIDEO } from '../../data/media';
import { CDN_IMAGES } from '../../utils/cdnAssets';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';
const PAGE_SIZE = 12;

const DEFAULT_SECTIONS = [
  {
    id: 'sec_1',
    heading: 'The Sky Taught Me Calm',
    text: 'I still remember the first time I took off alone. The runway lights stretched ahead, the city shrank behind me, and for a few seconds everything went quiet. That silence taught me something I had never learned in a classroom: staying calm is not a talent some people are born with. It is a practice.\n\nIn the cockpit, decisions are made in seconds. Yet every one of them rests on months of training, a checklist you trust and a team you rely on. Calm is simply what preparation looks like from the outside. I carried that idea with me long after I stepped out of the aircraft, and it slowly became the foundation of everything I believe about growth.',
    quote: '',
    layout: 'right',
    image: { url: CDN_IMAGES.ABOUT_PILOT }
  },
  {
    id: 'sec_2',
    heading: 'Pressure Is Not the Enemy',
    text: 'Years of flying in high-pressure environments showed me a hard truth. Pressure never disappears. Weather changes, schedules collapse, and tired minds make small mistakes. The pilots I admired most were not the ones who avoided stress. They were the ones who understood it.\n\nThey named what they felt, slowed their breathing, followed their process and made the next good decision. Nothing dramatic, nothing heroic. Just a steady habit repeated until it became second nature. When I started noticing the same patterns in everyday life, in careers, families and friendships, I realised that these skills were not meant only for pilots. Anyone can learn them. That realisation changed how I work with people, and it is why I never promise a life without pressure, only a calmer way of meeting it.',
    quote: 'Calm is a skill. You can train it.',
    layout: 'left',
    image: { url: CDN_IMAGES.THINK_CLEARLY }
  },
  {
    id: 'sec_3',
    heading: 'From the Cockpit to Coaching',
    text: 'Becoming an ICF-certified coach gave my experience a proper shape. I trained in evidence-based methods, learned to listen without judging and to ask the questions that help people hear their own answers. The science mattered to me, but so did something simpler: people do not change because they are told what to do. They change when they feel understood.\n\nSo my sessions are built around three things: clarity about where you are, honesty about where you want to go, and small, realistic steps in between. No jargon. No grand promises. Just a clear process that you can follow on your busiest and most uncertain days.',
    quote: '',
    layout: 'none'
  },
  {
    id: 'sec_4',
    heading: 'Walking Beside You',
    text: 'My favourite sentence in coaching is also my promise: I walk beside you, not ahead of you. I am not a guru standing on a mountain top, and I am not here to hand you a perfect plan. You are the expert on your own life. My role is to hold the space, reflect what I hear, challenge you kindly when you need it and celebrate every step forward, even the small and messy ones.\n\nSome of my clients come to me for career decisions. Others arrive carrying stress, doubt or a quiet feeling that life has become too heavy. Whatever brings you here, you will not be rushed, and you will not be judged. I believe the best answers are already inside you; they are just waiting for the right questions and a little patience.',
    quote: 'I walk beside you, not ahead of you.',
    layout: 'right',
    image: { url: CDN_IMAGES.COACHING_PROCESS }
  },
  {
    id: 'sec_5',
    heading: 'The Human Behind the Roles',
    text: 'Behind the uniform and the certificates, I am simply a human being. I have doubted myself, felt exhausted and stood at crossroads wondering which way to go. I still love watching the sun go down over the sea, and I still believe that small dreams deserve as much respect as big ones.\n\nThat is why I do this work. Someone once walked beside me when I needed it most, and it changed everything. If you have read this far, you have already taken a first step. Whenever you are ready, let us have a real conversation and take the next one together.',
    quote: '',
    layout: 'left',
    image: { url: CDN_IMAGES.ABOUT_HUMAN }
  }
];

export default function RoleDetailModal({
  isOpen,
  onClose,
  triggerRef,
  roleKey: _roleKey,
  cardImage: _cardImage,
  data: propData = null,
  previewData = null,
  initialView = 'main'
}) {
  // Navigation view within popup: 'main' | 'story'
  const [view, setView] = useState(initialView || 'main');

  // Asynchronously fetched data from /api/about-popup if no prop data passed
  const [fetchedData, setFetchedData] = useState(null);

  useEffect(() => {
    if (!isOpen || previewData || propData) return;
    let isMounted = true;
    fetch(`${API_URL}/api/about-popup`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && isMounted) setFetchedData(data);
      })
      .catch(err => console.warn('Failed to fetch about popup data:', err));
    return () => { isMounted = false; };
  }, [isOpen, previewData, propData]);

  // Sync initial view when modal re-opens
  useEffect(() => {
    if (isOpen && initialView) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  const activeData = previewData || propData || fetchedData;
  const popupSettings = activeData?.popup || {};
  const popupTitle = popupSettings.title || 'ABOUT AARKESH';
  const readMoreLabel = popupSettings.readMoreLabel || 'Read More';
  const showYoutube = popupSettings.showYoutube !== false;
  const showInstagram = popupSettings.showInstagram !== false;
  const hasMediaTabs = Boolean(showYoutube || showInstagram);
  const activePageSize = popupSettings.pageSize || PAGE_SIZE;

  // Media browser state
  const [tab, setTab] = useState('yt'); // 'yt' | 'ig'
  const [cat, setCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [shownCount, setShownCount] = useState(activePageSize);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(null);

  // If one social tab is disabled, auto switch to the visible one
  useEffect(() => {
    if (!showYoutube && showInstagram && tab === 'yt') {
      setTab('ig');
    } else if (!showInstagram && showYoutube && tab === 'ig') {
      setTab('yt');
    }
  }, [showYoutube, showInstagram, tab]);

  // Categories list
  const activeCategories = useMemo(() => {
    const customCats = activeData?.categories || popupSettings.categories;
    if (customCats && Array.isArray(customCats) && customCats.length > 0) {
      return customCats;
    }
    return CATEGORIES;
  }, [activeData?.categories, popupSettings.categories]);

  // Dynamic media items
  const youtubeList = useMemo(() => {
    if (activeData?.media && Array.isArray(activeData.media)) {
      return activeData.media
        .filter(m => m.type === 'youtube' && m.published !== false)
        .map(m => ({
          id: m.externalId || m.id,
          t: m.title,
          c: m.category,
          img: m.thumbnail?.url,
          featured: Boolean(m.featured)
        }));
    }
    return MEDIA_DATA.yt || [];
  }, [activeData?.media]);

  const instagramList = useMemo(() => {
    if (activeData?.media && Array.isArray(activeData.media)) {
      return activeData.media
        .filter(m => m.type === 'instagram' && m.published !== false)
        .map(m => ({
          id: m.externalId || m.id,
          t: m.title,
          c: m.category,
          img: m.thumbnail?.url
        }));
    }
    return MEDIA_DATA.ig || [];
  }, [activeData?.media]);



  // Story (Read More) Content
  const activeStory = activeData?.story || {};
  const storyKicker = activeStory.kicker || 'My story';
  const storyTitle = activeStory.title || 'The Journey Behind the Mission';
  const storyLead = activeStory.lead || 'From the skies to the soul, here is the story behind why I do what I do.';
  const storyHero = activeStory.hero;
  const storySections = useMemo(() => {
    if (activeStory.sections && Array.isArray(activeStory.sections) && activeStory.sections.length > 0) {
      return activeStory.sections;
    }
    return DEFAULT_SECTIONS;
  }, [activeStory.sections]);

  // Word count & read time calculation
  const readTimeEst = useMemo(() => {
    let words = (storyLead || '').split(/\s+/).filter(Boolean).length;
    storySections.forEach(s => {
      words += (s.heading || '').split(/\s+/).filter(Boolean).length;
      words += (s.text || '').split(/\s+/).filter(Boolean).length;
      words += (s.quote || '').split(/\s+/).filter(Boolean).length;
    });
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
  }, [storyLead, storySections]);

  // Intro video state & properties
  const activeIntroVideo = popupSettings.introVideo || INTRO_VIDEO;
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);

  const introPoster = useMemo(() => {
    if (activeIntroVideo?.useMuxThumbnail && activeIntroVideo?.playbackId) {
      return `https://image.mux.com/${activeIntroVideo.playbackId}/thumbnail.jpg?width=1280&height=720&fit_mode=smart`;
    }
    if (activeIntroVideo?.poster?.url) {
      return activeIntroVideo.poster.url;
    }
    return INTRO_VIDEO?.poster || CDN_IMAGES.HERO_MAIN;
  }, [activeIntroVideo]);

  const isIntroProcessingOrError = Boolean(
    activeIntroVideo?.status && 
    activeIntroVideo.status !== 'ready' && 
    !activeIntroVideo?.playbackId
  );

  const introHasRealVideo = Boolean(
    activeIntroVideo?.playbackId || 
    activeIntroVideo?.videoUrl || 
    (activeIntroVideo?.youtubeId && !activeIntroVideo.youtubeId.startsWith('DEMO'))
  );

  const backdropRef = useRef(null);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const searchInputRef = useRef(null);
  const playerBackdropRef = useRef(null);

  // Active raw list based on tab
  const rawTabList = tab === 'yt' ? youtubeList : instagramList;

  // Filter list based on current active tab, category, and search query
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rawTabList.filter((item) => {
      const matchCat = cat === 'All' || item.c === cat;
      const matchSearch = !q || (item.t && item.t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [rawTabList, cat, searchQuery]);

  // Handle Tab Switch
  const handleSwitchTab = (newTab) => {
    setTab(newTab);
    setCat('All');
    setSearchQuery('');
    setShownCount(activePageSize);
  };

  // Handle Category Filter
  const handleSelectCat = (newCat) => {
    setCat(newCat);
    setShownCount(activePageSize);
  };

  // Handle Search Input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShownCount(activePageSize);
  };

  // Open in-popup player for grid item
  const handlePlay = (index) => {
    setCurrentPlayIndex(index);
  };

  // Close in-popup player
  const handleStopPlayer = () => {
    setCurrentPlayIndex(null);
  };

  // Player Prev / Next
  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (filteredList.length === 0) return;
    setCurrentPlayIndex((prev) => (prev - 1 + filteredList.length) % filteredList.length);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (filteredList.length === 0) return;
    setCurrentPlayIndex((prev) => (prev + 1) % filteredList.length);
  };

  // Switch to Read More story page
  const handleGoToStory = () => {
    setView('story');
    setIsIntroPlaying(false);
    if (modalRef.current) {
      modalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Switch back to Main overview page
  const handleBackToMain = () => {
    setView('main');
    if (modalRef.current) {
      modalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll & lock state ONLY when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setView('main');
      setIsIntroPlaying(false);
      setCurrentPlayIndex(null);
      return;
    }

    // Scroll to top ONLY ONCE upon initial modal opening
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }

    // Focus close button once on open
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    // Lock page body scroll without freezing Lenis modal events
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Stop Lenis from intercepting wheel and touch inside modal
    const modalEl = modalRef.current;
    const stopLenisCapture = (e) => {
      e.stopPropagation();
    };
    if (modalEl) {
      modalEl.addEventListener('wheel', stopLenisCapture, { passive: true });
      modalEl.addEventListener('touchmove', stopLenisCapture, { passive: true });
    }

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      if (modalEl) {
        modalEl.removeEventListener('wheel', stopLenisCapture);
        modalEl.removeEventListener('touchmove', stopLenisCapture);
      }

      // Return focus to clicked card
      if (triggerRef?.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, triggerRef]);

  // Keyboard navigation (Esc, Arrow keys) - does NOT touch scrollTop or focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Don't intercept arrow keys if user is typing in search input
      if (document.activeElement === searchInputRef.current && e.key !== 'Escape') {
        return;
      }

      // If player is open, Esc closes player first
      if (currentPlayIndex !== null) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          handleStopPlayer();
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrev();
          return;
        }
      } else {
        // Player closed: Esc closes modal
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, currentPlayIndex, filteredList.length]);

  if (!isOpen) return null;

  // Show items in regular grid rows starting from the first video
  const visibleGridItems = filteredList.slice(0, shownCount);
  const totalCount = filteredList.length;
  const currentShown = Math.min(shownCount, totalCount);

  // Helper to resolve thumbnail
  const getThumbnailSrc = (item, isYt) => {
    if (item.img) return item.img;
    const isDemo = !item.id || item.id.startsWith('DEMO');
    if (isYt && !isDemo) {
      return `https://img.youtube.com/vi/${item.id}/mqdefault.jpg`;
    }
    return null;
  };

  const currentPlayingItem = currentPlayIndex !== null ? filteredList[currentPlayIndex] : null;
  const isCurrentDemo = currentPlayingItem ? (!currentPlayingItem.id || currentPlayingItem.id.startsWith('DEMO')) : false;
  const isCurrentYt = tab === 'yt';

  return createPortal(
    <div
      ref={backdropRef}
      data-lenis-prevent="true"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="aw-ov"
      role="dialog"
      aria-modal="true"
      aria-labelledby="awT"
    >
      <style>{`
        /* Scoped exact styles matching current design tokens */
        .aw-ov {
          --bg: #f5f1ea;
          --bg2: #ece5d8;
          --ink: #1d1a17;
          --mute: #6b6258;
          --acc: #c4522d;
          --line: #ddd3c2;
          position: fixed;
          inset: 0;
          background: rgba(20, 14, 10, .68);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 2147483000;
          font: 16px/1.6 Inter, system-ui, sans-serif;
          overscroll-behavior: contain;
        }
        .aw-ov * {
          box-sizing: border-box;
          margin: 0;
        }
        .aw-modal {
          background: var(--bg);
          color: var(--ink);
          width: min(1100px, 100%);
          max-height: 92vh;
          overflow-y: auto !important;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          touch-action: pan-y;
          border-radius: 18px;
          position: relative;
          box-shadow: 0 25px 60px -15px rgba(0,0,0,0.5);
        }
        .aw-modal::-webkit-scrollbar {
          width: 8px;
        }
        .aw-modal::-webkit-scrollbar-track {
          background: var(--bg2);
          border-radius: 99px;
        }
        .aw-modal::-webkit-scrollbar-thumb {
          background: var(--line);
          border-radius: 99px;
        }
        .aw-modal::-webkit-scrollbar-thumb:hover {
          background: var(--mute);
        }
        .aw-head {
          position: relative;
          text-align: center;
          padding: 16px 60px 12px;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .aw-head-story {
          justify-content: space-between;
          padding: 16px 60px 14px 24px;
        }
        .aw-head h2 {
          font: 700 clamp(19px, 2.5vw, 26px) 'Playfair Display', Georgia, serif;
          letter-spacing: .2em;
          text-transform: uppercase;
        }
        .aw-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 99px;
          border: 1px solid var(--line);
          background: var(--bg2);
          color: var(--ink);
          font: 600 12.5px/1 Inter, sans-serif;
          cursor: pointer;
          transition: all .2s;
        }
        .aw-back-btn:hover {
          background: var(--ink);
          color: var(--bg);
          border-color: var(--ink);
        }
        .aw-back-btn svg {
          transition: transform .2s ease;
        }
        .aw-back-btn:hover svg {
          transform: translateX(-3px);
        }
        .aw-x {
          position: absolute;
          top: 14px;
          right: 18px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid var(--line);
          background: var(--bg2);
          color: var(--ink);
          font-size: 18px;
          cursor: pointer;
          z-index: 6;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          transition: background .2s, color .2s, border-color .2s;
        }
        .aw-x:hover {
          background: var(--acc);
          color: #fff;
          border-color: var(--acc);
        }
        .aw-x:focus-visible {
          outline: 2px solid var(--acc);
          outline-offset: 2px;
        }

        /* ---------- 2-MINUTE VIDEO SECTION ---------- */
        .aw-video-section {
          padding: 16px 36px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .aw-video-section.aw-video-solo {
          padding: 28px 36px 44px;
        }
        .aw-video-card {
          width: 100%;
          max-width: 680px;
          border-radius: 16px;
          overflow: hidden;
          background: #110e0c;
          border: 1px solid var(--line);
          box-shadow: 0 14px 32px -8px rgba(0,0,0,0.22);
          position: relative;
          transition: max-width .3s ease;
        }
        .aw-video-card.aw-card-solo {
          max-width: 840px;
          border-radius: 18px;
          box-shadow: 0 20px 48px -10px rgba(0,0,0,0.28);
        }
        .aw-video-frame {
          position: relative;
          aspect-ratio: 16/9;
          width: 100%;
          background: #000;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .aw-video-frame iframe,
        .aw-video-frame video {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        }
        .aw-video-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.88;
          transition: transform .4s ease, opacity .3s ease;
        }
        .aw-video-frame:hover .aw-video-poster {
          transform: scale(1.02);
          opacity: 0.94;
        }
        .aw-video-tint {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(17,16,16,0.15) 0%, rgba(17,16,16,0.65) 100%);
          pointer-events: none;
        }
        .aw-video-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(17,16,16,0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 99px;
          padding: 4px 10px;
          font: 600 10.5px/1 Inter, sans-serif;
          letter-spacing: .08em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 2;
        }
        .aw-video-tag-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ff6b3d;
          box-shadow: 0 0 5px #ff6b3d;
        }
        .aw-video-duration {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(17,16,16,0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 99px;
          padding: 4px 9px;
          font: 600 11px/1 Inter, sans-serif;
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 2;
        }
        .aw-video-play-btn {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          border: none;
          background: transparent;
          color: #fff;
          z-index: 3;
        }
        .aw-play-circle-lg {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(196, 82, 45, 0.94);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(196, 82, 45, 0.45);
          transition: transform .25s ease, background .25s ease, box-shadow .25s ease;
        }
        .aw-video-play-btn:hover .aw-play-circle-lg {
          transform: scale(1.08);
          background: #d85c33;
          box-shadow: 0 10px 30px rgba(196, 82, 45, 0.6);
        }
        .aw-video-caption {
          font: 600 13px/1.3 'Playfair Display', Georgia, serif;
          letter-spacing: .02em;
          text-shadow: 0 2px 6px rgba(0,0,0,0.65);
          text-align: center;
          max-width: 380px;
          padding: 0 14px;
        }
        .aw-video-bar {
          padding: 7px 14px;
          background: var(--bg2);
          border-top: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .aw-video-bar h4 {
          font: 600 12px/1.3 Inter, sans-serif;
          color: var(--ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .aw-video-bar span {
          font-size: 11px;
          color: var(--mute);
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ---------- READ MORE BUTTON SECTION ---------- */
        .aw-readmore-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-top: 14px;
          margin-bottom: 2px;
          text-align: center;
        }
        .aw-video-solo .aw-readmore-row {
          margin-top: 22px;
          margin-bottom: 6px;
        }
        .aw-readmore-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px 26px;
          background: var(--acc);
          color: #fff;
          border: none;
          border-radius: 99px;
          font: 600 13.5px/1 Inter, sans-serif;
          cursor: pointer;
          transition: all .2s ease;
          box-shadow: 0 3px 10px rgba(196, 82, 45, 0.25);
        }
        .aw-readmore-btn:hover {
          background: #b34522;
          transform: translateY(-1px);
          box-shadow: 0 5px 14px rgba(196, 82, 45, 0.35);
        }
        .aw-readmore-btn:active {
          transform: translateY(0);
        }
        .aw-readmore-btn svg {
          transition: transform .2s ease;
        }
        .aw-readmore-btn:hover svg {
          transform: translateX(3px);
        }

        .aw-video-label-badge {
          position: absolute;
          bottom: 12px;
          left: 14px;
          background: rgba(29, 26, 23, 0.78);
          color: #fff;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 2;
          letter-spacing: .02em;
        }
        .aw-video-status-overlay {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          background: rgba(0,0,0,0.65);
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          text-align: center;
          padding: 20px;
          z-index: 3;
        }

        /* ---------- MEDIA BROWSER ---------- */
        .aw-media {
          padding: 8px 48px 40px;
        }
        .aw-featured-banner {
          margin: 0 0 20px 0;
        }
        .aw-featured-card {
          width: 100%;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 20px;
          align-items: center;
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 14px;
          text-align: left;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
        }
        .aw-featured-card:hover {
          transform: translateY(-2px);
          border-color: var(--acc);
          box-shadow: 0 8px 24px rgba(0,0,0,.08);
        }
        .aw-featured-thumb {
          position: relative;
          aspect-ratio: 16 / 9;
          border-radius: 10px;
          overflow: hidden;
          background: #000;
        }
        .aw-featured-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .aw-start-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: var(--acc);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .08em;
          padding: 4px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .aw-featured-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .aw-featured-kicker {
          font-size: 11px;
          font-weight: 700;
          color: var(--acc);
          letter-spacing: .1em;
          text-transform: uppercase;
        }
        .aw-featured-info h4 {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: var(--ink);
          line-height: 1.35;
          margin: 0;
        }
        .aw-featured-info p {
          font-size: 13px;
          color: var(--mute);
          margin: 0;
        }
        @media (max-width: 680px) {
          .aw-featured-card {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
        .aw-bar {
          position: sticky;
          top: 0;
          z-index: 5;
          background: var(--bg);
          padding: 8px 0 10px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 18px;
        }
        .aw-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .aw-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--ink);
          font: 600 13px Inter, sans-serif;
          cursor: pointer;
          transition: all .2s;
        }
        /* Reduced size social media icons in tabs */
        .aw-tab-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }
        .aw-tab em {
          font: 500 11px Inter, sans-serif;
          font-style: normal;
          background: var(--bg2);
          border-radius: 99px;
          padding: 2px 7px;
          color: var(--mute);
          transition: all .2s;
          margin-left: 2px;
        }
        .aw-tab[aria-selected="true"] {
          background: var(--acc);
          border-color: var(--acc);
          color: #fff;
        }
        .aw-tab[aria-selected="true"] em {
          background: rgba(255, 255, 255, .25);
          color: #fff;
        }
        .aw-tools {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .aw-search {
          flex: 1 1 220px;
          padding: 10px 18px;
          height: 42px;
          border-radius: 99px;
          border: 1px solid var(--line);
          background: #fff8;
          font: 14px Inter, sans-serif;
          color: var(--ink);
          box-sizing: border-box;
          transition: border-color .2s, outline .2s, background .2s;
        }
        .aw-search:focus {
          outline: 2px solid var(--acc);
          border-color: transparent;
          background: #fff;
        }
        .aw-chips {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          flex: 1 1 100%;
          padding: 8px 4px 6px;
          align-items: center;
        }
        .aw-chips::-webkit-scrollbar {
          display: none;
        }
        .aw-chip {
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 14px;
          min-height: 32px;
          border-radius: 99px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--mute);
          font: 500 13px/1 Inter, sans-serif;
          cursor: pointer;
          transition: all .2s;
          flex-shrink: 0;
          box-sizing: border-box;
        }
        .aw-chip:hover {
          border-color: var(--ink);
          color: var(--ink);
        }
        .aw-chip.on {
          border-color: var(--ink);
          color: var(--ink);
          background: var(--bg2);
        }
        .aw-chip:focus-visible {
          outline: 2px solid var(--acc);
          outline-offset: 1px;
        }

        .aw-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(3, 1fr);
        }
        .aw-grid.ig {
          grid-template-columns: repeat(4, 1fr);
        }
        .aw-item {
          border: 0;
          background: none;
          padding: 0;
          text-align: left;
          cursor: pointer;
          color: inherit;
          display: block;
          width: 100%;
        }
        .aw-th {
          position: relative;
          aspect-ratio: 16/9;
          border-radius: 12px;
          overflow: hidden;
          background: var(--g, #d8c3aa);
        }
        .aw-grid.ig .aw-th, .aw-th.p {
          aspect-ratio: 9/14;
        }
        .aw-th img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .4s ease;
        }
        .aw-item:hover .aw-th img, .aw-item:focus-visible .aw-th img {
          transform: scale(1.06);
        }
        .aw-item:focus-visible {
          outline: 2px solid var(--acc);
          outline-offset: 3px;
          border-radius: 12px;
        }
        .aw-play {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          pointer-events: none;
        }
        .aw-play i {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, .92);
          display: grid;
          place-items: center;
          color: var(--acc);
          font-style: normal;
          font-size: 15px;
          padding-left: 2px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, .25);
          transition: transform .2s ease;
        }
        .aw-item:hover .aw-play i {
          transform: scale(1.08);
        }
        .aw-item h5 {
          font: 600 13.5px/1.4 Inter, sans-serif;
          margin-top: 10px;
          color: var(--ink);
        }
        .aw-item span {
          font-size: 12px;
          color: var(--mute);
          display: block;
          margin-top: 2px;
        }
        .aw-more {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-top: 30px;
          color: var(--mute);
          font-size: 13px;
        }
        .aw-more button {
          padding: 12px 30px;
          border-radius: 99px;
          border: 1px solid var(--ink);
          background: transparent;
          color: var(--ink);
          font: 600 14px Inter, sans-serif;
          cursor: pointer;
          transition: all .2s;
        }
        .aw-more button:hover {
          background: var(--ink);
          color: var(--bg);
        }
        .aw-bartrack {
          width: 180px;
          height: 3px;
          background: var(--line);
          border-radius: 3px;
          overflow: hidden;
        }
        .aw-bartrack i {
          display: block;
          height: 100%;
          background: var(--acc);
          transition: width .3s ease;
        }
        .aw-empty {
          padding: 40px;
          text-align: center;
          color: var(--mute);
        }

        /* ---------- READ MORE PAGE (WRITTEN CONTENT + IMAGES) ---------- */
        /* ---------- READ MORE ARTICLE (NEW DESIGN) ---------- */
        .rm-art {
          max-width: 960px;
          margin: 0 auto;
          padding: 44px 48px 64px;
          animation: rmFadeIn .3s ease;
        }
        @keyframes rmFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rm-kick {
          font: 600 12px Inter, sans-serif;
          letter-spacing: .2em;
          color: var(--acc);
          text-transform: uppercase;
        }
        .rm-art h3 {
          font: 700 clamp(32px, 5vw, 54px)/1.1 'Playfair Display', Georgia, serif;
          margin: 12px 0 16px;
          color: var(--ink);
        }
        .rm-lead {
          font: italic 500 clamp(19px, 2.4vw, 24px)/1.5 'Playfair Display', Georgia, serif;
          color: var(--acc);
          max-width: 34em;
        }
        .rm-meta {
          margin-top: 18px;
          font-size: 13px;
          color: var(--mute);
        }
        .rm-fig {
          margin: 0;
        }
        .rm-fig .im {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          background: linear-gradient(135deg, #f9c98f, #e98b5b 55%, #8a4b3a);
          aspect-ratio: 1 / 1;
          display: grid;
          place-items: center;
          color: #fff;
          font: 500 13px Inter;
          text-align: center;
          padding: 14px;
          box-shadow: 0 4px 16px -4px rgba(0,0,0,0.08);
        }
        .rm-fig .im img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .4s ease;
        }
        .rm-fig .im:hover img {
          transform: scale(1.03);
        }
        .rm-fig figcaption {
          font: italic 13px/1.5 Inter, sans-serif;
          color: var(--mute);
          margin-top: 8px;
        }
        .rm-hero {
          margin: 34px 0 8px;
        }
        .rm-hero .im {
          aspect-ratio: 21 / 9;
        }
        .rm-sec {
          display: grid;
          gap: 40px;
          align-items: start;
          margin-top: 56px;
        }
        .rm-sec.right {
          grid-template-columns: 1.15fr 1fr;
        }
        .rm-sec.left {
          grid-template-columns: 1fr 1.15fr;
        }
        .rm-sec.left .rm-fig {
          order: -1;
        }
        .rm-sec.full,
        .rm-sec.none {
          grid-template-columns: 1fr;
        }
        .rm-sec.full .rm-fig {
          margin-top: 12px;
        }
        .rm-sec.full .im {
          aspect-ratio: 16 / 8;
        }
        .rm-sec:not(.full):not(.none) .rm-fig {
          position: sticky;
          top: 84px;
        }
        .rm-sec h4 {
          font: 700 clamp(24px, 3vw, 32px)/1.2 'Playfair Display', Georgia, serif;
          margin: 6px 0 18px;
          color: var(--ink);
        }
        .rm-sec p {
          font: 400 18px/1.9 'Playfair Display', Georgia, serif;
          margin-bottom: 18px;
          color: #2b2622;
        }
        .rm-sec p.dc::first-letter {
          float: left;
          font: 700 66px/.85 'Playfair Display', Georgia, serif;
          color: var(--acc);
          padding: 6px 10px 0 0;
        }
        .rm-sec blockquote {
          border-left: 3px solid var(--acc);
          padding-left: 20px;
          margin: 26px 0 8px;
          font: italic 500 24px/1.4 'Playfair Display', Georgia, serif;
          color: var(--acc);
        }
        .rm-sign {
          margin-top: 56px;
          padding-top: 26px;
          border-top: 1px solid var(--line);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .rm-sign b {
          font: italic 500 26px 'Playfair Display', Georgia, serif;
          color: var(--ink);
        }
        .rm-cta {
          padding: 13px 30px;
          border-radius: 99px;
          border: 0;
          background: var(--acc);
          color: #fff;
          font: 600 14px Inter, sans-serif;
          letter-spacing: .08em;
          text-transform: uppercase;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background .2s, transform .2s;
        }
        .rm-cta:hover {
          background: #b34522;
          transform: translateY(-1px);
        }
        .rm-btn {
          padding: 11px 22px;
          border-radius: 99px;
          border: 1px solid var(--line);
          background: var(--bg2);
          color: var(--ink);
          font: 600 13px Inter, sans-serif;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: all .2s ease;
        }
        .rm-btn:hover {
          background: var(--ink);
          color: var(--bg);
          border-color: var(--ink);
        }

        /* Player overlay (inside modal for grid cards) */
        .aw-player {
          position: fixed;
          inset: 0;
          background: rgba(10, 7, 5, .88);
          display: none;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 14px;
          padding: 20px;
          z-index: 2147483010;
        }
        .aw-player.on {
          display: flex;
        }
        .aw-pbox {
          width: min(900px, 100%);
          aspect-ratio: 16/9;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        .aw-pbox.p {
          aspect-ratio: 9/16;
          width: min(90vw, 400px);
          max-width: 100%;
          height: min(78vh, 720px);
          background: #000;
        }
        .aw-pbox iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }
        .aw-pt {
          color: #fff;
          font: 600 15px Inter, sans-serif;
          text-align: center;
          max-width: 900px;
          padding: 0 16px;
        }
        .aw-nav {
          display: flex;
          gap: 10px;
        }
        .aw-nav button {
          padding: 9px 20px;
          border-radius: 99px;
          border: 1px solid #fff6;
          background: transparent;
          color: #fff;
          font: 500 13px Inter, sans-serif;
          cursor: pointer;
          transition: all .2s;
        }
        .aw-nav button:hover {
          background: #fff;
          color: #000;
        }

        @media (max-width: 860px) {
          .aw-video-section {
            padding: 20px 20px 4px;
          }
          .aw-media {
            padding: 20px;
          }
          .aw-story-page {
            padding: 22px 20px 36px;
          }
          .aw-story-lead {
            grid-template-columns: 1fr;
            gap: 24px;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .aw-story-card, .aw-story-card.reverse {
            grid-template-columns: 1fr;
            padding: 18px;
            gap: 18px;
          }
          .aw-story-img-wrap {
            width: 100%;
            max-width: 260px;
            aspect-ratio: 1 / 1 !important;
            min-height: auto;
            margin: 0 auto;
          }
          .aw-story-card-body {
            padding: 22px 20px;
          }
          .aw-pillars-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .aw-story-footer {
            flex-direction: column;
            align-items: flex-start;
          }
          .aw-grid, .aw-grid.ig {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
          .aw-head {
            padding: 22px 64px 16px;
          }
          .aw-head-story {
            padding: 18px 64px 16px 18px;
          }
          .rm-art {
            padding: 28px 20px 44px;
          }
          .rm-sec {
            gap: 20px;
            margin-top: 40px;
          }
          .rm-sec.right,
          .rm-sec.left {
            grid-template-columns: 1fr;
          }
          .rm-sec.left .rm-fig {
            order: 0;
          }
          .rm-sec:not(.full):not(.none) .rm-fig {
            position: static;
          }
          .rm-hero .im {
            aspect-ratio: 16 / 9;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
          }
        }
      `}</style>

      {/* Main Modal Dialog (Size and dimensions remain exactly as designed) */}
      <article
        ref={modalRef}
        data-lenis-prevent="true"
        className="aw-modal"
        tabIndex={-1}
      >
        {/* Main Close Button */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="aw-x"
        >
          ×
        </button>

        {/* Head */}
        <div className={`aw-head ${view === 'story' ? 'aw-head-story' : ''}`}>
          {view === 'story' ? (
            <>
              <button
                type="button"
                className="aw-back-btn"
                onClick={handleBackToMain}
                aria-label="Back to overview"
              >
                <ArrowLeft size={15} weight="bold" />
                <span>Back</span>
              </button>
              <h2 id="awT">{popupTitle}</h2>
              <div style={{ width: 44 }} /> {/* Balance flex spacer for centered title */}
            </>
          ) : (
            <h2 id="awT">{popupTitle}</h2>
          )}
        </div>

        {/* VIEW 1: MAIN PAGE (2-Minute Video + Read More Button + Social Media Videos) */}
        {view === 'main' && (
          <>
            {/* 2-Minute Video Section (Replaces the former text block) */}
            <section className={`aw-video-section ${!hasMediaTabs ? 'aw-video-solo' : ''}`}>
              <div className={`aw-video-card ${!hasMediaTabs ? 'aw-card-solo' : ''}`}>
                <div className="aw-video-frame">
                  {isIntroPlaying ? (
                    activeIntroVideo?.playbackId ? (
                      <MuxPlayer
                        playbackId={activeIntroVideo.playbackId}
                        streamType="on-demand"
                        autoPlay
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : introHasRealVideo ? (
                      activeIntroVideo?.videoUrl ? (
                        <video
                          src={activeIntroVideo.videoUrl}
                          controls
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <iframe
                          src={`https://www.youtube.com/embed/${activeIntroVideo.youtubeId}?autoplay=1&rel=0`}
                          scrolling="no"
                          allow="autoplay; encrypted-media; fullscreen"
                          allowFullScreen
                          title={activeIntroVideo.label || activeIntroVideo.title || 'Meet Aarkesh'}
                        />
                      )
                    ) : (
                      /* Demo/Fallback Interactive Video Player */
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '24px',
                          color: '#fff',
                          textAlign: 'center',
                          background: 'radial-gradient(circle at center, #221a14 0%, #0d0a08 100%)'
                        }}
                      >
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: 'rgba(196,82,45,0.2)',
                            border: '1px solid #c4522d',
                            display: 'grid',
                            placeItems: 'center',
                            marginBottom: 16,
                            color: '#ff7b52'
                          }}
                        >
                          <Play size={26} weight="fill" />
                        </div>
                        <h4 style={{ font: "700 20px 'Playfair Display', serif", marginBottom: 8 }}>
                          {activeIntroVideo.label || activeIntroVideo.title || 'Meet Aarkesh · 2 min'}
                        </h4>
                        <p style={{ fontSize: 13.5, color: '#b8aba0', maxWidth: 460, lineHeight: 1.6, marginBottom: 16 }}>
                          2-minute introduction video.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsIntroPlaying(false)}
                          style={{
                            padding: '7px 18px',
                            borderRadius: 99,
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            color: '#fff',
                            fontSize: 12.5,
                            cursor: 'pointer'
                          }}
                        >
                          Pause Video
                        </button>
                      </div>
                    )
                  ) : (
                    /* Video Thumbnail / Poster state */
                    <>
                      <img
                        className="aw-video-poster"
                        src={introPoster}
                        alt="Aarkesh Gupta"
                        onError={(e) => {
                          e.currentTarget.src = CDN_IMAGES.HERO_MAIN;
                        }}
                      />
                      <div className="aw-video-tint" />



                      {!isIntroProcessingOrError ? (
                        <button
                          type="button"
                          className="aw-video-play-btn"
                          onClick={() => setIsIntroPlaying(true)}
                          aria-label="Play video"
                        >
                          <div className="aw-play-circle-lg">
                            <Play size={32} weight="fill" style={{ marginLeft: 3 }} />
                          </div>
                        </button>
                      ) : (
                        <div className="aw-video-status-overlay">
                          <span>{activeIntroVideo?.status === 'processing' ? 'Processing video stream...' : 'Video not ready'}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Read More Button placed directly below the video */}
              <div className="aw-readmore-row">
                <button
                  type="button"
                  className="aw-readmore-btn"
                  onClick={handleGoToStory}
                  aria-label="Read full story and written content"
                >
                  <span>{readMoreLabel}</span>
                  <ArrowRight size={14} weight="bold" />
                </button>
              </div>
            </section>

            {/* Social Media Videos Section (YouTube & Instagram) */}
            {hasMediaTabs && (
              <section className="aw-media">
              <div className="aw-bar">
                {/* Tabs with live counts */}
                <div className="aw-tabs" role="tablist">
                  {showYoutube && (
                    <button
                      className="aw-tab"
                      role="tab"
                      id="tabYt"
                      aria-selected={tab === 'yt'}
                      onClick={() => handleSwitchTab('yt')}
                    >
                      <YoutubeLogo size={16} weight="fill" className="aw-tab-icon" />
                      <span>YouTube</span>
                      <em>{youtubeList.length}</em>
                    </button>
                  )}
                  {showInstagram && (
                    <button
                      className="aw-tab"
                      role="tab"
                      id="tabIg"
                      aria-selected={tab === 'ig'}
                      onClick={() => handleSwitchTab('ig')}
                    >
                      <InstagramLogo size={16} weight="bold" className="aw-tab-icon" />
                      <span>Instagram Reels</span>
                      <em>{instagramList.length}</em>
                    </button>
                  )}
                </div>

                {/* Tools: Search + Category Chips */}
                <div className="aw-tools">
                  <input
                    ref={searchInputRef}
                    className="aw-search"
                    id="awQ"
                    type="search"
                    placeholder="Search videos…"
                    aria-label="Search videos"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <div className="aw-chips">
                    {['All', ...activeCategories].map((category) => (
                      <button
                        key={category}
                        className={`aw-chip ${cat === category ? 'on' : ''}`}
                        onClick={() => handleSelectCat(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>



              {/* Grid of Items */}
              <div className={`aw-grid ${tab === 'ig' ? 'ig' : ''}`}>
                {filteredList.length === 0 ? (
                  <div className="aw-empty" style={{ gridColumn: '1 / -1' }}>
                    No results found. Try a different word or category.
                  </div>
                ) : (
                  visibleGridItems.map((item, idx) => {
                    const thumbSrc = getThumbnailSrc(item, tab === 'yt');
                    const gradient = GRADIENTS[idx % GRADIENTS.length];

                    return (
                      <button
                        key={`${item.id}-${idx}`}
                        className="aw-item"
                        onClick={() => handlePlay(idx)}
                        aria-label={`Play: ${item.t}`}
                      >
                        <div
                          className={`aw-th ${tab === 'ig' ? 'p' : ''}`}
                          style={{
                            background: `linear-gradient(135deg, ${gradient})`
                          }}
                        >
                          {thumbSrc && (
                            <img
                              loading="lazy"
                              src={thumbSrc}
                              alt=""
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          )}
                          <div className="aw-play">
                            <i>▶</i>
                          </div>
                        </div>
                        <h5>{item.t}</h5>
                        <span>{item.c}</span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Load More Counter and Button */}
              {totalCount > 0 && (
                <div className="aw-more">
                  <span>{currentShown} / {totalCount} shown</span>
                  <div className="aw-bartrack">
                    <i style={{ width: `${(currentShown / totalCount) * 100}%` }} />
                  </div>
                  {currentShown < totalCount && (
                    <button
                      type="button"
                      onClick={() => setShownCount((prev) => prev + PAGE_SIZE)}
                    >
                      Load more
                    </button>
                  )}
                </div>
              )}
              </section>
            )}
          </>
        )}

        {/* VIEW 2: READ MORE PAGE (Editorial Story with dynamic sections and square images without numbering) */}
        {view === 'story' && (
          <article className="rm-art">
            <div className="rm-kick">{storyKicker}</div>
            <h3>{storyTitle}</h3>
            <p className="rm-lead">{storyLead}</p>
            <div className="rm-meta">{readTimeEst}</div>

            {storyHero?.url && (
              <figure className="rm-fig rm-hero">
                <div className="im">
                  <img loading="lazy" src={storyHero.url} alt="Story hero" />
                </div>
              </figure>
            )}

            {storySections.map((sec, sIdx) => {
              const paragraphs = (sec.text || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
              return (
                <section className={`rm-sec ${sec.layout || 'none'}`} key={sec.id || sIdx}>
                  <div className="rm-txt">
                    {sec.heading && <h4>{sec.heading}</h4>}
                    {paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className={sIdx === 0 && pIdx === 0 ? 'dc' : ''}>
                        {p}
                      </p>
                    ))}
                    {sec.quote && (
                      <blockquote>“{sec.quote.replace(/^["“]|["”]$/g, '').trim()}”</blockquote>
                    )}
                  </div>
                  {sec.layout && sec.layout !== 'none' && sec.image?.url && (
                    <figure className="rm-fig">
                      <div className="im">
                        <img
                          loading="lazy"
                          src={sec.image.url}
                          alt={sec.heading || ''}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    </figure>
                  )}
                </section>
              );
            })}

            {/* Signature & CTAs */}
            <div className="rm-sign">
              <b>— Aarkesh</b>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="rm-btn"
                  onClick={handleBackToMain}
                  aria-label="Back to videos"
                >
                  <ArrowLeft size={14} weight="bold" />
                  <span>Back to videos</span>
                </button>
                <Link
                  to="/book"
                  onClick={onClose}
                  className="rm-cta"
                >
                  <CalendarCheck size={16} weight="bold" />
                  <span>Book a Session</span>
                </Link>
              </div>
            </div>
          </article>
        )}

        {/* Video Player Overlay (Only loads iframe on thumbnail click, never up front) */}
        <div
          ref={playerBackdropRef}
          onClick={(e) => {
            if (e.target === playerBackdropRef.current) handleStopPlayer();
          }}
          className={`aw-player ${currentPlayIndex !== null ? 'on' : ''}`}
          role="dialog"
          aria-label="Video player"
        >
          {currentPlayIndex !== null && currentPlayingItem && (
            <>
              <button
                type="button"
                onClick={handleStopPlayer}
                aria-label="Close video"
                className="aw-x"
                style={{ position: 'absolute', top: 22, right: 22 }}
              >
                ×
              </button>

              <div className={`aw-pbox ${!isCurrentYt ? 'p' : ''}`}>
                {isCurrentDemo ? (
                  <div
                    style={{
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      height: '100%',
                      textAlign: 'center',
                      padding: '20px',
                      font: '14px Inter, sans-serif',
                      lineHeight: '1.6'
                    }}
                  >
                    Demo item.<br />Add a real ID and the video will play here.
                  </div>
                ) : (
                  <iframe
                    src={
                      isCurrentYt
                        ? `https://www.youtube.com/embed/${currentPlayingItem.id}?autoplay=1&rel=0`
                        : `https://www.instagram.com/reel/${currentPlayingItem.id}/embed/`
                    }
                    scrolling="no"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    title={currentPlayingItem.t}
                  />
                )}
              </div>

              <div className="aw-pt">{currentPlayingItem.t}</div>

              <div className="aw-nav">
                <button type="button" onClick={handlePrev}>
                  ← Previous
                </button>
                <button type="button" onClick={handleNext}>
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </article>
    </div>,
    document.body
  );
}
