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
  const subTabs = ['ALL', 'PERSPECTIVES', 'VIDEOS', 'TOOLS'];

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
    <div className="w-full h-full min-h-[400px] rounded-2xl border border-[#c79c6e]/40 bg-[#0a0a0a]/70 backdrop-blur-sm p-8 md:p-12 flex flex-col animate-in fade-in duration-500 mb-20 relative overflow-hidden group hover:border-[#c79c6e]/60 transition-colors duration-500 hover:shadow-[0_0_40px_rgba(199,156,110,0.1)]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#c79c6e]/5 rounded-full blur-[100px] pointer-events-none" />
      {/* Header */}
      <div className="mb-10">
        <h2 className="font-serif text-3xl md:text-4xl text-white mb-3 tracking-tight">My Library</h2>
        <p className="font-sans text-white/60 font-light">The Perspectives, videos and tools you chose to return to.</p>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-8 border-b border-white/10 mb-6">
        {mainTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={`pb-4 font-sans text-xs uppercase tracking-[0.15em] font-medium transition-colors relative ${
              mainTab === tab ? 'text-[#c79c6e]' : 'text-white/40 hover:text-white/80'
            }`}
          >
            {tab}
            {mainTab === tab && (
              <span className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-[#c79c6e]" />
            )}
          </button>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-6 mb-8">
        {subTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`font-sans text-[0.65rem] uppercase tracking-[0.15em] font-medium transition-colors ${
              subTab === tab ? 'text-[#c79c6e]' : 'text-white/40 hover:text-white/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {mainTab === 'BOOKMARKED' && (
          <>
            {savedArticles.length === 0 ? (
              <div className="text-white/40 font-sans text-sm py-10 border border-dashed border-white/10 rounded text-center">
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
                  <div key={article._id} className="group/card w-full rounded-xl border border-white/5 bg-[#050505]/60 backdrop-blur-md p-6 flex flex-col hover:border-white/10 transition-all duration-500 ease-out">
                    
                    {/* Main Visible Content */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-white/40">
                          <BookmarkSimple size={14} weight="light" />
                          <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium">PERSPECTIVE</span>
                        </div>
                        <h3 className="font-serif text-xl md:text-2xl text-white/90 transition-colors group-hover/card:text-white">{article.title}</h3>
                      </div>

                      <div className="flex flex-col md:items-end md:text-right shrink-0 gap-1">
                        <div className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-bold text-[#c79c6e] mb-1">
                          {hasLegacyProgress && readPercentage === 0 ? 'IN PROGRESS' : `${readPercentage}% READ`}
                        </div>
                        <span className="font-sans text-[0.7rem] text-white/80">{article.categoryTitle || 'Article'}</span>
                        <span className="font-sans text-[0.6rem] text-white/40">Saved {dateSaved}</span>
                      </div>
                    </div>

                    {/* Expandable Actions on Hover */}
                    <div className="max-h-0 overflow-hidden opacity-0 group-hover/card:max-h-[150px] group-hover/card:opacity-100 group-hover/card:mt-6 transition-all duration-500 ease-in-out">
                      <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-6">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/articles?category=${article.categoryId}&subCategory=${article.headingId}&article=${article._id}`); }}
                          className="px-5 py-2.5 rounded border border-[#c79c6e]/60 text-[#c79c6e] hover:bg-[#c79c6e]/10 font-sans text-[0.65rem] uppercase tracking-[0.2em] transition-colors"
                        >
                          CONTINUE
                        </button>
                        <button 
                          onClick={(e) => handleRemove(article._id, e)}
                          className="px-5 py-2.5 rounded border border-white/5 text-white/40 hover:border-white/20 hover:text-white/80 font-sans text-[0.65rem] uppercase tracking-[0.2em] transition-colors"
                        >
                          REMOVE BOOKMARK
                        </button>
                        <button 
                          onClick={(e) => handleComplete(article._id, e)}
                          className="px-5 py-2.5 rounded border border-white/5 text-white/40 hover:border-white/20 hover:text-white/80 font-sans text-[0.65rem] uppercase tracking-[0.2em] transition-colors"
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
              <div className="text-white/40 font-sans text-sm py-10 border border-dashed border-white/10 rounded text-center">
                You haven't completed any articles yet.
              </div>
            ) : (
              completedArticles.map(article => {
                const dateCompleted = new Date(article.updatedAt || article.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                return (
                  <div key={article._id} className="group/card w-full rounded-xl border border-white/5 bg-[#050505]/60 backdrop-blur-md p-6 flex flex-col hover:border-white/10 transition-all duration-500 ease-out">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-white/40">
                          <BookmarkSimple size={14} weight="light" />
                          <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium">PERSPECTIVE</span>
                        </div>
                        <h3 className="font-serif text-xl md:text-2xl text-white/90 transition-colors group-hover/card:text-white">{article.title}</h3>
                      </div>

                      <div className="flex flex-col md:text-right shrink-0">
                        <span className="font-sans text-[0.7rem] text-white/80 mb-1">{article.categoryTitle || 'Article'}</span>
                        <span className="font-sans text-[0.6rem] text-white/40">Completed {dateCompleted}</span>
                      </div>
                    </div>

                    <div className="max-h-0 overflow-hidden opacity-0 group-hover/card:max-h-[150px] group-hover/card:opacity-100 group-hover/card:mt-6 transition-all duration-500 ease-in-out">
                      <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-6">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/articles?category=${article.categoryId}&subCategory=${article.headingId}&article=${article._id}`); }}
                          className="px-5 py-2.5 rounded border border-[#c79c6e]/60 text-[#c79c6e] hover:bg-[#c79c6e]/10 font-sans text-[0.65rem] uppercase tracking-[0.2em] transition-colors"
                        >
                          REVISIT
                        </button>
                        <button 
                          onClick={(e) => handleComplete(article._id, e)}
                          className="px-5 py-2.5 rounded border border-white/5 text-white/40 hover:border-white/20 hover:text-white/80 font-sans text-[0.65rem] uppercase tracking-[0.2em] transition-colors"
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
