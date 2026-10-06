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
  const progressIntervalRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Decrypt and resolve actual playable YouTube Video ID in memory
  const [actualVideoId, setActualVideoId] = useState(() => {
    const raw = resolvePlayableVideoId(videoToken || encryptedToken || videoId || lesson) || '';
    const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) || (raw.trim().length === 11 && !raw.includes('/') && !raw.includes('.') ? [null, raw.trim()] : null);
    return match ? match[1] : raw.trim();
  });

  useEffect(() => {
    const raw = resolvePlayableVideoId(videoToken || encryptedToken || videoId || lesson) || '';
    const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) || (raw.trim().length === 11 && !raw.includes('/') && !raw.includes('.') ? [null, raw.trim()] : null);
    setActualVideoId(match ? match[1] : raw.trim());
  }, [videoToken, encryptedToken, videoId, lesson]);

  // Player states
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [availableQualities, setAvailableQualities] = useState(['hd1080', 'hd720', 'large', 'medium', 'small', 'auto']);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsTab, setSettingsTab] = useState('main'); // 'main' | 'speed' | 'quality'
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

  // Load YouTube IFrame API
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

    let checkInterval;

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
          host: 'https://www.youtube-nocookie.com',
          width: '100%',
          height: '100%',
          videoId: actualVideoId,
          playerVars: {
            autoplay: 0,
            controls: 0,           // Complete removal of YouTube's native UI (no Watch on YouTube, no Share, no profile)
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playsinline: 1,
            fs: 0,
            origin: window.location.origin,
            enablejsapi: 1,
            suggestedQuality: 'hd1080'
          },
          events: {
            onReady: (event) => {
              setIsReady(true);
              const player = event.target;
              try {
                const dur = player.getDuration();
                if (dur) setDuration(dur);
                const qLevels = player.getAvailableQualityLevels?.() || [];
                if (qLevels.length > 0) setAvailableQualities(qLevels);
              } catch (e) {}
            },
            onStateChange: (event) => {
              if (event.data === 1) { // Playing
                setIsPlaying(true);
              } else if (event.data === 2) { // Paused
                setIsPlaying(false);
                setShowControls(true);
              } else if (event.data === 0) { // Ended
                setIsPlaying(false);
                setShowControls(true);
              }
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
      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          initPlayer();
        }
      }, 150);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [actualVideoId, playerId]);

  // Track playback time
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
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, isScrubbing, duration]);

  // Autohide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && !showSettingsMenu) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, showSettingsMenu]);

  // Play / Pause Toggle
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (e) {}
  }, [isPlaying]);

  // Volume Change
  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (playerRef.current) {
      try {
        playerRef.current.setVolume(newVol);
        if (newVol === 0) {
          setIsMuted(true);
          playerRef.current.mute();
        } else if (isMuted) {
          setIsMuted(false);
          playerRef.current.unMute();
        }
      } catch (e) {}
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
        playerRef.current.setVolume(volume || 80);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (e) {}
  };

  // Seek
  const seekTo = (seconds) => {
    if (!playerRef.current) return;
    try {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    } catch (e) {}
  };

  const seekRelative = (offset) => {
    const target = Math.max(0, Math.min(duration, currentTime + offset));
    seekTo(target);
  };

  // Playback Rate / Speed
  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      try {
        playerRef.current.setPlaybackRate(rate);
      } catch (e) {}
    }
    setShowSettingsMenu(false);
    setSettingsTab('main');
  };

  // Quality Change
  const handleQualityChange = (q) => {
    setQuality(q);
    if (playerRef.current && typeof playerRef.current.setPlaybackQuality === 'function') {
      try {
        playerRef.current.setPlaybackQuality(q);
      } catch (e) {}
    }
    setShowSettingsMenu(false);
    setSettingsTab('main');
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) return;
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        seekRelative(-5);
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        seekRelative(5);
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, duration, currentTime]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!actualVideoId) {
    return (
      <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center text-center p-8 bg-[#0d0714] text-white">
        <p className="text-sm text-white/60">No video ID provided for this lesson.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden select-none group"
      style={{ width: '100%', height: '100%', minHeight: '380px', aspectRatio: '16/9' }}
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ── YouTube Headless Stream Video ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div id={playerId} className="w-full h-full" />
      </div>

      {/* ── Click to Play / Pause Overlay ── */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* ── Center Play Button Overlay (when paused) ── */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute z-20 w-20 h-20 rounded-full bg-[#C878BE]/90 hover:bg-[#C878BE] hover:scale-110 text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all cursor-pointer border border-white/20"
          aria-label="Play Video"
        >
          <Play size={32} weight="fill" className="ml-1" />
        </button>
      )}

      {/* ── LUXURY CONTROLS BAR (Appears on Hover / Active) ── */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2.5 ${showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Scrubber Bar */}
        <div 
          className="relative w-full h-3 sm:h-3.5 flex items-center cursor-pointer group/bar"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            seekTo(clickPos * duration);
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            setHoverPos(pos);
            setHoverTime(pos * duration);
          }}
          onMouseLeave={() => setHoverTime(null)}
        >
          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div 
              className="absolute -top-7 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-white font-mono text-[11px] shadow -translate-x-1/2 pointer-events-none"
              style={{ left: `${hoverPos * 100}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
          {/* Track background */}
          <div className="w-full h-1.5 group-hover/bar:h-2 rounded-full bg-white/25 overflow-hidden relative transition-all">
            {/* Buffered */}
            <div className="absolute top-0 bottom-0 left-0 bg-white/40 rounded-full" style={{ width: `${buffered}%` }} />
            {/* Progress Fill */}
            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#D97FC8] to-[#C878BE] rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
          {/* Scrubber Thumb */}
          <div 
            className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md -translate-x-1/2 scale-0 group-hover/bar:scale-100 transition-transform"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between gap-4 text-white text-sm">
          {/* Left: Play/Pause, Replay, Volume, Timestamp */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" className="ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => seekRelative(-10)}
              className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer text-white/80 hover:text-white"
              title="Rewind 10 seconds"
            >
              <ArrowCounterClockwise size={18} weight="bold" />
            </button>

            <button
              type="button"
              onClick={() => seekRelative(10)}
              className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer text-white/80 hover:text-white"
              title="Forward 10 seconds"
            >
              <ArrowClockwise size={18} weight="bold" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/vol">
              <button
                type="button"
                onClick={toggleMute}
                className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? <SpeakerSlash size={20} /> : <SpeakerHigh size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-16 sm:w-20 h-1.5 accent-[#C878BE] bg-white/30 rounded-lg cursor-pointer opacity-80 hover:opacity-100"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-xs font-mono text-white/80 ml-1">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 text-white/40">/</span>
              <span className="text-white/60">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Quality & Speed Settings ⚙️ + Fullscreen */}
          <div className="flex items-center gap-2 relative">
            {/* Settings Button */}
            <button
              type="button"
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-all cursor-pointer ${showSettingsMenu ? 'bg-white/20 text-[#E090D6]' : 'text-white/80 hover:text-white'}`}
              title="Settings (Quality & Speed)"
            >
              <Gear size={20} weight="bold" />
            </button>

            {/* Settings Popover Menu */}
            {showSettingsMenu && (
              <div className="absolute bottom-12 right-0 w-56 rounded-xl bg-[#160B1C]/95 border border-white/15 shadow-2xl backdrop-blur-xl p-2 z-50 text-xs">
                {settingsTab === 'main' && (
                  <div className="flex flex-col gap-1">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-white/50 uppercase tracking-wider border-b border-white/10">
                      Settings
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettingsTab('speed')}
                      className="w-full px-3 py-2 rounded-lg hover:bg-white/10 text-left flex items-center justify-between text-white transition-colors cursor-pointer"
                    >
                      <span>Playback Speed</span>
                      <span className="text-[#E090D6] font-semibold">{playbackRate === 1 ? 'Normal' : `${playbackRate}x`} ›</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsTab('quality')}
                      className="w-full px-3 py-2 rounded-lg hover:bg-white/10 text-left flex items-center justify-between text-white transition-colors cursor-pointer"
                    >
                      <span>Quality</span>
                      <span className="text-[#E090D6] font-semibold uppercase">{quality === 'auto' ? 'Auto (1080p)' : quality} ›</span>
                    </button>
                  </div>
                )}

                {/* Speed Submenu */}
                {settingsTab === 'speed' && (
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setSettingsTab('main')}
                      className="px-3 py-1.5 text-[11px] font-bold text-[#E090D6] text-left hover:underline cursor-pointer border-b border-white/10"
                    >
                      ‹ Back to Settings
                    </button>
                    {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => handleRateChange(rate)}
                        className={`w-full px-3 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer ${playbackRate === rate ? 'bg-[#C878BE]/30 text-[#E090D6] font-bold' : 'hover:bg-white/10 text-white'}`}
                      >
                        <span>{rate === 1 ? '1.0x (Normal)' : `${rate}x`}</span>
                        {playbackRate === rate && <Check size={14} weight="bold" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Quality Submenu */}
                {settingsTab === 'quality' && (
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setSettingsTab('main')}
                      className="px-3 py-1.5 text-[11px] font-bold text-[#E090D6] text-left hover:underline cursor-pointer border-b border-white/10"
                    >
                      ‹ Back to Settings
                    </button>
                    {[
                      ['auto', 'Auto (HD 1080p)'],
                      ['hd1080', '1080p HD (High Definition)'],
                      ['hd720', '720p HD'],
                      ['large', '480p (Standard)'],
                      ['medium', '360p (Data Saver)']
                    ].map(([qVal, qLabel]) => (
                      <button
                        key={qVal}
                        type="button"
                        onClick={() => handleQualityChange(qVal)}
                        className={`w-full px-3 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer ${quality === qVal ? 'bg-[#C878BE]/30 text-[#E090D6] font-bold' : 'hover:bg-white/10 text-white'}`}
                      >
                        <span>{qLabel}</span>
                        {quality === qVal && <Check size={14} weight="bold" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <ArrowsIn size={20} weight="bold" /> : <ArrowsOut size={20} weight="bold" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
