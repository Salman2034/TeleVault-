import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div
        id="reconnected-toast"
        className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-xl shadow-emerald-600/30 animate-in slide-in-from-bottom duration-300"
      >
        <Wifi className="w-4 h-4" />
        <span>Back online! Telegram cloud connected.</span>
      </div>
    );
  }

  return (
    <div
      id="offline-toast"
      className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white border border-amber-500/40 text-xs font-medium shadow-2xl shadow-black/40 backdrop-blur-md animate-in slide-in-from-bottom duration-300"
    >
      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <div>
        <p className="font-bold text-slate-100">Offline Mode</p>
        <p className="text-[11px] text-slate-400">Serving cached folders and local files</p>
      </div>
    </div>
  );
};
