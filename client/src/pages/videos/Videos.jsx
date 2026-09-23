import React, { useState, useEffect } from 'react';
import { Play, X, BookmarkSimple } from '@phosphor-icons/react';
import Navbar from '../../components/layout/Navbar';
import UniversalVideoModal from '../../components/ui/UniversalVideoModal';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [savedVideoIds, setSavedVideoIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
    fetchSavedVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/videos/published`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedVideos = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/users/saved-videos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const ids = new Set((data || []).map(v => v._id || v.id || v));
        setSavedVideoIds(ids);
      }
    } catch (err) {
      console.error('Failed to load saved video IDs:', err);
    }
  };

  const handleToggleSaveVideo = async (video, e) => {
    e?.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const videoId = video._id || video.id;
    if (!videoId) return;

    setSavedVideoIds(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });

    try {
      await fetch(`${API_URL}/api/users/save-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ videoId })
      });
    } catch (err) {
      console.error('Error saving video:', err);
    }
  };

  // Helper to safely embed YouTube/Vimeo links
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    if (url.includes('vimeo.com/')) {
      return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-[#c79c6e]/30 selection:text-white">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 w-full max-w-[1600px] mx-auto">
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex flex-col gap-4 max-w-2xl">
            <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">
              VIDEO LIBRARY
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-light tracking-tight leading-[1.1]">
              Perspectives spoken<br />and explored.
            </h1>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full py-20 flex justify-center text-white/40">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="w-full py-20 border border-white/5 bg-[#0a0a0a] rounded-xl flex items-center justify-center text-white/30 text-sm">
            No videos available at the moment. Please check back later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {videos.map(video => {
              const isSaved = savedVideoIds.has(video._id);
              return (
                <div 
                  key={video._id} 
                  className="group cursor-pointer flex flex-col"
                  onClick={() => {
                    if (video.videoUrl && video.videoUrl.includes('instagram.com')) {
                      window.open(video.videoUrl, '_blank');
                    } else {
                      setActiveVideo(video);
                    }
                  }}
                >
                  <div className="w-full aspect-[16/10] bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden relative mb-6 transition-all duration-500 group-hover:border-[#c79c6e]/50">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80" 
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play size={48} weight="light" className="text-white/80 group-hover:text-[#c79c6e] group-hover:scale-110 transition-all duration-500" />
                    </div>
                    
                    {/* Duration badge */}
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur rounded text-[0.65rem] font-sans font-bold tracking-widest text-[#c79c6e]">
                      {video.duration || 'VIDEO'}
                    </div>

                    {/* Bookmark / Save Icon */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSaveVideo(video, e)}
                      className={`absolute top-3 right-3 p-2.5 rounded-full border transition-all duration-300 z-20 ${
                        isSaved
                          ? 'bg-[#c79c6e] text-black border-[#c79c6e]'
                          : 'bg-black/60 text-white/70 border-white/15 hover:border-[#c79c6e] hover:text-[#c79c6e]'
                      }`}
                      title={isSaved ? "Saved to My Journey" : "Save to My Journey"}
                    >
                      <BookmarkSimple size={18} weight={isSaved ? "fill" : "regular"} />
                    </button>
                  </div>
                  
                  <h3 className="font-serif text-xl md:text-2xl text-white/90 font-light leading-snug group-hover:text-white transition-colors duration-300 pr-4 mb-3">
                    {video.title}
                  </h3>
                  
                  <p className="font-sans text-[0.8rem] text-white/40 leading-relaxed line-clamp-3">
                    {video.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Video Modal Player */}
      {activeVideo && (
        <UniversalVideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}
