import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { searchAlbums } from '../services/musicService';
import { Link } from 'react-router-dom';
import { Loader2, Disc } from 'lucide-react';
import { motion } from 'framer-motion';

export const Albums: React.FC = () => {
  const { isDarkMode } = useApp();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      const data = await searchAlbums('New Hindi Albums');
      setAlbums(data);
      setLoading(false);
    };
    fetchAlbums();
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
        <h1 className="text-4xl font-black dark:text-white tracking-tighter">Featured Albums</h1>
        <p className="text-slate-400">Discover the latest and greatest albums</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {albums.map((album, index) => (
          <motion.div
            key={`${album.id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link 
              to={`/album/${album.id}`}
              className={`flex flex-col p-4 rounded-2xl transition-all group ${
                isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'
              }`}
            >
              <div className="relative mb-4 aspect-square overflow-hidden rounded-xl shadow-2xl">
                <img 
                  src={album.coverUrl} 
                  alt={album.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-xl">
                    <Disc className="text-white" size={24} />
                  </div>
                </div>
              </div>
              <h3 className="font-bold dark:text-white truncate">{album.title}</h3>
              <p className="text-sm text-slate-400 truncate">{album.artistName}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
