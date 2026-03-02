import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Player } from './components/Player';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { AlbumDetail } from './pages/AlbumDetail';
import { ArtistDetail } from './pages/ArtistDetail';
import { Albums } from './pages/Albums';
import { Artists } from './pages/Artists';
import { Lyrics } from './pages/Lyrics';
import { Playlists } from './pages/Playlists';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { Profile } from './pages/Profile';
import { Search } from './pages/Search';
import { Auth } from './pages/Auth';
import { Queue } from './pages/Queue';
import { LikedSongs } from './pages/LikedSongs';
import { DebugPanel } from './components/DebugPanel';
import { Background } from './components/Background';
import { AppProvider, useApp } from './AppContext';
import { clsx } from 'clsx';
import { Loader2, Music2 } from 'lucide-react';

const DARK_GRADIENTS = [
  'linear-gradient(-45deg, #0a1128, #1c2541, #3a506b, #0b132b)', // Default Blue
  'linear-gradient(-45deg, #240046, #3c096c, #5a189a, #10002b)', // Deep Purple
  'linear-gradient(-45deg, #0f172a, #1e293b, #334155, #020617)', // Slate
  'linear-gradient(-45deg, #14532d, #166534, #15803d, #052e16)', // Forest Green
  'linear-gradient(-45deg, #4a044e, #701a75, #86198f, #2e1065)', // Magenta
];

const LIGHT_GRADIENTS = [
  'linear-gradient(-45deg, #e2e8f0, #f1f5f9, #cbd5e1, #e0e7ff)', // Default Cool
  'linear-gradient(-45deg, #fef3c7, #fde68a, #fcd34d, #fffbeb)', // Warm Yellow
  'linear-gradient(-45deg, #ccfbf1, #99f6e4, #5eead4, #f0fdfa)', // Mint
  'linear-gradient(-45deg, #fce7f3, #fbcfe8, #f9a8d4, #fdf2f8)', // Pink
  'linear-gradient(-45deg, #e0f2fe, #bae6fd, #7dd3fc, #f0f9ff)', // Sky Blue
];

const AppContent: React.FC = () => {
  const { isDarkMode, user, loading } = useApp();
  const [bgGradient, setBgGradient] = useState('');

  useEffect(() => {
    const gradients = isDarkMode ? DARK_GRADIENTS : LIGHT_GRADIENTS;
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
    setBgGradient(randomGradient);
  }, [isDarkMode]);

  if (loading) {
    return (
      <div className={clsx(
        "h-screen w-screen flex flex-col items-center justify-center gap-4",
        isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-white text-black"
      )}>
        <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 animate-pulse">
          <Music2 className="text-white w-10 h-10" />
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium tracking-widest uppercase">Frosted</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={clsx(
        "h-screen w-screen overflow-hidden",
        isDarkMode ? "frosted-bg" : "frosted-bg-light"
      )}>
        <Auth />
      </div>
    );
  }

  return (
    <div 
      className={clsx(
        "flex h-screen overflow-hidden font-sans relative transition-colors duration-500",
        isDarkMode ? "text-white" : "text-black"
      )}
      style={{ 
        background: bgGradient,
        backgroundSize: '400% 400%',
        animation: 'gradient-flow 20s ease infinite'
      }}
    >
      <Background />
      
      {/* Sidebar is hidden on mobile, shown on md screens and up */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header />
        
        {/* Main content area with padding at the bottom to account for Player and BottomNav */}
        <main className="flex-1 overflow-y-auto pb-[140px] md:pb-24 hide-scrollbar">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/album/:id" element={<AlbumDetail />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/artist/:id" element={<ArtistDetail />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/playlist/:id" element={<PlaylistDetail />} />
            <Route path="/lyrics" element={<Lyrics />} />
            <Route path="/library" element={<Playlists />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/queue" element={<Queue />} />
            <Route path="/collection/tracks" element={<LikedSongs />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Player sits above BottomNav on mobile, at the bottom on desktop */}
        <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40 transition-all duration-300">
          <Player />
        </div>
        
        <BottomNav />
        <DebugPanel />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
