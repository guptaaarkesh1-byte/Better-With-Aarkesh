import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, BookmarkSimple, Sparkle, BookOpen, ArrowRight, X } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import bgImage from '../../assets/PerspectivePage/Page1.webp';
import continuousBg from '../../assets/PerspectivePage/BG/library_day_bg.webp';
import LibraryDirectorySection from '../../components/library/LibraryDirectorySection';
import FormatExploreSection from '../../components/library/FormatExploreSection';
import AnimatedText from '../../components/ui/AnimatedText';
import { topics } from '../../constants/articleTaxonomy';
import { CURATED_LIBRARY_ARTICLES } from '../../constants/libraryArticlesData';

export default function Library() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isRestoringScroll, setIsRestoringScroll] = useState(!!sessionStorage.getItem('library_scroll_position'));
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingArticles, setMatchingArticles] = useState([]);
  const [librarySettings, setLibrarySettings] = useState(null);
  const hotspotRef = useRef(null);

  // Fetch Library Settings from Backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/library-settings`);
        if (res.ok) {
          const data = await res.json();
          setLibrarySettings(data);
        }
      } catch (err) {
        console.error('Failed to load library settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Handle click outside to close on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hotspotRef.current && !hotspotRef.current.contains(event.target)) {
        setIsHovered(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Smart scroll restoration
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('library_scroll_position');
    if (savedScroll) {
      setTimeout(() => {
        const targetScroll = parseInt(savedScroll, 10);
        if (window.lenis) {
          window.lenis.scrollTo(targetScroll, { immediate: true });
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'instant' });
        }
        sessionStorage.removeItem('library_scroll_position');
        
        // Small additional delay to allow browser paint before fading in
        setTimeout(() => setIsRestoringScroll(false), 50);
      }, 300); // delay to allow expanded section to render
    } else {
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }, []);

  // Fetch published articles for live hero search
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/articles/published`);
        if (res.ok) {
          const data = await res.json();
          setPublishedArticles(data);
        }
      } catch (err) {
        console.error('Failed to load published articles:', err);
      }
    };
    fetchArticles();
  }, []);

  // Live article search scoring (Using ONLY new library articles)
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setMatchingArticles([]);
      return;
    }

    // Synonym/Theme keywords
    const searchTerms = [q];
    if (q.includes('stuck')) searchTerms.push('stuck', 'pattern', 'decision', 'growth', 'change', 'clarity');
    if (q.includes('relationship')) searchTerms.push('relationship', 'conflict', 'boundaries', 'communication', 'heartbreak', 'love', 'closure');
    if (q.includes('decision')) searchTerms.push('decision', 'choices', 'limits', 'clarity', 'direction');
    if (q.includes('pattern')) searchTerms.push('pattern', 'repeat', 'habit', 'behavioural', 'emotional');

    const words = q.split(/\s+/).filter(Boolean);

    // Strictly use ONLY the 18 new curated library articles
    const uniquePool = CURATED_LIBRARY_ARTICLES.map(a => ({
      ...a,
      _id: a.id,
      categoryId: a.category.toLowerCase(),
      headingId: a.category.toLowerCase(),
      description: a.subtitle || a.excerpt || ''
    }));

    const scored = uniquePool.map(article => {
      let score = 0;
      const title = (article.title || '').toLowerCase();
      const desc = (article.description || '').toLowerCase();
      const content = (article.subtitle || article.excerpt || '').toLowerCase();
      const category = (article.category || '').toLowerCase();

      // Direct phrase match
      if (title.includes(q)) score += 20;
      if (desc.includes(q)) score += 10;
      if (category.includes(q)) score += 8;

      // Word matches
      words.forEach(w => {
        if (title.includes(w)) score += 6;
        if (desc.includes(w)) score += 4;
        if (category.includes(w)) score += 3;
      });

      // Semantic phrase expansion
      searchTerms.forEach(term => {
        if (term !== q) {
          if (title.includes(term)) score += 4;
          if (desc.includes(term)) score += 2;
          if (category.includes(term)) score += 2;
        }
      });

      return { article, score };
    });

    const results = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.article);

    setMatchingArticles(results);
  }, [searchQuery]);

  const getCategoryLabel = (categoryId) => {
    const topic = topics.find(t => t.id === categoryId);
    return topic ? topic.title : (categoryId || 'PERSPECTIVE').toUpperCase();
  };

  const handleOpenArticle = (art) => {
    sessionStorage.setItem('library_scroll_position', window.scrollY.toString());
    navigate(`/articles?article=${art.slug || art._id || art.id}&title=${encodeURIComponent(art.title)}`);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (matchingArticles.length > 0) {
      handleOpenArticle(matchingArticles[0]);
    }
  };

  // Golden Dust Particles Data (removing tailwind animation classes)
  const particles = [
    { id: 1, top: '20%', left: '15%', size: 'w-1 h-1' },
    { id: 2, top: '45%', left: '35%', size: 'w-1.5 h-1.5' },
    { id: 3, top: '70%', left: '10%', size: 'w-1 h-1' },
    { id: 4, top: '30%', left: '80%', size: 'w-2 h-2' },
    { id: 5, top: '65%', left: '60%', size: 'w-1 h-1' },
    { id: 6, top: '85%', left: '85%', size: 'w-1.5 h-1.5' },
    { id: 7, top: '15%', left: '65%', size: 'w-1 h-1' },
    { id: 8, top: '55%', left: '85%', size: 'w-1.5 h-1.5' },
    { id: 9, top: '80%', left: '40%', size: 'w-1 h-1' },
    { id: 10, top: '25%', left: '45%', size: 'w-2 h-2' },
    { id: 11, top: '50%', left: '20%', size: 'w-1 h-1' },
    { id: 12, top: '10%', left: '90%', size: 'w-1.5 h-1.5' },
    { id: 13, top: '40%', left: '10%', size: 'w-1 h-1' },
    { id: 14, top: '75%', left: '70%', size: 'w-1.5 h-1.5' },
    { id: 15, top: '85%', left: '25%', size: 'w-2 h-2' },
  ];

  // Window Light Dust Particles (Automatically spreads out within its container)
  const windowParticles = React.useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: `wp-${i}`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() > 0.6 ? 'w-1.5 h-1.5' : (Math.random() > 0.8 ? 'w-2 h-2' : 'w-1 h-1')
    }));
  }, []);

  const particlesRef = useRef(null);
  const windowParticlesRef = useRef(null);
  const bgOverlayRef = useRef(null);
  const heroRef = useRef(null);

  useGSAP(() => {
    // Initial page load brightening effect
    gsap.to(bgOverlayRef.current, {
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
    });

    const animateParticles = (ref) => {
      if (!ref.current) return;
      const elements = ref.current.children;
      Array.from(elements).forEach((el) => {
        const moveRandomly = () => {
          gsap.to(el, {
            x: `random(-100, 100)`,
            y: `random(-100, 100)`,
            duration: `random(6, 15)`,
            ease: 'sine.inOut',
            onComplete: moveRandomly
          });
        };
        
        gsap.fromTo(el, 
          { opacity: 0 },
          {
            opacity: `random(0.3, 0.8)`,
            duration: `random(2, 4)`,
            ease: 'power2.out',
            onComplete: moveRandomly
          }
        );
      });
    };

    animateParticles(particlesRef);
    animateParticles(windowParticlesRef);
  });

  useGSAP(() => {
    if (!heroRef.current) return;
    const tl = gsap.timeline({ delay: 0.2 });
    
    tl.to('.library-text', {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    })
    .to('.heading-word', {
      x: 0,
      opacity: 1,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power3.out'
    }, "-=0.2")
    .to('.hero-content', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out'
    }, "-=0.2");
  }, { scope: heroRef });

  const currentHero = librarySettings?.hero || {};
  const eyebrowText = currentHero.eyebrowText || 'The Library';
  const headingLine1 = currentHero.headingLine1 || 'What are you trying';
  const headingLine2 = currentHero.headingLine2 || 'to understand?';
  const descriptionText = currentHero.description || 'Articles, videos and reflective tools for the parts of life that are difficult to see clearly while you are living through them.';
  const searchPlaceholder = currentHero.searchPlaceholder || "Describe what you're facing...";
  const bottomPromptText = currentHero.bottomPromptText || 'Or explore what others often carry';
  const heroBg = currentHero.bgImageUrl || bgImage;

  const line1Words = headingLine1.split(/\s+/).filter(Boolean);
  const line2Words = headingLine2.split(/\s+/).filter(Boolean);

  return (
    <div className={`w-full min-h-screen bg-[#050505] overflow-x-clip text-white select-none transition-opacity duration-700 ease-in-out ${isRestoringScroll ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* SECTION 1: Intro / Hotspot */}
      <section className="relative z-30 w-full min-h-screen overflow-visible flex flex-col justify-center">
        
        {/* Background Layer with Darkening effect on hover */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-1000 ease-in-out"
        style={{
          filter: isHovered ? 'brightness(0.4) contrast(1.1)' : 'brightness(1) contrast(1)'
        }}
      >
        <img 
          src={heroBg} 
          alt="Dark Library" 
          className="w-full h-full object-cover object-center"
        />
        {/* Gradients for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
      </div>

      {/* Intro Dark Overlay (Fades out on load) */}
      <div ref={bgOverlayRef} className="absolute inset-0 bg-black z-20 pointer-events-none" />

      {/* Floating Golden Dust Particles (Global) */}
      <div ref={particlesRef} className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div 
            key={p.id}
            className={`absolute rounded-full bg-[#c79c6e] ${p.size}`}
            style={{ 
              top: p.top, 
              left: p.left
            }}
          />
        ))}
      </div>

      {/* 
        WINDOW LIGHT ZONE: 
        Control the position and spread of the dense particle cluster here!
        - Change 'top-[10%]' and 'left-[5%]' to move the entire cluster around.
        - Change 'w-[35%]' and 'h-[60%]' to change how wide or tall the cluster spreads.
      */}
      <div 
        ref={windowParticlesRef} 
        className="absolute top-[10%] left-[60%] w-[35%] h-[60%] z-10 pointer-events-none overflow-hidden"
      >
        {windowParticles.map((p) => (
          <div 
            key={p.id}
            className={`absolute rounded-full bg-[#c79c6e] ${p.size}`}
            style={{ 
              top: p.top, 
              left: p.left
            }}
          />
        ))}
      </div>

      {/* Main Content Overlay */}
      <div 
        ref={heroRef}
        className="relative z-10 w-full flex-1 flex flex-col justify-center px-4 md:px-8 pt-24 pb-16"
      >
        <div className="w-full md:w-[75%] lg:w-[65%] flex flex-col items-start justify-center">
          
          <span className="library-text opacity-0 font-sans text-[0.7rem] md:text-[0.75rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-6 block">
            {eyebrowText}
          </span>

          <h1 className="font-serif text-5xl md:text-[4.5rem] lg:text-[5rem] text-white tracking-tight leading-[1.05] mb-6">
            {line1Words.map((word, idx) => (
              <span key={`l1-${idx}`} className="heading-word inline-block opacity-0 -translate-x-4 mr-[0.25em]">
                {word}
              </span>
            ))}
            {line2Words.length > 0 && <br className="hidden md:block"/>}
            {line2Words.map((word, idx) => (
              <span key={`l2-${idx}`} className={`heading-word inline-block opacity-0 -translate-x-4 ${idx < line2Words.length - 1 ? 'mr-[0.25em]' : ''}`}>
                {word}
              </span>
            ))}
          </h1>

          <div className="hero-content opacity-0 translate-y-4 w-full">
            <p className="font-sans text-white/60 text-lg md:text-xl font-light leading-relaxed mb-10 max-w-lg">
              {descriptionText}
            </p>

            <div className="w-full max-w-xl relative">
              <form onSubmit={handleSearchSubmit} className="w-full relative group">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-[#050505]/70 border border-[#c79c6e]/40 rounded-xl px-5 sm:px-6 py-4 md:py-5 text-white placeholder-white/40 font-light text-base md:text-lg focus:outline-none focus:border-[#c79c6e] focus:bg-[#050505]/90 transition-all duration-300 backdrop-blur-md pr-24 shadow-[0_0_25px_rgba(0,0,0,0.5)]"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-white/40 hover:text-white p-2 transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X size={18} />
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="text-[#c79c6e] hover:text-white transition-colors p-2 cursor-pointer hover:scale-110"
                    title="Search"
                  >
                    <ArrowRight size={22} weight="light" />
                  </button>
                </div>
              </form>

              {/* Floating Dynamic Search Dropdown Overlay (Solid background covering any content below) */}
              {searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-3 z-[100] bg-[#0c0a08] border border-[#c79c6e]/50 rounded-2xl p-3 sm:p-4 shadow-[0_30px_90px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] flex items-center gap-1.5">
                      <Sparkle size={13} weight="fill" />
                      {matchingArticles.length > 0 
                        ? `MATCHING PERSPECTIVES (${matchingArticles.length})` 
                        : 'NO DIRECT MATCHES'
                      }
                    </span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-white/40 hover:text-white text-xs font-sans flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                      Close
                    </button>
                  </div>

                  {matchingArticles.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-[260px] sm:max-h-[300px] overflow-y-auto custom-scrollbar pr-1 overscroll-contain">
                      {matchingArticles.slice(0, 5).map((art) => (
                        <div
                          key={art._id || art.id}
                          onClick={() => handleOpenArticle(art)}
                          className="group p-3 sm:p-3.5 rounded-xl border border-[#c79c6e]/25 bg-[#17130e] hover:bg-[#221b14] hover:border-[#c79c6e]/70 transition-all duration-200 cursor-pointer flex flex-col gap-1 shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e]">
                              {art.category || getCategoryLabel(art.categoryId)}
                            </span>
                            <div className="flex items-center gap-1 text-[#c79c6e] opacity-0 group-hover:opacity-100 transition-opacity text-xs font-sans font-medium">
                              <span>Read</span>
                              <ArrowRight size={12} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                          <h4 className="font-serif text-sm sm:text-base text-white font-normal group-hover:text-[#c79c6e] transition-colors leading-snug">
                            {art.title}
                          </h4>
                          {art.description && (
                            <p className="text-white/60 text-xs font-light line-clamp-1 leading-relaxed">
                              {art.description}
                            </p>
                          )}
                        </div>
                      ))}
                      {matchingArticles.length > 5 && (
                        <button
                          onClick={handleSearchSubmit}
                          className="text-center py-2 text-xs uppercase tracking-widest font-semibold text-[#c79c6e] hover:text-white transition-colors cursor-pointer"
                        >
                          View all {matchingArticles.length} perspectives &rarr;
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-white/10 bg-[#050505]/70 backdrop-blur-md text-center flex flex-col items-center gap-1.5">
                      <p className="text-white/70 text-xs sm:text-sm font-light">
                        No articles directly matching "<span className="text-white font-medium">{searchQuery}</span>".
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>

      {/* Scroll Indicator */}
      {!searchQuery.trim() && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4">
          <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]/80">
            {bottomPromptText}
          </span>
          <ArrowDown size={18} className="text-[#c79c6e]/80 animate-bounce" weight="light" />
        </div>
      )}


      </section>

      {/* SECTION 2: 6 Topics Directory with Live Hover Preview */}
      <LibraryDirectorySection />

      {/* SECTION 3: Explore By Format */}
      <div 
        className="relative w-full bg-cover bg-center bg-no-repeat bg-fixed bg-black/40 bg-blend-overlay"
        style={{ backgroundImage: `url(${continuousBg})` }}
      >
        <FormatExploreSection />
      </div>

    </div>
  );
}
