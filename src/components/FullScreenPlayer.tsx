import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, CheckCircle2, Volume2, VolumeX, Moon, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../AppContext';
import { clsx } from 'clsx';
import { getLyrics, getSyncedLyrics } from '../services/musicService';

interface FullScreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTimeStr: string;
  progressPct: number;
  onSeek: (pct: number) => void;
  durationSec: number;
  currentTimeSec: number;
  volume: number;
  onVolumeChange: (vol: number) => void;
  sleepTimer: number | null;
  setSleepTimer: (minutes: number | null) => void;
  sleepTimerRemaining: number | null;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  isOpen, onClose, currentTimeStr, progressPct, onSeek, durationSec, currentTimeSec, volume, onVolumeChange, sleepTimer, setSleepTimer, sleepTimerRemaining
}) => {
  const { currentSong, isPlaying, setIsPlaying, playNext, playPrevious, toggleLikeSong, isSongLiked } = useApp();
  const [lyrics, setLyrics] = useState<{text: string, time: number}[]>([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [showEqMenu, setShowEqMenu] = useState(false);
  const [eqPreset, setEqPreset] = useState('Flat');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [rawLyrics, setRawLyrics] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && currentSong) {
      setIsLoadingLyrics(true);
      setIsSynced(false);
      setLyrics([]);
      setRawLyrics([]);
      
      // Try to get perfectly synced lyrics first
      getSyncedLyrics(currentSong.title, currentSong.artist).then(syncedLines => {
        if (syncedLines && syncedLines.length > 0) {
          setLyrics(syncedLines);
          setIsSynced(true);
          setIsLoadingLyrics(false);
        } else {
          // Fallback to plain lyrics from JioSaavn
          getLyrics(currentSong.id).then(lines => {
            setRawLyrics(lines);
            setIsLoadingLyrics(false);
          });
        }
      });
    }
  }, [isOpen, currentSong]);

  useEffect(() => {
    if (!isSynced && rawLyrics.length > 0) {
      const startSec = Math.max(0, durationSec * 0.1);
      const endSec = durationSec > 0 ? durationSec * 0.9 : 180; // fallback to 3 mins
      const durationRange = endSec - startSec;
      
      const synced = rawLyrics.map((line, i) => {
        const time = startSec + (durationRange / Math.max(rawLyrics.length, 1)) * i;
        return { text: line, time };
      });
      setLyrics(synced);
    } else if (!isSynced) {
      setLyrics([]);
    }
  }, [rawLyrics, durationSec, isSynced]);

  // Find the currently active line
  const activeLineIndex = lyrics.findIndex((line, i) => {
    const nextLine = lyrics[i + 1];
    if (nextLine) {
      return currentTimeSec >= line.time && currentTimeSec < nextLine.time;
    }
    return currentTimeSec >= line.time;
  });

  // Auto-scroll to active line if user hasn't scrolled manually recently
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = () => {
    if (!isUserScrolling) {
      setIsUserScrolling(true);
    }
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 3000); // Resume auto-scroll after 3 seconds of inactivity
  };

  useEffect(() => {
    if (!isUserScrolling && scrollRef.current && activeLineIndex !== -1) {
      const activeEl = scrollRef.current.children[0]?.children[activeLineIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLineIndex, isUserScrolling]);

  const formatRemainingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentSong) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.y > 150 || velocity.y > 500) {
              onClose();
            }
          }}
          className="fixed inset-0 z-[60] bg-black text-white flex flex-col"
        >
          {/* Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-3xl scale-110 transition-all duration-1000"
            style={{ backgroundImage: `url(${currentSong.coverUrl})` }}
          />
          <div className="absolute inset-0 bg-black/40" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-6">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronDown size={28} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold tracking-widest uppercase opacity-70 flex items-center gap-2">
                Now Playing
                {isPlaying && (
                  <div className="flex items-end gap-[2px] h-3">
                    <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} className="w-1 bg-blue-400 rounded-full" />
                    <motion.div animate={{ height: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }} className="w-1 bg-blue-400 rounded-full" />
                    <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }} className="w-1 bg-blue-400 rounded-full" />
                  </div>
                )}
              </span>
              {lyrics.length > 0 && (
                <span className="text-[10px] text-white/50 mt-1">
                  {isSynced ? 'Synced Lyrics' : 'Estimated Sync'}
                </span>
              )}
            </div>
            <div className="relative flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowEqMenu(!showEqMenu);
                    setShowTimerMenu(false);
                  }}
                  className={clsx(
                    "p-2 rounded-full transition-colors flex items-center gap-2",
                    eqPreset !== 'Flat' ? "text-blue-400 bg-blue-500/20" : "hover:bg-white/10 text-white/70 hover:text-white"
                  )}
                  title="Smart EQ"
                >
                  <SlidersHorizontal size={24} className={clsx(eqPreset !== 'Flat' && "fill-blue-400")} />
                </button>
                
                <AnimatePresence>
                  {showEqMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-white/10">
                        <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider">Smart EQ</h3>
                      </div>
                      <div className="flex flex-col py-2">
                        {['Flat', 'Bass Boost', 'Vocal Boost', 'Acoustic', 'Electronic'].map(preset => (
                          <button
                            key={preset}
                            onClick={() => {
                              setEqPreset(preset);
                              setShowEqMenu(false);
                            }}
                            className={clsx(
                              "px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors",
                              eqPreset === preset ? "text-blue-400 font-bold" : "text-white"
                            )}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button 
                  onClick={() => {
                    setShowTimerMenu(!showTimerMenu);
                    setShowEqMenu(false);
                  }}
                  className={clsx(
                    "p-2 rounded-full transition-colors flex items-center gap-2",
                    sleepTimer !== null ? "text-blue-400 bg-blue-500/20" : "hover:bg-white/10 text-white/70 hover:text-white"
                  )}
                  title="Sleep Timer"
                >
                  <Moon size={24} className={clsx(sleepTimer !== null && "fill-blue-400")} />
                  {sleepTimerRemaining !== null && (
                    <span className="text-xs font-bold">{formatRemainingTime(sleepTimerRemaining)}</span>
                  )}
                </button>
                
                <AnimatePresence>
                  {showTimerMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-white/10">
                        <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider">Sleep Timer</h3>
                      </div>
                      <div className="flex flex-col py-2">
                        {[15, 30, 45, 60].map(mins => (
                          <button
                            key={mins}
                            onClick={() => {
                              setSleepTimer(mins);
                              setShowTimerMenu(false);
                            }}
                            className={clsx(
                              "px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors",
                              sleepTimer === mins ? "text-blue-400 font-bold" : "text-white"
                            )}
                          >
                            {mins} minutes
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setSleepTimer(null);
                            setShowTimerMenu(false);
                          }}
                          className={clsx(
                            "px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors border-t border-white/5 mt-1",
                            sleepTimer === null ? "text-blue-400 font-bold" : "text-white/70"
                          )}
                        >
                          Off
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Lyrics Area */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="relative z-10 flex-1 overflow-y-auto px-6 pb-32 pt-10 hide-scrollbar scroll-smooth"
          >
            {isLoadingLyrics ? (
              <div className="h-full flex items-center justify-center opacity-50">
                Loading lyrics...
              </div>
            ) : lyrics.length > 0 ? (
              <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-[50vh]">
                {lyrics.map((line, i) => {
                  const isActive = i === activeLineIndex;
                  const isPassed = i < activeLineIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setIsUserScrolling(false);
                        onSeek(line.time / (durationSec || 1));
                      }}
                      className={clsx(
                        "text-left text-2xl md:text-4xl font-bold transition-all duration-300",
                        isActive ? "text-white scale-105 origin-left" : 
                        isPassed ? "text-white/50 hover:text-white/80" : "text-white/30 hover:text-white/60"
                      )}
                    >
                      {line.text}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center opacity-50 text-xl font-bold">
                No lyrics available
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="relative z-10 p-6 bg-gradient-to-t from-black via-black/80 to-transparent mt-auto">
            <div className="max-w-3xl mx-auto">
              {/* Song Info */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img src={currentSong.coverUrl} alt={currentSong.title} className="w-14 h-14 rounded-md shadow-lg" />
                  <div className="flex flex-col">
                    <h2 className="text-xl font-bold truncate">{currentSong.title}</h2>
                    <p className="text-white/70 text-sm truncate">{currentSong.artist}</p>
                  </div>
                </div>
                <button onClick={() => toggleLikeSong(currentSong)}>
                  {isSongLiked(currentSong.id) ? (
                    <CheckCircle2 size={28} className="text-green-500 fill-green-500" />
                  ) : (
                    <Heart size={28} className="text-white/70 hover:text-white" />
                  )}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex flex-col gap-2 mb-6">
                <div 
                  className="h-1.5 bg-white/20 rounded-full cursor-pointer relative group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    onSeek(pct);
                  }}
                >
                  <div className="h-full bg-white rounded-full relative" style={{ width: `${progressPct}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform shadow-lg" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-white/60 font-medium">
                  <span>{currentTimeStr}</span>
                  <span>{currentSong.duration}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-between">
                <button className="text-green-500 hover:scale-105 transition-transform">
                  <Shuffle size={24} />
                </button>
                <button onClick={playPrevious} className="text-white hover:scale-105 transition-transform">
                  <SkipBack size={32} fill="currentColor" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                </button>
                <button onClick={playNext} className="text-white hover:scale-105 transition-transform">
                  <SkipForward size={32} fill="currentColor" />
                </button>
                <div 
                  className="relative flex items-center"
                  onMouseEnter={() => setIsVolumeHovered(true)}
                  onMouseLeave={() => setIsVolumeHovered(false)}
                >
                  <button 
                    className="text-white/70 hover:text-white hover:scale-105 transition-transform z-10"
                    onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
                  >
                    {volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                  <AnimatePresence>
                    {isVolumeHovered && (
                      <motion.div 
                        initial={{ width: 0, opacity: 0, x: -10 }}
                        animate={{ width: 100, opacity: 1, x: 0 }}
                        exit={{ width: 0, opacity: 0, x: -10 }}
                        className="absolute right-8 flex items-center h-full overflow-hidden origin-right"
                      >
                        <div 
                          className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer relative group mx-2"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const vol = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                            onVolumeChange(vol);
                          }}
                        >
                          <div className="h-full bg-white rounded-full relative" style={{ width: `${volume * 100}%` }}>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform shadow-lg" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
