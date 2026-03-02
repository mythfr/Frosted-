import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, MessageCircle, Share2, MessageSquare, Music2 } from 'lucide-react';
import { useApp } from '../AppContext';
import { toPng } from 'html-to-image';
import { clsx } from 'clsx';

export const ShareModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentSong } = useApp();
  const [activeCard, setActiveCard] = useState<'music' | 'lyrics'>('music');
  const [bgGradient, setBgGradient] = useState('from-pink-300 to-blue-300');
  const cardRef = useRef<HTMLDivElement>(null);
  const lyricsCardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const gradients = [
    'from-pink-300 to-blue-300',
    'from-orange-400 to-red-500',
    'from-emerald-400 to-cyan-500',
    'from-purple-500 to-indigo-600',
    'from-slate-800 to-slate-900'
  ];

  // Detect which card is active based on scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const width = containerRef.current.clientWidth;
    if (scrollLeft > width / 2) {
      setActiveCard('lyrics');
    } else {
      setActiveCard('music');
    }
  };

  if (!currentSong) return null;

  const handleShare = async (platform: string) => {
    const targetRef = activeCard === 'music' ? cardRef : lyricsCardRef;
    if (!targetRef.current) return;
    
    try {
      // Temporarily remove border radius for better image capture if needed, or keep it
      const dataUrl = await toPng(targetRef.current, { 
        cacheBust: true, 
        pixelRatio: 2,
        style: { transform: 'scale(1)' } // Ensure no scaling issues
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${currentSong.title}-share.png`, { type: 'image/png' });

      if (platform === 'copy') {
        // Copy link to song (mocked)
        navigator.clipboard.writeText(`https://frosted.app/song/${currentSong.id}`);
        alert('Link copied to clipboard!');
        return;
      }

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Listening to ${currentSong.title}`,
          text: `Check out ${currentSong.title} by ${currentSong.artist} on Frosted!`,
        });
      } else {
        // Fallback for desktop/unsupported browsers
        const link = document.createElement('a');
        link.download = `${currentSong.title}-share.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Error sharing:', err);
      alert('Could not generate share image. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.y > 150 || velocity.y > 500) {
              onClose();
            }
          }}
          className="fixed inset-0 z-[70] flex flex-col bg-[#121212] text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X size={24} />
            </button>
            <span className="font-semibold text-sm tracking-wide">Share</span>
            <div className="w-10" />
          </div>

          {/* Cards Container */}
          <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-x-auto snap-x snap-mandatory flex items-center px-8 gap-8 pb-4 hide-scrollbar"
          >
            {/* Music Card */}
            <div className="snap-center shrink-0 w-full max-w-[320px] mx-auto flex flex-col items-center">
              <div 
                ref={cardRef}
                className={clsx(
                  "w-full aspect-[3/4.5] rounded-3xl p-6 flex flex-col justify-center bg-gradient-to-br shadow-2xl",
                  bgGradient
                )}
              >
                <div className="bg-[#181818] rounded-2xl p-4 flex flex-col gap-4 shadow-2xl">
                  <img 
                    src={currentSong.coverUrl} 
                    alt={currentSong.title} 
                    className="w-full aspect-square rounded-xl object-cover shadow-lg"
                    crossOrigin="anonymous"
                  />
                  <div className="flex flex-col px-1">
                    <h2 className="text-xl font-bold truncate text-white">{currentSong.title}</h2>
                    <p className="text-slate-400 text-sm truncate">{currentSong.artist}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <Music2 size={16} className="text-white" />
                    <span className="font-bold tracking-widest text-xs text-white">FROSTED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lyrics Card */}
            <div className="snap-center shrink-0 w-full max-w-[320px] mx-auto flex flex-col items-center">
              <div 
                ref={lyricsCardRef}
                className={clsx(
                  "w-full aspect-[3/4.5] rounded-3xl p-6 flex flex-col justify-center bg-gradient-to-br shadow-2xl",
                  bgGradient
                )}
              >
                <div className="bg-[#181818] rounded-2xl p-6 flex flex-col h-full shadow-2xl relative overflow-hidden">
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xl font-bold text-white text-center leading-relaxed">
                      "I'm wide awake<br/>Yeah, I was in the dark<br/>I was falling hard<br/>With an open heart"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
                    <img 
                      src={currentSong.coverUrl} 
                      alt={currentSong.title} 
                      className="w-10 h-10 rounded object-cover"
                      crossOrigin="anonymous"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-white truncate">{currentSong.title}</span>
                      <span className="text-xs text-slate-400 truncate">{currentSong.artist}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mb-4">
            <div className={clsx("w-2 h-2 rounded-full transition-colors", activeCard === 'music' ? "bg-white" : "bg-white/30")} />
            <div className={clsx("w-2 h-2 rounded-full transition-colors", activeCard === 'lyrics' ? "bg-white" : "bg-white/30")} />
          </div>

          {/* Color Picker */}
          <div className="flex justify-center gap-4 py-4">
            {gradients.map(grad => (
              <button
                key={grad}
                onClick={() => setBgGradient(grad)}
                className={clsx(
                  "w-8 h-8 rounded-full bg-gradient-to-br border-2 transition-transform",
                  grad,
                  bgGradient === grad ? "border-white scale-110" : "border-transparent scale-100"
                )}
              />
            ))}
          </div>

          {/* Share Actions */}
          <div className="flex items-center justify-between px-6 py-6 bg-black/40 border-t border-white/10">
            <button onClick={() => handleShare('copy')} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <LinkIcon size={20} />
              </div>
              <span className="text-[10px] font-medium">Copy link</span>
            </button>
            <button onClick={() => handleShare('whatsapp')} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center hover:brightness-110 transition-all">
                <MessageCircle size={24} fill="white" />
              </div>
              <span className="text-[10px] font-medium">WhatsApp</span>
            </button>
            <button onClick={() => handleShare('status')} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#128C7E] flex items-center justify-center hover:brightness-110 transition-all">
                <MessageCircle size={24} fill="white" />
              </div>
              <span className="text-[10px] font-medium">Status</span>
            </button>
            <button onClick={() => handleShare('sms')} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <MessageSquare size={20} />
              </div>
              <span className="text-[10px] font-medium">SMS</span>
            </button>
            <button onClick={() => handleShare('native')} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Share2 size={20} />
              </div>
              <span className="text-[10px] font-medium">More</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
