import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MEDIA_DATA, CATEGORIES, GRADIENTS } from '../../data/media';

const PAGE_SIZE = 12;

export default function RoleDetailModal({
  isOpen,
  onClose,
  triggerRef
}) {
  const [tab, setTab] = useState('yt'); // 'yt' | 'ig'
  const [cat, setCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [shownCount, setShownCount] = useState(PAGE_SIZE);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(null); // index in filtered list, null if closed

  const backdropRef = useRef(null);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const searchInputRef = useRef(null);
  const playerBackdropRef = useRef(null);

  // Filter list based on current active tab, category, and search query
  const filteredList = useMemo(() => {
    const rawList = MEDIA_DATA[tab] || [];
    const q = searchQuery.trim().toLowerCase();
    return rawList.filter((item) => {
      const matchCat = cat === 'All' || item.c === cat;
      const matchSearch = !q || (item.t && item.t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [tab, cat, searchQuery]);

  // Handle Tab Switch
  const handleSwitchTab = (newTab) => {
    setTab(newTab);
    setCat('All');
    setSearchQuery('');
    setShownCount(PAGE_SIZE);
  };

  // Handle Category Filter
  const handleSelectCat = (newCat) => {
    setCat(newCat);
    setShownCount(PAGE_SIZE);
  };

  // Handle Search Input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShownCount(PAGE_SIZE);
  };

  // Open in-popup player
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

  // Keyboard navigation & scroll locking
  useEffect(() => {
    if (!isOpen) return;

    // Focus close button on open
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

    const handleKeyDown = (e) => {
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

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      if (modalEl) {
        modalEl.removeEventListener('wheel', stopLenisCapture);
        modalEl.removeEventListener('touchmove', stopLenisCapture);
      }
      window.removeEventListener('keydown', handleKeyDown);

      // Return focus to clicked card
      if (triggerRef?.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, currentPlayIndex, triggerRef, filteredList.length]);

  if (!isOpen) return null;

  // Show items in regular grid rows starting from the first video
  const visibleGridItems = filteredList.slice(0, shownCount);

  // Total shown calculation
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
        /* Scoped exact styles from approved reference */
        .aw-ov {
          --bg: #f5f1ea;
          --bg2: #ece5d8;
          --ink: #1d1a17;
          --mute: #6b6258;
          --acc: #c4522d;
          --line: #ddd3c2;
          position: fixed;
          inset: 0;
          background: rgba(20, 14, 10, .62);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
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
          text-align: center;
          padding: 28px 70px 22px;
          border-bottom: 1px solid var(--line);
        }
        .aw-head h2 {
          font: 700 clamp(26px, 4vw, 40px) 'Playfair Display', Georgia, serif;
          letter-spacing: .22em;
          text-transform: uppercase;
        }
        .aw-x {
          position: absolute;
          top: 22px;
          right: 22px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid var(--line);
          background: var(--bg2);
          color: var(--ink);
          font-size: 20px;
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
        .aw-body {
          padding: 36px 56px 8px;
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 48px;
        }
        .aw-story p {
          font: 400 17px/1.85 'Playfair Display', Georgia, serif;
          margin-bottom: 18px;
        }
        .aw-story p:first-child::first-letter {
          float: left;
          font: 700 64px/.85 'Playfair Display', Georgia, serif;
          color: var(--acc);
          padding: 6px 10px 0 0;
        }
        .aw-side {
          align-self: start;
          border-left: 3px solid var(--acc);
          padding-left: 24px;
        }
        .aw-side blockquote {
          font: italic 500 24px/1.4 'Playfair Display', Georgia, serif;
          color: var(--acc);
        }
        .aw-side ul {
          padding: 0;
          margin-top: 22px;
        }
        .aw-side li {
          list-style: none;
          font-size: 14px;
          color: var(--mute);
          margin-top: 14px;
        }
        .aw-side li b {
          display: block;
          color: var(--ink);
          font-weight: 700;
        }

        /* ---------- MEDIA BROWSER ---------- */
        .aw-media {
          padding: 28px 56px 48px;
        }
        .aw-bar {
          position: sticky;
          top: 0;
          z-index: 5;
          background: var(--bg);
          padding: 16px 0 14px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 22px;
        }
        .aw-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .aw-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--ink);
          font: 600 15px Inter, sans-serif;
          cursor: pointer;
          transition: all .2s;
        }
        .aw-tab em {
          font: 500 12px Inter, sans-serif;
          font-style: normal;
          background: var(--bg2);
          border-radius: 99px;
          padding: 2px 9px;
          color: var(--mute);
          transition: all .2s;
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
        .aw-feat {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 22px;
          margin-bottom: 26px;
          align-items: center;
        }
        .aw-feat h4 {
          font: 700 26px/1.25 'Playfair Display', Georgia, serif;
          margin: 6px 0 10px;
          color: var(--ink);
        }
        .aw-feat small {
          color: var(--acc);
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }
        .aw-feat p {
          color: var(--mute);
          font-size: 14px;
          margin-bottom: 14px;
          line-height: 1.6;
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
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(255, 255, 255, .92);
          display: grid;
          place-items: center;
          color: var(--acc);
          font-style: normal;
          font-size: 16px;
          padding-left: 3px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, .25);
          transition: transform .2s ease;
        }
        .aw-item:hover .aw-play i {
          transform: scale(1.08);
        }
        .aw-item h5 {
          font: 600 14px/1.4 Inter, sans-serif;
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

        /* Player overlay (inside modal) */
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
          .aw-body {
            grid-template-columns: 1fr;
            padding: 24px 20px 4px;
            gap: 24px;
          }
          .aw-media {
            padding: 20px;
          }
          .aw-grid, .aw-grid.ig {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
          .aw-feat {
            grid-template-columns: 1fr;
          }
          .aw-head {
            padding: 24px 64px 18px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
          }
        }
      `}</style>

      {/* Main Modal Dialog */}
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
        <div className="aw-head">
          <h2 id="awT">ABOUT AARKESH</h2>
        </div>

        {/* Body */}
        <div className="aw-body">
          <div className="aw-story">
            <p>
              After my first flight, I realised that staying calm is not a talent, it is a practice. In the cockpit every decision is made in seconds, and behind every decision sits training, a checklist and trust.
            </p>
            <p>
              After years of working in high-pressure environments, I learned that pressure does not need to be removed, it needs to be understood. That lesson is the foundation of my coaching today.
            </p>
          </div>
          <aside className="aw-side">
            <blockquote>“Calm is a skill. You can train it.”</blockquote>
            <ul>
              <li>
                <b>Real experience</b>Life in high-pressure environments
              </li>
              <li>
                <b>Discipline</b>Checklists, clarity, calm decisions
              </li>
            </ul>
          </aside>
        </div>

        {/* Media Browser Section */}
        <section className="aw-media">
          <div className="aw-bar">
            {/* Tabs */}
            <div className="aw-tabs" role="tablist">
              <button
                className="aw-tab"
                role="tab"
                id="tabYt"
                aria-selected={tab === 'yt'}
                onClick={() => handleSwitchTab('yt')}
              >
                ▶ YouTube <em>{MEDIA_DATA.yt.length}</em>
              </button>
              <button
                className="aw-tab"
                role="tab"
                id="tabIg"
                aria-selected={tab === 'ig'}
                onClick={() => handleSwitchTab('ig')}
              >
                ◎ Instagram Reels <em>{MEDIA_DATA.ig.length}</em>
              </button>
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
                {['All', ...CATEGORIES].map((category) => (
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
