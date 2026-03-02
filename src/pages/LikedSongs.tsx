import React from 'react';
import { useApp } from '../AppContext';
import { Play, Heart, Clock, Music2 } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export const LikedSongs: React.FC = () => {
  const { 
    likedSongs, 
    setCurrentSong, 
    setIsPlaying, 
    isDarkMode,
    setPlayQueue,
    setCurrentIndex,
    setPlaySource,
    toggleLikeSong
  } = useApp();

  const handlePlaySong = (index: number) => {
    setPlayQueue(likedSongs);
    setCurrentIndex(index);
    setCurrentSong(likedSongs[index]);
    setPlaySource('playlist');
    setIsPlaying(true);
  };

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      handlePlaySong(0);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
        <div className="w-48 h-48 lg:w-60 lg:h-60 rounded-2xl shadow-2xl flex-shrink-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <Heart className="w-24 h-24 text-white fill-white" />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Playlist</span>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter dark:text-white mb-2">Liked Songs</h1>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="font-semibold dark:text-white">You</span>
            <span>•</span>
            <span>{likedSongs.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={handlePlayAll}
          disabled={likedSongs.length === 0}
          className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={24} fill="white" className="text-white ml-1" />
        </button>
      </div>

      {/* Songs List */}
      <div className={clsx(
        "rounded-2xl overflow-hidden border",
        isDarkMode ? "glass-dark border-white/5" : "glass border-black/5"
      )}>
        {/* Table Header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b border-white/5 text-sm font-medium text-slate-400">
          <div className="w-8 text-center">#</div>
          <div>Title</div>
          <div className="w-32 hidden md:block">Album</div>
          <div className="w-16 text-right"><Clock size={16} className="inline" /></div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {likedSongs.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-4">
              <Music2 size={48} className="opacity-20" />
              <p>Songs you like will appear here</p>
            </div>
          ) : (
            likedSongs.map((song, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={`${song.id}-${index}`}
                className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center hover:bg-white/5 transition-colors group cursor-pointer"
                onClick={() => handlePlaySong(index)}
              >
                <div className="w-8 text-center text-slate-400 group-hover:hidden">{index + 1}</div>
                <div className="w-8 text-center hidden group-hover:block">
                  <Play size={16} className="text-white" fill="currentColor" />
                </div>
                
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src={song.coverUrl} 
                    alt={song.title} 
                    className="w-10 h-10 rounded object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium dark:text-white truncate">{song.title}</span>
                    <span className="text-sm text-slate-400 truncate">{song.artist}</span>
                  </div>
                </div>

                <div className="w-32 hidden md:block text-sm text-slate-400 truncate">
                  {song.album}
                </div>

                <div className="w-16 flex items-center justify-end gap-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeSong(song);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart size={18} className="fill-blue-500 text-blue-500" />
                  </button>
                  <span className="text-sm text-slate-400">{song.duration}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
