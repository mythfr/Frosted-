import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { motion } from 'framer-motion';
import { X, Music2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLyrics } from '../services/musicService';
import { logger } from '../services/logger';

export const Lyrics: React.FC = () => {
  const { currentSong, isDarkMode } = useApp();
  const navigate = useNavigate();
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLyrics = async () => {
      if (!currentSong) return;
      
      setLoading(true);
      try {
        const fetchedLyrics = await getLyrics(currentSong.id);
        if (fetchedLyrics.length > 0) {
          setLyrics(fetchedLyrics);
        } else {
          setLyrics(["No lyrics found for this track.", "Try another song!"]);
        }
      } catch (error) {
        logger.error('Failed to fetch lyrics in component', { error });
        setLyrics(["Failed to load lyrics.", "Please try again later."]);
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [currentSong]);

  if (!currentSong) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden ${isDarkMode ? 'text-white' : 'text-black'}`}
    >
      {/* Immersive Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-30 transition-all duration-1000"
          style={{ backgroundImage: `url(${currentSong.coverUrl})` }}
        />
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-white/60'} backdrop-blur-2xl`} />
        <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-transparent via-black/20 to-black' : 'from-transparent via-white/20 to-white'}`} />
      </div>

      <header className="h-24 px-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={currentSong.coverUrl} 
            className="w-16 h-16 rounded-xl shadow-2xl border border-white/10" 
            referrerPolicy="no-referrer" 
          />
          <div>
            <h3 className="text-xl font-black tracking-tight">{currentSong.title}</h3>
            <p className="text-sm opacity-60 font-medium">{currentSong.artist}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
        >
          <X size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-8 py-12 flex flex-col items-center relative z-10 custom-scrollbar">
        <div className="max-w-4xl w-full space-y-12 pb-32">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-xl font-bold opacity-60">Fetching lyrics...</p>
            </div>
          ) : (
            lyrics.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0.2, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] transition-all duration-700 cursor-default hover:text-blue-400"
              >
                {line}
              </motion.p>
            ))
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-20" />
    </motion.div>
  );
};
