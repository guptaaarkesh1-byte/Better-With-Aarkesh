import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SpeakerHigh, 
  SpeakerSlash, 
  ArrowsOut, 
  ArrowsIn, 
  ArrowCounterClockwise, 
  ArrowClockwise, 
  Gear, 
  Check
} from '@phosphor-icons/react';
import { resolvePlayableVideoId } from '../../utils/videoSecurity';

export default function ProtectedYouTubePlayer({ 
  videoId, 
  encryptedToken, 
  videoToken, 
  lesson, 
  title = 'Course Lesson Video' 
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const iframeContainerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Decrypt and resolve actual playable YouTube Video ID in memory
  const [actualVideoId, setActualVideoId] = useState(() => {
    return resolvePlayableVideoId(videoToken || encryptedToken || videoId || lesson) || '';
  });

  useEffect(() => {
    const resolved = resolvePlayableVideoId(videoToken || encryptedToken || videoId || lesson) || '';
    setActualVideoId(resolved);
  }, [videoToken, encryptedToken, videoId, lesson]);

  // Player states
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [availableQualities, setAvailableQualities] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPos, setHoverPos] = useState(0);

  const playerId = useRef(`yt_player_${Math.random().toString(36).substring(2, 9)}`).current;

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const totalSecs = Math.floor(secs);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Reset playback start flag when switching video
  useEffect(() => {
    setHasStartedPlaying(false);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [actualVideoId]);

  // Load YouTube IFrame API Script if not already loaded
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }, []);

  // Initialize YT.Player
  useEffect(() => {
    if (!actualVideoId) return;

    let checkYTInterval;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }

      try {
        const domTarget = document.getElementById(playerId);
        if (!domTarget) return;

        playerRef.current = new window.YT.Player(playerId, {
          host: 'https://www.youtube.com',
          width: '100%',
          height: '100%',
          videoId: actualVideoId,
          playerVars: {
            autoplay: 0,
            controls: 0,           // Hide all native YouTube controls
            disablekb: 1,          // Disable native keyboard controls
            modestbranding: 1,     // Remove prominent YouTube logo
            rel: 0,                // Do not show related random videos
            showinfo: 0,           // Hide video title/uploader
            iv_load_policy: 3,     // Hide video annotations/popups
            playsinline: 1,        // Play inline on mobile
            fs: 0,                 // Hide native fullscreen button
            origin: window.location.origin,
            enablejsapi: 1,
            hd: 1,                 // Enforce HD stream
            vq: 'hd1080',          // Request 1080p HD stream
            suggestedQuality: 'hd1080'
          },
          events: {
            onReady: (event) => {
              setIsReady(true);
              const player = event.target;
              try {
                const iframe = player.getIframe?.() || document.getElementById(playerId);
                if (iframe) {
                  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                  iframe.setAttribute('allowfullscreen', 'true');
                }

                const dur = player.getDuration();
                if (dur) setDuration(dur);
                
                if (typeof player.setPlaybackQualityRange === 'function') {
                  player.setPlaybackQualityRange('hd1080', 'highres');
                }
                if (typeof player.setPlaybackQuality === 'function') {
                  player.setPlaybackQuality('hd1080');
                }
                const qualities = player.getAvailableQualityLevels?.() || [];
                if (qualities && qualities.length > 0) {
                  setAvailableQualities(qualities);
                }
              } catch (e) {}
            },
            onStateChange: (event) => {
              if (event.data === 1) {
                setIsPlaying(true);
                setHasStartedPlaying(true);
                try {
                  const player = event.target;
                  const targetQ = quality === 'auto' ? 'hd1080' : quality;
                  if (typeof player.setPlaybackQualityRange === 'function') {
                    player.setPlaybackQualityRange(targetQ, 'highres');
                  }
                  if (typeof player.setPlaybackQuality === 'function') {
                    player.setPlaybackQuality(targetQ);
                  }
                } catch (e) {}
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                setIsPlaying(false);
                setShowControls(true);
              }
            },
            onPlaybackQualityChange: (event) => {
              if (event.data) {
                setQuality(event.data);
              }
            },
            onError: (err) => {
              console.warn('YouTube Player Event Warning:', err);
            }
          }
        });
      } catch (err) {
        console.error('Error creating YouTube player:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      checkYTInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYTInterval);
          initPlayer();
        }
      }, 150);
    }

    return () => {
      if (checkYTInterval) clearInterval(checkYTInterval);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [actualVideoId, playerId]);

  // Track progress while playing
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const cur = playerRef.current.getCurrentTime() || 0;
            const dur = playerRef.current.getDuration() || duration;
            const fraction = playerRef.current.getVideoLoadedFraction() || 0;
            if (!isScrubbing) {
              setCurrentTime(cur);
            }
            if (dur && dur !== duration) {
              setDuration(dur);
            }
            setBuffered(fraction * 100);
          } catch (e) {}
        }
      }, 250);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, isScrubbing, duration]);

  // Auto-hide controls timer
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && !showSpeedMenu && !showQualityMenu) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying && !showSpeedMenu && !showQualityMenu) {
      setShowControls(false);
    }
  };

  // Play / Pause Toggle
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        if (typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
      } else {
        if (typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
        setHasStartedPlaying(true);
      }
    } catch (e) {
      console.warn('Play/Pause toggle error:', e);
    }
  }, [isPlaying]);

  // Seek
  const handleSeek = (seconds) => {
    if (!playerRef.current) return;
    const target = Math.max(0, Math.min(duration || 10000, seconds));
    setCurrentTime(target);
    try {
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(target, true);
      }
    } catch (e) {}
  };

  const skipSeconds = (offset) => {
    if (!playerRef.current) return;
    const current = currentTime;
    handleSeek(current + offset);
  };

  // Volume & Mute
  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
        }
        setIsMuted(false);
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(volume || 100);
        }
      } else {
        if (typeof playerRef.current.mute === 'function') {
          playerRef.current.mute();
        }
        setIsMuted(true);
      }
    } catch (e) {}
  }, [isMuted, volume]);

  const handleVolumeChange = (newVol) => {
    const val = Number(newVol);
    setVolume(val);
    if (!playerRef.current) return;
    try {
      if (val === 0) {
        if (typeof playerRef.current.mute === 'function') playerRef.current.mute();
        setIsMuted(true);
      } else {
        if (isMuted && typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
          setIsMuted(false);
        }
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(val);
        }
      }
    } catch (e) {}
  };

  // Playback Rate
  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    if (!playerRef.current) return;
    try {
      if (typeof playerRef.current.setPlaybackRate === 'function') {
        playerRef.current.setPlaybackRate(rate);
      }
    } catch (e) {}
  };

  // Quality Change
  const handleQualityChange = (q) => {
    setQuality(q);
    setShowQualityMenu(false);
    if (!playerRef.current) return;
    try {
      const player = playerRef.current;
      if (typeof player.setPlaybackQualityRange === 'function') {
        player.setPlaybackQualityRange(q, q);
      }
      if (typeof player.setPlaybackQuality === 'function') {
        player.setPlaybackQuality(q);
      }
      if (typeof player.getCurrentTime === 'function' && typeof player.seekTo === 'function') {
        const curTime = player.getCurrentTime();
        player.seekTo(curTime, true);
      }
    } catch (e) {}
  };

  // Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.setSize === 'function') {
            if (isFs) {
              playerRef.current.setSize(window.innerWidth, window.innerHeight);
            } else {
              playerRef.current.setSize('100%', '100%');
            }
          }
          if (typeof playerRef.current.setPlaybackQualityRange === 'function') {
            playerRef.current.setPlaybackQualityRange('hd1080', 'highres');
          }
          if (typeof playerRef.current.setPlaybackQuality === 'function') {
            playerRef.current.setPlaybackQuality('hd1080');
          }
        } catch (e) {}
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    window.addEventListener('resize', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      window.removeEventListener('resize', onFsChange);
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipSeconds(-5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipSeconds(5);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(Math.min(100, volume + 5));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(Math.max(0, volume - 5));
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isPlaying, isMuted, volume, duration, currentTime, togglePlay, toggleMute, toggleFullscreen]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!actualVideoId) {
    return (
      <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-black via-[#0c0c0c] to-[#070707] select-none">
        <img src="/course_hero_bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
        <div className="text-center z-10 p-6 max-w-md">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#c79c6e] font-semibold mb-2 block">
            Lesson Ready
          </span>
          <h3 className="text-xl md:text-2xl font-serif text-white mb-2">{title}</h3>
          <p className="text-xs text-white/50">Video content will begin once loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
      className="w-full h-full relative bg-black flex items-center justify-center select-none overflow-hidden group font-sans"
    >
      {/* ── NATIVE 1:1 SHARP YOUTUBE CANVAS (UNZOOMED 16:9 NATIVE FRAMING) ── */}
      <div 
        ref={iframeContainerRef}
        className="w-full h-full absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center bg-black select-none"
      >
        <div id={playerId} className="w-full h-full pointer-events-none" />
      </div>

      {/* Subtle top & bottom edge shading (light and clean for landscape) */}
      <div className="absolute top-0 left-0 right-0 h-6 sm:h-8 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-15" />
      <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-15" />

      {/* ── CLEAN POSTER THUMBNAIL (Before User Clicks Play) ── */}
      {!hasStartedPlaying && (
        <div className="absolute inset-0 z-10 bg-black pointer-events-none overflow-hidden">
          <img 
            src={`https://img.youtube.com/vi/${actualVideoId}/maxresdefault.jpg`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://img.youtube.com/vi/${actualVideoId}/hqdefault.jpg`;
            }}
            alt="" 
            className="w-full h-full object-cover object-center opacity-90 scale-[1.02]" 
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>
      )}

      {/* ── INVISIBLE SHIELDS (Blocks external links/clicks completely) ── */}
      <div 
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
        className="absolute top-0 left-0 right-0 h-16 z-20 cursor-pointer bg-transparent"
      />
      <div 
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
        className="absolute bottom-0 right-0 w-32 h-16 z-20 cursor-pointer bg-transparent"
      />

      {/* ── FULL CANVAS TAP/CLICK AREA ── */}
      <div 
        onClick={togglePlay}
        className="absolute inset-0 z-20 cursor-pointer bg-transparent"
      />

      {/* ── MINIMAL LUXURY CENTER PLAY BUTTON OVERLAY ── */}
      {!isPlaying && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-all duration-300 cursor-pointer"
        >
          <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-black/70 backdrop-blur-md border border-white/25 hover:border-[#c79c6e] text-white hover:text-black hover:bg-[#c79c6e] flex items-center justify-center transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.8)] hover:scale-110 active:scale-95 group/btn">
            <Play size={24} weight="fill" className="ml-1 text-white group-hover/btn:text-black transition-colors" />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MINIMALIST MODERN BOTTOM CONTROLS BAR
         ═══════════════════════════════════════════════════════════════ */}
      <div className={`absolute bottom-0 left-0 right-0 px-3 py-2 sm:px-5 sm:py-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-40 transition-all duration-300 flex flex-col gap-2 ${
        showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>

        {/* ── 1. CUSTOM SCRUBBER / TIMELINE BAR ── */}
        <div 
          className="relative w-full h-2.5 flex items-center cursor-pointer group/scrub py-0.5"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            handleSeek(clickPos * duration);
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            setHoverPos(e.clientX - rect.left);
            setHoverTime(pos * duration);
          }}
          onMouseLeave={() => setHoverTime(null)}
        >
          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div 
              className="absolute -top-7 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[10px] font-mono text-[#c79c6e] -translate-x-1/2 pointer-events-none shadow-lg"
              style={{ left: `${hoverPos}px` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Background Track */}
          <div className="w-full bg-white/20 h-1 group-hover/scrub:h-1.5 rounded-full overflow-hidden transition-all relative">
            {/* Buffered Track */}
            <div 
              className="absolute top-0 bottom-0 left-0 bg-white/25 rounded-full transition-all duration-200"
              style={{ width: `${buffered}%` }}
            />
            {/* Played Track */}
            <div 
              className="absolute top-0 bottom-0 left-0 bg-[#c79c6e] rounded-full shadow-[0_0_8px_rgba(199,156,110,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Scrubber Handle */}
          <div 
            className="absolute w-3 h-3 bg-[#c79c6e] border border-white rounded-full -translate-x-1/2 shadow-md transition-transform scale-0 group-hover/scrub:scale-100"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* ── 2. BUTTONS & CONTROLS ROW ── */}
        <div className="flex items-center justify-between gap-2 text-white">
          
          {/* Left Controls: Play/Pause, Volume, Time */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-8 h-8 rounded-lg text-white hover:text-[#c79c6e] hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={17} weight="fill" /> : <Play size={17} weight="fill" className="ml-0.5" />}
            </button>

            {/* Skip Back 10s */}
            <button
              type="button"
              onClick={() => skipSeconds(-10)}
              className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer hidden sm:flex items-center gap-0.5 text-xs"
              title="Rewind 10s"
            >
              <ArrowCounterClockwise size={16} />
              <span className="text-[10px] font-mono">10</span>
            </button>

            {/* Skip Forward 10s */}
            <button
              type="button"
              onClick={() => skipSeconds(10)}
              className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer hidden sm:flex items-center gap-0.5 text-xs"
              title="Forward 10s"
            >
              <ArrowClockwise size={16} />
              <span className="text-[10px] font-mono">10</span>
            </button>

            {/* Volume / Mute */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                type="button"
                onClick={toggleMute}
                className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <SpeakerSlash size={17} className="text-red-400" />
                ) : (
                  <SpeakerHigh size={17} />
                )}
              </button>

              {/* Volume Slider (Compact on mobile) */}
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(e.target.value)}
                className="w-12 sm:w-16 h-1 bg-white/20 accent-[#c79c6e] rounded-full cursor-pointer transition-all opacity-60 group-hover/vol:opacity-100"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-[11px] font-mono text-white/60 flex items-center gap-1 ml-0.5">
              <span className="text-white font-medium">{formatTime(currentTime)}</span>
              <span className="text-white/30">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Speed, Quality, Fullscreen */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Speed Selector (1x, 1.25x, 1.5x, 2x) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowQualityMenu(false);
                }}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all flex items-center gap-1 cursor-pointer ${
                  playbackRate !== 1 
                    ? 'bg-[#c79c6e]/20 text-[#c79c6e] font-bold' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Playback Speed"
              >
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-28 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50">
                  <span className="px-3 py-1 text-[10px] uppercase font-sans tracking-widest text-white/40 block border-b border-white/5">
                    Speed
                  </span>
                  {[0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleSpeedChange(rate)}
                      className={`w-full px-3 py-1.5 text-left text-xs font-mono flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer ${
                        playbackRate === rate ? 'text-[#c79c6e] font-bold bg-[#c79c6e]/10' : 'text-white/70'
                      }`}
                    >
                      <span>{rate}x</span>
                      {playbackRate === rate && <Check size={12} className="text-[#c79c6e]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Settings Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSpeedMenu(false);
                }}
                className={`p-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs ${
                  showQualityMenu ? 'bg-[#c79c6e]/20 text-[#c79c6e]' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Video Quality"
              >
                <Gear size={16} />
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-32 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50">
                  <span className="px-3 py-1 text-[10px] uppercase font-sans tracking-widest text-white/40 block border-b border-white/5">
                    Quality
                  </span>
                  {[
                    { label: 'Auto (HD)', val: 'auto' },
                    { label: '1080p HD', val: 'hd1080' },
                    { label: '720p HD', val: 'hd720' },
                    { label: '480p', val: 'large' },
                    { label: '360p', val: 'medium' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleQualityChange(opt.val)}
                      className={`w-full px-3 py-1.5 text-left text-xs font-sans flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer ${
                        quality === opt.val ? 'text-[#c79c6e] font-semibold bg-[#c79c6e]/10' : 'text-white/70'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {quality === opt.val && <Check size={12} className="text-[#c79c6e]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Expand / Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <ArrowsIn size={16} /> : <ArrowsOut size={16} />}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
