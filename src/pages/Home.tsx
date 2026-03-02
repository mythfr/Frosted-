import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { Play, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { searchSongs, searchAlbums, searchArtists } from '../services/musicService';
import { Song } from '../types';
import { clsx } from 'clsx';

export const Home: React.FC = () => {
  const { isDarkMode, setCurrentSong, setIsPlaying, setPlaySource, isPartyMode } = useApp();
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [featuredAlbums, setFeaturedAlbums] = useState<any[]>([]);
  const [popularArtists, setPopularArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: '🌅' };
    if (hour < 18) return { text: 'Good afternoon', icon: '☀️' };
    return { text: 'Good evening', icon: '🌙' };
  };

  const greeting = getGreeting();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [songs, albums, artists] = await Promise.all([
          searchSongs('Hindi Trending'),
          searchAlbums('Bollywood Hits'),
          searchArtists('Top Indian Artists')
        ]);
        setTrendingSongs(songs.slice(0, 6));
        setFeaturedAlbums(albums.slice(0, 10));
        setPopularArtists(artists.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const playSong = (song: Song) => {
    setPlaySource('individual');
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const playMoodMix = () => {
    if (trendingSongs.length > 0) {
      // Pick a random song to start the mix
      const randomSong = trendingSongs[Math.floor(Math.random() * trendingSongs.length)];
      playSong(randomSong);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-8 md:gap-10 pb-32">
      {/* Top Greeting & Recent Grid */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 dark:text-white tracking-tight flex items-center gap-2">
          <span>{greeting.text}</span>
          <span className="text-2xl md:text-3xl">{greeting.icon}</span>
        </h2>

        {/* Hero Mood Mix Banner */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className={clsx(
            "relative w-full rounded-2xl md:rounded-3xl overflow-hidden mb-8 shadow-2xl group cursor-pointer",
            isPartyMode ? "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500" : "bg-gradient-to-r from-blue-600 to-indigo-600"
          )}
          onClick={playMoodMix}
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/music/1920/1080?blur=4')] opacity-30 mix-blend-overlay" />
          
          <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider w-fit">
                <Sparkles size={14} /> Made For You
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mt-2">
                {isPartyMode ? "Party Mix" : "Daily Mix"}
              </h1>
              <p className="text-white/80 font-medium max-w-md mt-1">
                A personalized mix of tracks based on your recent listening and the current vibe.
              </p>
            </div>
            
            <button className="w-14 h-14 md:w-16 md:h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform shrink-0">
              <Play size={28} fill="currentColor" className="ml-1" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
          {trendingSongs.map((song) => (
            <motion.div
              key={song.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                "group flex items-center gap-3 rounded-md overflow-hidden cursor-pointer transition-colors shadow-sm",
                isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
              )}
              onClick={() => playSong(song)}
            >
              <img src={song.coverUrl} alt={song.title} className="w-14 h-14 md:w-20 md:h-20 object-cover shadow-md" referrerPolicy="no-referrer" loading="lazy" />
              <div className="flex-1 flex items-center justify-between pr-3 min-w-0">
                <span className="font-bold text-xs md:text-sm dark:text-white truncate pr-2">{song.title}</span>
                <button className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shrink-0">
                  <Play fill="white" size={14} className="ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Albums - Horizontal Scroll on Mobile */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold dark:text-white tracking-tight">Featured Albums</h2>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 gap-4 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-6">
          {featuredAlbums.map((album) => (
            <Link 
              key={album.id} 
              to={`/album/${album.id}`}
              className={clsx(
                "w-36 md:w-auto shrink-0 p-3 md:p-4 rounded-xl transition-all group",
                isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
              )}
            >
              <div className="relative mb-3 md:mb-4">
                <img src={album.coverUrl} alt={album.title} className="w-full aspect-square object-cover rounded-md md:rounded-lg shadow-lg" referrerPolicy="no-referrer" loading="lazy" />
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                  <Play fill="white" size={16} className="ml-1" />
                </button>
              </div>
              <h3 className="font-bold text-sm dark:text-white truncate">{album.title}</h3>
              <p className="text-xs text-slate-400 truncate mt-1">{album.artistName}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Artists - Horizontal Scroll on Mobile */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold dark:text-white tracking-tight">Popular Artists</h2>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 gap-4 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-6">
          {popularArtists.map((artist) => (
            <Link 
              key={artist.id} 
              to={`/artist/${artist.id}`}
              className={clsx(
                "w-36 md:w-auto shrink-0 p-3 md:p-4 rounded-xl transition-all group text-center",
                isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
              )}
            >
              <div className="relative mb-3 md:mb-4">
                <img src={artist.imageUrl} alt={artist.name} className="w-full aspect-square object-cover rounded-full shadow-lg" referrerPolicy="no-referrer" loading="lazy" />
              </div>
              <h3 className="font-bold text-sm dark:text-white truncate">{artist.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Artist</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
