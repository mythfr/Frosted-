import React, { useState, useEffect, useRef } from 'react';
import { logger, LogEntry } from '../services/logger';
import { Terminal, X, Trash2, ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useApp } from '../AppContext';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDarkMode } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = logger.subscribe(setLogs);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs, isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-6 z-50 p-3 bg-red-500 text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
        title="Open Debug Logs"
      >
        <Bug size={20} />
        <span className="text-xs font-bold">Debug</span>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={clsx(
        "fixed bottom-28 right-6 z-50 w-[90vw] max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200",
        isExpanded ? "h-[60vh]" : "h-80"
      )}
    >
      {/* Header */}
      <div className={clsx(
        "p-3 flex items-center justify-between border-b",
        isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-200"
      )}>
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-red-500" />
          <span className="text-xs font-bold uppercase tracking-widest dark:text-white">System Logs</span>
          <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-500 text-[10px] font-bold">
            {logs.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-black/10 rounded transition-colors text-slate-400"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button 
            onClick={() => logger.clear()}
            className="p-1 hover:bg-black/10 rounded transition-colors text-slate-400"
            title="Clear Logs"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-black/10 rounded transition-colors text-slate-400"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-[10px] space-y-1"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic">
            No logs yet...
          </div>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id}
              className={clsx(
                "p-1.5 rounded border-l-2",
                log.level === 'error' ? "bg-red-500/10 border-red-500 text-red-400" :
                log.level === 'warn' ? "bg-yellow-500/10 border-yellow-500 text-yellow-400" :
                log.level === 'info' ? "bg-blue-500/10 border-blue-500 text-blue-400" :
                "bg-zinc-500/10 border-zinc-500 text-zinc-400"
              )}
            >
              <div className="flex justify-between opacity-50 mb-0.5">
                <span>{log.level.toUpperCase()}</span>
                <span>{log.timestamp}</span>
              </div>
              <div className="font-bold break-words">{log.message}</div>
              {log.data && (
                <pre className="mt-1 p-1 bg-black/20 rounded overflow-x-auto max-w-full">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
