import React from 'react';
import { Cloud, Search, Settings, Upload, FolderPlus, Send, Sparkles, RefreshCw, Download } from 'lucide-react';
import { TelegramConfig } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  telegramConfig: TelegramConfig | null;
  onOpenConfig: () => void;
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  onSyncTelegram?: () => void;
  isSyncing?: boolean;
  totalFiles: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenInstallModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  telegramConfig,
  onOpenConfig,
  onOpenUpload,
  onOpenNewFolder,
  onSyncTelegram,
  isSyncing = false,
  totalFiles,
  theme,
  onToggleTheme,
  onOpenInstallModal,
}) => {
  const isLive = telegramConfig?.isConfigured && !telegramConfig?.isDemoMode;
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleInstallClick = async () => {
    if (onOpenInstallModal) onOpenInstallModal();
    if (isInstallable) {
      await install();
    }
  };

  return (
    <header id="main-navbar" className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-sky-500/20 dark:shadow-sky-500/10">
            <Send className="w-4 h-4 sm:w-5 sm:h-5 -rotate-12 translate-x-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-sm sm:text-lg">TeleVault</span>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-transparent dark:border-sky-800/50 rounded-full">
                Encrypted Vault
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block">Unlimited Telegram Cloud Storage</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs sm:max-w-md mx-1 sm:mx-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-8 sm:pl-10 pr-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:focus:bg-slate-800 rounded-xl border border-transparent focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 px-1 py-0.5 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Actions & Telegram Status */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Theme Switcher Toggle */}
          <ThemeToggle
            theme={theme}
            onToggleTheme={onToggleTheme}
          />

          {/* Sync with Telegram Channel Button (hidden on mobile since it's on bottom dock) */}
          {onSyncTelegram && (
            <button
              id="btn-navbar-sync"
              onClick={onSyncTelegram}
              disabled={isSyncing}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
              title="Sync folders & files with your Telegram Channel (cross-device restore)"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-600 dark:text-sky-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isSyncing ? 'Syncing...' : 'Sync Channel'}</span>
            </button>
          )}

          {/* Telegram Connection Badge (Desktop) */}
          <button
            id="btn-telegram-status-pill"
            onClick={onOpenConfig}
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              isLive
                ? telegramConfig?.protocol === 'mtproto'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 hover:bg-amber-100/80 dark:hover:bg-amber-900/60'
            }`}
            title="Click to view or edit Telegram Settings"
          >
            {isLive ? (
              <>
                <span className={`w-2 h-2 rounded-full ${telegramConfig?.protocol === 'mtproto' ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-emerald-500 dark:bg-emerald-400'} animate-pulse`} />
                <span className="truncate max-w-[130px]">
                  {telegramConfig?.protocol === 'mtproto' ? '⚡ ' : ''}@{telegramConfig?.botUsername || 'Telegram Bot'}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  telegramConfig?.protocol === 'mtproto' ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200' : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                }`}>
                  {telegramConfig?.protocol === 'mtproto' ? '2 GB' : '50 MB'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Sandbox (2 GB)</span>
              </>
            )}
          </button>

          {/* Install App Button */}
          {onOpenInstallModal && !isInstalled && (
            <button
              id="btn-navbar-install-app"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-sky-500/15 to-indigo-500/15 hover:from-sky-500/25 hover:to-indigo-500/25 border border-sky-300/40 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Direct Install TeleVault App for PC, Android, Mac & iPhone"
            >
              <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 animate-bounce" />
              <span className="hidden sm:inline">Direct Install</span>
            </button>
          )}

          {/* New Folder Button (Tablet & Desktop) */}
          <button
            id="btn-navbar-new-folder"
            onClick={onOpenNewFolder}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-medium transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>New Folder</span>
          </button>

          {/* Upload Button (hidden on mobile, accessible via central mobile floating action in bottom dock) */}
          <button
            id="btn-navbar-upload"
            onClick={onOpenUpload}
            className="hidden sm:flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Upload File</span>
          </button>

          {/* Settings Trigger */}
          <button
            id="btn-navbar-settings"
            onClick={onOpenConfig}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
            title="Telegram Storage Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
