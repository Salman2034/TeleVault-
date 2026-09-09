import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  Apple,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenInstallModal: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenInstallModal }) => {
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('televault_pwa_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('televault_pwa_banner_dismissed', 'true');
  };

  const getPlatformLabel = () => {
    if (platform === 'android') return 'Android App';
    if (platform === 'ios') return 'iPhone / iPad App';
    if (platform === 'mac') return 'macOS App';
    return 'PC / Desktop App';
  };

  return (
    <div
      id="pwa-install-promo-banner"
      className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 dark:from-sky-900 dark:via-sky-800 dark:to-indigo-950 text-white border-b border-sky-400/20 shadow-sm transition-all"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Side: Icon + Message */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shrink-0 shadow-sm">
            <Download className="w-4 h-4 text-white animate-bounce" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm tracking-tight">
                Install TeleVault App for {getPlatformLabel()}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm">
                <Sparkles className="w-2.5 h-2.5" /> PWA Ready
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-sky-100 dark:text-sky-200 truncate">
              Direct install for PC & Android • Guided setup for Mac & iPhone • Fast offline caching
            </p>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            id="btn-banner-install-guide"
            onClick={onOpenInstallModal}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install / View Guide</span>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl hover:bg-black/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Dismiss banner"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
