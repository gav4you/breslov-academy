import React, { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Settings, 
  SkipBack, SkipForward, Rewind, FastForward, PictureInPicture,
  Subtitles, BookmarkPlus, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoPlayer({ 
  src, 
  onTimeUpdate, 
  onEnded, 
  initialTime = 0,
  bookmarks = [],
  onAddBookmark,
  transcript = []
}) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const controlsTimeout = useRef(null);

  useEffect(() => {
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, [initialTime]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      onTimeUpdate?.(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const changePlaybackRate = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current?.parentElement) {
      if (!document.fullscreenElement) {
        videoRef.current.parentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const activeTranscriptLine = transcript.find(
    (line, idx) => {
      const nextLine = transcript[idx + 1];
      return currentTime >= line.start && (!nextLine || currentTime < nextLine.start);
    }
  );

  return (
    <Card className="relative overflow-hidden rounded-[2rem] bg-black group">
      <div 
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => playing && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full aspect-video"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setPlaying(false);
            onEnded?.();
          }}
          onClick={togglePlay}
        />

        {/* Bookmarks on timeline */}
        <div className="absolute bottom-20 left-0 right-0 h-1">
          {bookmarks.map((bookmark, idx) => (
            <div
              key={idx}
              className="absolute w-2 h-2 bg-amber-400 rounded-full -translate-y-1/2"
              style={{ left: `${(bookmark.timestamp / duration) * 100}%` }}
              title={bookmark.note}
            />
          ))}
        </div>

        {/* Center play button */}
        <AnimatePresence>
          {!playing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
              onClick={togglePlay}
            >
              <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                <Play className="w-10 h-10 text-slate-900 ml-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Transcript Overlay */}
        {showTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-24 left-4 right-4 max-h-32 overflow-y-auto bg-black/80 backdrop-blur-md rounded-xl p-4"
          >
            <div className="space-y-2">
              {transcript.map((line, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSeek([line.start])}
                  className={`block text-left w-full px-2 py-1 rounded transition-colors ${
                    activeTranscriptLine?.start === line.start
                      ? 'bg-blue-500 text-white'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs opacity-60">{formatTime(line.start)}</span>
                  {' '}
                  {line.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-20"
            >
              {/* Progress Bar */}
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={handleSeek}
                className="mb-4"
              />

              <div className="flex items-center justify-between">
                {/* Left controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => skip(-10)}
                    className="text-white hover:bg-white/20"
                  >
                    <Rewind className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => skip(10)}
                    className="text-white hover:bg-white/20"
                  >
                    <FastForward className="w-5 h-5" />
                  </Button>

                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    <Slider
                      value={[muted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-20"
                    />
                  </div>

                  <span className="text-white text-sm ml-4">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onAddBookmark?.(currentTime)}
                    className="text-white hover:bg-white/20"
                    title="Add bookmark"
                  >
                    <BookmarkPlus className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="text-white hover:bg-white/20"
                    title="Toggle transcript"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCaptionsEnabled(!captionsEnabled)}
                    className="text-white hover:bg-white/20"
                  >
                    <Subtitles className="w-5 h-5" />
                  </Button>

                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-white hover:bg-white/20"
                    >
                      <Settings className="w-5 h-5" />
                    </Button>

                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 bg-slate-900 rounded-xl p-2 min-w-[200px]">
                        <div className="text-white text-sm font-bold mb-2 px-2">Playback Speed</div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                          <button
                            key={rate}
                            onClick={() => changePlaybackRate(rate)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                              playbackRate === rate
                                ? 'bg-blue-500 text-white'
                                : 'text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {rate}x {rate === 1 && '(Normal)'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePiP}
                    className="text-white hover:bg-white/20"
                  >
                    <PictureInPicture className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}