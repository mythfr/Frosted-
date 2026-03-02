import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, User } from 'lucide-react';
import { useApp } from '../AppContext';
import { clsx } from 'clsx';

export const BottomNav: React.FC = () => {
  const { isDarkMode } = useApp();

  return (
    <div className={clsx(
      "md:hidden fixed bottom-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-50 transition-colors duration-300",
      isDarkMode 
        ? "bg-black/80 backdrop-blur-xl border-t border-white/10" 
        : "bg-white/80 backdrop-blur-xl border-t border-black/10"
    )}>
      <NavItem to="/" icon={<Home size={24} />} label="Home" />
      <NavItem to="/search" icon={<Search size={24} />} label="Search" />
      <NavItem to="/library" icon={<Library size={24} />} label="Library" />
      <NavItem to="/profile" icon={<User size={24} />} label="Profile" />
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => clsx(
      "flex flex-col items-center gap-1 transition-all duration-300",
      isActive ? "text-blue-500 dark:text-white scale-110" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 scale-100"
    )}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
);
