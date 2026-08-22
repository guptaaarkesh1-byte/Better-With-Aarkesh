import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  BookmarkSimple,
  PlayCircle
} from '@phosphor-icons/react';

// Placeholders for content thumbnails
import thumb1 from '../../assets/PerspectivePage/recognition/emotional_exhaustion.png';
import thumb2 from '../../assets/PerspectivePage/recognition/comparison.png';
import thumb3 from '../../assets/PerspectivePage/recognition/holding_it_in.png';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export default function SituationExploreSection() {
  const navigate = useNavigate();
  const [situations, setSituations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSituation, setHoveredSituation] = useState(null);
  const [selectedSituation, setSelectedSituation] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/collections/published`);
        const data = await res.json();
        
        const mapped = data.map(col => ({
          id: col._id,
          text: col.title,
          curatedContent: col.items.map((item, idx) => ({
            id: item.itemId || idx,
            categoryId: item.categoryId,
            headingId: item.headingId,
            image: item.image || thumb1,
            type: item.itemType === 'ReflectionTool' ? 'REFLECTION TOOL' : item.itemType.toUpperCase(),
            duration: item.duration || (item.itemType === 'Article' ? '5 MIN' : '10 MIN'),
            title: item.title,
            hasPlay: item.hasPlay || item.itemType === 'Video'
          }))
        }));
        
        // Sync restoration state in same tick
        const savedId = sessionStorage.getItem('library_expanded_id');
        if (savedId) {
          const sit = mapped.find(s => s.id === savedId);
          if (sit) {
            setSelectedSituation(sit);
          }
        }
        
        setSituations(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const [savedArticleIds, setSavedArticleIds] = useState([]);
  useEffect(() => {
    const fetchSaved = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/users/saved-articles`, {
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

  const handleToggleSave = async (articleId, e) => {
    e?.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to save items to your library.");
      return;
    }

    const isCurrentlySaved = savedArticleIds.includes(articleId);
    setSavedArticleIds(prev => 
      isCurrentlySaved ? prev.filter(id => id !== articleId) : [...prev, articleId]
    );

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/users/save-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId }),
      });
      if (!res.ok) {
        setSavedArticleIds(prev => 
          isCurrentlySaved ? [...prev, articleId] : prev.filter(id => id !== articleId)
        );
      }
    } catch (err) {
      console.error(err);
      setSavedArticleIds(prev => 
        isCurrentlySaved ? [...prev, articleId] : prev.filter(id => id !== articleId)
      );
    }
  };

  const containerRef = useRef(null);
  const gridContainerRef = useRef(null);
  const detailContainerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.situation-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }
    )
    .fromTo('.situation-card', 
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.3, 
        stagger: 0.1,
        ease: 'power3.out',
      },
      "-=0.5"
    );
  }, { scope: containerRef });

  const handleSelect = (sit) => {
    if (window.innerWidth < 768) {
      const newSelected = selectedSituation?.id === sit.id ? null : sit;
      if (newSelected) sessionStorage.setItem('library_expanded_id', newSelected.id);
      else sessionStorage.removeItem('library_expanded_id');
      
      setSelectedSituation(newSelected);
      return;
    }

    gsap.to(gridContainerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        sessionStorage.setItem('library_expanded_id', sit.id);
        setSelectedSituation(sit);
        gsap.fromTo(detailContainerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', delay: 0.1 }
        );
      }
    });
  };

  const handleBack = () => {
    sessionStorage.removeItem('library_expanded_id');
    gsap.to(detailContainerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setSelectedSituation(null);
        gsap.fromTo(gridContainerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', delay: 0.1 }
        );
      }
    });
  };

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-32 pb-12 flex flex-col items-center px-6 md:px-16 lg:px-24 border-t border-white/5">
      
      <div className="w-full max-w-5xl flex flex-col flex-1 h-full">
        {/* Header Area */}
        <div className="situation-header mb-12 flex flex-col items-start z-10 opacity-0 w-full relative">
          


          <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4">
            FOR WHAT YOU'RE CARRYING TODAY
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light tracking-tight leading-[1.1] mb-6">
            Begin with the thought<br />
            that keeps returning.
          </h2>

          {/* Subtitle when selected */}
          {selectedSituation && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2">
              <span className="font-sans text-[0.7rem] uppercase tracking-[0.15em] font-medium text-[#c79c6e]">
                {selectedSituation.text.replace(/\n/g, ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="w-full flex-1 relative md:min-h-[500px]">
          
          {/* OVERVIEW (The 6 Cards) */}
          <div ref={gridContainerRef} className={`w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:absolute md:inset-0 ${selectedSituation ? 'md:hidden' : ''}`}>
            {situations.map((sit) => (
                <div 
                  key={sit.id}
                  className={`situation-card relative w-full px-8 py-8 pb-14 md:px-10 md:py-10 md:pb-16 rounded-md bg-[#050505]/60 backdrop-blur-md border flex flex-col items-center justify-center text-center transition-all duration-500 ease-out cursor-pointer z-10
                    ${hoveredSituation === sit.id 
                      ? 'border-[#c79c6e]/80 shadow-[0_0_30px_rgba(199,156,110,0.15)] bg-black scale-[1.01]' 
                      : 'border-white/10 hover:border-white/20'
                    }
                  `}
                  onMouseEnter={() => setHoveredSituation(sit.id)}
                  onMouseLeave={() => setHoveredSituation(null)}
                  onClick={() => handleSelect(sit)}
                >
                  <p className={`font-serif text-[1.15rem] leading-relaxed whitespace-pre-line transition-colors duration-500 ${hoveredSituation === sit.id ? 'text-white' : 'text-white/70'}`}>
                    {sit.text}
                  </p>

                  {/* Bottom Link (Appears on Hover) */}
                  <div className={`hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 overflow-hidden transition-all duration-500 ${hoveredSituation === sit.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-center gap-2 text-[#c79c6e] whitespace-nowrap mt-4">
                      <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">EXPLORE THIS</span>
                      <ArrowRight size={14} weight="bold" />
                    </div>
                  </div>

                  {/* Mobile Accordion Content */}
                  <div 
                    className={`md:hidden grid transition-[grid-template-rows,opacity,margin] duration-500 w-full mt-4 ${
                      selectedSituation?.id === sit.id 
                        ? 'grid-rows-[1fr] opacity-100 mb-8' 
                        : 'grid-rows-[0fr] opacity-0 mb-0'
                    }`}
                    onClick={(e) => e.stopPropagation()} 
                  >
                    <div className="overflow-hidden flex flex-col w-full border-t border-white/10 pt-6 mt-2">
                      <div className="flex flex-col gap-6 w-full text-left">
                        {sit.curatedContent && sit.curatedContent.map((content) => (
                          <div 
                            key={content.id} 
                            className="group cursor-pointer"
                            onClick={() => {
                              if (content.type === 'ARTICLE') {
                                sessionStorage.setItem('library_scroll_position', window.scrollY.toString());
                                if (content.categoryId && content.headingId) {
                                  navigate(`/articles?category=${content.categoryId}&subCategory=${content.headingId}&article=${content.id}`);
                                } else {
                                  navigate(`/articles?article=${content.id}`);
                                }
                              }
                            }}
                          >
                            <div className="w-full aspect-[4/3] bg-[#0a0a0a] rounded-sm border border-white/10 overflow-hidden relative mb-3">
                              <img src={content.image} alt={content.title} className="w-full h-full object-cover opacity-60" />
                              <div className="absolute inset-0 bg-black/40" />
                              {content.hasPlay && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <PlayCircle size={32} weight="light" className="text-white/80" />
                                </div>
                              )}
                              
                              {/* Top Right Bookmark */}
                              <button 
                                onClick={(e) => handleToggleSave(content.id, e)}
                                className="absolute top-3 right-3 z-20 text-white/50 hover:text-[#c79c6e] transition-colors"
                              >
                                <BookmarkSimple size={18} weight={savedArticleIds.includes(content.id) ? "fill" : "light"} />
                              </button>
                            </div>
                            <span className="font-sans text-[0.55rem] uppercase tracking-widest font-semibold text-[#c79c6e] mb-1 block">
                              {content.type}
                            </span>
                            <h4 className="font-serif text-lg text-white/90 font-light leading-snug pr-2">
                              {content.title}
                            </h4>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          {/* DETAILED VIEW (Curated Collection - DESKTOP ONLY) */}
          {selectedSituation && (
            <div ref={detailContainerRef} className="hidden md:flex w-full md:absolute md:inset-0 pt-4 flex-col">
              <div className="mb-6">
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-300 group w-fit"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">BACK</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {selectedSituation.curatedContent && selectedSituation.curatedContent.map((content) => (
                  <div 
                    key={content.id} 
                    className="group cursor-pointer"
                    onClick={() => {
                      if (content.type === 'ARTICLE') {
                        sessionStorage.setItem('library_scroll_position', window.scrollY.toString());
                        if (content.categoryId && content.headingId) {
                          navigate(`/articles?category=${content.categoryId}&subCategory=${content.headingId}&article=${content.id}`);
                        } else {
                          navigate(`/articles?article=${content.id}`);
                        }
                      }
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="w-full aspect-[4/3] bg-[#0a0a0a] rounded-sm border border-white/10 overflow-hidden relative mb-4 transition-all duration-500 group-hover:border-[#c79c6e]/50">
                      <img 
                        src={content.image} 
                        alt={content.title} 
                        className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                      
                      {/* Top Right Bookmark */}
                      <button 
                        onClick={(e) => handleToggleSave(content.id, e)}
                        className="absolute top-4 right-4 z-20 text-white/50 hover:text-[#c79c6e] transition-colors"
                      >
                        <BookmarkSimple size={20} weight={savedArticleIds.includes(content.id) ? "fill" : "light"} />
                      </button>

                      {/* Center Play Icon (if video) */}
                      {content.hasPlay && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle size={40} weight="light" className="text-white/80 group-hover:text-[#c79c6e] group-hover:scale-110 transition-all duration-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <span className="font-sans text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e] mb-2 block">
                      {content.type}
                    </span>
                    <h4 className="font-serif text-[1.25rem] text-white/90 font-light leading-snug group-hover:text-white transition-colors duration-300 pr-4">
                      {content.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Text */}
        <div className="w-full flex justify-center mt-auto pt-16 opacity-70 z-10">
          <div className="flex flex-col items-center gap-3">
          
            <ArrowDown size={14} className="text-[#c79c6e] animate-bounce" weight="light" />
          </div>
        </div>

      </div>
    </section>
  );
}
