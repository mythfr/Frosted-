import React from 'react';
import { useApp } from '../AppContext';
import { Play, Trash2, Music, Shuffle, ListMusic, Zap, ZapOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export const Queue: React.FC = () => {
  const { 
    playQueue, currentIndex, currentSong, 
    setCurrentSong, setIsPlaying, setCurrentIndex,
    isDarkMode, removeFromQueue, setPlayQueue,
    isAutoplayEnabled, setIsAutoplayEnabled
  } = useApp();

  const playFromQueue = (index: number) => {
    setCurrentIndex(index);
    setCurrentSong(playQueue[index]);
    setIsPlaying(true);
  };

  const shuffleQueue = () => {
    const newQueue = [...playQueue];
    for (let i = newQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
    }
    setPlayQueue(newQueue);
    // Find new index of current song
    if (currentSong) {
      const newIndex = newQueue.findIndex(s => s.id === currentSong.id);
      setCurrentIndex(newIndex);
    }
  };

  const clearQueue = () => {
    if (currentSong) {
      setPlayQueue([currentSong]);
      setCurrentIndex(0);
    } else {
      setPlayQueue([]);
      setCurrentIndex(-1);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black dark:text-white tracking-tighter flex items-center gap-3">
            <ListMusic className="text-blue-500" size={36} />
            Queue
          </h1>
          <p className="text-slate-400">Manage your upcoming tracks</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAutoplayEnabled(!isAutoplayEnabled)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors",
              isAutoplayEnabled 
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                : "bg-white/5 hover:bg-white/10 dark:text-white"
            )}
          >
            {isAutoplayEnabled ? <Zap size={16} fill="currentColor" /> : <ZapOff size={16} />}
            Autoplay
          </button>
          <button 
            onClick={shuffleQueue}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm font-bold dark:text-white transition-colors"
          >
            <Shuffle size={16} />
            Shuffle
          </button>
          <button 
            onClick={clearQueue}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-bold transition-colors"
          >
            Clear Queue
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {/* Now Playing */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Now Playing</h2>
          {currentSong ? (
            <div className={clsx(
              "p-4 rounded-2xl flex items-center gap-4 border",
              isDarkMode ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50/50 border-blue-200"
            )}>
              <img 
                src={currentSong.coverUrl} 
                alt={currentSong.title} 
                className="w-16 h-16 rounded-lg object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg dark:text-white">{currentSong.title}</h3>
                <p className="text-slate-400">{currentSong.artist}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 items-end h-4">
                  <motion.div animate={{ height: [4, 16, 8, 16, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-blue-500 rounded-full" />
                  <motion.div animate={{ height: [16, 4, 16, 8, 16] }} transition={{ repeat: Infinity, duration: 1.0 }} className="w-1 bg-blue-500 rounded-full" />
                  <motion.div animate={{ height: [8, 16, 4, 16, 8] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-blue-500 rounded-full" />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center opacity-40">
              <Music size={48} className="mx-auto mb-4" />
              <p>Nothing playing right now</p>
            </div>
          )}
        </section>

        {/* Next Up */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Next Up</h2>
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {playQueue.map((song, index) => {
                if (index <= currentIndex) return null;
                return (
                  <motion.div
                    key={`${song.id}-${index}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={clsx(
                      "group p-3 rounded-xl flex items-center gap-4 transition-all",
                      isDarkMode ? "hover:bg-white/5" : "hover:bg-black/5"
                    )}
                  >
                    <span className="w-6 text-center text-slate-500 text-sm font-medium">{index + 1}</span>
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img 
                        src={song.coverUrl} 
                        alt={song.title} 
                        className="w-full h-full rounded-md object-cover shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        onClick={() => playFromQueue(index)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                      >
                        <Play size={16} fill="white" className="text-white" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold dark:text-white truncate">{song.title}</h4>
                      <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500">{song.duration}</span>
                      <button 
                        onClick={() => removeFromQueue(index)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {playQueue.length <= currentIndex + 1 && (
              <div className="p-10 border-2 border-dashed border-white/5 rounded-2xl text-center opacity-40">
                <p className="text-sm">Queue is empty. Add more songs or enable Autoplay!</p>
              </div>
            )}
          </div>
        </section>

        {/* Previous Tracks */}
        {currentIndex > 0 && (
          <section className="opacity-60">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Previously Played</h2>
            <div className="flex flex-col gap-2">
              {playQueue.slice(0, currentIndex).map((song, index) => (
                <div 
                  key={`${song.id}-${index}`}
                  className="p-3 rounded-xl flex items-center gap-4 grayscale"
                >
                  <span className="w-6 text-center text-slate-500 text-sm">{index + 1}</span>
                  <img 
                    src={song.coverUrl} 
                    alt={song.title} 
                    className="w-12 h-12 rounded-md object-cover shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold dark:text-white truncate">{song.title}</h4>
                    <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                  </div>
                  <button 
                    onClick={() => playFromQueue(index)}
                    className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-all"
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
