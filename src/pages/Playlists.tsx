import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Search, MoreVertical, Play, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Playlists: React.FC = () => {
  const { playlists, setPlaylists, isDarkMode, renamePlaylist } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPlaylist = {
      id: `p${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newPlaylistName,
      description: 'New playlist',
      songs: [],
      coverUrl: `https://picsum.photos/seed/${Date.now()}/400/400`
    };
    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handleRename = (id: string) => {
    if (!newPlaylistName.trim()) return;
    renamePlaylist(id, newPlaylistName);
    setEditingId(null);
    setNewPlaylistName('');
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(playlists.filter(p => p.id !== id));
  };

  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black dark:text-white tracking-tighter">Your Playlists</h1>
        <button 
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
        >
          <Plus size={20} />
          Create New
        </button>
      </div>

      {(isCreating || editingId) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}
        >
          <h3 className="font-bold mb-4 dark:text-white">{editingId ? 'Rename Playlist' : 'Playlist Name'}</h3>
          <div className="flex gap-4">
            <input 
              autoFocus
              type="text" 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="My Awesome Mix"
              className={`flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-black/40 text-white' : 'bg-white text-black'
              }`}
            />
            <button 
              onClick={editingId ? () => handleRename(editingId) : createPlaylist}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold"
            >
              {editingId ? 'Save' : 'Create'}
            </button>
            <button 
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
                setNewPlaylistName('');
              }}
              className="px-6 py-2 bg-slate-500 text-white rounded-lg font-bold"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {playlists.map((playlist) => (
          <div 
            key={playlist.id} 
            className={`group p-4 rounded-xl transition-all relative ${
              isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'
            }`}
          >
            <Link to={`/playlist/${playlist.id}`}>
              <div className="relative mb-4">
                <img 
                  src={playlist.coverUrl || 'https://picsum.photos/seed/playlist/400/400'} 
                  alt={playlist.name} 
                  className="w-full aspect-square object-cover rounded-lg shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                <button className="absolute bottom-2 right-2 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                  <Play fill="white" className="ml-1" />
                </button>
              </div>
              <h3 className="font-bold dark:text-white truncate">{playlist.name}</h3>
              <p className="text-sm text-slate-400 truncate">{playlist.songs?.length || 0} songs</p>
            </Link>
            
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setEditingId(playlist.id);
                  setNewPlaylistName(playlist.name);
                }}
                className="p-2 bg-blue-500/80 text-white rounded-full hover:bg-blue-600"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => deletePlaylist(playlist.id)}
                className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
