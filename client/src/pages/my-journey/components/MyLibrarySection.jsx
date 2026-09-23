import React, { useState, useEffect } from 'react';
import { CaretDown, BookmarkSimple, PlayCircle, Play, X } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import UniversalVideoModal from '../../../components/ui/UniversalVideoModal';
import { renderFormattedTitle, resolveImageUrl } from '../../../pages/articles/ArticleReaderView';

export default function MyLibrarySection() {
  const [libraryTab, setLibraryTab] = useState('BOOKMARKED');
  const [libraryFilter, setLibraryFilter] = useState('ARTICLES');
  const [showWatchCard, setShowWatchCard] = useState(true);
  const [savedArticles, setSavedArticles] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [completedArticles, setCompletedArticles] = useState([]);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [activeModalVideo, setActiveModalVideo] = useState(null);
  const navigate = useNavigate();

  const fetchSavedAndCompleted = async () => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Fetch library settings to check if Watch Card / Video tab is enabled
    try {
      const settingsRes = await fetch(`${API_URL}/api/library-settings/formatExplore`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData && settingsData.showWatchCard === false) {
          setShowWatchCard(false);
          setLibraryFilter('ARTICLES');
        } else {
          setShowWatchCard(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch formatExplore settings', err);
    }

    if (!token) return;
    try {
      const [savedArtRes, savedVidRes, completedArtRes, completedVidRes] = await Promise.all([
        fetch(`${API_URL}/api/users/saved-articles`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/users/saved-videos`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/users/completed-articles`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/users/completed-videos`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (savedArtRes.ok) {
        const savedArtData = await savedArtRes.json();
        setSavedArticles(Array.isArray(savedArtData) ? savedArtData.filter(Boolean) : []);
      }
      if (savedVidRes.ok) {
        const savedVidData = await savedVidRes.json();
        setSavedVideos(Array.isArray(savedVidData) ? savedVidData.filter(Boolean) : []);
      }
      if (completedArtRes.ok) {
        const completedArtData = await completedArtRes.json();
        setCompletedArticles(Array.isArray(completedArtData) ? completedArtData.filter(Boolean) : []);
      }
      if (completedVidRes.ok) {
        const completedVidData = await completedVidRes.json();
        setCompletedVideos(Array.isArray(completedVidData) ? completedVidData.filter(Boolean) : []);
      }
    } catch (err) {
      console.error('Failed to fetch library items', err);
    }
  };

  useEffect(() => {
    fetchSavedAndCompleted();
  }, []);

  const handleRemoveArticle = async (articleId, e) => {
    e?.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
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

  const handleRemoveVideo = async (videoId, e) => {
    e?.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const previous = [...savedVideos];
    setSavedVideos(prev => prev.filter(v => v._id !== videoId));
    
    try {
      const res = await fetch(`${API_URL}/api/users/save-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId }),
      });
      if (!res.ok) {
        setSavedVideos(previous);
      }
    } catch (err) {
      console.error(err);
      setSavedVideos(previous);
    }
  };

  const handleCompleteArticle = async (articleId, e) => {
    e?.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
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

  const handleCompleteVideo = async (videoId, e) => {
    e?.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const previousSaved = [...savedVideos];
    const previousCompleted = [...completedVideos];
    
    const videoToComplete = savedVideos.find(v => v._id === videoId) || completedVideos.find(v => v._id === videoId);
    
    if (savedVideos.some(v => v._id === videoId)) {
      setSavedVideos(prev => prev.filter(v => v._id !== videoId));
      if (videoToComplete) setCompletedVideos(prev => [...prev, videoToComplete]);
    } else {
      setCompletedVideos(prev => prev.filter(v => v._id !== videoId));
      if (videoToComplete) setSavedVideos(prev => [...prev, videoToComplete]);
    }

    try {
      const res = await fetch(`${API_URL}/api/users/complete-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId }),
      });
      if (!res.ok) {
        setSavedVideos(previousSaved);
        setCompletedVideos(previousCompleted);
      }
    } catch (err) {
      console.error(err);
      setSavedVideos(previousSaved);
      setCompletedVideos(previousCompleted);
    }
  };

  const currentArticles = libraryTab === 'COMPLETED' ? completedArticles : savedArticles;
  const currentVideos = libraryTab === 'COMPLETED' ? completedVideos : savedVideos;

  const getEmptyMessage = () => {
    if (libraryTab === 'COMPLETED') {
      if (libraryFilter === 'VIDEOS') return "You haven't completed any videos yet.";
      return "You haven't completed any articles yet.";
    }
    if (libraryFilter === 'VIDEOS') return "You haven't saved any videos yet.";
    return "You haven't saved any articles yet.";
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
            The Articles and videos you chose to return to.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="w-full flex items-center border-b border-white/10 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
          {['CONTINUE', 'BOOKMARKED', 'COMPLETED'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setLibraryTab(tab)}
              className={`px-6 md:px-8 py-3 md:py-4 font-sans text-xs uppercase tracking-widest font-medium transition-colors relative ${libraryTab === tab ? 'text-[#c79c6e]' : 'text-white/50 hover:text-white'}`}
            >
              {tab}
              {libraryTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c79c6e]" />}
            </button>
          ))}
        </div>

        {/* Filters: ARTICLES & VIDEOS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between w-full mb-10 gap-6">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {(showWatchCard ? ['ARTICLES', 'VIDEOS'] : ['ARTICLES']).map((filter) => (
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
        <div className="flex flex-col w-full max-w-6xl">
          {libraryFilter === 'VIDEOS' ? (
            /* VIDEO CARDS GRID WITH THUMBNAIL */
            currentVideos.length === 0 ? (
              <div className="text-white/40 font-sans text-sm py-10 border border-dashed border-white/10 rounded text-center">
                {getEmptyMessage()}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {currentVideos.map(video => {
                  const dateStr = new Date(video.updatedAt || video.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                  const thumbSrc = resolveImageUrl(video.thumbnailUrl || video.image, '/library_preview_silhouette.jpg');

                  return (
                    <div 
                      key={video._id} 
                      className="group/vid cursor-pointer flex flex-col bg-[#0c0c0c] border border-white/10 hover:border-[#c79c6e]/60 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_0_30px_rgba(199,156,110,0.15)]"
                      onClick={() => {
                        if (video.videoUrl && video.videoUrl.includes('instagram.com')) {
                          window.open(video.videoUrl, '_blank');
                        } else {
                          setActiveModalVideo(video);
                        }
                      }}
                    >
                      {/* Thumbnail Frame */}
                      <div className="w-full aspect-[16/10] bg-black overflow-hidden relative">
                        <img 
                          src={thumbSrc} 
                          alt={video.title} 
                          className="w-full h-full object-cover opacity-70 group-hover/vid:opacity-90 group-hover/vid:scale-105 transition-all duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        
                        {/* Center Play Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-black/60 border border-white/20 flex items-center justify-center group-hover/vid:bg-[#c79c6e] group-hover/vid:border-[#c79c6e] group-hover/vid:text-black text-white/90 group-hover/vid:scale-110 transition-all duration-300 shadow-xl">
                            <Play size={22} weight="fill" className="ml-0.5" />
                          </div>
                        </div>

                        {/* Duration Tag */}
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded text-[0.65rem] font-sans font-bold tracking-widest text-[#c79c6e] border border-white/10">
                          {video.duration || 'VIDEO'}
                        </div>
                      </div>

                      {/* Video Info & Controls */}
                      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <PlayCircle size={14} className="text-[#c79c6e]" weight="bold" />
                            <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-[#c79c6e]/90">
                              VIDEO
                            </span>
                          </div>
                          <h3 className="font-serif text-lg sm:text-xl text-white font-normal leading-snug group-hover/vid:text-[#c79c6e] transition-colors line-clamp-2">
                            {renderFormattedTitle(video.title)}
                          </h3>
                          <span className="font-sans text-[0.7rem] text-white/40 block mt-2">
                            {libraryTab === 'COMPLETED' ? `Completed ${dateStr}` : `Saved ${dateStr}`}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModalVideo(video);
                            }}
                            className="flex-1 py-2 px-3 rounded border border-[#c79c6e]/70 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black font-sans text-xs uppercase tracking-[0.14em] font-semibold transition-all text-center flex items-center justify-center gap-1.5"
                          >
                            <Play size={12} weight="bold" />
                            WATCH
                          </button>

                          {libraryTab !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={(e) => handleRemoveVideo(video._id, e)}
                              className="py-2 px-3 rounded border border-white/10 text-white/50 hover:text-white hover:border-white/30 font-sans text-xs uppercase tracking-[0.14em] font-semibold transition-colors"
                              title="Remove from Saved"
                            >
                              REMOVE
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleCompleteVideo(video._id, e)}
                            className="py-2 px-3 rounded border border-white/10 text-white/50 hover:text-white hover:border-white/30 font-sans text-xs uppercase tracking-[0.14em] font-semibold transition-colors"
                          >
                            {libraryTab === 'COMPLETED' ? 'UNMARK' : 'COMPLETE'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* ARTICLES LIST */
            currentArticles.length === 0 ? (
              <div className="text-white/40 font-sans text-sm py-10 border border-dashed border-white/10 rounded text-center">
                {getEmptyMessage()}
              </div>
            ) : (
              currentArticles.map((article) => {
                const isExpanded = expandedId === article._id;
                const dateStr = new Date(article.updatedAt || article.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                
                let readPercentage = 0;
                let hasLegacyProgress = false;
                const keys = [article._id, article.id, article.slug].filter(Boolean);
                let progressData = null;
                for (const k of keys) {
                  const stored = localStorage.getItem(`article_progress_${k}`);
                  if (stored) {
                    progressData = stored;
                    break;
                  }
                }
                if (progressData) {
                  try {
                    const parsed = JSON.parse(progressData);
                    readPercentage = typeof parsed.percentage === 'number' ? parsed.percentage : 0;
                  } catch (e) {
                    if (parseInt(progressData) > 200) {
                      hasLegacyProgress = true;
                    }
                  }
                }

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
                          <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium">ARTICLE</span>
                        </div>
                        <h3 className="font-serif text-2xl text-white pr-4">{renderFormattedTitle(article.title)}</h3>
                      </div>
                      
                      <div className="flex flex-col text-left md:text-right shrink-0 w-36 gap-1">
                        {libraryTab !== 'COMPLETED' && (
                          <div className="font-sans text-xs uppercase tracking-[0.16em] font-bold text-[#c79c6e]">
                            {hasLegacyProgress && readPercentage === 0 ? 'IN PROGRESS' : `${readPercentage}% READ`}
                          </div>
                        )}
                        <span className="font-sans text-xs text-white/60">
                          {article.categoryTitle || article.category || 'Article'}
                        </span>
                        <span className="font-sans text-xs text-white/40">
                          {libraryTab === 'COMPLETED' ? `Completed ${dateStr}` : `Saved ${dateStr}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 justify-start md:justify-end">
                        <div className={`flex gap-4 transition-all duration-300 ${isExpanded ? 'opacity-0 invisible pointer-events-none' : 'group-hover:opacity-0 group-hover:invisible group-hover:pointer-events-none'}`}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/articles?category=${article.categoryId}&subCategory=${article.headingId}&article=${article._id}`); }}
                            className="px-5 py-2 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium"
                          >
                            {libraryTab === 'COMPLETED' ? 'REVISIT' : 'CONTINUE'}
                          </button>

                          {libraryTab !== 'COMPLETED' && (
                            <button 
                              onClick={(e) => handleRemoveArticle(article._id, e)}
                              className="px-5 py-2 border border-white/10 text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium"
                            >
                              REMOVE
                            </button>
                          )}

                          <button 
                            onClick={(e) => handleCompleteArticle(article._id, e)}
                            className="px-5 py-2 border border-white/10 text-[#c79c6e] rounded text-[0.6rem] uppercase tracking-[0.2em] font-medium"
                          >
                            {libraryTab === 'COMPLETED' ? 'MARK INCOMPLETE' : 'MARK COMPLETE'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Hover Area */}
                    <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out w-full z-10 relative ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] group-hover:grid-rows-[1fr]'}`}>
                      <div className="overflow-hidden">
                        <div className="pt-8 flex flex-col gap-6">
                          <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] block">
                            {libraryTab === 'COMPLETED' ? `COMPLETED ${dateStr}` : `LAST OPENED ${dateStr}`}
                          </span>
                          
                          <div className="flex flex-wrap items-center gap-4">
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/articles?category=${article.categoryId}&subCategory=${article.headingId}&article=${article._id}`); }}
                              className="px-6 py-3 border border-[#c79c6e] rounded text-[0.65rem] uppercase tracking-widest font-medium text-[#c79c6e] transition-colors hover:bg-[#c79c6e] hover:text-black"
                            >
                              {libraryTab === 'COMPLETED' ? 'REVISIT ARTICLE' : 'CONTINUE READING'}
                            </button>

                            {libraryTab !== 'COMPLETED' && (
                              <button 
                                onClick={(e) => handleRemoveArticle(article._id, e)}
                                className="px-6 py-3 border border-white/10 rounded text-[0.65rem] uppercase tracking-widest font-medium text-[#c79c6e] transition-colors hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/5"
                              >
                                REMOVE BOOKMARK
                              </button>
                            )}

                            <button 
                              onClick={(e) => handleCompleteArticle(article._id, e)}
                              className="px-6 py-3 border border-white/10 rounded text-[0.65rem] uppercase tracking-widest font-medium text-[#c79c6e] transition-colors hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/5"
                            >
                              {libraryTab === 'COMPLETED' ? 'MARK INCOMPLETE' : 'MARK COMPLETE'}
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
            )
          )}
        </div>

      </div>

      {/* Video Playback Modal */}
      {activeModalVideo && (
        <UniversalVideoModal
          video={activeModalVideo}
          onClose={() => setActiveModalVideo(null)}
        />
      )}
    </section>
  );
}
