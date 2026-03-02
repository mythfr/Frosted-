import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song, Playlist, UserProfile } from './types';
import { MOCK_SONGS } from './constants';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AppContextType {
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playlists: Playlist[];
  setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
  isDarkMode: boolean;
  toggleTheme: () => void;
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  addToHistory: (song: Song) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isAutoplayEnabled: boolean;
  setIsAutoplayEnabled: (enabled: boolean) => void;
  playQueue: Song[];
  setPlayQueue: (songs: Song[]) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  playSource: 'individual' | 'playlist';
  setPlaySource: (source: 'individual' | 'playlist') => void;
  playNext: () => void;
  playPrevious: () => void;
  removeFromQueue: (index: number) => void;
  likedSongs: Song[];
  toggleLikeSong: (song: Song) => void;
  isSongLiked: (songId: string) => boolean;
  isPartyMode: boolean;
  togglePartyMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence Helpers
  const getStored = <T,>(key: string, defaultValue: T): T => {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    try {
      return JSON.parse(stored);
    } catch (e) {
      return defaultValue;
    }
  };

  const [currentSong, setCurrentSong] = useState<Song | null>(getStored('currentSong', MOCK_SONGS[0]));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(getStored('isDarkMode', true));
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(getStored('isAutoplayEnabled', true));
  const [isPartyMode, setIsPartyMode] = useState(false);
  const [playQueue, setPlayQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playSource, setPlaySource] = useState<'individual' | 'playlist'>('individual');
  const [likedSongs, setLikedSongs] = useState<Song[]>(() => {
    const stored = getStored('likedSongs', []);
    return Array.from(new Map(stored.map((s: Song) => [s.id, s])).values());
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const stored = getStored('playlists', [
      { id: 'p1', name: 'My Favorites', description: 'Songs I love', songs: MOCK_SONGS.slice(0, 2), coverUrl: 'https://picsum.photos/seed/fav/400/400' },
      { id: 'p2', name: 'Chill Vibes', description: 'Relaxing music', songs: [MOCK_SONGS[2], MOCK_SONGS[4]], coverUrl: 'https://picsum.photos/seed/chill/400/400' }
    ]);
    return Array.from(new Map(stored.map((p: Playlist) => [p.id, p])).values());
  });
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            // Create a new profile if it doesn't exist (should be handled in signup too)
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              avatarUrl: `https://picsum.photos/seed/${firebaseUser.uid}/400/400`,
              listeningHistory: [],
              topArtists: []
            };
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            } catch (e) {
              console.warn("Could not save new profile to Firestore (might be offline):", e);
            }
            setUser(newProfile);
          }
        } catch (error: any) {
          console.warn("Failed to get user document from Firestore (might be offline):", error);
          // Fallback to a basic profile so the app can still load
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            avatarUrl: `https://picsum.photos/seed/${firebaseUser.uid}/400/400`,
            listeningHistory: [],
            topArtists: []
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  // Save to localStorage on changes
  useEffect(() => localStorage.setItem('currentSong', JSON.stringify(currentSong)), [currentSong]);
  useEffect(() => localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode)), [isDarkMode]);
  useEffect(() => localStorage.setItem('playlists', JSON.stringify(playlists)), [playlists]);
  useEffect(() => localStorage.setItem('isAutoplayEnabled', JSON.stringify(isAutoplayEnabled)), [isAutoplayEnabled]);
  useEffect(() => localStorage.setItem('likedSongs', JSON.stringify(likedSongs)), [likedSongs]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const togglePartyMode = () => setIsPartyMode(!isPartyMode);

  const playNext = () => {
    if (playQueue.length > 0 && currentIndex < playQueue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentSong(playQueue[nextIndex]);
      setIsPlaying(true);
    }
  };

  const playPrevious = () => {
    if (playQueue.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentSong(playQueue[prevIndex]);
      setIsPlaying(true);
    }
  };

  const removeFromQueue = (index: number) => {
    const newQueue = [...playQueue];
    if (index >= 0 && index < newQueue.length) {
      newQueue.splice(index, 1);
      setPlayQueue(newQueue);
      
      if (index < currentIndex) {
        setCurrentIndex(currentIndex - 1);
      } else if (index === currentIndex) {
        // Current song removed from queue, but it's still playing.
        // We just need to handle the index properly for next/prev.
        if (newQueue.length === 0) {
          setCurrentIndex(-1);
        } else if (currentIndex >= newQueue.length) {
          setCurrentIndex(newQueue.length - 1);
        }
      }
    }
  };

  const addToHistory = async (song: Song) => {
    if (!user) return;
    
    const updatedHistory = [
      { song, playedAt: new Date().toISOString() },
      ...user.listeningHistory.filter(h => h.song.id !== song.id).slice(0, 19)
    ];

    const updatedUser = { ...user, listeningHistory: updatedHistory };
    setUser(updatedUser);
    
    // Sync to Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), updatedUser, { merge: true });
    } catch (e) {
      console.error('Error syncing history to Firestore:', e);
    }
  };

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId 
        ? { ...p, songs: [...p.songs.filter(s => s.id !== song.id), song] }
        : p
    ));
  };

  const renamePlaylist = (playlistId: string, newName: string) => {
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId ? { ...p, name: newName } : p
    ));
  };

  const toggleLikeSong = (song: Song) => {
    setLikedSongs(prev => {
      const isLiked = prev.some(s => s.id === song.id);
      if (isLiked) {
        return prev.filter(s => s.id !== song.id);
      } else {
        return [song, ...prev];
      }
    });
  };

  const isSongLiked = (songId: string) => {
    return likedSongs.some(s => s.id === songId);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AppContext.Provider value={{
      currentSong, setCurrentSong,
      isPlaying, setIsPlaying,
      playlists, setPlaylists,
      isDarkMode, toggleTheme,
      user, loading, logout,
      addToHistory,
      addSongToPlaylist, renamePlaylist,
      isSidebarOpen, setIsSidebarOpen, toggleSidebar,
      isAutoplayEnabled, setIsAutoplayEnabled,
      playQueue, setPlayQueue,
      currentIndex, setCurrentIndex,
      playSource, setPlaySource,
      playNext, playPrevious,
      removeFromQueue,
      likedSongs, toggleLikeSong, isSongLiked,
      isPartyMode, togglePartyMode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
