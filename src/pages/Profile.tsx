import React from 'react';
import { useApp } from '../AppContext';
import { MOCK_SONGS, MOCK_ARTISTS } from '../constants';
import { Clock, History, TrendingUp, Music, LogOut, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Profile: React.FC = () => {
  const { user, isDarkMode, setCurrentSong, setIsPlaying, logout, setPlaySource } = useApp();

  if (!user) return null;

  const playSong = (song: any) => {
    if (song) {
      setPlaySource('individual');
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  // Generate mock listening data for the chart
  const listeningData = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 120 },
    { day: 'Wed', minutes: 85 },
    { day: 'Thu', minutes: 60 },
    { day: 'Fri', minutes: 150 },
    { day: 'Sat', minutes: 210 },
    { day: 'Sun', minutes: 180 },
  ];

  return (
    <div className="p-8 flex flex-col gap-12 pb-32">
      {/* User Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
        <img 
          src={user.avatarUrl} 
          alt={user.name} 
          className="w-48 h-48 rounded-full object-cover shadow-2xl border-4 border-white/10"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col gap-2 flex-1 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Profile</span>
          <h1 className="text-5xl md:text-7xl font-black dark:text-white tracking-tighter">{user.name}</h1>
          <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
            <span className="text-sm font-bold dark:text-white">{user.email}</span>
            <span className="text-sm font-bold dark:text-white">|</span>
            <span className="text-sm font-bold dark:text-white">{user.listeningHistory.length} Songs Played</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all font-bold"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      {/* Listening Stats Chart */}
      <section className={`p-6 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-blue-500" />
          <h2 className="text-2xl font-bold dark:text-white">Listening Activity</h2>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={listeningData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  color: isDarkMode ? '#fff' : '#000',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => [`${value} mins`, 'Listened']}
              />
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                {listeningData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={isDarkMode ? '#3b82f6' : '#2563eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Listening History */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <History className="text-blue-500" />
            <h2 className="text-2xl font-bold dark:text-white">Recently Played</h2>
          </div>
          <div className="flex flex-col gap-2">
            {user.listeningHistory.length > 0 ? (
              user.listeningHistory.map((item, i) => {
                const song = item.song;
                return (
                  <div 
                    key={i}
                    onClick={() => playSong(song)}
                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                      isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
                    }`}
                  >
                    <img src={song.coverUrl} className="w-12 h-12 rounded object-cover" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <p className="font-bold dark:text-white">{song.title}</p>
                      <p className="text-xs text-slate-400">{song.artist}</p>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(item.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                );
              })
            ) : (
              <div className={`p-8 rounded-xl text-center ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                <Music className="mx-auto mb-2 text-slate-500" />
                <p className="text-slate-400">No history yet. Start listening!</p>
              </div>
            )}
          </div>
        </section>

        {/* Top Artists */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-blue-500" />
            <h2 className="text-2xl font-bold dark:text-white">Top Artists</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {MOCK_ARTISTS.map((artist) => (
              <div 
                key={artist.id}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  isDarkMode ? 'bg-white/5' : 'bg-black/5'
                }`}
              >
                <img src={artist.imageUrl} className="w-16 h-16 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div>
                  <p className="font-bold dark:text-white">{artist.name}</p>
                  <p className="text-xs text-slate-400">Artist</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
