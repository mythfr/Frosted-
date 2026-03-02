import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { searchArtists } from '../services/musicService';
import { Link } from 'react-router-dom';
import { Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const Artists: React.FC = () => {
  const { isDarkMode } = useApp();
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      const data = await searchArtists('Indian Artists');
      setArtists(data);
      setLoading(false);
    };
    fetchArtists();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black dark:text-white tracking-tighter">Popular Artists</h1>
        <p className="text-slate-400">Your favorite artists in one place</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {artists.map((artist, index) => (
          <motion.div
            key={`${artist.id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link 
              to={`/artist/${artist.id}`}
              className={`flex flex-col p-4 rounded-2xl transition-all group text-center ${
                isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'
              }`}
            >
              <div className="relative mb-4 aspect-square overflow-hidden rounded-full shadow-2xl mx-auto w-full max-w-[160px]">
                <img 
                  src={artist.imageUrl} 
                  alt={artist.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <User className="text-white" size={32} />
                </div>
              </div>
              <h3 className="font-bold dark:text-white truncate">{artist.name}</h3>
              <p className="text-sm text-slate-400">Artist</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
