import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  BookmarkSimple, 
  ArrowRight,
  ArrowDown
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedSection() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [article, setArticle] = useState(null);
  const [savedArticleIds, setSavedArticleIds] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchArticleAndSaves = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        // Fetch published articles
        const resArticles = await fetch(`${apiUrl}/api/articles/published`);
        if (resArticles.ok) {
          const data = await resArticles.json();
          if (data.length > 0) {
            // Pick a random article or the first one. Let's just pick the first one for consistency.
            setArticle(data[0]);
          }
        }

        // Fetch saves if logged in
        const token = localStorage.getItem('token');
        if (token) {
          const resSaves = await fetch(`${apiUrl}/api/users/saved-articles`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resSaves.ok) {
            const dataSaves = await resSaves.json();
            setSavedArticleIds(dataSaves.map(a => typeof a === 'object' ? a._id : a));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchArticleAndSaves();
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

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      }
    });

    tl.fromTo('.featured-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }
    )
    .fromTo('.featured-card', 
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.3, 
        ease: 'power3.out',
      },
      "+=0.2"
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-transparent pt-32 pb-12 flex flex-col items-center justify-center px-6 md:px-16 lg:px-24">
      
      {/* Header */}
      <div className="featured-header mb-12 flex flex-col items-center text-center z-10 opacity-0 max-w-3xl">
        <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-4">
          A PLACE TO BEGIN
        </span>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white font-light tracking-tight leading-[1.1]">
          If you are not sure where to start, begin with one question worth sitting with.
        </h2>
      </div>

      {/* Featured Card */}
      {article && (
        <div 
          className={`featured-card relative w-full max-w-xl mx-auto p-8 md:p-10 rounded-md bg-[#050505]/80 backdrop-blur-md border transition-all duration-500 ease-out cursor-pointer z-10
            ${isHovered 
              ? 'border-[#c79c6e]/80 shadow-[0_0_30px_rgba(199,156,110,0.15)] bg-black' 
              : 'border-white/10 hover:border-white/20'
            }
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => {
            sessionStorage.setItem('library_scroll_position', window.scrollY.toString());
            navigate(`/articles?category=${article.categoryId}&subCategory=${article.headingId}&article=${article._id}`);
          }}
        >
        {/* Top row */}
        <div className="flex items-start justify-between mb-8">
          <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-widest font-semibold text-[#c79c6e]">
            ARTICLE
          </span>
          <button 
            className="flex items-center gap-3 group z-20"
            onClick={(e) => handleToggleSave(article._id, e)}
          >
            {savedArticleIds.includes(article._id) && (
              <span className="font-sans text-[0.55rem] uppercase tracking-widest font-medium text-[#c79c6e] text-right leading-tight animate-in fade-in slide-in-from-right-2">
                SAVED TO<br/>MY LIBRARY
              </span>
            )}
            <BookmarkSimple 
              size={22} 
              weight={savedArticleIds.includes(article._id) ? "fill" : "regular"} 
              className={`transition-colors ${savedArticleIds.includes(article._id) ? 'text-[#c79c6e]' : 'text-white/50 group-hover:text-[#c79c6e]'}`} 
            />
          </button>
        </div>

        {/* Title */}
        <h3 className="font-serif text-3xl md:text-4xl text-white font-light leading-tight mb-8">
          {article.title}
        </h3>

        <div className="w-full h-[1px] bg-white/10 mb-8" />

        {/* Description */}
        <p className={`font-sans text-xs md:text-sm font-light leading-relaxed transition-colors duration-500 line-clamp-3 ${isHovered ? 'text-white/90' : 'text-white/10'}`}>
          {article.description}
        </p>

        {/* Bottom Link (Appears on Hover) */}
        <div className={`overflow-hidden transition-all duration-500 ${isHovered ? 'max-h-12 opacity-100 mt-8' : 'max-h-0 opacity-0 mt-0'}`}>
          <div className="flex items-center gap-2 text-[#c79c6e]">
            <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">OPEN PERSPECTIVE</span>
            <ArrowRight size={14} weight="bold" />
          </div>
        </div>
      </div>
      )}

      {/* Footer Text */}
      <div className="mt-16 flex flex-col items-center gap-3 z-10 opacity-70">
      
        <ArrowDown size={14} className="text-[#c79c6e] animate-bounce" weight="light" />
      </div>

    </section>
  );
}
