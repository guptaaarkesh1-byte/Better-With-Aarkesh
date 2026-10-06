import React, { useState, useEffect, useMemo } from 'react';
import { resolvePlayableVideoId } from '../../utils/videoSecurity';

export default function ProtectedYouTubePlayer({ 
  videoId, 
  encryptedToken, 
  videoToken, 
  lesson, 
  title = 'Course Lesson Video' 
}) {
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

  if (!actualVideoId) {
    return (
      <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center text-center p-8 bg-[#0d0714] text-white">
        <p className="text-sm text-white/60">No video ID provided for this lesson.</p>
      </div>
    );
  }

  // Official YouTube embed URL with native settings, fullscreen, and quality options
  const embedUrl = `https://www.youtube.com/embed/${actualVideoId}?rel=0&playsinline=1&enablejsapi=1&modestbranding=1`;

  const preventClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div 
      className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden select-none"
      style={{ width: '100%', height: '100%', minHeight: '380px', aspectRatio: '16/9' }}
      onContextMenu={preventClick}
    >
      <iframe
        key={actualVideoId}
        src={embedUrl}
        title={title || 'Course Lesson Video'}
        className="w-full h-full border-0 absolute inset-0"
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onError={() => setHasError(true)}
      />

      {/* ── TOP BAR CLICK-BLOCKER ──
          Makes Channel Name, Avatar, Share, and Watch Later 100% NON-CLICKABLE */}
      <div 
        className="absolute top-0 left-0 right-0 h-14 z-20 pointer-events-auto cursor-default bg-transparent"
        onClick={preventClick}
        onMouseDown={preventClick}
        onMouseUp={preventClick}
        title=""
      />

      {/* ── BOTTOM-RIGHT YOUTUBE LOGO CLICK-BLOCKER ──
          Makes YouTube Watermark Logo 100% NON-CLICKABLE */}
      <div 
        className="absolute bottom-0 right-0 w-24 h-12 z-20 pointer-events-auto cursor-default bg-transparent"
        onClick={preventClick}
        onMouseDown={preventClick}
        onMouseUp={preventClick}
        title=""
      />

      {/* ── BOTTOM-LEFT SHARE / WATCH LATER CLICK-BLOCKER ── */}
      <div 
        className="absolute bottom-0 left-0 w-24 h-12 z-20 pointer-events-auto cursor-default bg-transparent"
        onClick={preventClick}
        onMouseDown={preventClick}
        onMouseUp={preventClick}
        title=""
      />

      {hasError && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-6 text-white z-30">
          <p className="text-base font-semibold text-red-400 mb-2">Unable to load video</p>
          <p className="text-xs text-white/60 max-w-sm">
            Please verify the YouTube video ID ({actualVideoId}) is set to "Unlisted" or "Public" on YouTube.
          </p>
        </div>
      )}
    </div>
  );
}
