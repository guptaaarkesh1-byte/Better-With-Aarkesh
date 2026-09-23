import React, { useState, useEffect } from 'react';
import { BookmarkSimple, PlayCircle, Faders } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export default function MyLibraryTab() {
  const [mainTab, setMainTab] = useState('BOOKMARKED');
  const [subTab, setSubTab] = useState('ALL');
  const [savedArticles, setSavedArticles] = useState([]);
  const [completedArticles, setCompletedArticles] = useState([]);
  const navigate = useNavigate();

  const mainTabs = ['CONTINUE', 'BOOKMARKED', 'COMPLETED'];
  const subTabs = ['ALL', 'ARTICLES', 'VIDEOS'];

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
    <div className="w-full h-full min-h-[400px] rounded-2xl border border-[#c79c6e]/40 bg-[#080808] p-4 sm:p-6 md:p-10 lg:p-12 flex flex-col animate-in fade-in duration-500 mb-20 relative overflow-hidden group hover:border-[#c79c6e]/60 transition-colors duration-500 hover:shadow-[0_0_40px_rgba(199,156,110,0.1)]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#c79c6e]/5 rounded-full blur-[100px] pointer-events-none" />
      {/* Header */}
      <div className="mb-6 md:mb-10">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white mb-2 tracking-tight">My Library</h2>
        <p className="font-sans text-white/60 font-light text-sm sm:text-base">The Articles and videos you chose to return to.</p>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-5 sm:gap-8 border-b border-white/10 mb-5 sm:mb-6 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {mainTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={`pb-3 sm:pb-4 font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold transition-colors relative shrink-0 ${
              mainTab === tab ? 'text-[#c79c6e]' : 'text-white/40 hover:text-white/80'
            }`}
          >
            {tab}
            {mainTab === tab && (
              <span className="absolute bottom-[-1px] left-0 w-full h-[1.5px] bg-[#c79c6e]" />
            )}
          </button>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-4 sm:gap-6 mb-6 md:mb-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {subTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`font-sans text-xs sm:text-xs uppercase tracking-[0.16em] font-semibold transition-colors shrink-0 ${
              subTab === tab ? 'text-[#c79c6e]' : 'text-white/40 hover:text-white/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {mainTab === 'BOOKMARKED' && (
          <>
            {savedArticles.length === 0 ? (
              <div className="text-white/40 font-sans text-xs sm:text-sm py-10 border border-dashed border-white/10 rounded text-center">
                You haven't saved any articles yet.
              </div>
            ) : (
              savedArticles.map(article => {
                const dateSaved = new Date(article.updatedAt || article.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                
                let readPercentage = 0;
                let hasLegacyProgress = false;
                const progressData = localStorage.getItem(`article_progress_${article._id}`);
                if (progressData) {
                  try {
                    const parsed = JSON.parse(progressData);
                    readPercentage = parsed.percentage || 0;
                  } catch (e) {
                    // Ignore legacy string formats but mark as in progress
                    if (parseInt(progressData) > 200) {
                      hasLegacyProgress = true;
                    }
                  }
                }

                return (
                  <div key={article._id} className="group/card w-full rounded-xl border border-white/10 bg-[#0c0c0c] p-5 sm:p-6 md:p-7 flex flex-col hover:border-[#c79c6e]/40 transition-all duration-300 ease-out">
                    
                    {/* Main Visible Content */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                      <div className="flex flex-col gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 text-white/50">
                          <BookmarkSimple size={16} weight="light" />
                          <span className="font-sans text-xs uppercase tracking-[0.2em] font-semibold text-[#c79c6e]/80">ARTICLE</span>
                        </div>
                        <h3 className="font-serif text-xl sm:text-2xl md:text-2xl text-white/90 transition-colors group-hover/card:text-white leading-snug">{article.title}</h3>
                      </div>

                      <div className="flex flex-row sm:flex-col sm:items-end justify-between sm:text-right shrink-0 gap-1.5 pt-2 sm:pt-0 border-t border-white/5 sm:border-0">
                        <div className="font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-bold text-[#c79c6e]">
                          {hasLegacyProgress && readPercentage === 0 ? 'IN PROGRESS' : `${readPercentage}% READ`}
                        </div>
                        <span className="font-sans text-xs sm:text-sm text-white/90 font-medium">{article.categoryTitle || 'Article'}</span>
                        <span className="font-sans text-xs text-white/50 hidden sm:block">Saved {dateSaved}</span>
                      </div>
                    </div>

                    {/* Actions: Always visible on mobile, expandable on desktop hover */}
                    <div className="block md:max-h-0 md:overflow-hidden md:opacity-0 md:group-hover/card:max-h-[150px] md:group-hover/card:opacity-100 md:group-hover/card:mt-6 transition-all duration-500 ease-in-out mt-4 md:mt-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-t border-white/5 pt-4 md:pt-6">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/articles?category=${article.categoryId}&subCategory=${article.headingId}&article=${article._id}`); }}
                          className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded border border-[#c79c6e]/60 text-[#c79c6e] hover:bg-[#c79c6e]/10 font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold transition-colors text-center"
                        >
                          CONTINUE
                        </button>
                        <button 
                          onClick={(e) => handleRemove(article._id, e)}
                          className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded border border-white/10 text-white/50 hover:border-white/25 hover:text-white font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold transition-colors text-center"
                        >
                          REMOVE
                        </button>
                        <button 
                          onClick={(e) => handleComplete(article._id, e)}
                          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded border border-white/10 text-white/50 hover:border-white/25 hover:text-white font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold transition-colors text-center"
                        >
                          MARK COMPLETE
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </>
        )}
        {mainTab === 'COMPLETED' && (
          <>
            {completedArticles.length === 0 ? (
              <div className="text-white/40 font-sans text-xs sm:text-sm py-10 border border-dashed border-white/10 rounded text-center">
                You haven't completed any articles yet.
              </div>
            ) : (
              completedArticles.map(article => {
                const dateCompleted = new Date(article.updatedAt || article.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                return (
                  <div key={article._id} className="group/card w-full rounded-xl border border-white/10 bg-[#0c0c0c] p-5 sm:p-6 md:p-7 flex flex-col hover:border-[#c79c6e]/40 transition-all duration-300 ease-out">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                      <div className="flex flex-col gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 text-white/50">
                          <BookmarkSimple size={16} weight="light" />
                          <span className="font-sans text-xs uppercase tracking-[0.2em] font-semibold text-[#c79c6e]/80">ARTICLE</span>
                        </div>
                        <h3 className="font-serif text-xl sm:text-2xl md:text-2xl text-white/90 transition-colors group-hover/card:text-white leading-snug">{article.title}</h3>
                      </div>

                      <div className="flex flex-row sm:flex-col sm:items-end justify-between sm:text-right shrink-0 gap-1.5 pt-2 sm:pt-0 border-t border-white/5 sm:border-0">
                        <span className="font-sans text-xs sm:text-sm text-white/90 font-medium">{article.categoryTitle || 'Article'}</span>
                        <span className="font-sans text-xs text-white/50">Completed {dateCompleted}</span>
                      </div>
                    </div>

                    <div className="block md:max-h-0 md:overflow-hidden md:opacity-0 md:group-hover/card:max-h-[150px] md:group-hover/card:opacity-100 md:group-hover/card:mt-6 transition-all duration-500 ease-in-out mt-4 md:mt-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-t border-white/5 pt-4 md:pt-6">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/articles?category=${article.categoryId}&subCategory=${article.headingId}&article=${article._id}`); }}
                          className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded border border-[#c79c6e]/60 text-[#c79c6e] hover:bg-[#c79c6e]/10 font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold transition-colors text-center"
                        >
                          REVISIT
                        </button>
                        <button 
                          onClick={(e) => handleComplete(article._id, e)}
                          className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded border border-white/10 text-white/50 hover:border-white/25 hover:text-white font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold transition-colors text-center"
                        >
                          MARK INCOMPLETE
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
