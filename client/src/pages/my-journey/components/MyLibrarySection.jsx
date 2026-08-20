import React, { useState, useEffect } from 'react';
import { CaretDown, BookmarkSimple, PlayCircle, Faders } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export default function MyLibrarySection() {
  const [libraryTab, setLibraryTab] = useState('BOOKMARKED');
  const [libraryFilter, setLibraryFilter] = useState('ALL');
  const [savedArticles, setSavedArticles] = useState([]);
  const [completedArticles, setCompletedArticles] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedAndCompleted = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        const [savedRes, completedRes] = await Promise.all([
          fetch(`${API_URL}/api/users/saved-articles`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/users/completed-articles`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setSavedArticles(savedData);
        }
        if (completedRes.ok) {
          const completedData = await completedRes.json();
          setCompletedArticles(completedData);
        }
      } catch (err) {
        console.error('Failed to fetch articles', err);
      }
    };
    fetchSavedAndCompleted();
  }, []);

  const handleRemove = async (articleId, e) => {
    e?.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Optimistic update
    const previous = [...savedArticles];
    setSavedArticles(prev => prev.filter(a => a._id !== articleId));
    
    try {
      const res = await fetch(`${API_URL}/api/users/save-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId }),
      });
      if (!res.ok) {
        setSavedArticles(previous);
      }
    } catch (err) {
      console.error(err);
      setSavedArticles(previous);
    }
  };

  const handleComplete = async (articleId, e) => {
    e?.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Optimistic update
    const previousSaved = [...savedArticles];
    const previousCompleted = [...completedArticles];
    
    const articleToComplete = savedArticles.find(a => a._id === articleId) || completedArticles.find(a => a._id === articleId);
    
    if (savedArticles.some(a => a._id === articleId)) {
      setSavedArticles(prev => prev.filter(a => a._id !== articleId));
      if (articleToComplete) setCompletedArticles(prev => [...prev, articleToComplete]);
    } else {
      setCompletedArticles(prev => prev.filter(a => a._id !== articleId));
      if (articleToComplete) setSavedArticles(prev => [...prev, articleToComplete]);
    }

    try {
      const res = await fetch(`${API_URL}/api/users/complete-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId }),
      });
      if (!res.ok) {
        setSavedArticles(previousSaved);
        setCompletedArticles(previousCompleted);
      }
    } catch (err) {
      console.error(err);
      setSavedArticles(previousSaved);
      setCompletedArticles(previousCompleted);
    }
  };

  return (
    <section className="relative z-10 w-full min-h-[100dvh] flex flex-col px-4 md:px-8 py-24 mx-auto border-t border-white/5 bg-[#050505]/40 backdrop-blur-sm">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full flex-1">
        
        {/* Header */}
        <div className="mb-12">
          <span className="font-sans text-[0.7rem] md:text-[0.8rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-4 block">
            MY JOURNEY
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-[1.1] mb-4">
            My Library
          </h2>
          <p className="font-sans text-white/70 text-base md:text-lg font-light leading-relaxed max-w-lg">
            The Perspectives, videos and tools you chose to return to.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="w-full flex items-center border-b border-white/10 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button 
            onClick={() => setLibraryTab('CONTINUE')}
            className={`px-6 md:px-8 py-3 md:py-4 font-sans text-xs uppercase tracking-widest font-medium transition-colors relative ${libraryTab === 'CONTINUE' ? 'text-[#c79c6e]' : 'text-white/50 hover:text-white'}`}
          >
            CONTINUE
            {libraryTab === 'CONTINUE' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c79c6e]" />}
          </button>
          <button 
            onClick={() => setLibraryTab('BOOKMARKED')}
            className={`px-6 md:px-8 py-3 md:py-4 font-sans text-xs uppercase tracking-widest font-medium transition-colors relative ${libraryTab === 'BOOKMARKED' ? 'text-[#c79c6e]' : 'text-white/50 hover:text-white'}`}
          >
            BOOKMARKED
            {libraryTab === 'BOOKMARKED' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c79c6e]" />}
          </button>
          <button 
            onClick={() => setLibraryTab('COMPLETED')}
            className={`px-6 md:px-8 py-3 md:py-4 font-sans text-xs uppercase tracking-widest font-medium transition-colors relative ${libraryTab === 'COMPLETED' ? 'text-[#c79c6e]' : 'text-white/50 hover:text-white'}`}
          >
            COMPLETED
            {libraryTab === 'COMPLETED' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c79c6e]" />}
          </button>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between w-full mb-10 gap-6">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {['ALL', 'PERSPECTIVES', 'VIDEOS', 'TOOLS'].map((filter) => (
              <button
                key={filter}
                onClick={() => setLibraryFilter(filter)}
                className={`font-sans text-xs uppercase tracking-widest font-medium transition-colors ${libraryFilter === filter ? 'text-[#c79c6e]' : 'text-white/50 hover:text-white'}`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-medium text-white/50 hover:text-white transition-colors">
            SORT: NEWEST <CaretDown size={14} weight="bold" />
          </button>
        </div>

        {/* Library Content List */}
        <div className="flex flex-col w-full max-w-4xl">
          
          {libraryTab === 'BOOKMARKED' && (
            <>
              {savedArticles.length === 0 ? (
                <div className="text-white/40 font-sans text-sm py-10 border border-dashed border-white/10 rounded text-center">
                  You haven't saved any articles yet.
                </div>
              ) : (
                savedArticles.map((article) => {
                  const isExpanded = expandedId === article._id;
                  const dateSaved = new Date(article.updatedAt || article.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                  return (
                    <div 
                      key={article._id}
                      onClick={() => setExpandedId(isExpanded ? null : article._id)}
                      className="group flex flex-col w-full border border-white/10 rounded-lg hover:border-[#c79c6e] hover:bg-[#c79c6e]/5 transition-colors duration-500 cursor-pointer p-6 relative overflow-hidden mb-4"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 z-10 relative">
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="flex items-center gap-2 text-white/50 group-hover:text-[#c79c6e] transition-colors">
                            <BookmarkSimple size={16} weight="regular" />
                            <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium">PERSPECTIVE</span>
                          </div>
                          <h3 className="font-serif text-2xl text-white pr-4">{article.title}</h3>
                        </div>
                        
                        <div className="flex flex-col text-left md:text-center shrink-0 w-32">
                          <span className="font-sans text-xs text-white/60">{article.categoryTitle || 'Article'}</span>
                          <span className="font-sans text-xs text-white/40">Saved {dateSaved}</span>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 justify-start md:justify-end">
                          <div className={`flex gap-4 transition-all duration-300 ${isExpanded ? 'opacity-0 invisible pointer-events-none' : 'group-hover:opacity-0 group-hover:invisible group-hover:pointer-events-none'}`}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/articles?category=${article.categoryId}&subCategory=${article.headingId}&article=${article._id}`); }}
                              className="px-5 py-2 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium"
                            >
                              CONTINUE
                            </button>
                            <button 
                              onClick={(e) => handleRemove(article._id, e)}
                              className="px-5 py-2 border border-white/10 text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium"
                            >
                              REMOVE
                            </button>
                            <button 
                              onClick={(e) => handleComplete(article._id, e)}
                              className="px-5 py-2 border border-white/10 text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium"
                            >
                              MARK COMPLETE
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Hover Area */}
                      <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out w-full z-10 relative ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] group-hover:grid-rows-[1fr]'}`}>
                        <div className="overflow-hidden">
                          <div className="pt-8 flex flex-col gap-6">
                            <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] block">
                              LAST OPENED {dateSaved}
                            </span>
                            
                            <div className="flex flex-wrap items-center gap-4">
                              <button 
                                onClick={(e) => { e.stopPropagation(); navigate(`/articles?category=${article.categoryId}&subCategory=${article.headingId}&article=${article._id}`); }}
                                className="px-6 py-3 border border-[#c79c6e] rounded text-[0.65rem] uppercase tracking-widest font-medium text-[#c79c6e] transition-colors hover:bg-[#c79c6e] hover:text-black"
                              >
                                CONTINUE READING
                              </button>
                              <button 
                                onClick={(e) => handleRemove(article._id, e)}
                                className="px-6 py-3 border border-white/10 rounded text-[0.65rem] uppercase tracking-widest font-medium text-[#c79c6e] transition-colors hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/5"
                              >
                                REMOVE BOOKMARK
                              </button>
                              <button 
                                onClick={(e) => handleComplete(article._id, e)}
                                className="px-6 py-3 border border-white/10 rounded text-[0.65rem] uppercase tracking-widest font-medium text-[#c79c6e] transition-colors hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/5"
                              >
                                MARK COMPLETE
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Subtle Glow */}
                      <div className="absolute left-0 bottom-0 w-64 h-32 bg-[#c79c6e]/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>
                  );
                })
              )}
            </>
          )}

          {libraryTab === 'COMPLETED' && (
            <div className="animate-in fade-in duration-300">
              <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] block mb-6">MARKED COMPLETE</span>
              
              {completedArticles.length === 0 ? (
                <div className="text-white/40 font-sans text-sm py-10 border border-dashed border-white/10 rounded text-center">
                  You haven't completed any articles yet.
                </div>
              ) : (
                completedArticles.map((article) => {
                  const dateCompleted = new Date(article.updatedAt || article.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                  return (
                    <div 
                      key={article._id}
                      className="group flex flex-col w-full border border-white/10 rounded-lg hover:border-[#c79c6e] hover:bg-[#c79c6e]/5 transition-colors duration-500 cursor-pointer p-6 relative overflow-hidden mb-4"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 z-10 relative">
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="flex items-center gap-2 text-white/50 group-hover:text-[#c79c6e] transition-colors">
                            <BookmarkSimple size={16} weight="regular" />
                            <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium">PERSPECTIVE</span>
                          </div>
                          <h3 className="font-serif text-2xl text-white pr-4">{article.title}</h3>
                        </div>
                        
                        <div className="flex flex-col text-left md:text-center shrink-0 w-40">
                          <span className="font-sans text-xs text-white/60">{article.categoryTitle || 'Article'}</span>
                          <span className="font-sans text-xs text-white/40">Completed {dateCompleted}</span>
                        </div>
  
                        <div className="flex items-center gap-4 shrink-0 justify-start md:justify-end">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/articles?category=${article.categoryId}&subCategory=${article.headingId}&article=${article._id}`); }}
                            className="px-5 py-2 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium group-hover:bg-[#c79c6e] group-hover:text-black transition-colors"
                          >
                            REVISIT
                          </button>
                          <button 
                            onClick={(e) => handleComplete(article._id, e)}
                            className="px-5 py-2 border border-white/10 text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium group-hover:border-[#c79c6e]/40 group-hover:bg-[#c79c6e]/5 transition-colors"
                          >
                            MARK INCOMPLETE
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
          
        </div>

      </div>
    </section>
  );
}
