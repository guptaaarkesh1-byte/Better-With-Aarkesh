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

  // Construct optimized privacy-enhanced embed URL with full settings, controls, and modest branding
  const embedUrl = `https://www.youtube-nocookie.com/embed/${actualVideoId}?enablejsapi=1&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&playsinline=1&iv_load_policy=3&disablekb=0&autoplay=0`;

  return (
    <div 
      className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden group select-none"
      style={{ width: '100%', height: '100%', minHeight: '360px', aspectRatio: '16/9' }}
      onContextMenu={(e) => e.preventDefault()}
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

      {/* Top Banner Click-Blocker (Hides/blocks top title & share buttons) */}
      <div 
        className="absolute top-0 left-0 right-0 h-14 z-10 pointer-events-auto cursor-default bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        title=""
      />

      {/* Bottom Corner Click-Blockers (Blocks 'Watch on YouTube' / external share pills) */}
      <div 
        className="absolute bottom-12 right-2 w-44 h-12 z-10 pointer-events-auto cursor-default bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        title=""
      />
      <div 
        className="absolute bottom-12 left-2 w-28 h-12 z-10 pointer-events-auto cursor-default bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        title=""
      />

      {hasError && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-6 text-white z-20">
          <p className="text-base font-semibold text-red-400 mb-2">Unable to load YouTube video</p>
          <p className="text-xs text-white/60 max-w-sm mb-4">
            Please check if the video ID ({actualVideoId}) is valid and set to "Unlisted" or "Public" on YouTube.
          </p>
        </div>
      )}
    </div>
  );
}
