import React, { useState, useEffect, useMemo, useRef } from 'react';
import { resolvePlayableVideoId } from '../../utils/videoSecurity';

export default function ProtectedYouTubePlayer({ 
  videoId, 
  encryptedToken, 
  videoToken, 
  lesson, 
  title = 'Course Lesson Video' 
}) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Decrypt and resolve actual playable YouTube Video ID
  const actualVideoId = useMemo(() => {
    const raw = resolvePlayableVideoId(videoToken || encryptedToken || videoId || lesson) || '';
    const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) || (raw.trim().length === 11 && !raw.includes('/') && !raw.includes('.') ? [null, raw.trim()] : null);
    return match ? match[1] : raw.trim();
  }, [videoToken, encryptedToken, videoId, lesson]);

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [actualVideoId]);

  // Track container fullscreen changes so overlays scale & stay active in fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  if (!actualVideoId) {
    return (
      <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center text-center p-8 bg-[#0d0714] text-white">
        <p className="text-sm text-white/60">No video ID provided for this lesson.</p>
      </div>
    );
  }

  // Pure standard YouTube embed URL without internal fullscreen to keep overlays on top at any scale
  const embedUrl = `https://www.youtube.com/embed/${actualVideoId}?rel=0&playsinline=1&enablejsapi=1&fs=0`;

  // Helper handler to strictly block external navigation clicks
  const blockEvent = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative bg-black flex items-center justify-center select-none"
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: isFullscreen ? '100vh' : '380px', 
        aspectRatio: isFullscreen ? 'unset' : '16/9', 
        position: 'relative', 
        overflow: 'hidden' 
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        key={actualVideoId}
        src={embedUrl}
        title={title || 'Course Lesson Video'}
        className="w-full h-full border-0 absolute inset-0 pointer-events-auto"
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        onError={() => setHasError(true)}
      />

      {/* 1. TOP-LEFT OVERLAY: Blocks channel avatar, title link, and channel name at all scale/resolutions */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 'calc(100% - 210px)',
          height: isFullscreen ? '110px' : '85px',
          zIndex: 30,
          background: 'rgba(0,0,0,0.001)',
          cursor: 'default',
          pointerEvents: 'auto'
        }}
        onClick={blockEvent}
        onMouseDown={blockEvent}
        onMouseUp={blockEvent}
        onPointerDown={blockEvent}
        onPointerUp={blockEvent}
        onTouchStart={blockEvent}
        onTouchEnd={blockEvent}
        onDoubleClick={blockEvent}
        onContextMenu={blockEvent}
      />

      {/* 2. BOTTOM-LEFT OVERLAY: Blocks the Share & Watch Later capsule icon at all scale/resolutions */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: isFullscreen ? '260px' : '190px',
          height: isFullscreen ? '100px' : '80px',
          zIndex: 30,
          background: 'rgba(0,0,0,0.001)',
          cursor: 'default',
          pointerEvents: 'auto'
        }}
        onClick={blockEvent}
        onMouseDown={blockEvent}
        onMouseUp={blockEvent}
        onPointerDown={blockEvent}
        onPointerUp={blockEvent}
        onTouchStart={blockEvent}
        onTouchEnd={blockEvent}
        onDoubleClick={blockEvent}
        onContextMenu={blockEvent}
      />

      {/* 3. BOTTOM-RIGHT OVERLAY: Blocks the 'Watch on YouTube' logo watermark pill at all scale/resolutions */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: isFullscreen ? '320px' : '260px',
          height: isFullscreen ? '90px' : '75px',
          zIndex: 30,
          background: 'rgba(0,0,0,0.001)',
          cursor: 'default',
          pointerEvents: 'auto'
        }}
        onClick={blockEvent}
        onMouseDown={blockEvent}
        onMouseUp={blockEvent}
        onPointerDown={blockEvent}
        onPointerUp={blockEvent}
        onTouchStart={blockEvent}
        onTouchEnd={blockEvent}
        onDoubleClick={blockEvent}
        onContextMenu={blockEvent}
      />

      {/* 4. SEAMLESS CONTAINER FULLSCREEN BUTTON: Stays interactive at bottom-right above the logo */}
      <button
        type="button"
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit full screen (f)' : 'Full screen (f)'}
        style={{
          position: 'absolute',
          bottom: isFullscreen ? '28px' : '18px',
          right: isFullscreen ? '28px' : '18px',
          zIndex: 40,
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: 'rgba(28, 28, 28, 0.75)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(45, 45, 45, 0.95)';
          e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(28, 28, 28, 0.75)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isFullscreen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6m0-6L14 10M9 21H3v-6m0 6l7-7m11 0l-7 7m7-7v6m-18-6l7-7M3 9V3h6"/>
          </svg>
        )}
      </button>

      {hasError && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-6 text-white z-20">
          <p className="text-base font-semibold text-red-400 mb-2">Unable to load video</p>
          <p className="text-xs text-white/60 max-w-sm">
            Please verify the YouTube video ID ({actualVideoId}) is set to "Unlisted" or "Public" on YouTube.
          </p>
        </div>
      )}
    </div>
  );
}
