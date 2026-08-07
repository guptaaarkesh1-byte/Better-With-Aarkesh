import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from '@phosphor-icons/react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { topics } from '../../components/library/QuestionsSection';
import savedDecisionsImg from '../../assets/PerspectivePage/saved_decisions.png';

const ExpandedArticle = ({ isExpanded }) => {
  const contentRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isExpanded) return;
    
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { top, height } = contentRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much we have scrolled past the container.
      // Progress starts when the top of the container hits the middle of the viewport (windowHeight / 2)
      const startTrigger = windowHeight / 2;
      const scrolled = startTrigger - top;
      
      let p = (scrolled / height) * 100;
      p = Math.max(0, Math.min(100, p));
      setProgress(p);
    };
    
    window.addEventListener('scroll', handleScroll);
    // initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isExpanded]);

  return (
    <div className={`transition-all duration-1000 ease-in-out px-4 ml-4 ${isExpanded ? 'max-h-[10000px] opacity-100 pb-8' : 'max-h-0 opacity-0 pb-0'}`}>
      <div className="relative pl-6 flex flex-col gap-6" ref={contentRef}>
        {/* Background dim bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#c79c6e]/30" />
        {/* Foreground bright bar (Reading Progress) */}
        <div 
          className="absolute left-0 top-0 w-[2px] bg-[#c79c6e] shadow-[0_0_10px_rgba(199,156,110,0.8)]" 
          style={{ height: `${progress}%`, transition: 'none' }} 
        />
        
        {Array.from({ length: 15 }).map((_, i) => (
          <p key={i} className="font-sans text-base md:text-lg text-white/70 leading-relaxed font-light">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        ))}
      </div>
    </div>
  );
};

