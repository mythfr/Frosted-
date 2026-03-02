export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

type Listener = (logs: LogEntry[]) => void;

class Logger {
  private logs: LogEntry[] = [];
  private listeners: Listener[] = [];

  info(message: string, data?: any) { this.addLog('info', message, data); }
  warn(message: string, data?: any) { this.addLog('warn', message, data); }
  error(message: string, data?: any) { this.addLog('error', message, data); }
  debug(message: string, data?: any) { this.addLog('debug', message, data); }

  private addLog(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data,
    };
    
    this.logs = [entry, ...this.logs].slice(0, 100);
    this.notify();
    
    // Also log to console for standard debugging
    const consoleMethod = level === 'debug' ? 'log' : level;
    console[consoleMethod](`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, data || '');
  }

  private notify() {
    this.listeners.forEach(l => l(this.logs));
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    listener(this.logs);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getLogs() {
    return this.logs;
  }

  clear() {
    this.logs = [];
    this.notify();
  }
}

export const logger = new Logger();
