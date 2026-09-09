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
    <div id="storage-stats-container" className="space-y-4">
      {/* Banner / Telegram Status Bar */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border transition-all ${
          isLive
            ? isMTProto
              ? 'bg-gradient-to-r from-sky-50 via-indigo-50/50 to-emerald-50/40 border-sky-300/80 shadow-xs'
              : 'bg-gradient-to-r from-sky-50 via-cyan-50/60 to-slate-50 border-sky-200/80'
            : 'bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-slate-50 border-amber-200/80'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                isLive
                  ? isMTProto
                    ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white'
                    : 'bg-sky-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {isMTProto ? <Zap className="w-5 h-5 text-white" /> : <Send className="w-5 h-5 -rotate-12" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900 text-sm">
                  {isLive
                    ? isMTProto
                      ? 'Telegram MTProto Cloud: Active'
                      : 'Telegram Bot API Storage: Active'
                    : 'Sandbox Storage Mode'}
                </h3>
                {isLive && isMTProto && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200/60">
                    <Zap className="w-3 h-3 text-indigo-600" />
                    2 GB Max File Size
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                    isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isLive ? 'Unlimited Free Hosting' : 'Local Sandbox'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {isLive ? (
                  <span>
                    Files stream to/from Telegram CDN via <strong>@{telegramConfig?.botUsername || 'your_bot'}</strong> in{' '}
                    <strong>{telegramConfig?.chatTitle || telegramConfig?.chatId}</strong>
                    {isMTProto ? ' using MTProto 2 GB chunked pipeline.' : ' (capped at 50 MB per file).'}
                    {telegramConfig?.lastSyncTime && (
                      <span className="block text-[11px] text-emerald-700 mt-0.5 font-medium">
                        ✓ Cross-device synchronized with channel (Manifest updated)
                      </span>
                    )}
                  </span>
                ) : (
                  <span>
                    Uploads are stored locally in sandbox mode. Connect your Telegram MTProto credentials to upload files up to 2 GB for free!
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0">
            {onSyncTelegram && isLive && (
              <button
                id="btn-stats-sync-channel"
                onClick={onSyncTelegram}
                disabled={isSyncing}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs disabled:opacity-50"
                title="Restore folders and files from your Telegram channel"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Channel'}</span>
              </button>
            )}
            <button
              id="btn-stats-configure"
              onClick={onOpenConfig}
              className={`flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-sm text-center ${
                isLive
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
            >
              {isLive ? 'Configure' : 'Connect Telegram'}
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-4 pt-4 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/60">
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Stored on Telegram</div>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 truncate">
              {formatBytes(stats?.totalBytes || 0)}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/60">
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Total Files</div>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              {stats?.totalFiles || 0}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/60">
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Storage Quota</div>
            <div className="text-sm sm:text-base font-bold text-emerald-600 mt-0.5">
              Unlimited ($0/mo)
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/60">
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Max Single File</div>
            <div className="text-sm sm:text-base font-bold text-sky-700 mt-0.5 truncate">
              {isLive && isMTProto ? '2 GB (MTProto)' : isLive ? '50 MB' : '2 GB (Sandbox)'}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters Pills - Smooth touch scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`filter-btn-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 min-h-[38px] rounded-xl text-xs font-medium whitespace-nowrap transition-all touch-manipulation ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 hover:border-slate-300'
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
