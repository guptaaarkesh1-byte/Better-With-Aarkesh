import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, SpeakerHigh, SpeakerSlash, Gear, Check } from '@phosphor-icons/react';
import MuxPlayer from '@mux/mux-player-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function resolveVideoUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    return `${API_URL}${url}`;
  }
  if (url.startsWith('uploads/')) {
    return `${API_URL}/${url}`;
  }
  return `${API_URL}/${url.replace(/^\//, '')}`;
}

export function extractMuxPlaybackId(video) {
  if (!video) return null;
  if (video.muxPlaybackId) return video.muxPlaybackId;
  const url = video.videoUrl || '';
  if (url.includes('stream.mux.com/')) {
    const clean = url.split('?')[0];
    const match = clean.match(/stream\.mux\.com\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1].replace(/\.m3u8$/i, '');
    }
  }
  if (url.includes('mux.com/')) {
    const clean = url.split('?')[0];
    const match = clean.match(/mux\.com\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1].replace(/\.m3u8$/i, '');
    }
  }
  return null;
}

export function getEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  if (url.includes('youtube.com/shorts/')) {
    const videoId = url.split('shorts/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return '';
}

export default function UniversalVideoModal({ video, onClose }) {
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState('1080p HD');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsTab, setSettingsTab] = useState('main'); // 'main' | 'quality' | 'speed'
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!video) return null;

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettingsMenu(false);
  };

  const handleQualityChange = (quality) => {
    setSelectedQuality(quality);
    setShowSettingsMenu(false);
  };

  const muxPlaybackId = extractMuxPlaybackId(video);
  const embedUrl = !muxPlaybackId ? getEmbedUrl(video.videoUrl) : '';
  const isDirectFile = !muxPlaybackId && !embedUrl && Boolean(video.videoUrl);
  const resolvedDirectUrl = isDirectFile ? resolveVideoUrl(video.videoUrl) : '';

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-10 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        ref={containerRef}
        className="relative w-full max-w-5xl aspect-video max-h-[85vh] bg-black rounded-2xl overflow-hidden border border-[#c79c6e]/40 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(199,156,110,0.15)] flex items-center justify-center group/player"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-40 p-4 sm:p-5 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
          <div className="flex flex-col gap-0.5 max-w-[70%]">
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-[#c79c6e]">
              VIDEO PERSPECTIVE
            </span>
            <h3 className="font-serif text-sm sm:text-base md:text-lg text-white font-normal truncate">
              {video.title || 'Video Player'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct video Quality & Speed settings button */}
            {isDirectFile && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsMenu(prev => !prev);
                    setSettingsTab('main');
                  }}
                  className="p-2.5 rounded-full bg-black/70 hover:bg-[#c79c6e] text-white hover:text-black border border-white/20 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                  title="Quality & Speed Settings"
                >
                  <Gear size={18} weight="bold" />
                  <span className="font-sans text-[0.68rem] font-bold tracking-wider hidden sm:inline">
                    {selectedQuality}
                  </span>
                </button>

                {/* Settings Popup Menu */}
                {showSettingsMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#12100e] border border-[#c79c6e]/50 p-2 shadow-2xl z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                    {settingsTab === 'main' && (
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => setSettingsTab('quality')}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/10 text-white font-sans text-xs transition-colors"
                        >
                          <span className="text-white/70">Quality</span>
                          <span className="text-[#c79c6e] font-semibold">{selectedQuality} ›</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSettingsTab('speed')}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/10 text-white font-sans text-xs transition-colors"
                        >
                          <span className="text-white/70">Playback Speed</span>
                          <span className="text-[#c79c6e] font-semibold">{playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`} ›</span>
                        </button>
                      </div>
                    )}

                    {settingsTab === 'quality' && (
                      <div className="flex flex-col gap-1">
                        <div className="px-2 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
                          <span className="text-[0.7rem] uppercase tracking-wider text-white/50 font-bold">Quality</span>
                          <button 
                            type="button" 
                            onClick={() => setSettingsTab('main')} 
                            className="text-xs text-[#c79c6e] hover:underline"
                          >
                            Back
                          </button>
                        </div>
                        {['1080p HD', '720p HD', '480p', '360p', 'Auto'].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => handleQualityChange(q)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg font-sans text-xs transition-colors ${
                              selectedQuality === q ? 'bg-[#c79c6e]/20 text-[#c79c6e] font-bold' : 'hover:bg-white/10 text-white/80'
                            }`}
                          >
                            <span>{q}</span>
                            {selectedQuality === q && <Check size={14} weight="bold" />}
                          </button>
                        ))}
                      </div>
                    )}

                    {settingsTab === 'speed' && (
                      <div className="flex flex-col gap-1">
                        <div className="px-2 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
                          <span className="text-[0.7rem] uppercase tracking-wider text-white/50 font-bold">Playback Speed</span>
                          <button 
                            type="button" 
                            onClick={() => setSettingsTab('main')} 
                            className="text-xs text-[#c79c6e] hover:underline"
                          >
                            Back
                          </button>
                        </div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleSpeedChange(s)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg font-sans text-xs transition-colors ${
                              playbackSpeed === s ? 'bg-[#c79c6e]/20 text-[#c79c6e] font-bold' : 'hover:bg-white/10 text-white/80'
                            }`}
                          >
                            <span>{s === 1 ? '1x (Normal)' : `${s}x`}</span>
                            {playbackSpeed === s && <Check size={14} weight="bold" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Close Modal Button */}
            <button 
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/70 hover:bg-[#c79c6e] text-white/80 hover:text-black border border-white/20 transition-all duration-200 hover:scale-105 cursor-pointer"
              aria-label="Close video player"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* Video Player Display */}
        <div className="w-full h-full absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
          {muxPlaybackId ? (
            <MuxPlayer
              playbackId={muxPlaybackId}
              metadata={{
                video_title: video.title || 'Video Perspective',
                player_name: 'Better With Aarkesh Luxury Player'
              }}
              streamType="on-demand"
              autoPlay
              accentColor="#c79c6e"
              playbackEngine="mse"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                maxWidth: '100%',
                display: 'block'
              }}
              className="w-full h-full"
            />
          ) : isDirectFile ? (
            <video
              ref={videoRef}
              src={resolvedDirectUrl}
              controls
              autoPlay
              playsInline
              controlsList="nodownload"
              className="w-full h-full object-contain bg-black"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                maxWidth: '100%',
                display: 'block'
              }}
            />
          ) : embedUrl ? (
            <iframe 
              src={embedUrl + (embedUrl.includes('?') ? '&autoplay=1' : '?autoplay=1')} 
              title={video.title || 'Video player'}
              className="w-full h-full border-0"
              style={{ width: '100%', height: '100%', display: 'block' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white/50">
              <p className="font-serif text-xl mb-2 text-white/80">{video.title}</p>
              <p className="text-sm">Video playback is not available for this item.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
