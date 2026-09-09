import React from 'react';
import {
  FileText,
  Image,
  Film,
  Music,
  Archive,
  Files,
  Send,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { StorageStats, FileCategory, TelegramConfig } from '../types';
import { formatBytes } from '../utils/formatters';

interface StorageStatsBarProps {
  stats: StorageStats | null;
  selectedCategory: FileCategory;
  onSelectCategory: (cat: FileCategory) => void;
  telegramConfig: TelegramConfig | null;
  onOpenConfig: () => void;
  onSyncTelegram?: () => void;
  isSyncing?: boolean;
}

export const StorageStatsBar: React.FC<StorageStatsBarProps> = ({
  stats,
  selectedCategory,
  onSelectCategory,
  telegramConfig,
  onOpenConfig,
  onSyncTelegram,
  isSyncing = false,
}) => {
  const isLive = telegramConfig?.isConfigured && !telegramConfig?.isDemoMode;
  const isMTProto = telegramConfig?.protocol === 'mtproto';

  const categories: { id: FileCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Files', icon: <Files className="w-3.5 h-3.5" /> },
    { id: 'images', label: 'Images', icon: <Image className="w-3.5 h-3.5" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'videos', label: 'Videos', icon: <Film className="w-3.5 h-3.5" /> },
    { id: 'audio', label: 'Audio', icon: <Music className="w-3.5 h-3.5" /> },
    { id: 'archives', label: 'Archives', icon: <Archive className="w-3.5 h-3.5" /> },
  ];

  return (
    <div id="storage-stats-container" className="space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden">
      {/* Banner / Telegram Status Bar */}
      <div
        className={`rounded-2xl p-3.5 sm:p-4 md:p-5 border transition-all overflow-hidden ${
          isLive
            ? isMTProto
              ? 'bg-gradient-to-r from-sky-50 via-indigo-50/50 to-emerald-50/40 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border-sky-300/80 dark:border-indigo-800/60 shadow-xs'
              : 'bg-gradient-to-r from-sky-50 via-cyan-50/60 to-slate-50 dark:from-slate-900 dark:via-sky-950/40 dark:to-slate-900 border-sky-200/80 dark:border-slate-800'
            : 'bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-slate-50 dark:from-slate-900 dark:via-amber-950/30 dark:to-slate-900 border-amber-200/80 dark:border-amber-900/50'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                isLive
                  ? isMTProto
                    ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white'
                    : 'bg-sky-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {isMTProto ? <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5 -rotate-12" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                  {isLive
                    ? isMTProto
                      ? 'Telegram MTProto: Active'
                      : 'Telegram Bot API: Active'
                    : 'Sandbox Storage Mode'}
                </h3>
                {isLive && isMTProto && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600 dark:text-indigo-400" />
                    2 GB Max / File
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-full ${
                    isLive ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-transparent dark:border-emerald-800/60' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-800/60'
                  }`}
                >
                  {isLive ? 'Unlimited Free' : 'Local Sandbox'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed break-words">
                {isLive ? (
                  <span>
                    Files stream to Telegram CDN via <strong className="text-slate-800 dark:text-slate-200">@{telegramConfig?.botUsername || 'your_bot'}</strong> in{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{telegramConfig?.chatTitle || telegramConfig?.chatId}</strong>
                    {isMTProto ? ' (MTProto 2 GB pipeline).' : ' (max 50 MB/file).'}
                  </span>
                ) : (
                  <span>
                    Uploads are saved in local sandbox. Connect your Telegram MTProto credentials to upload files up to 2 GB for free!
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-center shrink-0">
            {onSyncTelegram && isLive && (
              <button
                id="btn-stats-sync-channel"
                onClick={onSyncTelegram}
                disabled={isSyncing}
                className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                title="Restore folders and files from your Telegram channel"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-sky-600 dark:text-sky-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Channel'}</span>
              </button>
            )}
            <button
              id="btn-stats-configure"
              onClick={onOpenConfig}
              className={`flex-1 md:flex-initial px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-sm text-center cursor-pointer ${
                isLive
                  ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              {isLive ? 'Configure' : 'Connect Telegram'}
            </button>
          </div>
        </div>

        {/* Quick Stats Grid - 2 cols on mobile, 4 cols on tablet and desktop */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 min-w-0">
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Stored on Telegram</div>
            <div className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {formatBytes(stats?.totalBytes || 0)}
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 min-w-0">
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Total Files</div>
            <div className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {stats?.totalFiles || 0}
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 min-w-0">
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Storage Quota</div>
            <div className="text-xs sm:text-sm md:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
              Unlimited ($0/mo)
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 min-w-0">
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Max Single File</div>
            <div className="text-xs sm:text-sm md:text-base font-bold text-sky-700 dark:text-sky-400 mt-0.5 truncate">
              {isLive && isMTProto ? '2 GB (MTProto)' : isLive ? '50 MB (Bot)' : '2 GB (Sandbox)'}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters Pills - Smooth touch scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x w-full">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`filter-btn-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-xl text-xs font-medium whitespace-nowrap transition-all touch-manipulation cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
