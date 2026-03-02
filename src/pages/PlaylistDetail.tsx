import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { Play, Clock, MoreHorizontal, Heart, Music, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';

type SortKey = 'title' | 'artist' | 'duration' | null;

export const PlaylistDetail: React.FC = () => {
  const { id } = useParams();
  const { 
    playlists, isDarkMode, setCurrentSong, setIsPlaying,
    setPlayQueue, setCurrentIndex, setPlaySource 
  } = useApp();
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  const playlist = playlists.find(p => p.id === id);
  if (!playlist) return <div className="p-8 dark:text-white">Playlist not found</div>;

  const playlistSongs = playlist.songs;

  const parseDuration = (durationStr: string) => {
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const sortedSongs = [...playlistSongs].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    if (sortConfig.key === 'duration') {
      aVal = parseDuration(a.duration);
      bVal = parseDuration(b.duration);
    } else {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const playSong = (song: any, index: number) => {
    setPlaySource('playlist');
    setPlayQueue(sortedSongs);
    setCurrentIndex(index);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className={`p-8 pt-12 flex items-end gap-8 bg-gradient-to-b ${isDarkMode ? 'from-green-900/40 to-frosted-dark' : 'from-green-200 to-frosted-light'}`}>
        <motion.img 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          src={playlist.coverUrl || 'https://picsum.photos/seed/playlist/400/400'} 
          alt={playlist.name} 
          className="w-60 h-60 object-cover rounded-lg shadow-2xl"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest dark:text-white">Playlist</span>
          <h1 className="text-7xl font-black dark:text-white tracking-tighter">{playlist.name}</h1>
          <p className="text-slate-400 mt-2">{playlist.description}</p>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm font-bold dark:text-white">Frosted User</span>
            <span className="text-sm text-slate-400">• {playlistSongs.length} songs</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-8 flex items-center gap-8">
        <button 
          onClick={() => sortedSongs.length > 0 && playSong(sortedSongs[0], 0)}
          className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform disabled:opacity-50"
          disabled={sortedSongs.length === 0}
        >
          <Play fill="white" size={28} className="ml-1" />
        </button>
        <button className="text-slate-400 hover:text-white transition-colors">
          <Heart size={32} />
        </button>
        <button className="text-slate-400 hover:text-white transition-colors">
          <MoreHorizontal size={32} />
        </button>
      </div>

      {/* Tracklist */}
      <div className="px-8 pb-12">
        {playlistSongs.length > 0 ? (
          <>
            <div className="grid grid-cols-[16px_1fr_1fr_48px] gap-4 px-4 py-2 border-b border-white/10 text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
              <span>#</span>
              <span className="cursor-pointer hover:text-white flex items-center gap-1" onClick={() => handleSort('title')}>
                Title {sortConfig.key === 'title' && <ArrowUpDown size={12} />}
              </span>
              <span className="cursor-pointer hover:text-white flex items-center gap-1" onClick={() => handleSort('artist')}>
                Artist {sortConfig.key === 'artist' && <ArrowUpDown size={12} />}
              </span>
              <div className="flex justify-end cursor-pointer hover:text-white" onClick={() => handleSort('duration')}>
                <Clock size={16} className={sortConfig.key === 'duration' ? 'text-white' : ''} />
              </div>
            </div>

            <div className="flex flex-col">
              {sortedSongs.map((song, index) => (
                <div 
                  key={`${song.id}-${index}`}
                  onClick={() => playSong(song, index)}
                  className={`grid grid-cols-[16px_1fr_1fr_48px] gap-4 px-4 py-3 rounded-lg group cursor-pointer transition-colors ${
                    isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
                  }`}
                >
                  <span className="flex items-center text-slate-400 text-sm">{index + 1}</span>
                  <div className="flex flex-col">
                    <span className="font-medium dark:text-white group-hover:text-blue-500 transition-colors">{song.title}</span>
                    <span className="text-xs text-slate-400">{song.artist}</span>
                  </div>
                  <span className="flex items-center text-sm text-slate-400">{song.artist}</span>
                  <span className="flex items-center justify-end text-sm text-slate-400">{song.duration}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <Music size={64} className="mb-4" />
            <p className="text-xl font-bold">This playlist is empty</p>
            <Link to="/" className="mt-4 text-blue-500 hover:underline">Find songs to add</Link>
          </div>
        )}
      </div>
    </div>
  );
};
