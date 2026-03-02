import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { getArtistDetails } from '../services/musicService';
import { Play, Heart, MoreHorizontal, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ArtistDetail: React.FC = () => {
  const { id } = useParams();
  const { 
    isDarkMode, setCurrentSong, setIsPlaying,
    setPlayQueue, setCurrentIndex, setPlaySource 
  } = useApp();
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getArtistDetails(id);
      setArtist(data);
      setLoading(false);
    };
    fetchArtist();
  }, [id]);

  const [isBioExpanded, setIsBioExpanded] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!artist) return <div className="p-8 dark:text-white">Artist not found</div>;

  const artistAlbums = artist.topAlbums || [];
  const topSongs = artist.topSongs || [];

  const playSong = (song: any, index: number) => {
    setPlaySource('playlist');
    setPlayQueue(topSongs);
    setCurrentIndex(index);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className={`h-[40vh] relative flex items-end p-8 bg-gradient-to-b ${isDarkMode ? 'from-slate-800 to-frosted-dark' : 'from-slate-300 to-frosted-light'}`}>
        <img 
          src={artist.imageUrl} 
          alt={artist.name} 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Play size={12} fill="white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest dark:text-white">Verified Artist</span>
          </div>
          <h1 className="text-4xl lg:text-8xl font-black dark:text-white tracking-tighter">{artist.name}</h1>
          <p className="text-sm font-bold dark:text-white">{artist.followerCount || 'Many'} listeners</p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-8 flex items-center gap-8">
        <button 
          onClick={() => playSong(topSongs[0], 0)}
          className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
        >
          <Play fill="white" size={28} className="ml-1" />
        </button>
        <button className="px-6 py-2 border border-white/20 rounded-full font-bold dark:text-white hover:bg-white/10 transition-colors">
          Following
        </button>
        <button className="text-slate-400 hover:text-white transition-colors">
          <MoreHorizontal size={32} />
        </button>
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-12 pb-12">
        {/* Popular Songs */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Popular</h2>
          <div className="flex flex-col">
            {topSongs.map((song: any, index: number) => (
              <div 
                key={`${song.id}-${index}`}
                onClick={() => playSong(song, index)}
                className={`flex items-center gap-4 px-4 py-2 rounded-lg group cursor-pointer transition-colors ${
                  isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
                }`}
              >
                <span className="w-4 text-slate-400 text-sm">{index + 1}</span>
                <img src={song.coverUrl} className="w-10 h-10 rounded" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <p className="font-medium dark:text-white group-hover:text-blue-500 transition-colors">{song.title}</p>
                </div>
                <span className="text-sm text-slate-400">{song.duration}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Artist Pick / Bio */}
        <div>
          <h2 className="text-2xl font-bold mb-6 dark:text-white">About</h2>
          <div 
            onClick={() => setIsBioExpanded(!isBioExpanded)}
            className={`p-6 rounded-2xl relative overflow-hidden group cursor-pointer transition-all ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}
          >
            <img src={artist.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
            <div className="relative z-10">
              <p className={`text-sm leading-relaxed dark:text-slate-300 transition-all ${isBioExpanded ? '' : 'line-clamp-6'}`}>
                {artist.bio}
              </p>
              <button className="mt-4 text-sm font-bold dark:text-white hover:underline">
                {isBioExpanded ? 'Show less' : 'Read more'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discography */}
      <div className="px-8 pb-12">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Discography</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {artistAlbums.map((album, index) => (
            <Link 
              key={`${album.id}-${index}`} 
              to={`/album/${album.id}`}
              className={`p-4 rounded-xl transition-all group ${
                isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'
              }`}
            >
              <img src={album.coverUrl} alt={album.title} className="w-full aspect-square object-cover rounded-lg shadow-2xl mb-4" referrerPolicy="no-referrer" />
              <h3 className="font-bold dark:text-white truncate">{album.title}</h3>
              <p className="text-sm text-slate-400">{album.releaseDate} • Album</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
