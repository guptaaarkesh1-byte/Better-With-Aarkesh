import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, BookmarkSimple, Sparkle, BookOpen, ArrowRight, X } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import bgImage from '../../assets/PerspectivePage/Page1.png';
import continuousBg from '../../assets/PerspectivePage/BG/library_day_bg.png';
import QuestionsSection from '../../components/library/QuestionsSection';
import FeaturedSection from '../../components/library/FeaturedSection';
import FormatExploreSection from '../../components/library/FormatExploreSection';
import SituationExploreSection from '../../components/library/SituationExploreSection';
import LatestPerspectivesSection from '../../components/library/LatestPerspectivesSection';
import ToolsReflectionSection from '../../components/library/ToolsReflectionSection';
import LibraryInvitationSection from '../../components/library/LibraryInvitationSection';
import PerspectiveToConversationSection from '../../components/library/PerspectiveToConversationSection';
import AnimatedText from '../../components/ui/AnimatedText';
import { topics } from '../../constants/articleTaxonomy';

export default function Library() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isRestoringScroll, setIsRestoringScroll] = useState(!!sessionStorage.getItem('library_scroll_position'));
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingArticles, setMatchingArticles] = useState([]);
  const hotspotRef = useRef(null);

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

  // Live article search scoring
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setMatchingArticles([]);
      return;
    }

    // Synonym/Theme keywords
    const searchTerms = [q];
    if (q.includes('stuck')) searchTerms.push('stuck', 'pattern', 'decision', 'growth', 'change', 'clarity');
    if (q.includes('relationship')) searchTerms.push('relationship', 'conflict', 'boundaries', 'communication', 'heartbreak');
    if (q.includes('decision')) searchTerms.push('decision', 'choices', 'limits', 'clarity', 'direction');
    if (q.includes('pattern')) searchTerms.push('pattern', 'repeat', 'habit', 'behavioural', 'emotional');

    const words = q.split(/\s+/).filter(Boolean);

    const scored = publishedArticles.map(article => {
      let score = 0;
      const title = (article.title || '').toLowerCase();
      const desc = (article.description || '').toLowerCase();
      const content = (article.content || '').toLowerCase();
      const category = (article.categoryId || '').toLowerCase();
      const heading = (article.headingId || '').toLowerCase();
      const tags = (Array.isArray(article.tags) ? article.tags.join(' ') : (article.tags || '')).toLowerCase();

      // Direct phrase match
      if (title.includes(q)) score += 15;
      if (desc.includes(q)) score += 8;
      if (category.includes(q) || heading.includes(q)) score += 6;
      if (tags.includes(q)) score += 5;
      if (content.includes(q)) score += 3;

      // Word matches
      words.forEach(w => {
        if (title.includes(w)) score += 5;
        if (desc.includes(w)) score += 3;
        if (category.includes(w) || heading.includes(w)) score += 3;
        if (tags.includes(w)) score += 2;
        if (content.includes(w)) score += 1;
      });

      // Semantic phrase expansion
      searchTerms.forEach(term => {
        if (term !== q) {
          if (title.includes(term)) score += 3;
          if (desc.includes(term)) score += 2;
          if (category.includes(term) || heading.includes(term)) score += 2;
        }
      });

      return { article, score };
    });

    const results = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.article);

    setMatchingArticles(results);
  }, [searchQuery, publishedArticles]);

  const getCategoryLabel = (categoryId) => {
    const topic = topics.find(t => t.id === categoryId);
    return topic ? topic.title : (categoryId || 'PERSPECTIVE').toUpperCase();
  };

  const handleOpenArticle = (art) => {
    sessionStorage.setItem('library_scroll_position', window.scrollY.toString());
    navigate(`/articles?category=${art.categoryId}&subCategory=${art.headingId}&article=${art._id}`);
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

  return (
    <div className={`w-full min-h-screen bg-[#050505] overflow-x-hidden text-white select-none transition-opacity duration-700 ease-in-out ${isRestoringScroll ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* SECTION 1: Intro / Hotspot */}
      <section className="relative w-full h-screen overflow-hidden">
        
        {/* Background Layer with Darkening effect on hover */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out"
        style={{
          filter: isHovered ? 'brightness(0.4) contrast(1.1)' : 'brightness(1) contrast(1)'
        }}
      >
        <img 
          src={bgImage} 
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
        className="absolute top-[10%] left-[60%] w-[35%] h-[60%] z-10 pointer-events-none"
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
        className="relative z-10 w-full h-full flex flex-col justify-center px-4 md:px-8 pt-16 pb-12"
      >
        <div className="w-full md:w-[75%] lg:w-[65%] flex flex-col items-start justify-center">
          
          <span className="library-text opacity-0 font-sans text-[0.7rem] md:text-[0.75rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-6 block">
            The Library
          </span>

          <h1 className="font-serif text-5xl md:text-[4.5rem] lg:text-[5rem] text-white tracking-tight leading-[1.05] mb-6">
            <span className="heading-word inline-block opacity-0 -translate-x-4 mr-[0.25em]">What</span>
            <span className="heading-word inline-block opacity-0 -translate-x-4 mr-[0.25em]">are</span>
            <span className="heading-word inline-block opacity-0 -translate-x-4 mr-[0.25em]">you</span>
            <span className="heading-word inline-block opacity-0 -translate-x-4 mr-[0.25em]">trying</span>
            <br className="hidden md:block"/>
            <span className="heading-word inline-block opacity-0 -translate-x-4 mr-[0.25em]">to</span>
            <span className="heading-word inline-block opacity-0 -translate-x-4">understand?</span>
          </h1>

          <div className="hero-content opacity-0 translate-y-4 w-full">
            <p className="font-sans text-white/60 text-lg md:text-xl font-light leading-relaxed mb-12 max-w-lg">
              Articles, videos and reflective tools for the parts of life that are difficult to see clearly while you are living through them.
            </p>

            <div className="w-full max-w-xl">
              <form onSubmit={handleSearchSubmit} className="w-full relative mb-4 group">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Describe what you're facing..."
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

              {/* Dynamic Suggestions Below Search */}
              {searchQuery.trim() ? (
                <div className="w-full mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] flex items-center gap-1.5">
                      <Sparkle size={13} weight="fill" />
                      {matchingArticles.length > 0 
                        ? `RELATED PERSPECTIVES (${matchingArticles.length})` 
                        : 'NO DIRECT MATCHES'
                      }
                    </span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-white/40 hover:text-white text-xs font-sans flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                      Clear
                    </button>
                  </div>

                  {matchingArticles.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-[300px] sm:max-h-[340px] overflow-y-auto custom-scrollbar pr-1 overscroll-contain">
                      {matchingArticles.slice(0, 4).map((art) => (
                        <div
                          key={art._id}
                          onClick={() => handleOpenArticle(art)}
                          className="group p-3.5 sm:p-4 rounded-xl border border-[#c79c6e]/25 bg-[#0a0a0a]/90 hover:bg-[#15100a] hover:border-[#c79c6e]/70 transition-all duration-300 backdrop-blur-md cursor-pointer flex flex-col gap-1 shadow-lg shadow-black/50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e]">
                              {getCategoryLabel(art.categoryId)}
                            </span>
                            <div className="flex items-center gap-1 text-[#c79c6e] opacity-0 group-hover:opacity-100 transition-opacity text-xs font-sans font-medium">
                              <span>Read</span>
                              <ArrowRight size={12} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                          <h4 className="font-serif text-base sm:text-lg text-white font-normal group-hover:text-[#c79c6e] transition-colors leading-snug">
                            {art.title}
                          </h4>
                          {art.description && (
                            <p className="text-white/60 text-xs font-light line-clamp-2 leading-relaxed">
                              {art.description}
                            </p>
                          )}
                        </div>
                      ))}
                      {matchingArticles.length > 4 && (
                        <button
                          onClick={handleSearchSubmit}
                          className="text-center py-2 text-xs uppercase tracking-widest font-semibold text-[#c79c6e] hover:text-white transition-colors cursor-pointer"
                        >
                          View all {matchingArticles.length} matching perspectives &rarr;
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-white/10 bg-[#050505]/70 backdrop-blur-md text-center flex flex-col items-center gap-1.5">
                      <p className="text-white/70 text-xs sm:text-sm font-light">
                        No articles directly matching "<span className="text-white font-medium">{searchQuery}</span>".
                      </p>
                      <p className="text-white/40 text-xs font-light">
                        Try: <button onClick={() => setSearchQuery('stuck')} className="text-[#c79c6e] underline hover:text-white">stuck</button>, <button onClick={() => setSearchQuery('relationship')} className="text-[#c79c6e] underline hover:text-white">relationship</button>, <button onClick={() => setSearchQuery('pattern')} className="text-[#c79c6e] underline hover:text-white">pattern</button>, or <button onClick={() => setSearchQuery('decision')} className="text-[#c79c6e] underline hover:text-white">decision</button>.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full">
                  <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-3 block">
                    Not sure where to begin?
                  </span>
                  <div className="flex gap-2.5 md:gap-3 w-full overflow-x-auto no-scrollbar pb-2">
                    {[
                      { label: 'I feel stuck', query: 'stuck' },
                      { label: 'A relationship is confusing me', query: 'relationship' },
                      { label: 'I have a decision to make', query: 'decision' },
                      { label: 'Breaking patterns', query: 'pattern' }
                    ].map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => setSearchQuery(item.query)}
                        className="px-4 py-2.5 md:px-5 md:py-3 border border-[#c79c6e]/30 rounded-lg bg-[#050505]/40 hover:bg-[#c79c6e]/15 hover:border-[#c79c6e]/60 text-white/80 hover:text-white text-xs md:text-sm font-light transition-all duration-300 backdrop-blur-sm whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4">
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]/80">
          Or explore what others often carry
        </span>
        <ArrowDown size={18} className="text-[#c79c6e]/80 animate-bounce" weight="light" />
      </div>


      </section>

      {/* CONTINUOUS BACKGROUND WRAPPER */}
      <div 
        className="relative w-full bg-cover bg-center bg-no-repeat bg-fixed bg-black/40 bg-blend-overlay"
        style={{ backgroundImage: `url(${continuousBg})` }}
      >
        {/* SECTION 2: Featured Perspective */}
      <FeaturedSection />

      {/* SECTION 3: Explore By Situation */}
      <SituationExploreSection />

      {/* SECTION 4: Questions Grid */}
      <QuestionsSection />

      {/* SECTION 5: Explore By Format */}
      <FormatExploreSection />

      {/* SECTION 8: Library Invitation */}
      <LibraryInvitationSection />
      
      {/* SECTION 9: Perspective To Conversation */}
      <PerspectiveToConversationSection />
      </div>

    </div>
  );
}