export default function Articles() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const viewParam = searchParams.get('view');
  const categoryParam = searchParams.get('category');
  const initialCategory = topics.find(t => t.id === categoryParam) || topics[0];

  // step: 0 = Master List, 1 = Subcategories, 2 = Specific Topics
  const [step, setStep] = useState(viewParam === 'all' ? 0 : 1);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  
  // Track which sub-point is hovered in the master list view
  const [hoveredSubPoint, setHoveredSubPoint] = useState(null);
  const [expandedPathway, setExpandedPathway] = useState(null);
  
  const containerRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (searchParams.get('view') === 'all') {
      setStep(0);
      return;
    }
    const newCategory = topics.find(t => t.id === searchParams.get('category'));
    if (newCategory) {
      setActiveCategory(newCategory);
      setStep(1);
      setSelectedSubCategory(null);
    }
  }, [searchParams]);

  const handleNextStep = (subCategory) => {
    lastScrollY.current = window.scrollY;
    gsap.to('.step-content', {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => {
        setSelectedSubCategory(subCategory);
        setExpandedPathway(null);
        setStep(2);
        window.scrollTo(0, 0); // scroll to top for the new article
        gsap.fromTo('.step-content',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    });
  };

  const handleSelectFromMaster = (category, subCategory, pathwayIndex = null) => {
    lastScrollY.current = window.scrollY;
    gsap.to('.step-content', {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => {
        setActiveCategory(category);
        setSelectedSubCategory(subCategory);
        setExpandedPathway(null); // Ensure everything is closed initially
        setStep(2);
        if (pathwayIndex === null) window.scrollTo(0, 0); // Scroll to top if no specific pathway
        gsap.fromTo('.step-content',
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.4, 
            ease: 'power2.out',
            onComplete: () => {
              if (pathwayIndex !== null) {
                setTimeout(() => {
                  const el = document.getElementById(`pathway-${pathwayIndex}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Optional flash effect
                    gsap.fromTo(el, { backgroundColor: 'rgba(199,156,110,0.2)' }, { backgroundColor: 'transparent', duration: 1.5 });
                  }
                }, 100);
              }
            }
          }
        );
      }
    });
  };

  const handleBack = () => {
    if (step === 0 || step === 1) {
      navigate('/library'); 
      return;
    }
    gsap.to('.step-content', {
      opacity: 0,
      y: 20,
      duration: 0.3,
      onComplete: () => {
        setSelectedSubCategory(null);
        setExpandedPathway(null);
        // If we came from view=all and we go back from the article, go back to master list. 
        // Otherwise go to category list (step 1)
        setStep(searchParams.get('view') === 'all' ? 0 : 1);
        
        // Wait a tick for React to render the previous list, then restore scroll position
        setTimeout(() => {
          window.scrollTo({ top: lastScrollY.current, behavior: 'instant' });
        }, 10);

        gsap.fromTo('.step-content',
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans text-white relative">
      
      {/* Dynamic Background Image for specific categories */}
      {(step === 1 || step === 2) && activeCategory?.id === 'relationships' && (
        <div className="fixed inset-0 z-0 pointer-events-none animate-in fade-in duration-1000">
          <img 
            src={savedDecisionsImg} 
            alt="Relationships Background" 
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-[#050505]/40" />
        </div>
      )}

      <div className="relative z-10 flex flex-col w-full h-full flex-1">
        <Navbar />
        
        <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6" ref={containerRef}>
        
        <div className="w-full md:w-[80%] max-w-6xl relative min-h-[400px] flex items-center justify-center">
          
          {/* STEP 0: Master List View */}
          {step === 0 && (
            <div className="step-content w-full mx-auto flex flex-col pt-8">
              <div className="mb-12 w-full flex flex-col items-center text-center pb-8 border-b border-white/10 relative">
                <button 
                  onClick={handleBack}
                  className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 rounded-full hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                >
                  <ArrowLeft size={20} weight="light" />
                </button>
                <span className="font-sans text-[0.7rem] uppercase tracking-[0.25em] font-medium text-[#c79c6e] mb-4">
                  THE COMPLETE LIBRARY
                </span>
                <h1 className="font-serif text-4xl text-white font-light">
                  All 24 Perspectives
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                {topics.map((cat) => (
                  <div key={cat.id} className="flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <cat.icon size={24} className="text-[#c79c6e]" weight="light" />
                      <h2 className="font-sans text-[0.85rem] uppercase tracking-[0.25em] font-medium text-[#c79c6e]">
                        {cat.title}
                      </h2>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {cat.subItems.map((sub, idx) => {
                        const isHovered = hoveredSubPoint === `${cat.id}-${idx}`;
                        return (
                          <div 
                            key={idx}
                            className="w-full flex flex-col border-b border-white/5 group cursor-pointer"
                            onMouseEnter={() => setHoveredSubPoint(`${cat.id}-${idx}`)}
                            onMouseLeave={() => setHoveredSubPoint(null)}
                          >
                            <button
                              onClick={() => handleSelectFromMaster(cat, sub)}
                              className="w-full flex items-center justify-between py-5 text-left transition-colors"
                            >
                              <span className="font-sans text-base md:text-lg font-light transition-colors text-white/80 group-hover:text-[#c79c6e]">
                                {sub.title}
                              </span>
                              <ArrowRight size={18} className="text-white/20 transition-all duration-300 group-hover:text-[#c79c6e] group-hover:translate-x-2" weight="light" />
                            </button>
                            
                            <div 
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${isHovered ? 'max-h-[200px] opacity-100 mb-5' : 'max-h-0 opacity-0'}`}
                            >
                              <div className="flex flex-col gap-3 pl-5 border-l-2 border-[#c79c6e]/30 ml-2">
                                {sub.pathways.map((pathway, pIdx) => (
                                  <span 
                                    key={pIdx} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectFromMaster(cat, sub, pIdx);
                                    }}
                                    className="font-sans text-sm text-white/60 font-light leading-relaxed hover:text-white transition-colors cursor-pointer"
                                  >
                                    {pathway}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: Subcategories List */}
          {step === 1 && (
            <div className="step-content w-full max-w-4xl mx-auto flex flex-col">
              <div className="mb-8 w-full flex items-center gap-4 border-b border-white/10 pb-6">
                <button 
                  onClick={handleBack}
                  className="flex items-center justify-center p-2 rounded-full hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                >
                  <ArrowLeft size={20} weight="light" />
                </button>
                <div className="flex flex-col">
                  <span className="font-sans text-[0.7rem] uppercase tracking-[0.25em] font-medium text-[#c79c6e] mb-2 flex items-center gap-2">
                    <activeCategory.icon size={16} /> {activeCategory.title}
                  </span>
                  <h2 className="font-sans text-base text-white/90 font-light">
                    Not every difficult {activeCategory.id.toLowerCase().replace(/s$/, '')} needs the same question.
                  </h2>
                </div>
              </div>

              <div className="flex flex-col w-full">
                {activeCategory.subItems.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNextStep(sub)}
                    className="w-full flex items-center gap-4 py-5 border-b border-white/5 hover:border-[#c79c6e]/30 group transition-colors text-left"
                  >
                    <ArrowRight size={16} className="text-white/30 group-hover:text-[#c79c6e] transition-colors" weight="light" />
                    <span className="font-sans text-sm font-light text-white/80 group-hover:text-white transition-colors">
                      {sub.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Topics List */}
          {step === 2 && selectedSubCategory && (
            <div className="step-content w-full max-w-5xl mx-auto flex flex-col">
              <div className="mb-8 w-full flex items-center gap-4 pb-4 border-b border-white/10">
                <button 
                  onClick={handleBack}
                  className="flex items-center justify-center p-2 rounded-full hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                >
                  <ArrowLeft size={20} weight="light" />
                </button>
                <div className="flex flex-col">
                  <span className="font-sans text-[0.65rem] uppercase tracking-[0.25em] font-medium text-white/50 mb-1">
                    {activeCategory.title}
                  </span>
                  <h2 className="font-sans text-[0.7rem] uppercase tracking-[0.25em] font-medium text-[#c79c6e]">
                    {selectedSubCategory.title}
                  </h2>
                </div>
              </div>

              <div className="flex flex-col gap-6 w-full pt-4">
                {selectedSubCategory.pathways.map((pathway, idx) => {
                  const isExpanded = expandedPathway === idx;
                  return (
                    <div 
                      key={idx} 
                      id={`pathway-${idx}`} 
                      className={`flex flex-col rounded-md transition-all duration-500 overflow-hidden ${isExpanded ? 'bg-[#0a0a0a] shadow-2xl border border-white/10' : 'bg-transparent border-b border-white/5'}`}
                    >
                      <button 
                        onClick={() => setExpandedPathway(isExpanded ? null : idx)}
                        className="w-full flex items-center justify-between py-6 px-4 text-left hover:bg-white/5 transition-colors group"
                      >
                        <h3 className={`font-serif text-2xl font-light border-l-2 pl-4 transition-colors ${isExpanded ? 'border-[#c79c6e] text-white' : 'border-transparent text-white/80 group-hover:text-white'}`}>
                          {pathway}
                        </h3>
                        <div className="flex items-center gap-2 text-[#c79c6e] opacity-80 group-hover:opacity-100 transition-opacity">
                          <span className="font-sans text-[0.65rem] uppercase tracking-widest font-medium">
                            {isExpanded ? 'CLOSE' : 'READ'}
                          </span>
                        </div>
                      </button>
                      
                      <ExpandedArticle isExpanded={isExpanded} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>
      </div>

      {/* Fixed bottom gradient to fade text as it approaches the bottom of the screen */}
      <div className="fixed bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pointer-events-none z-40" />

      <div className="relative z-50">
        <Footer />
      </div>
    </div>
  );
}
