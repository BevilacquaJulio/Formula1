import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../../config/siteConfig';
import './VideoPlayer.module.css';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

interface VideoElementWithWebkit extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
}

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLabel, setTimeLabel] = useState('0:00 / 0:00');

  const updateProgress = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    setProgress(pct);
    setTimeLabel(`${formatTime(video.currentTime)} / ${formatTime(video.duration)}`);
  };

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    void video.play();
    setPlaying(true);
  };

  const pause = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setPlaying(false);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) play();
    else pause();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', () => setPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('ended', () => setPlaying(false));
    };
  }, []);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const track = e.currentTarget;
    if (!video || !video.duration) return;
    const rect = track.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
  };

  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const handleFullscreen = () => {
    const video = videoRef.current as VideoElementWithWebkit | null;
    const container = containerRef.current;
    if (!video || !container) return;

    const isVideoFs = video.webkitDisplayingFullscreen === true;
    const isContainerFs = document.fullscreenElement === container;

    if (isVideoFs && video.webkitExitFullscreen) {
      video.webkitExitFullscreen();
    } else if (isContainerFs) {
      void document.exitFullscreen();
    } else if (video.webkitEnterFullscreen) {
      if (video.paused) void video.play();
      video.webkitEnterFullscreen();
    } else if (video.requestFullscreen) {
      if (video.paused) void video.play();
      void video.requestFullscreen();
    } else if (container.requestFullscreen) {
      void container.requestFullscreen();
    }
  };

  return (
    <div id="video" className="about-video-section">
      <div className="section-header">
        <div className="eyebrow">Behind the Wheel</div>
        <h2>
          {siteConfig.videoSectionHeading} <span>{siteConfig.videoSectionHighlight}</span>
        </h2>
      </div>

      <div className="vid-wrapper">
        <div className="vid-corner vid-corner-tl" />
        <div className="vid-corner vid-corner-tr" />
        <div className="vid-corner vid-corner-bl" />
        <div className="vid-corner vid-corner-br" />

        <div
          className={`vid-container${playing ? ' playing' : ''}`}
          id="vidContainer"
          ref={containerRef}
        >
          <div className="vid-badge">
            <div className="vid-badge-dot" />
            <span className="vid-badge-text">{siteConfig.videoBadge}</span>
          </div>

          <div className="vid-overlay" id="vidOverlay" onClick={play} role="presentation">
            <div className="vid-play-glow" />
            <div className="vid-play-btn" id="vidPlayBtn" role="button" tabIndex={0} onClick={play}>
              <div className="vid-play-ring" />
              <div className="vid-play-circle">
                <div className="vid-play-icon" />
              </div>
            </div>
            <span className="vid-overlay-label">Play Video</span>
          </div>

          <video id="raceVideo" ref={videoRef} preload="metadata" playsInline onClick={togglePlay}>
            <source src={siteConfig.videoSrc} type="video/mp4" />
          </video>

          <div className="vid-bar">
            <button type="button" className="vid-bar-btn" aria-label="Play/Pause" onClick={togglePlay}>
              {!playing ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              )}
            </button>
            <div className="vid-progress-track" id="vidProgressTrack" onClick={handleProgressClick}>
              <div className="vid-progress-fill" style={{ width: `${progress}%` }} />
              <div className="vid-progress-thumb" style={{ left: `${progress}%` }} />
            </div>
            <span className="vid-bar-time">{timeLabel}</span>
            <button
              type="button"
              className="vid-bar-btn"
              aria-label="Mute"
              onClick={handleMute}
              style={{ opacity: muted ? 0.35 : 1 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </button>
            <button type="button" className="vid-bar-btn" aria-label="Fullscreen" onClick={handleFullscreen}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="vid-meta">
        <div className="vid-title">{siteConfig.videoTitle}</div>
        <div className="vid-desc">{siteConfig.videoDescription}</div>
      </div>
    </div>
  );
}
