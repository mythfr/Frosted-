import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { getAlbumDetails } from '../services/musicService';
import { Play, Clock, MoreHorizontal, Heart, Plus, Loader2, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';

type SortKey = 'title' | 'artist' | 'duration' | null;

export const AlbumDetail: React.FC = () => {
  const { id } = useParams();
  const { 
    isDarkMode, setCurrentSong, setIsPlaying, 
    playlists, addSongToPlaylist,
    setPlayQueue, setCurrentIndex, setPlaySource 
  } = useApp();
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  
  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getAlbumDetails(id);
      setAlbum(data);
      setLoading(false);
    };
    fetchAlbum();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!album) return <div className="p-8 dark:text-white">Album not found</div>;

  const parseDuration = (durationStr: string) => {
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const sortedSongs = [...album.songs].sort((a, b) => {
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

  const playAlbum = () => {
    if (sortedSongs.length > 0) {
      playSong(sortedSongs[0], 0);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className={`p-4 lg:p-8 pt-8 lg:pt-12 flex flex-col sm:flex-row items-center sm:items-end gap-6 lg:gap-8 bg-gradient-to-b ${isDarkMode ? 'from-blue-900/40 to-frosted-dark' : 'from-blue-200 to-frosted-light'}`}>
        <motion.img 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          src={album.coverUrl} 
          alt={album.title} 
          className="w-48 h-48 lg:w-60 lg:h-60 object-cover rounded-lg shadow-2xl"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest dark:text-white">Album</span>
          <h1 className="text-4xl lg:text-7xl font-black dark:text-white tracking-tighter">{album.title}</h1>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 lg:mt-4">
            <img src={album.coverUrl} className="w-5 h-5 lg:w-6 lg:h-6 rounded-full" referrerPolicy="no-referrer" />
            <Link to={`/artist/${album.artistId}`} className="text-xs lg:text-sm font-bold dark:text-white hover:underline">{album.artistName}</Link>
            <span className="text-xs lg:text-sm text-slate-400">• {album.releaseDate} • {album.songs.length} songs</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 lg:p-8 flex items-center gap-6 lg:gap-8">
        <button 
          onClick={playAlbum}
          className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
        >
          <Play fill="white" size={24} className="ml-1" />
        </button>
        <button className="text-slate-400 hover:text-white transition-colors">
          <Heart size={28} />
        </button>
        <button className="text-slate-400 hover:text-white transition-colors">
          <MoreHorizontal size={28} />
        </button>
      </div>

      {/* Tracklist */}
      <div className="px-4 lg:px-8 pb-12">
        <div className="grid grid-cols-[16px_1fr_48px] sm:grid-cols-[16px_1fr_1fr_48px] lg:grid-cols-[16px_1fr_1fr_120px_48px] gap-4 px-4 py-2 border-b border-white/10 text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
          <span>#</span>
          <span className="cursor-pointer hover:text-white flex items-center gap-1" onClick={() => handleSort('title')}>
            Title {sortConfig.key === 'title' && <ArrowUpDown size={12} />}
          </span>
          <span className="hidden sm:flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => handleSort('artist')}>
            Artist {sortConfig.key === 'artist' && <ArrowUpDown size={12} />}
          </span>
          <span className="hidden lg:block">Add to</span>
          <div className="flex justify-end cursor-pointer hover:text-white" onClick={() => handleSort('duration')}>
            <Clock size={16} className={sortConfig.key === 'duration' ? 'text-white' : ''} />
          </div>
        </div>

        <div className="flex flex-col">
          {sortedSongs.map((song, index) => (
            <div 
              key={`${song.id}-${index}`}
              className={`grid grid-cols-[16px_1fr_48px] sm:grid-cols-[16px_1fr_1fr_48px] lg:grid-cols-[16px_1fr_1fr_120px_48px] gap-4 px-4 py-3 rounded-lg group cursor-pointer transition-colors ${
                isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
              }`}
            >
              <span className="flex items-center text-slate-400 text-xs lg:text-sm" onClick={() => playSong(song, index)}>{index + 1}</span>
              <div className="flex flex-col min-w-0" onClick={() => playSong(song, index)}>
                <span className="font-medium text-sm lg:text-base dark:text-white group-hover:text-blue-500 transition-colors truncate">{song.title}</span>
                <span className="text-[10px] lg:text-xs text-slate-400 truncate">{song.artist}</span>
              </div>
              <span className="hidden sm:flex items-center text-xs lg:text-sm text-slate-400 truncate" onClick={() => playSong(song, index)}>{song.artist}</span>
              <div className="hidden lg:flex items-center gap-1 overflow-hidden">
                {playlists.slice(0, 2).map((p, index) => (
                  <button 
                    key={`${p.id}-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      addSongToPlaylist(p.id, song);
                    }}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-blue-500 text-slate-400 hover:text-white transition-all"
                    title={`Add to ${p.name}`}
                  >
                    <Plus size={14} />
                  </button>
                ))}
              </div>
              <span className="flex items-center justify-end text-xs lg:text-sm text-slate-400" onClick={() => playSong(song, index)}>{song.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
