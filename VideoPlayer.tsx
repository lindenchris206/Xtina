import React, { useState, useRef, useEffect } from 'react';

interface VideoPlayerProps {
  src?: string | File;
  onClose?: () => void;
  autoPlay?: boolean;
  controls?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  onClose,
  autoPlay = false,
  controls = true
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [buffered, setBuffered] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (src) {
      if (typeof src === 'string') {
        setVideoUrl(src);
      } else {
        const url = URL.createObjectURL(src);
        setVideoUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('progress', handleProgress);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Video Element */}
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: '100%',
            height: 'auto'
          }}
          onClick={togglePlay}
        />
      ) : (
        <div style={{ color: '#fff', fontSize: '18px' }}>
          No video loaded
        </div>
      )}

      {/* Controls Overlay */}
      {controls && showControls && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            padding: '40px 20px 20px',
            transition: 'opacity 0.3s'
          }}
        >
          {/* Progress Bar */}
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            {/* Buffered Progress */}
            <div
              style={{
                position: 'absolute',
                height: '4px',
                backgroundColor: 'rgba(255,255,255,0.3)',
                width: `${buffered}%`,
                borderRadius: '2px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
            {/* Seek Slider */}
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              style={{
                width: '100%',
                height: '4px',
                cursor: 'pointer',
                appearance: 'none',
                background: `linear-gradient(to right, #e50914 0%, #e50914 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`,
                borderRadius: '2px',
                outline: 'none'
              }}
            />
          </div>

          {/* Control Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              {/* Skip Backward */}
              <button
                onClick={() => skip(-10)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                ⏪ 10s
              </button>

              {/* Skip Forward */}
              <button
                onClick={() => skip(10)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                10s ⏩
              </button>

              {/* Volume Control */}
              <button
                onClick={toggleMute}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{
                  width: '80px',
                  height: '4px',
                  cursor: 'pointer',
                  appearance: 'none',
                  background: `linear-gradient(to right, #fff 0%, #fff ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%, rgba(255,255,255,0.3) 100%)`,
                  borderRadius: '2px',
                  outline: 'none'
                }}
              />

              {/* Time Display */}
              <span style={{ color: '#fff', fontSize: '14px', minWidth: '100px' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Playback Speed */}
              <select
                value={playbackRate}
                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                {isFullscreen ? '⛶' : '⛶'}
              </button>

              {/* Close */}
              {onClose && (
                <button
                  onClick={onClose}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Bar with Close Button */}
      {showControls && onClose && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
            padding: '20px',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
