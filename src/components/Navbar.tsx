import React from 'react';
import { Cloud, Search, Settings, Upload, FolderPlus, Send, Sparkles, RefreshCw } from 'lucide-react';
import { TelegramConfig } from '../types';

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
}) => {
  const isLive = telegramConfig?.isConfigured && !telegramConfig?.isDemoMode;

  return (
    <header id="main-navbar" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-sky-500/10">
            <Send className="w-4 h-4 sm:w-5 sm:h-5 -rotate-12 translate-x-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-lg">TeleVault</span>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold bg-sky-100 text-sky-800 rounded-full">
                Encrypted Vault
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden lg:block">Unlimited Telegram Cloud Storage</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs sm:max-w-md mx-1 sm:mx-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-8 sm:pl-10 pr-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white rounded-xl border border-transparent focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Actions & Telegram Status */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Sync with Telegram Channel Button */}
          {onSyncTelegram && (
            <button
              id="btn-navbar-sync"
              onClick={onSyncTelegram}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors disabled:opacity-50"
              title="Sync folders & files with your Telegram Channel (cross-device restore)"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isSyncing ? 'Syncing...' : 'Sync Channel'}</span>
            </button>
          )}

          {/* Telegram Connection Badge (Desktop) */}
          <button
            id="btn-telegram-status-pill"
            onClick={onOpenConfig}
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isLive
                ? telegramConfig?.protocol === 'mtproto'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100/80'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/80'
                : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100/80'
            }`}
            title="Click to view or edit Telegram Settings"
          >
            {isLive ? (
              <>
                <span className={`w-2 h-2 rounded-full ${telegramConfig?.protocol === 'mtproto' ? 'bg-indigo-500' : 'bg-emerald-500'} animate-pulse`} />
                <span className="truncate max-w-[130px]">
                  {telegramConfig?.protocol === 'mtproto' ? '⚡ ' : ''}@{telegramConfig?.botUsername || 'Telegram Bot'}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  telegramConfig?.protocol === 'mtproto' ? 'bg-indigo-200 text-indigo-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {telegramConfig?.protocol === 'mtproto' ? '2 GB' : '50 MB'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Sandbox (2 GB)</span>
              </>
            )}
          </button>

          {/* New Folder Button (Tablet & Desktop) */}
          <button
            id="btn-navbar-new-folder"
            onClick={onOpenNewFolder}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-slate-500" />
            <span>New Folder</span>
          </button>

          {/* Upload Button */}
          <button
            id="btn-navbar-upload"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Upload File</span>
            <span className="sm:hidden">Upload</span>
          </button>

          {/* Settings Trigger */}
          <button
            id="btn-navbar-settings"
            onClick={onOpenConfig}
            className="p-2 sm:p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Telegram Storage Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
