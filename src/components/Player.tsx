import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2, ListMusic, AlertCircle, Zap, ZapOff, Heart, Share2 } from 'lucide-react';
import { useApp } from '../AppContext';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { logger } from '../services/logger';
import { getSongSuggestions } from '../services/musicService';
import { ShareModal } from './ShareModal';
import { FullScreenPlayer } from './FullScreenPlayer';
import { motion, AnimatePresence } from 'framer-motion';

export const Player: React.FC = () => {
  const { 
    currentSong, setCurrentSong, 
    isPlaying, setIsPlaying, 
    isDarkMode, addToHistory,
    isAutoplayEnabled, setIsAutoplayEnabled,
    playSource, playNext, playPrevious,
    playQueue, setPlayQueue, currentIndex, setCurrentIndex,
    toggleLikeSong, isSongLiked
  } = useApp();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showScreenshotToast, setShowScreenshotToast] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); // minutes
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null); // seconds

  // Sleep Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sleepTimer !== null && isPlaying) {
      if (sleepTimerRemaining === null) {
        setSleepTimerRemaining(sleepTimer * 60);
      }
      
      interval = setInterval(() => {
        setSleepTimerRemaining((prev) => {
          if (prev !== null && prev <= 1) {
            setIsPlaying(false);
            setSleepTimer(null);
            return null;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    } else if (!isPlaying && sleepTimerRemaining !== null) {
      // Pause the timer if music is paused
    } else {
      setSleepTimerRemaining(null);
    }

    return () => clearInterval(interval);
  }, [sleepTimer, isPlaying, sleepTimerRemaining]);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, currentSong]);

  // Screenshot detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect PrintScreen or Cmd+Shift+3/4
      if (
        e.key === 'PrintScreen' || 
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))
      ) {
        setShowScreenshotToast(true);
        setIsShareModalOpen(true);
        setTimeout(() => setShowScreenshotToast(false), 3000);
      }
    };

    window.addEventListener('keyup', handleKeyDown);
    return () => window.removeEventListener('keyup', handleKeyDown);
  }, []);

  // Media Session API for background playback and lock screen controls
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album,
        artwork: [
          { src: currentSong.coverUrl, sizes: '96x96', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '128x128', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '192x192', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '256x256', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '384x384', type: 'image/png' },
          { src: currentSong.coverUrl, sizes: '512x512', type: 'image/png' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
    }
  }, [currentSong]);

  useEffect(() => {
    setError(null);
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().then(() => {
          setError(null);
          if (currentSong) addToHistory(currentSong);
        }).catch(e => {
          if (e.name !== 'AbortError') {
            const errorMsg = `Playback failed: ${e.message}`;
            logger.error(errorMsg, { error: e, song: currentSong });
            setError(errorMsg);
            setIsPlaying(false);
          }
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const handleNext = async () => {
    // If we have more songs in the queue, play the next one
    if (playQueue.length > 0 && currentIndex < playQueue.length - 1) {
      playNext();
      return;
    }

    // If we're at the end of the queue and autoplay is enabled
    if (isAutoplayEnabled && currentSong) {
      setIsBuffering(true);
      try {
        const suggestions = await getSongSuggestions(currentSong.id);
        if (suggestions.length > 0) {
          // Fetch and play new songs individually
          const nextSong = suggestions[0];
          
          const newQueue = [...playQueue, nextSong];
          setPlayQueue(newQueue);
          
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);
          setCurrentSong(nextSong);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      } catch (err) {
        logger.error('Autoplay failed to get suggestions', { err });
        setIsPlaying(false);
      } finally {
        setIsBuffering(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 0;
      setCurrentTimeSec(current);
      setDurationSec(duration);
      setProgress((current / duration) * 100);
      
      const mins = Math.floor(current / 60);
      const secs = Math.floor(current % 60);
      setCurrentTime(`${mins}:${secs < 10 ? '0' : ''}${secs}`);

      // Update Media Session position state
      if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
        navigator.mediaSession.setPositionState({
          duration: duration || 0,
          playbackRate: audioRef.current.playbackRate,
          position: current
        });
      }
    }
  };

  const handleAudioError = (e: any) => {
    const error = audioRef.current?.error;
    let message = 'Unknown audio error';
    
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED: message = 'Playback aborted by user'; break;
        case error.MEDIA_ERR_NETWORK: message = 'Network error during playback'; break;
        case error.MEDIA_ERR_DECODE: message = 'Audio decoding failed'; break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED: message = 'Audio format not supported or URL invalid'; break;
      }
    }
    
    logger.error('Audio element error', { code: error?.code, message, url: currentSong?.previewUrl });
    setError(message);
    setIsPlaying(false);
  };

  const handleSeek = (pct: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = pct * audioRef.current.duration;
    }
  };

  if (!currentSong) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={clsx(
          "mx-2 mb-2 md:mx-0 md:mb-0 rounded-xl md:rounded-none h-14 md:h-24 px-3 md:px-6 flex items-center justify-between relative overflow-hidden transition-all duration-300 group/player",
          isDarkMode 
            ? "bg-[#181818] md:bg-transparent md:glass-dark border border-white/10 md:border-t md:border-x-0 md:border-b-0 md:border-white/5" 
            : "bg-white md:bg-transparent md:glass border border-black/10 md:border-t md:border-x-0 md:border-b-0 md:border-black/5"
        )}
      >
        {/* Mobile Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 md:hidden group-hover/player:h-1 transition-all">
          <div 
            className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-100" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        {/* Screenshot Toast */}
        {showScreenshotToast && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-full shadow-xl flex items-center gap-2 animate-bounce z-50">
            Screenshot detected! Generating share card...
          </div>
        )}

        {/* Error Toast */}
        {error && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-full shadow-xl flex items-center gap-2 animate-bounce">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {currentSong.previewUrl && (
          <audio 
            ref={audioRef} 
            src={currentSong.previewUrl} 
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleNext}
            onError={handleAudioError}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onCanPlay={() => setIsBuffering(false)}
          />
        )}

        {/* Song Info */}
        <div className="flex items-center gap-3 lg:gap-4 w-[60%] md:w-1/3">
          <div 
            className="relative group cursor-pointer hover:opacity-80 transition-opacity shrink-0" 
            onClick={() => setIsFullScreen(true)}
            title="Open Full Player"
          >
            <img 
              src={currentSong.coverUrl} 
              alt={currentSong.title} 
              className={clsx(
                "w-10 h-10 md:w-14 md:h-14 rounded-md md:rounded-lg object-cover shadow-lg transition-all",
                isBuffering && "opacity-50 grayscale"
              )}
              referrerPolicy="no-referrer"
            />
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-4 h-4 md:w-6 md:h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0 cursor-pointer" onClick={() => setIsFullScreen(true)}>
            <span className="font-semibold text-xs md:text-sm dark:text-white hover:underline truncate">
              {currentSong.title}
            </span>
            <span className="text-[10px] md:text-xs text-slate-400 hover:underline truncate">
              {currentSong.artist}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-end md:justify-center gap-3 md:gap-2 w-[40%] md:w-1/3">
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => toggleLikeSong(currentSong)}
              className="md:hidden text-slate-400 hover:text-white transition-colors"
            >
              <Heart 
                size={20} 
                className={clsx(isSongLiked(currentSong.id) && "fill-blue-500 text-blue-500")} 
              />
            </button>
            <button 
              onClick={() => setIsAutoplayEnabled(!isAutoplayEnabled)}
              className={clsx(
                "hidden md:block transition-colors",
                isAutoplayEnabled ? "text-blue-500" : "text-slate-400 hover:text-white"
              )}
              title={isAutoplayEnabled ? "Autoplay On" : "Autoplay Off"}
            >
              {isAutoplayEnabled ? <Zap size={16} fill="currentColor" /> : <ZapOff size={16} />}
            </button>
            <button 
              onClick={playPrevious}
              disabled={playSource !== 'playlist' || currentIndex <= 0}
              className="hidden md:block text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>
            
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 md:w-10 md:h-10 bg-transparent md:bg-white rounded-full flex items-center justify-center md:hover:scale-105 transition-transform md:shadow-lg overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isPlaying ? 'pause' : 'play'}
                  initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  {isPlaying 
                    ? <Pause size={24} className="md:fill-black md:text-black dark:text-white" fill="currentColor" /> 
                    : <Play size={24} className="md:fill-black md:text-black dark:text-white ml-1 md:ml-1" fill="currentColor" />
                  }
                </motion.div>
              </AnimatePresence>
            </motion.button>

            <button 
              onClick={handleNext}
              className="hidden md:block text-slate-400 hover:text-white transition-colors"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button className="hidden md:block text-slate-400 hover:text-white transition-colors">
              <Repeat size={16} />
            </button>
          </div>
          <div className="hidden md:flex w-full items-center gap-2 mt-2">
            <span className="text-[10px] text-slate-400 w-8 text-right">{currentTime}</span>
            <div 
              className="flex-1 h-1 hover:h-1.5 bg-white/10 rounded-full cursor-pointer group relative transition-all"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const pct = x / rect.width;
                if (audioRef.current) {
                  audioRef.current.currentTime = pct * audioRef.current.duration;
                }
              }}
            >
              <div className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-100 relative rounded-full" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 w-8">{currentSong.duration}</span>
          </div>
        </div>

        {/* Volume & Extra (Desktop Only) */}
        <div className="hidden md:flex items-center justify-end gap-4 w-1/3">
          <button 
            onClick={() => toggleLikeSong(currentSong)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Heart 
              size={18} 
              className={clsx(isSongLiked(currentSong.id) && "fill-blue-500 text-blue-500")} 
            />
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="text-slate-400 hover:text-white transition-colors" 
            title="Share"
          >
            <Share2 size={18} />
          </button>
          <Link to="/queue" className="text-slate-400 hover:text-white transition-colors" title="Queue">
            <ListMusic size={20} />
          </Link>
          <div className="flex items-center gap-2 w-32 group">
            <Volume2 size={20} className="text-slate-400 group-hover:text-white transition-colors" />
            <div 
              className="flex-1 h-1 hover:h-1.5 bg-white/10 rounded-full cursor-pointer relative transition-all"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const vol = Math.max(0, Math.min(1, x / rect.width));
                setVolume(vol);
              }}
            >
              <div className="h-full bg-white/60 group-hover:bg-blue-500 transition-all rounded-full" style={{ width: `${volume * 100}%` }} />
            </div>
          </div>
          <button 
            onClick={() => setIsFullScreen(true)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </motion.div>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      <FullScreenPlayer 
        isOpen={isFullScreen} 
        onClose={() => setIsFullScreen(false)} 
        currentTimeStr={currentTime}
        progressPct={progress}
        onSeek={handleSeek}
        durationSec={durationSec}
        currentTimeSec={currentTimeSec}
        volume={volume}
        onVolumeChange={setVolume}
        sleepTimer={sleepTimer}
        setSleepTimer={setSleepTimer}
        sleepTimerRemaining={sleepTimerRemaining}
      />
    </AnimatePresence>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
