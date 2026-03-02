import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { searchSongs } from '../services/musicService';
import { Song } from '../types';
import { Play, Plus, Music, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { 
    isDarkMode, setCurrentSong, setIsPlaying, 
    playlists, addSongToPlaylist, setPlaySource 
  } = useApp();
  
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResults([]);
        return;
      }
      setLoading(true);
      const songs = await searchSongs(query);
      setResults(songs);
      setLoading(false);
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const playSong = (song: Song) => {
    setPlaySource('individual');
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black dark:text-white tracking-tighter">
          {query ? `Results for "${query}"` : 'Search'}
        </h1>
        <p className="text-slate-400">Explore millions of songs and artists</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 font-medium">Finding the best music for you...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((song, index) => (
            <motion.div
              key={`${song.id}-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`group p-4 rounded-2xl transition-all relative ${
                isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'
              }`}
            >
              <div className="relative mb-4 aspect-square overflow-hidden rounded-xl shadow-2xl">
                <img 
                  src={song.coverUrl} 
                  alt={song.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={() => playSong(song)}
                    className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                  >
                    <Play fill="white" size={24} className="ml-1" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="font-bold dark:text-white truncate">{song.title}</h3>
                <Link 
                  to={`/artist/${song.artistId}`}
                  className="text-sm text-slate-400 truncate hover:text-blue-500 transition-colors"
                >
                  {song.artist}
                </Link>
              </div>

              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {playlists.slice(0, 1).map((p, index) => (
                  <button 
                    key={`${p.id}-${index}`}
                    onClick={() => addSongToPlaylist(p.id, song)}
                    className="p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-blue-500 transition-colors"
                    title={`Add to ${p.name}`}
                  >
                    <Plus size={16} />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : query ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
          <Music size={64} className="mb-4" />
          <p className="text-xl font-bold">No results found</p>
          <p>Try searching for something else</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic'].map(genre => (
            <div 
              key={genre}
              className={`aspect-square rounded-2xl p-6 flex items-end cursor-pointer transition-transform hover:scale-105 ${
                isDarkMode ? 'bg-white/5' : 'bg-black/5'
              }`}
            >
              <span className="text-xl font-black dark:text-white">{genre}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
