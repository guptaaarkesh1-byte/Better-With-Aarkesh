import React, { useState, useEffect } from 'react';
import { BookmarkSimple, PlayCircle, Play, X } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import UniversalVideoModal from '../../../components/ui/UniversalVideoModal';
import { renderFormattedTitle, resolveImageUrl } from '../../../pages/articles/ArticleReaderView';

export default function MyLibraryTab() {
  const [mainTab, setMainTab] = useState('BOOKMARKED');
  const [subTab, setSubTab] = useState('ARTICLES');
  const [showWatchCard, setShowWatchCard] = useState(true);
  const [savedArticles, setSavedArticles] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [completedArticles, setCompletedArticles] = useState([]);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [activeModalVideo, setActiveModalVideo] = useState(null);
  const navigate = useNavigate();

  const mainTabs = ['BOOKMARKED', 'COMPLETED'];
  const subTabs = showWatchCard ? ['ARTICLES', 'VIDEOS'] : ['ARTICLES'];

  const fetchSavedAndCompleted = async () => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Fetch library settings to know if Watch/Video card is enabled
    try {
      const settingsRes = await fetch(`${API_URL}/api/library-settings/formatExplore`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData && settingsData.showWatchCard === false) {
          setShowWatchCard(false);
          setSubTab('ARTICLES');
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

  const currentArticles = mainTab === 'COMPLETED' ? completedArticles : savedArticles;
  const currentVideos = mainTab === 'COMPLETED' ? completedVideos : savedVideos;

  const getEmptyMessage = () => {
    if (mainTab === 'COMPLETED') {
      if (subTab === 'VIDEOS') return "You haven't completed any videos yet.";
      return "You haven't completed any articles yet.";
    }
    if (subTab === 'VIDEOS') return "You haven't saved any videos yet.";
    return "You haven't saved any articles yet.";
  };

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl border border-black/10 bg-[#f5f1e8] p-4 sm:p-6 md:p-10 lg:p-12 flex flex-col mb-20 relative overflow-hidden shadow-xs">
      
      {/* Header */}
      <div className="mb-6 md:mb-8 relative z-10">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#111010] mb-2 tracking-tight">My Library</h2>
        <p className="font-sans text-[#555047] font-light text-sm sm:text-base">The Articles and videos you chose to return to.</p>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-5 sm:gap-8 border-b border-black/10 mb-5 sm:mb-6 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10">
        {mainTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={`pb-3 sm:pb-4 font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold transition-colors relative shrink-0 cursor-pointer ${
              mainTab === tab ? 'text-[#c9542f]' : 'text-[#7a756b] hover:text-[#111010]'
            }`}
          >
            {tab}
            {mainTab === tab && (
              <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#c9542f]" />
            )}
          </button>
        ))}
      </div>

      {/* Sub Tabs: ARTICLES & VIDEOS */}
      <div className="flex items-center gap-4 sm:gap-6 mb-6 md:mb-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10">
        {subTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`font-sans text-xs uppercase tracking-[0.16em] font-bold transition-colors shrink-0 cursor-pointer pb-1 ${
              subTab === tab ? 'text-[#c9542f] border-b border-[#c9542f]' : 'text-[#7a756b] hover:text-[#111010]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Rendering */}
      <div className="relative z-10">
        {subTab === 'VIDEOS' ? (
          /* VIDEO GRID CARDS WITH THUMBNAIL (IDENTICAL TO FORMAT EXPLORE PREVIEW CARDS) */
          currentVideos.length === 0 ? (
            <div className="text-[#7a756b] font-sans text-xs sm:text-sm py-16 border border-black/10 rounded-2xl bg-white text-center shadow-xs">
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
                    className="group/vid cursor-pointer flex flex-col bg-white border border-black/10 hover:border-[#c9542f]/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md"
                    onClick={() => {
                      if (video.videoUrl && video.videoUrl.includes('instagram.com')) {
                        window.open(video.videoUrl, '_blank');
                      } else {
                        setActiveModalVideo(video);
                      }
                    }}
                  >
                    {/* Thumbnail Frame */}
                    <div className="w-full aspect-[16/10] bg-[#111010] overflow-hidden relative">
                      <img 
                        src={thumbSrc} 
                        alt={video.title} 
                        className="w-full h-full object-cover opacity-85 group-hover/vid:opacity-100 group-hover/vid:scale-105 transition-all duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Center Play Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 border border-black/10 flex items-center justify-center group-hover/vid:bg-[#c9542f] group-hover/vid:border-[#c9542f] text-[#111010] group-hover/vid:text-white group-hover/vid:scale-110 transition-all duration-300 shadow-lg">
                          <Play size={22} weight="fill" className="ml-0.5" />
                        </div>
                      </div>

                      {/* Duration Tag */}
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-lg text-[0.65rem] font-sans font-bold tracking-widest text-white border border-white/10">
                        {video.duration || 'VIDEO'}
                      </div>
                    </div>

                    {/* Video Info & Controls */}
                    <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <PlayCircle size={14} className="text-[#c9542f]" weight="bold" />
                          <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-bold text-[#c9542f]">
                            VIDEO
                          </span>
                        </div>
                        <h3 className="font-serif text-lg sm:text-xl text-[#111010] font-medium leading-snug group-hover/vid:text-[#c9542f] transition-colors line-clamp-2">
                          {renderFormattedTitle(video.title)}
                        </h3>
                        <span className="font-sans text-[0.7rem] text-[#7a756b] block mt-2">
                          {mainTab === 'COMPLETED' ? `Completed ${dateStr}` : `Saved ${dateStr}`}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-black/10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalVideo(video);
                          }}
                          className="flex-1 py-2.5 px-3 rounded-xl border border-black/15 hover:border-[#c9542f] hover:bg-[#fbf0eb] text-[#c9542f] font-sans text-xs uppercase tracking-[0.14em] font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Play size={12} weight="bold" />
                          WATCH
                        </button>

                        {mainTab !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveVideo(video._id, e)}
                            className="py-2.5 px-3 rounded-xl border border-black/10 text-[#7a756b] hover:text-[#111010] hover:bg-black/5 font-sans text-xs uppercase tracking-[0.14em] font-bold transition-colors cursor-pointer"
                            title="Remove from Saved"
                          >
                            REMOVE
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleCompleteVideo(video._id, e)}
                          className="py-2.5 px-3 rounded-xl border border-black/10 text-[#7a756b] hover:text-[#111010] hover:bg-black/5 font-sans text-xs uppercase tracking-[0.14em] font-bold transition-colors cursor-pointer"
                        >
                          {mainTab === 'COMPLETED' ? 'UNMARK' : 'COMPLETE'}
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
            <div className="text-[#7a756b] font-sans text-xs sm:text-sm py-16 border border-black/10 rounded-2xl bg-white text-center shadow-xs">
              {getEmptyMessage()}
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4">
              {currentArticles.map(article => {
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
                  <div key={article._id} className="group/card w-full rounded-2xl border border-black/10 bg-white p-5 sm:p-6 md:p-7 flex flex-col justify-between hover:border-[#c9542f]/40 transition-all duration-200 shadow-xs hover:shadow-md">
                    
                    {/* Main Visible Content */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                      <div className="flex flex-col gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 text-[#7a756b]">
                          <BookmarkSimple size={16} weight="bold" className="text-[#c9542f]" />
                          <span className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-[#c9542f]">ARTICLE</span>
                        </div>
                        <h3 className="font-serif text-xl sm:text-2xl md:text-2xl text-[#111010] transition-colors group-hover/card:text-[#c9542f] leading-snug font-medium">
                          {renderFormattedTitle(article.title)}
                        </h3>
                      </div>

                      <div className="flex flex-row sm:flex-col sm:items-end justify-between sm:text-right shrink-0 gap-1.5 pt-2 sm:pt-0 border-t border-black/5 sm:border-0">
                        {mainTab !== 'COMPLETED' && (
                          <div className="font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-bold text-[#c9542f]">
                            {hasLegacyProgress && readPercentage === 0 ? 'IN PROGRESS' : `${readPercentage}% READ`}
                          </div>
                        )}
                        <span className="font-sans text-xs sm:text-sm text-[#111010] font-semibold">
                          {article.categoryTitle || article.category || 'Article'}
                        </span>
                        <span className="font-sans text-xs text-[#7a756b] hidden sm:block">
                          {mainTab === 'COMPLETED' ? `Completed ${dateStr}` : `Saved ${dateStr}`}
                        </span>
                      </div>
                    </div>

                    {/* Actions: Clean direct footer buttons with zero hover lag */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-t border-black/10 pt-4 mt-5">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          navigate(`/articles?category=${article.categoryId}&subCategory=${article.headingId}&article=${article._id}&from=my-journey`, { state: { from: 'my-journey' } }); 
                        }}
                        className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-black/15 hover:border-[#c9542f] hover:bg-[#fbf0eb] text-[#c9542f] font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-bold transition-all text-center cursor-pointer shadow-2xs"
                      >
                        {mainTab === 'COMPLETED' ? 'REVISIT' : 'CONTINUE'}
                      </button>

                      {mainTab !== 'COMPLETED' && (
                        <button 
                          onClick={(e) => handleRemoveArticle(article._id, e)}
                          className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-black/10 text-[#7a756b] hover:text-[#111010] hover:bg-black/5 font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-bold transition-colors text-center cursor-pointer"
                        >
                          REMOVE
                        </button>
                      )}

                      <button 
                        onClick={(e) => handleCompleteArticle(article._id, e)}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-black/10 text-[#7a756b] hover:text-[#111010] hover:bg-black/5 font-sans text-xs sm:text-sm uppercase tracking-[0.16em] font-bold transition-colors text-center cursor-pointer"
                      >
                        {mainTab === 'COMPLETED' ? 'MARK INCOMPLETE' : 'MARK COMPLETE'}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Video Playback Modal */}
      {activeModalVideo && (
        <UniversalVideoModal
          video={activeModalVideo}
          onClose={() => setActiveModalVideo(null)}
        />
      )}
    </div>
  );
}
