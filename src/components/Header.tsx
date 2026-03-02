import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search as SearchIcon, Sun, Moon, User, Menu, Sparkles, Music, Mic2, Disc } from 'lucide-react';
import { useApp } from '../AppContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { searchSongs, searchArtists, searchAlbums } from '../services/musicService';
import { Song, Artist, Album } from '../types';

export const Header: React.FC = () => {
  const { isDarkMode, toggleTheme, user, toggleSidebar, isPartyMode, togglePartyMode, setCurrentSong, setIsPlaying, setPlaySource } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  
  const [suggestions, setSuggestions] = useState<{songs: Song[], artists: Artist[], albums: Album[]}>({ songs: [], artists: [], albums: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchValue.trim().length > 1) {
        try {
          const [songs, artists, albums] = await Promise.all([
            searchSongs(searchValue.trim()),
            searchArtists(searchValue.trim()),
            searchAlbums(searchValue.trim())
          ]);
          setSuggestions({ 
            songs: songs.slice(0, 3), 
            artists: artists.slice(0, 2), 
            albums: albums.slice(0, 2) 
          });
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      } else {
        setSuggestions({ songs: [], artists: [], albums: [] });
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSuggestions();
      const currentQ = searchParams.get('q') || '';
      if (searchValue.trim() !== currentQ) {
        const isSearchPage = window.location.pathname === '/search';
        if (searchValue.trim() && isSearchPage) {
          navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`, { replace: true });
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchValue, navigate, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const playSong = (song: Song) => {
    setPlaySource('individual');
    setCurrentSong(song);
    setIsPlaying(true);
    setShowSuggestions(false);
  };

  useEffect(() => {
    // Only update local state if it differs from URL (e.g. back navigation)
    const q = searchParams.get('q') || '';
    if (q !== searchValue) {
      setSearchValue(q);
    }
  }, [searchParams]);

  return (
    <header className="h-16 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Menu button hidden on mobile since we have BottomNav */}
        <button 
          onClick={toggleSidebar}
          className="hidden md:flex lg:hidden w-10 h-10 rounded-full items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/40 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/40 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <form ref={searchRef} onSubmit={handleSearch} className="relative group">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (e.target.value.trim().length > 1) setShowSuggestions(true);
            }}
            onFocus={() => {
              if (searchValue.trim().length > 1) setShowSuggestions(true);
            }}
            placeholder="Search..."
            className={clsx(
              "pl-10 pr-4 py-2 rounded-full w-40 sm:w-64 lg:w-80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
              isDarkMode ? "bg-white/10 text-white placeholder:text-slate-500" : "bg-black/5 text-black placeholder:text-slate-400"
            )}
          />
          
          {/* Live Suggestions Dropdown */}
          {showSuggestions && (suggestions.songs.length > 0 || suggestions.artists.length > 0) && (
            <div className={clsx(
              "absolute top-full -left-10 sm:left-0 mt-2 w-[320px] sm:w-80 lg:w-96 rounded-2xl shadow-2xl overflow-hidden border backdrop-blur-xl",
              isDarkMode ? "bg-[#1a1a1a]/95 border-white/10" : "bg-white/95 border-black/10"
            )}>
              <div className="max-h-[70vh] overflow-y-auto hide-scrollbar py-2">
                {suggestions.songs.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Music size={12} /> Songs
                    </div>
                    {suggestions.songs.map(song => (
                      <div 
                        key={song.id}
                        onClick={() => playSong(song)}
                        className={clsx(
                          "flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors",
                          isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"
                        )}
                      >
                        <img src={song.coverUrl} alt={song.title} className="w-10 h-10 rounded object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <p className={clsx("text-sm font-bold truncate", isDarkMode ? "text-white" : "text-black")}>{song.title}</p>
                          <p className="text-xs text-slate-500 truncate">{song.artist}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {suggestions.artists.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Mic2 size={12} /> Artists
                    </div>
                    {suggestions.artists.map(artist => (
                      <div 
                        key={artist.id}
                        onClick={() => {
                          setShowSuggestions(false);
                          navigate(`/artist/${artist.id}`);
                        }}
                        className={clsx(
                          "flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors",
                          isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"
                        )}
                      >
                        <img src={artist.imageUrl} alt={artist.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <p className={clsx("text-sm font-bold truncate", isDarkMode ? "text-white" : "text-black")}>{artist.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {suggestions.albums.length > 0 && (
                  <div>
                    <div className="px-4 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Disc size={12} /> Albums
                    </div>
                    {suggestions.albums.map(album => (
                      <div 
                        key={album.id}
                        onClick={() => {
                          setShowSuggestions(false);
                          navigate(`/album/${album.id}`);
                        }}
                        className={clsx(
                          "flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors",
                          isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"
                        )}
                      >
                        <img src={album.coverUrl} alt={album.title} className="w-10 h-10 rounded object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <p className={clsx("text-sm font-bold truncate", isDarkMode ? "text-white" : "text-black")}>{album.title}</p>
                          <p className="text-xs text-slate-500 truncate">{album.artistName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div 
                onClick={handleSearch}
                className={clsx(
                  "px-4 py-3 text-sm font-medium text-center cursor-pointer border-t transition-colors",
                  isDarkMode ? "border-white/10 hover:bg-white/5 text-blue-400" : "border-black/10 hover:bg-black/5 text-blue-600"
                )}
              >
                See all results for "{searchValue}"
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <button 
          onClick={togglePartyMode}
          className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative group",
            isPartyMode ? "text-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.5)]" : (isDarkMode ? "bg-white/10 text-slate-400 hover:bg-white/20" : "bg-black/5 text-slate-600 hover:bg-black/10")
          )}
          title="Party Mode"
        >
          <Sparkles size={20} className={clsx(isPartyMode && "animate-pulse")} />
          {isPartyMode && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
          )}
        </button>

        <button 
          onClick={toggleTheme}
          className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            isDarkMode ? "bg-white/10 text-yellow-400 hover:bg-white/20" : "bg-black/5 text-slate-600 hover:bg-black/10"
          )}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <Link 
          to="/profile"
          className={clsx(
            "flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-colors",
            isDarkMode ? "bg-black/40 hover:bg-black/60 text-white" : "bg-white/80 hover:bg-white text-black shadow-sm"
          )}
        >
          <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
          <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
        </Link>
      </div>
    </header>
  );
};
