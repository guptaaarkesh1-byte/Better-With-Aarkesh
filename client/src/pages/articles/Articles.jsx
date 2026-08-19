import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft } from '@phosphor-icons/react';
import gsap from 'gsap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import { topics } from '../../constants/articleTaxonomy';
import savedDecisionsImg from '../../assets/PerspectivePage/saved_decisions.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ExpandedArticle = ({ article, isExpanded }) => {
  const contentRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isExpanded || !article) {
      return undefined;
    }

    const handleScroll = () => {
      if (!contentRef.current) {
        return;
      }

      const { top, height } = contentRef.current.getBoundingClientRect();
      const startTrigger = window.innerHeight / 2;
      const scrolled = startTrigger - top;
      const nextProgress = Math.max(0, Math.min(100, (scrolled / Math.max(height, 1)) * 100));
      setProgress(nextProgress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [article, isExpanded]);

  return (
    <div className={`transition-all duration-1000 ease-in-out px-4 ml-4 ${isExpanded ? 'max-h-[20000px] opacity-100 pb-8' : 'max-h-0 opacity-0 pb-0'}`}>
      <div className="relative pl-6 flex flex-col gap-8" ref={contentRef}>
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#c79c6e]/30" />
        <div
          className="absolute left-0 top-0 w-[2px] bg-[#c79c6e] shadow-[0_0_10px_rgba(199,156,110,0.8)]"
          style={{ height: `${progress}%`, transition: 'none' }}
        />

        {article.featuredImage && (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full max-h-[420px] object-cover rounded-sm border border-white/10"
          />
        )}

        {article.description && (
          <p className="font-sans text-lg text-white/60 leading-relaxed font-light">
            {article.description}
          </p>
        )}

        <div
          className="prose prose-invert prose-lg max-w-none font-sans text-white/75 prose-headings:font-serif prose-headings:text-white prose-p:leading-relaxed prose-li:text-white/75"
          dangerouslySetInnerHTML={{
            __html:
              article.bodyHtml ||
              '<p>This article has been published, but the body content is still empty.</p>',
          }}
        />
      </div>
    </div>
  );
};

