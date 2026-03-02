import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export const Background: React.FC = () => {
  const { isDarkMode, isPlaying, isPartyMode } = useApp();
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('evening');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  const getColors = () => {
    if (isPartyMode) {
      return {
        orb1: "bg-fuchsia-600",
        orb2: "bg-cyan-500",
        orb3: "bg-yellow-400",
        wave1: ["#ff00ff", "#00ffff", "#ffff00"],
        wave2: ["#00ffff", "#ffff00", "#ff00ff"],
        wave3: ["#ffff00", "#ff00ff", "#00ffff"],
      };
    }

    if (timeOfDay === 'morning') {
      return {
        orb1: isDarkMode ? "bg-orange-600" : "bg-orange-300",
        orb2: isDarkMode ? "bg-pink-600" : "bg-pink-300",
        orb3: isDarkMode ? "bg-yellow-600" : "bg-yellow-300",
        wave1: isDarkMode ? ["#ea580c", "#f97316", "#fdba74"] : ["#fdba74", "#fed7aa", "#ffedd5"],
        wave2: isDarkMode ? ["#db2777", "#ec4899", "#f9a8d4"] : ["#f9a8d4", "#fbcfe8", "#fdf2f8"],
        wave3: isDarkMode ? ["#ca8a04", "#eab308", "#fef08a"] : ["#fef08a", "#fef9c3", "#fefce8"],
      };
    } else if (timeOfDay === 'afternoon') {
      return {
        orb1: isDarkMode ? "bg-cyan-600" : "bg-cyan-300",
        orb2: isDarkMode ? "bg-blue-600" : "bg-blue-300",
        orb3: isDarkMode ? "bg-emerald-600" : "bg-emerald-300",
        wave1: isDarkMode ? ["#0891b2", "#06b6d4", "#67e8f9"] : ["#67e8f9", "#a5f3fc", "#cffafe"],
        wave2: isDarkMode ? ["#2563eb", "#3b82f6", "#93c5fd"] : ["#93c5fd", "#bfdbfe", "#dbeafe"],
        wave3: isDarkMode ? ["#059669", "#10b981", "#6ee7b7"] : ["#6ee7b7", "#a7f3d0", "#d1fae5"],
      };
    } else {
      // Evening/Night
      return {
        orb1: isDarkMode ? "bg-indigo-600" : "bg-indigo-300",
        orb2: isDarkMode ? "bg-purple-600" : "bg-purple-300",
        orb3: isDarkMode ? "bg-blue-800" : "bg-blue-400",
        wave1: isDarkMode ? ["#4f46e5", "#6366f1", "#a5b4fc"] : ["#a5b4fc", "#c7d2fe", "#e0e7ff"],
        wave2: isDarkMode ? ["#7e22ce", "#a855f7", "#d8b4fe"] : ["#d8b4fe", "#e9d5ff", "#f3e8ff"],
        wave3: isDarkMode ? ["#1e40af", "#2563eb", "#93c5fd"] : ["#93c5fd", "#bfdbfe", "#dbeafe"],
      };
    }
  };

  const colors = getColors();
  const animationSpeed = isPartyMode ? 0.2 : (isPlaying ? 0.5 : 1); // Faster when playing, even faster in party mode
  const pulseScale = isPartyMode ? [1, 1.5, 1] : (isPlaying ? [1, 1.2, 1] : [1, 1.05, 1]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-1000">
      {/* Soft blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[100px] z-10" />

      {/* Animated Soundwaves */}
      <div className={clsx("absolute inset-0 flex items-center justify-center transition-opacity duration-1000", isPartyMode ? "opacity-80" : (isPlaying ? "opacity-50" : "opacity-20"))}>
        <svg
          className="w-[200%] h-[200%] max-w-none"
          viewBox="0 0 800 400"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.wave1[0]} stopOpacity="0" />
              <stop offset="50%" stopColor={colors.wave1[1]} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors.wave1[2]} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.wave2[0]} stopOpacity="0" />
              <stop offset="50%" stopColor={colors.wave2[1]} stopOpacity="0.6" />
              <stop offset="100%" stopColor={colors.wave2[2]} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.wave3[0]} stopOpacity="0" />
              <stop offset="50%" stopColor={colors.wave3[1]} stopOpacity="0.5" />
              <stop offset="100%" stopColor={colors.wave3[2]} stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <motion.path
            d="M 0 200 Q 200 100 400 200 T 800 200"
            fill="none"
            stroke="url(#wave-gradient-1)"
            strokeWidth={isPlaying ? "6" : "4"}
            filter="url(#glow)"
            animate={{
              d: [
                "M 0 200 Q 200 100 400 200 T 800 200",
                "M 0 200 Q 200 300 400 200 T 800 200",
                "M 0 200 Q 200 100 400 200 T 800 200"
              ]
            }}
            transition={{ duration: 15 * animationSpeed, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.path
            d="M 0 200 Q 200 250 400 200 T 800 200"
            fill="none"
            stroke="url(#wave-gradient-2)"
            strokeWidth={isPlaying ? "8" : "6"}
            filter="url(#glow)"
            animate={{
              d: [
                "M 0 200 Q 200 250 400 200 T 800 200",
                "M 0 200 Q 200 150 400 200 T 800 200",
                "M 0 200 Q 200 250 400 200 T 800 200"
              ]
            }}
            transition={{ duration: 20 * animationSpeed, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          <motion.path
            d="M 0 200 Q 200 150 400 200 T 800 200"
            fill="none"
            stroke="url(#wave-gradient-3)"
            strokeWidth={isPlaying ? "5" : "3"}
            filter="url(#glow)"
            animate={{
              d: [
                "M 0 200 Q 200 150 400 200 T 800 200",
                "M 0 200 Q 200 280 400 200 T 800 200",
                "M 0 200 Q 200 150 400 200 T 800 200"
              ]
            }}
            transition={{ duration: 18 * animationSpeed, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />
        </svg>
      </div>

      {/* Ambient Orbs */}
      <motion.div 
        className={clsx(
          "absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full mix-blend-screen filter blur-[100px] transition-colors duration-1000",
          colors.orb1,
          isPlaying ? "opacity-50" : "opacity-30"
        )}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: pulseScale
        }}
        transition={{ duration: 25 * animationSpeed, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className={clsx(
          "absolute bottom-[20%] right-[20%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[120px] transition-colors duration-1000",
          colors.orb2,
          isPlaying ? "opacity-40" : "opacity-20"
        )}
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: pulseScale
        }}
        transition={{ duration: 30 * animationSpeed, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      <motion.div 
        className={clsx(
          "absolute top-[40%] right-[40%] w-[30vw] h-[30vw] rounded-full mix-blend-screen filter blur-[90px] transition-colors duration-1000",
          colors.orb3,
          isPlaying ? "opacity-40" : "opacity-20"
        )}
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0],
          scale: pulseScale
        }}
        transition={{ duration: 20 * animationSpeed, repeat: Infinity, ease: "easeInOut", delay: 10 }}
      />
    </div>
  );
};
