import React, { useEffect, useRef } from 'react';
import '@mux/mux-player';

class VideoErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('Video preview error caught by boundary:', err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-black text-white/70 text-xs text-center gap-3">
          <span className="text-white font-medium">Video stream is active on Mux</span>
          <span className="text-white/40 font-mono text-[11px]">Playback ID: {this.props.playbackId}</span>
          <a
            href={`https://stream.mux.com/${this.props.playbackId}.m3u8`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#c79c6e] text-xs font-semibold"
          >
            Open Stream Directly
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MuxVideoPlayer({ playbackId, autoPlay = false, style, className = '' }) {
  const playerRef = useRef(null);

  useEffect(() => {
    if (playerRef.current && playbackId) {
      playerRef.current.playbackId = playbackId;
    }
  }, [playbackId]);

  if (!playbackId) return null;

  return (
    <VideoErrorBoundary playbackId={playbackId}>
      <mux-player
        ref={playerRef}
        playback-id={playbackId}
        stream-type="on-demand"
        controls
        autoplay={autoPlay ? true : undefined}
        style={style || { width: '100%', height: '100%', display: 'block' }}
        class={className}
      />
    </VideoErrorBoundary>
  );
}