export default function Articles() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const viewParam = searchParams.get('view');
  const categoryParam = searchParams.get('category');
  const initialCategory = topics.find((topic) => topic.id === categoryParam) || topics[0];

  const [step, setStep] = useState(viewParam === 'all' ? 0 : 1);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [hoveredSubPoint, setHoveredSubPoint] = useState(null);
  const [expandedArticleId, setExpandedArticleId] = useState(null);
  const containerRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);

      try {
        const res = await fetch(`${API_URL}/api/articles/published`);
        if (!res.ok) {
          throw new Error('Failed to fetch published articles');
        }

        const data = await res.json();
        setPublishedArticles(data);
      } catch (fetchError) {
        console.error(fetchError);
        setError('Unable to load articles right now.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    if (searchParams.get('view') === 'all') {
      setStep(0);
      setSelectedSubCategory(null);
      setExpandedArticleId(null);
      return;
    }

    const nextCategory = topics.find((topic) => topic.id === searchParams.get('category'));
    if (nextCategory) {
      setActiveCategory(nextCategory);
      setSelectedSubCategory(null);
      setExpandedArticleId(null);
      setStep(1);
    }
  }, [searchParams]);

  const getArticlesForSubCategory = (categoryId, subCategoryId) =>
    publishedArticles.filter(
      (article) => article.categoryId === categoryId && article.headingId === subCategoryId
    );

  const handleNextStep = (subCategory) => {
    lastScrollY.current = window.scrollY;
    gsap.to('.step-content', {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => {
        setSelectedSubCategory(subCategory);
        setExpandedArticleId(null);
        setStep(2);
        window.scrollTo(0, 0);
        gsap.fromTo(
          '.step-content',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
      },
    });
  };

  const handleSelectFromMaster = (category, subCategory, articleId = null) => {
    lastScrollY.current = window.scrollY;
    gsap.to('.step-content', {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => {
        setActiveCategory(category);
        setSelectedSubCategory(subCategory);
        setExpandedArticleId(articleId);
        setStep(2);
        window.scrollTo(0, 0);
        gsap.fromTo(
          '.step-content',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
      },
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
        setExpandedArticleId(null);
        setStep(searchParams.get('view') === 'all' ? 0 : 1);

        setTimeout(() => {
          window.scrollTo({ top: lastScrollY.current, behavior: 'instant' });
        }, 10);

        gsap.fromTo(
          '.step-content',
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
      },
    });
  };

  const selectedArticles = selectedSubCategory
    ? getArticlesForSubCategory(activeCategory.id, selectedSubCategory.id)
    : [];
  const expandedArticle =
    selectedArticles.find((article) => article._id === expandedArticleId) || null;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans text-white relative">
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
        <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6" ref={containerRef}>
          <div className="w-full md:w-[80%] max-w-6xl relative min-h-[400px] flex items-center justify-center">
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
                  <h1 className="font-serif text-4xl text-white font-light">Published Perspectives</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                  {topics.map((category) => (
                    <div key={category.id} className="flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <category.icon size={24} className="text-[#c79c6e]" weight="light" />
                        <h2 className="font-sans text-[0.85rem] uppercase tracking-[0.25em] font-medium text-[#c79c6e]">
                          {category.title}
                        </h2>
                      </div>

                      <div className="flex flex-col gap-2">
                        {category.subItems.map((subCategory, idx) => {
                          const isHovered = hoveredSubPoint === `${category.id}-${idx}`;
                          const articles = getArticlesForSubCategory(category.id, subCategory.id);

                          return (
                            <div
                              key={subCategory.id}
                              className="w-full flex flex-col border-b border-white/5 group cursor-pointer"
                              onMouseEnter={() => setHoveredSubPoint(`${category.id}-${idx}`)}
                              onMouseLeave={() => setHoveredSubPoint(null)}
                            >
                              <button
                                onClick={() => handleSelectFromMaster(category, subCategory)}
                                className="w-full flex items-center justify-between py-5 text-left transition-colors"
                              >
                                <span className="font-sans text-base md:text-lg font-light transition-colors text-white/80 group-hover:text-[#c79c6e]">
                                  {subCategory.title}
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="text-white/30 text-xs uppercase tracking-[0.2em]">
                                    {articles.length} Live
                                  </span>
                                  <ArrowRight size={18} className="text-white/20 transition-all duration-300 group-hover:text-[#c79c6e] group-hover:translate-x-2" weight="light" />
                                </div>
                              </button>

                              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isHovered ? 'max-h-[240px] opacity-100 mb-5' : 'max-h-0 opacity-0'}`}>
                                <div className="flex flex-col gap-3 pl-5 border-l-2 border-[#c79c6e]/30 ml-2">
                                  {articles.length > 0 ? (
                                    articles.map((article) => (
                                      <span
                                        key={article._id}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          handleSelectFromMaster(category, subCategory, article._id);
                                        }}
                                        className="font-sans text-sm text-white/60 font-light leading-relaxed hover:text-white transition-colors cursor-pointer"
                                      >
                                        {article.title}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="font-sans text-sm text-white/35 font-light leading-relaxed">
                                      No published articles in this chapter yet.
                                    </span>
                                  )}
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
                      Choose the chapter where you want to read.
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col w-full">
                  {activeCategory.subItems.map((subCategory) => {
                    const articles = getArticlesForSubCategory(activeCategory.id, subCategory.id);

                    return (
                      <button
                        key={subCategory.id}
                        onClick={() => handleNextStep(subCategory)}
                        className="w-full flex items-center gap-4 py-5 border-b border-white/5 hover:border-[#c79c6e]/30 group transition-colors text-left"
                      >
                        <ArrowRight size={16} className="text-white/30 group-hover:text-[#c79c6e] transition-colors" weight="light" />
                        <div className="flex-1 flex items-center justify-between gap-4">
                          <span className="font-sans text-sm font-light text-white/80 group-hover:text-white transition-colors">
                            {subCategory.title}
                          </span>
                          <span className="text-[0.65rem] uppercase tracking-[0.25em] text-white/30">
                            {articles.length} Published
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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

                {error && (
                  <div className="mb-6 p-4 rounded border border-red-500/20 bg-red-500/10 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                {isLoading ? (
                  <div className="py-20 text-center text-white/40">Loading articles...</div>
                ) : selectedArticles.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-white/10 rounded-sm text-white/35">
                    No published articles found here yet.
                  </div>
                ) : (
                  <>
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-4 transition-all duration-500 ${expandedArticle ? 'hidden' : 'block'}`}>
                      {selectedArticles.map((article) => (
                        <div
                          key={article._id}
                          className="flex flex-col h-full transition-all duration-500 overflow-hidden cursor-pointer group hover:-translate-y-2"
                          onClick={() => {
                            setExpandedArticleId(article._id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          <div className="flex flex-col bg-[#111111] border border-white/5 text-white w-full relative h-full rounded-sm">
                            <div className="p-6 md:p-8 flex flex-col flex-1">
                              <div className="flex justify-between items-center mb-6">
                                <div className="bg-white/10 border border-white/5 px-3 py-1.5 rounded-sm text-[0.65rem] font-bold tracking-widest text-white/80 shadow-sm uppercase">
                                  {article.readTime || 'Article'}
                                </div>
                                <div className="text-[0.7rem] font-bold text-[#c79c6e] uppercase tracking-wider">
                                  Read
                                </div>
                              </div>
                              <h3 className="font-serif text-2xl md:text-3xl font-bold uppercase leading-[1.1] mb-4 text-white/90">
                                {article.title}
                              </h3>
                              <p className="font-sans text-sm text-white/50 font-light leading-relaxed mt-auto">
                                {article.description || 'Open the article to read the full perspective.'}
                              </p>
                            </div>

                            <div className="relative h-8 w-full bg-[#111111] flex items-center justify-center z-10 border-x border-white/5">
                              <div className="w-[calc(100%-32px)] border-t-[2px] border-dashed border-white/10"></div>
                              <div className="absolute left-[-16px] w-8 h-8 bg-[#050505] rounded-full border border-white/5"></div>
                              <div className="absolute right-[-16px] w-8 h-8 bg-[#050505] rounded-full border border-white/5"></div>
                            </div>

                            <div className="w-full h-[200px] md:h-[240px] bg-[#111111] overflow-hidden p-4 pt-0 border-x border-b border-white/5 rounded-b-sm">
                              {article.featuredImage ? (
                                <img
                                  src={article.featuredImage}
                                  className="w-full h-full object-cover rounded-sm grayscale-[0.2] contrast-[1.1] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                  alt={article.title}
                                />
                              ) : (
                                <div className="w-full h-full rounded-sm border border-dashed border-white/10 flex items-center justify-center text-white/25 text-xs uppercase tracking-[0.25em]">
                                  No image
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {expandedArticle && (
                      <div className="w-full mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="mb-12 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-white/10 pb-8">
                          <div className="flex flex-col gap-4">
                            <button
                              onClick={() => setExpandedArticleId(null)}
                              className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-sans tracking-widest uppercase transition-colors w-fit group"
                            >
                              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                              Back to Articles
                            </button>
                            <div>
                              <div className="flex items-center gap-3 text-[#c79c6e] text-xs uppercase tracking-widest font-sans mb-4 mt-4">
                                <span>{activeCategory.title}</span>
                                <span className="opacity-50">/</span>
                                <span>{selectedSubCategory.title}</span>
                                {expandedArticle.readTime && (
                                  <>
                                    <span className="opacity-50">/</span>
                                    <span>{expandedArticle.readTime}</span>
                                  </>
                                )}
                              </div>
                              <h2 className="font-serif text-4xl md:text-5xl text-white font-light">
                                {expandedArticle.title}
                              </h2>
                            </div>
                          </div>
                        </div>
                        <ExpandedArticle article={expandedArticle} isExpanded={true} />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pointer-events-none z-40" />

      <div className="relative z-50">
        <Footer />
      </div>
    </div>
  );
}
