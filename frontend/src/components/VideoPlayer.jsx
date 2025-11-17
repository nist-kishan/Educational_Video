import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings } from 'lucide-react';

const VideoPlayer = ({ videoUrl, videoTitle, courseTitle, onProgress, duration = 0 }) => {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [error, setError] = useState(null);
  const controlsTimeoutRef = useRef(null);

  // Convert Cloudinary URL to playable format
  const getPlayableUrl = (url) => {
    if (!url || url.trim() === '') return '';
    
    // If it's a Cloudinary URL, convert it to a playable format
    if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
      // Add /fl_progressive,q_auto/ to make it progressive and auto-quality
      // and change /upload/ to /upload/fl_progressive,q_auto/
      return url.replace('/upload/', '/upload/fl_progressive,q_auto/');
    }
    
    return url;
  };

  const playableUrl = getPlayableUrl(videoUrl);
  
  // Check if URL is valid
  const isValidUrl = playableUrl && playableUrl.trim() !== '';

  // Format time in MM:SS format
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // Handle playback speed
  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * videoDuration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle skip forward/backward
  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + seconds);
    }
  };

  // Update current time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (onProgress) {
        onProgress(videoRef.current.currentTime);
      }
    }
  };

  // Update duration
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  // Handle mouse move to show controls
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Cleanup timeout
  useEffect(() => {
    return () => clearTimeout(controlsTimeoutRef.current);
  }, []);

  const progressPercent = videoDuration ? (currentTime / videoDuration) * 100 : 0;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full rounded-lg overflow-hidden shadow-2xl ${
        isDark ? 'bg-gray-900' : 'bg-black'
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Container */}
      <div className="relative w-full bg-black aspect-video">
        {!isValidUrl ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <p className="text-yellow-400 text-lg font-semibold mb-2">No Video URL</p>
              <p className="text-gray-300 text-sm">This video doesn't have a valid URL yet</p>
              <p className="text-gray-400 text-xs mt-4">Please upload a video file</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <p className="text-red-400 text-lg font-semibold mb-2">Video Error</p>
              <p className="text-gray-300 text-sm">{error}</p>
              <p className="text-gray-400 text-xs mt-4">URL: {playableUrl?.substring(0, 50)}...</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={playableUrl}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onError={(e) => {
              console.error('Video error:', e);
              setError(`Video format not supported or URL invalid`);
            }}
            crossOrigin="anonymous"
            controlsList="nodownload"
          />
        )}

        {/* Video Info Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent"
        >
          <p className="text-gray-300 text-sm">{courseTitle}</p>
          <h3 className="text-white font-semibold text-lg">{videoTitle}</h3>
        </motion.div>

        {/* Center Play Button */}
        {!isPlaying && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-blue-500 hover:bg-blue-600 rounded-full p-4 transition-colors">
              <Play size={48} className="text-white fill-white" />
            </div>
          </motion.button>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 space-y-3"
        >
          {/* Progress Bar */}
          <div
            className="w-full h-1 bg-gray-600 rounded-full cursor-pointer hover:h-2 transition-all group"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="float-right w-3 h-3 bg-blue-500 rounded-full -mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(videoDuration)}</span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="p-2 hover:bg-white/20 rounded transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={20} className="text-white" />
                ) : (
                  <Play size={20} className="text-white fill-white" />
                )}
              </button>

              {/* Skip Backward */}
              <button
                onClick={() => skip(-10)}
                className="p-2 hover:bg-white/20 rounded transition-colors"
                title="Skip 10s backward"
              >
                <SkipBack size={20} className="text-white" />
              </button>

              {/* Skip Forward */}
              <button
                onClick={() => skip(10)}
                className="p-2 hover:bg-white/20 rounded transition-colors"
                title="Skip 10s forward"
              >
                <SkipForward size={20} className="text-white" />
              </button>

              {/* Volume Control */}
              <div className="flex items-center gap-2 group">
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX size={20} className="text-white" />
                  ) : (
                    <Volume2 size={20} className="text-white" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover:w-20 transition-all h-1 bg-gray-600 rounded-full cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Speed */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="p-2 hover:bg-white/20 rounded transition-colors text-white text-sm font-semibold"
                  title="Playback speed"
                >
                  {playbackSpeed}x
                </button>
                {showSpeedMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute bottom-full right-0 mb-2 rounded-lg shadow-lg ${
                      isDark ? 'bg-gray-800' : 'bg-gray-900'
                    } border border-gray-700 overflow-hidden z-50`}
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`block w-full px-4 py-2 text-sm text-left hover:bg-blue-500 transition-colors ${
                          playbackSpeed === speed ? 'bg-blue-500 text-white' : 'text-gray-300'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded transition-colors"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize size={20} className="text-white" />
                ) : (
                  <Maximize size={20} className="text-white" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;
