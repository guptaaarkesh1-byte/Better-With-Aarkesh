import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { BookmarkSimple, ClockCounterClockwise, Notepad, ArrowRight, Target, Stack, Recycle } from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

export default function LibraryInvitationSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [savedArticles, setSavedArticles] = useState([]);
  const [publishedArticles, setPublishedArticles] = useState([]);
  const navigate = useNavigate();
  
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Fetch saved articles
      fetch(`${apiUrl}/api/users/saved-articles`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setSavedArticles(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching saved articles:', err));

      // Fetch all published articles for 'Continue' and 'Recently Viewed' fallbacks
      fetch(`${apiUrl}/api/articles/published`)
      .then(res => res.json())
      .then(data => setPublishedArticles(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching published articles:', err));
    }
  }, []);

  const [continueArticle, setContinueArticle] = useState(null);
  const [continueProgress, setContinueProgress] = useState(0);
  const [recentArticle, setRecentArticle] = useState(null);

  useEffect(() => {
    if (publishedArticles.length > 0) {
      let foundContinue = null;
      let highestProgress = 0;
      
      for (const article of publishedArticles) {
        try {
          const savedStr = localStorage.getItem(`article_progress_${article._id}`);
          if (savedStr) {
            const parsed = JSON.parse(savedStr);
            if (parsed.percentage > 0 && parsed.percentage < 100) {
               foundContinue = article;
               highestProgress = parsed.percentage;
               break; // Stop at the first one we find that is in progress
            }
          }
        } catch(e) {}
      }
      
      if (foundContinue) {
        setContinueArticle(foundContinue);
        setContinueProgress(highestProgress);
      } else {
        setContinueArticle(publishedArticles[0]);
        setContinueProgress(0);
      }
      
      setRecentArticle(publishedArticles.length > 1 ? publishedArticles[1] : publishedArticles[0]);
    }
  }, [publishedArticles]);

  const displaySaved = savedArticles.slice(0, 2);

  const navigateToArticle = (article) => {
    if (!article || !article._id) return;
    sessionStorage.setItem('library_scroll_position', window.scrollY.toString());
    navigate(`/articles?category=${article.categoryId}&subCategory=${article.headingId}&article=${article._id}`);
  };

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.invitation-elem', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: 'power3.out' }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-32 pb-32 flex flex-col items-center px-6 md:px-16 lg:px-24 border-t border-white/5">
      
      <div ref={contentRef} className="w-full max-w-5xl flex flex-col w-full h-full relative">
        
        {!isLoggedIn ? (
          // STATE 1: NOT LOGGED IN
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-12 lg:gap-24 w-full mt-12">
            
            {/* Left Column: Text */}
            <div className="w-full md:w-1/2 flex flex-col items-start invitation-elem">
              <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4">
                CONTINUE EXPLORING
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light tracking-tight leading-[1.1] mb-6">
                Keep what deserves<br />
                another look.
              </h2>
              <p className="font-sans text-[0.8rem] font-light leading-relaxed text-white/60 max-w-sm">
                Create My Library to save Perspectives, return to unfinished content, and keep notes worth revisiting.
              </p>
            </div>

            {/* Right Column: Card */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-end invitation-elem relative">
              <div 
                className={`w-full max-w-md rounded-md bg-[#050505]/60 backdrop-blur-md border p-8 flex flex-col transition-all duration-500 z-10 relative
                  ${isHovered ? 'border-[#c79c6e]/80 shadow-[0_0_30px_rgba(199,156,110,0.1)]' : 'border-white/10'}
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Features List */}
                <div className="flex flex-col gap-6 mb-10">
                  <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#c79c6e]">
                      <BookmarkSimple size={18} weight="light" />
                    </div>
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium text-white/80">SAVE PERSPECTIVES</span>
                  </div>
                  
                  <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#c79c6e]">
                      <ClockCounterClockwise size={18} weight="light" />
                    </div>
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium text-white/80">CONTINUE WHERE YOU LEFT OFF</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#c79c6e]">
                      <Notepad size={18} weight="light" />
                    </div>
                    <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium text-white/80">KEEP PRIVATE NOTES</span>
                  </div>
                </div>

                {/* Buttons */}
                <button 
                  onClick={() => navigate('/register')}
                  className={`w-full py-4 rounded-sm border transition-all duration-500 mb-4 font-sans text-[0.65rem] uppercase tracking-widest font-semibold
                    ${isHovered 
                      ? 'border-transparent text-black bg-gradient-to-r from-[#c79c6e] via-[#e6c49a] to-[#c79c6e] shadow-[0_0_20px_rgba(199,156,110,0.3)]' 
                      : 'border-[#c79c6e] text-[#c79c6e] bg-transparent hover:bg-[#c79c6e]/5'
                    }
                  `}
                >
                  CREATE MY LIBRARY
                </button>
                
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full py-2 font-sans text-[0.65rem] uppercase tracking-widest font-medium text-[#c79c6e] hover:text-white transition-colors"
                >
                  SIGN IN
                </button>
              </div>
              
              {/* Tooltip Text below card */}
              <div className={`absolute -bottom-10 right-0 w-full max-w-md text-center transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                <span className="font-serif text-[0.8rem] italic text-white/40">
                  Your Library grows only with what you choose to keep.
                </span>
              </div>
            </div>

          </div>
        ) : (
          // STATE 2: LOGGED IN (MY LIBRARY PREVIEW)
          <div className="flex flex-col w-full">
            
            {/* Header */}
            <div className="flex flex-col items-start mb-12">
              <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4">
                WELCOME BACK
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light tracking-tight leading-[1.1]">
                Continue from where you left it.
              </h2>
            </div>

            {/* 3-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr] gap-6 items-start">
              
              {/* Column 1: Continue */}
              <div className="flex flex-col gap-4">
                <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-[#c79c6e]">CONTINUE</span>
                <div 
                  className="w-full p-8 rounded-md bg-[#050505]/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors cursor-pointer flex flex-col justify-between min-h-[220px]"
                  onClick={() => navigateToArticle(continueArticle)}
                >
                  
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full border border-white/5 bg-black flex items-center justify-center shrink-0 text-white/30 overflow-hidden relative">
                       {continueArticle?.featuredImage ? (
                         <img src={continueArticle.featuredImage} alt={continueArticle.title} className="w-full h-full object-cover opacity-60" />
                       ) : (
                         <Target size={40} weight="thin" className="text-[#c79c6e]/40" />
                       )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-serif text-[1.2rem] text-white/90">{continueArticle?.title || 'The Thinking Cycle'}</h4>
                      <span className="font-sans text-[0.6rem] uppercase tracking-widest text-white/40">{continueArticle ? `A Perspective on ${continueArticle.categoryTitle}` : 'A Perspective on Awareness'}</span>
                    </div>
                  </div>

                  <div className="w-full flex flex-col gap-2 mt-auto">
                    <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                      <div 
                        className="absolute top-0 left-0 h-full bg-[#c79c6e] transition-all duration-1000" 
                        style={{ width: `${continueProgress}%` }}
                      />
                    </div>
                    <div className="w-full flex justify-end">
                      <span className="font-sans text-[0.65rem] text-white/50">{continueProgress}%</span>
                    </div>
                  </div>

                </div>
                
                <button 
                  onClick={() => navigate('/my-journey')}
                  className="flex items-center justify-center gap-3 px-8 py-4 mt-2 bg-transparent border border-[#c79c6e] rounded-sm hover:bg-[#c79c6e]/10 transition-colors w-fit group"
                >
                  <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-[#c79c6e]">VIEW MY LIBRARY</span>
                  <ArrowRight size={14} weight="bold" className="text-[#c79c6e] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Column 2: Saved */}
              <div className="flex flex-col gap-4">
                <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-[#c79c6e]">SAVED</span>
                <div className="flex flex-col gap-4">
                  {displaySaved.length > 0 ? (
                    displaySaved.map((item, idx) => (
                      <div 
                        key={item._id || idx}
                        className="w-full p-5 rounded-md bg-[#050505]/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors cursor-pointer flex items-center gap-4"
                        onClick={() => navigateToArticle(item)}
                      >
                        <div className="w-12 h-12 rounded-full border border-white/5 bg-black flex items-center justify-center shrink-0 overflow-hidden relative">
                          {item.featuredImage ? (
                            <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover opacity-60" />
                          ) : (
                            <Stack size={20} weight="thin" className="text-[#c79c6e]/40" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="font-serif text-[1rem] text-white/90 leading-tight">{item.title}</h4>
                          <span className="font-sans text-[0.55rem] uppercase tracking-widest text-white/40">A Perspective on {item.categoryTitle}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full p-5 rounded-md bg-[#050505]/60 backdrop-blur-md border border-white/10 flex items-center justify-center min-h-[100px]">
                      <span className="font-sans text-[0.65rem] uppercase tracking-widest text-white/30 text-center">No saved perspectives yet</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Recently Viewed */}
              <div className="flex flex-col gap-4">
                <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-[#c79c6e]">RECENTLY VIEWED</span>
                <div 
                  className="w-full p-5 rounded-md bg-[#050505]/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors cursor-pointer flex items-center gap-4"
                  onClick={() => navigateToArticle(recentArticle)}
                >
                  <div className="w-12 h-12 rounded-full border border-white/5 bg-black flex items-center justify-center shrink-0 overflow-hidden relative">
                    {recentArticle?.featuredImage ? (
                      <img src={recentArticle.featuredImage} alt={recentArticle.title} className="w-full h-full object-cover opacity-60" />
                    ) : (
                      <Target size={20} weight="thin" className="text-[#c79c6e]/40" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-serif text-[1rem] text-white/90 leading-tight">{recentArticle?.title || 'Patterns in Mind'}</h4>
                    <span className="font-sans text-[0.55rem] uppercase tracking-widest text-white/40">{recentArticle ? `A Perspective on ${recentArticle.categoryTitle}` : 'A Perspective on Habits'}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
