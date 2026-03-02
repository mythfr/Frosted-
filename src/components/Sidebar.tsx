import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart, Music2, User, X, ListMusic } from 'lucide-react';
import { useApp } from '../AppContext';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const { playlists, isDarkMode, isSidebarOpen, toggleSidebar } = useApp();

  const navItems = [
    { icon: Home, label: 'Home', to: '/' },
    { icon: Search, label: 'Search', to: '/search' },
    { icon: ListMusic, label: 'Queue', to: '/queue' },
    { icon: Library, label: 'Library', to: '/library' },
  ];

  const libraryItems = [
    { icon: PlusSquare, label: 'Create Playlist', to: '/playlists/new' },
    { icon: Heart, label: 'Liked Songs', to: '/collection/tracks' },
    { icon: Music2, label: 'Albums', to: '/albums' },
    { icon: User, label: 'Artists', to: '/artists' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col p-6 gap-8 transition-transform duration-300 lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        isDarkMode ? "glass-dark border-r border-white/5" : "glass border-r border-black/5"
      )}>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Music2 className="text-white w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tighter dark:text-white">Frosted</h1>
          </div>
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} className="dark:text-white" />
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({ isActive }) => clsx(
                "flex items-center gap-4 px-2 py-1 transition-colors hover:text-blue-500",
                isActive ? "text-blue-500 font-semibold" : "text-slate-400"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 px-2">Your Library</p>
          <nav className="flex flex-col gap-4">
            {libraryItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={({ isActive }) => clsx(
                  "flex items-center gap-4 px-2 py-1 transition-colors hover:text-blue-500",
                  isActive ? "text-blue-500 font-semibold" : "text-slate-400"
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 px-2">Playlists</p>
          <div className="flex flex-col gap-2">
            {playlists.map((playlist) => (
              <NavLink
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={({ isActive }) => clsx(
                  "px-2 py-1 truncate transition-colors hover:text-blue-500",
                  isActive ? "text-blue-500 font-semibold" : "text-slate-400"
                )}
              >
                {playlist.name}
              </NavLink>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};
