import React, { useState } from 'react';
import {
  Bot,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  ExternalLink,
  ShieldCheck,
  Server,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  RefreshCw,
  FolderTree,
  HardDrive,
  Info,
  BookOpen,
  ChevronRight,
  Check,
  Lock,
  Cloud,
} from 'lucide-react';
import { TelegramConfig, StorageProtocol } from '../types';

interface TelegramConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: TelegramConfig | null;
  onConfigSaved: (config: TelegramConfig) => void;
  onSyncChannel?: () => Promise<void>;
  isSyncing?: boolean;
}

type ActiveViewTab = 'config' | 'mtproto-help' | 'botapi-help' | 'comparison';

export const TelegramConfigModal: React.FC<TelegramConfigModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onConfigSaved,
  onSyncChannel,
  isSyncing = false,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveViewTab>('config');
  const [protocol, setProtocol] = useState<StorageProtocol>(currentConfig?.protocol || 'mtproto');
  const [botToken, setBotToken] = useState(currentConfig?.botToken || '');
  const [chatId, setChatId] = useState(currentConfig?.chatId || '');
  const [apiId, setApiId] = useState(currentConfig?.apiId || '');
  const [apiHash, setApiHash] = useState(currentConfig?.apiHash || '');
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken.trim() || !chatId.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide both a Telegram Bot Token and Target Chat ID.' });
      return;
    }

    if (protocol === 'mtproto' && (!apiId.trim() || !apiHash.trim())) {
      setStatusMessage({
        type: 'error',
        text: 'Telegram App API ID and API Hash are required for MTProto 2 GB per-file mode. Obtain them free from https://my.telegram.org.',
      });
      return;
    }

    setIsTesting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol,
          botToken: botToken.trim(),
          chatId: chatId.trim(),
          apiId: apiId.trim(),
          apiHash: apiHash.trim(),
          isDemoMode: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect to Telegram');
      }

      const protocolLabel = protocol === 'mtproto' ? 'MTProto (2 GB per file upload limit)' : 'Standard Bot API (50 MB per file upload limit)';
      setStatusMessage({
        type: 'success',
        text: `Connected successfully via ${protocolLabel}! Bot: @${data.botUsername || 'Bot'} (Target: ${data.chatTitle || chatId}). Total storage is unmetered!`,
      });

      onConfigSaved({
        protocol,
        botToken: botToken.trim(),
        chatId: chatId.trim(),
        apiId: apiId.trim(),
        apiHash: apiHash.trim(),
        isConfigured: true,
        botUsername: data.botUsername,
        botFirstName: data.botFirstName,
        chatTitle: data.chatTitle,
        isDemoMode: false,
        mtprotoConnected: protocol === 'mtproto',
        maxFileSizeBytes: protocol === 'mtproto' ? 2048 * 1024 * 1024 : 50 * 1024 * 1024,
        maxFileSizeLabel: protocol === 'mtproto' ? '2 GB / file' : '50 MB / file',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Verification failed. Please check your credentials and channel permissions.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSwitchToDemo = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemoMode: true }),
      });
      await res.json();
      onConfigSaved({
        protocol: 'bot_api',
        botToken: '',
        chatId: '',
        apiId: '',
        apiHash: '',
        isConfigured: false,
        isDemoMode: true,
        maxFileSizeBytes: 2048 * 1024 * 1024,
        maxFileSizeLabel: 'Sandbox Local',
      });
      setStatusMessage({
        type: 'success',
        text: 'Switched to Sandbox Mode. You can upload and test files locally in the browser.',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to switch mode' });
    } finally {
      setIsTesting(false);
    }
  };

  const isLive = currentConfig?.isConfigured && !currentConfig?.isDemoMode;

  return (
    <div
      id="telegram-config-modal-overlay"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 dark:bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="telegram-config-modal-card"
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Telegram Cloud Settings
                </h2>
                {isLive ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Live Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Sandbox Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure your cloud drive protocol, bot credentials & channel storage
              </p>
            </div>
          </div>
          <button
            id="btn-close-config-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/40 p-1.5 gap-1 shrink-0 overflow-x-auto">
          <button
            id="tab-btn-config"
            onClick={() => setActiveTab('config')}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Configuration</span>
          </button>

          <button
            id="tab-btn-mtproto-help"
            onClick={() => setActiveTab('mtproto-help')}
            className={`flex-1 min-w-[125px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'mtproto-help'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            <span>2 GB MTProto Help</span>
          </button>

          <button
            id="tab-btn-botapi-help"
            onClick={() => setActiveTab('botapi-help')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'botapi-help'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-500" />
            <span>50 MB Bot API Help</span>
          </button>

          <button
            id="tab-btn-comparison"
            onClick={() => setActiveTab('comparison')}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span>Comparison</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* TAB 1: MAIN CONFIGURATION FORM */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              {/* IMPORTANT STORAGE CLARIFICATION BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-indigo-500/10 border border-emerald-500/25 dark:border-emerald-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-sm">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      Important: Total Storage Space is 100% UNLIMITED
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      $0 Forever
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    The <strong>50 MB</strong> and <strong>2 GB</strong> numbers below represent the <u>maximum size allowed for a single file upload</u>. They are <strong>NOT a storage quota limit</strong>. You can upload an infinite amount of total files, gigabytes, or terabytes into your private Telegram channel without ever running out of space.
                  </p>
                </div>
              </div>

              {/* Protocol Architecture Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Select Upload System & Protocol
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* MTProto Option */}
                  <button
                    type="button"
                    id="btn-protocol-mtproto"
                    onClick={() => setProtocol('mtproto')}
                    className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                      protocol === 'mtproto'
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/60 ring-2 ring-sky-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${protocol === 'mtproto' ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          MTProto Client
                        </span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        2 GB / FILE
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      Parallel binary chunking via GramJS MTProto. Supports large videos, software, and zip archives up to <strong className="text-slate-900 dark:text-white">2,000 MB per file</strong>.
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Total Storage: <strong className="text-emerald-600 dark:text-emerald-400">Unlimited</strong></span>
                      <span className="text-sky-600 dark:text-sky-400 font-semibold">Recommended ★</span>
                    </div>
                  </button>

                  {/* Bot API Option */}
                  <button
                    type="button"
                    id="btn-protocol-botapi"
                    onClick={() => setProtocol('bot_api')}
                    className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                      protocol === 'bot_api'
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/60 ring-2 ring-sky-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${protocol === 'bot_api' ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Standard Bot API
                        </span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        50 MB / FILE
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      Simple HTTPS HTTP bot endpoints. Easy 1-minute setup with BotFather, but Telegram caps individual files at <strong className="text-slate-900 dark:text-white">50 MB per file</strong>.
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Total Storage: <strong className="text-emerald-600 dark:text-emerald-400">Unlimited</strong></span>
                      <span className="text-slate-500 dark:text-slate-400">Basic Setup</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Status feedback message */}
              {statusMessage && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 font-medium">{statusMessage.text}</div>
                </div>
              )}

              {/* Main Credential Form */}
              <form onSubmit={handleSaveAndTest} className="space-y-4">
                {/* Bot Token Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>Telegram Bot Token</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 font-medium"
                    >
                      Get token from @BotFather <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    id="input-telegram-bot-token"
                    type="text"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Created via Telegram BotFather with <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">/newbot</code> command.
                  </p>
                </div>

                {/* Target Chat / Channel ID Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>Target Storage Channel ID or Username</span>
                      <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <input
                    id="input-telegram-chat-id"
                    type="text"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    placeholder="e.g. -1001234567890 or @my_vault_channel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Your private storage channel. Add your bot as an <strong className="text-slate-700 dark:text-slate-300">Administrator</strong> with post permissions.
                  </p>
                </div>

                {/* MTProto Specific App Credentials */}
                {protocol === 'mtproto' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-sky-50/70 dark:from-slate-800/90 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        MTProto API Credentials (my.telegram.org)
                      </span>
                      <a
                        href="https://my.telegram.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 font-medium"
                      >
                        Get free API keys <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          App api_id <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="input-telegram-api-id"
                          type="text"
                          value={apiId}
                          onChange={(e) => setApiId(e.target.value)}
                          placeholder="e.g. 12345678"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          App api_hash <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="input-telegram-api-hash"
                          type="text"
                          value={apiHash}
                          onChange={(e) => setApiHash(e.target.value)}
                          placeholder="e.g. 0123456789abcdef0123456789abcdef"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Unlocks high-speed binary chunk streaming up to 2 GB per file directly to Telegram DC servers. Free and official for all Telegram accounts.
                    </p>
                  </div>
                )}

                {/* Cross-Device Persistence & Channel Manifest Sync */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <FolderTree className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Cross-Device Folder Hierarchy & Backup
                    </span>
                    {onSyncChannel && currentConfig?.isConfigured && (
                      <button
                        type="button"
                        id="btn-modal-sync-channel"
                        onClick={onSyncChannel}
                        disabled={isSyncing}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'Syncing...' : 'Sync From Channel'}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                    TeleVault automatically writes a master structure manifest (<code className="bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">tele_storage_manifest.json</code>) directly to your Telegram channel. Connecting this channel on any other computer, tablet, or phone instantly restores your entire folder tree.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    id="btn-verify-telegram"
                    type="submit"
                    disabled={isTesting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md hover:shadow-sky-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    {isTesting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying {protocol === 'mtproto' ? 'MTProto 2GB Connection...' : 'Bot API...'}</span>
                      </>
                    ) : (
                      <>
                        {protocol === 'mtproto' ? <Zap className="w-4 h-4 text-sky-200" /> : <Server className="w-4 h-4" />}
                        <span>Connect & Activate {protocol === 'mtproto' ? 'MTProto (2 GB/file)' : 'Bot API (50 MB/file)'}</span>
                      </>
                    )}
                  </button>

                  <button
                    id="btn-switch-demo-mode"
                    type="button"
                    onClick={handleSwitchToDemo}
                    disabled={isTesting}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sandbox Mode</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SYSTEM 1 - MTPROTO (2 GB / FILE) HELP */}
          {activeTab === 'mtproto-help' && (
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              {/* System 1 Intro Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-transparent border border-indigo-500/20 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    System 1: Telegram MTProto Client (Recommended)
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Telegram MTProto uses GramJS to connect directly to Telegram&apos;s binary Data Centers. It bypasses the standard HTTP 50 MB bot restriction and enables uploading files up to <strong>2,048 MB (2 GB) per single file</strong>.
                  </p>
                </div>
              </div>

              {/* Clarification Callout */}
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Storage Capacity:</strong> Unlimited total gigabytes / terabytes across all your uploads. The 2 GB limit only applies per individual file.
                </span>
              </div>

              {/* Step by Step Guide */}
              <div className="space-y-3">
                <h5 className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[11px]">
                  Step-by-Step MTProto Setup (Takes ~2 Minutes)
                </h5>

                {/* Step 1 */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <strong className="text-slate-900 dark:text-white">Create your Bot via @BotFather</strong>
                  </div>
                  <p className="pl-7 text-slate-600 dark:text-slate-300">
                    Open Telegram and message <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-600 dark:text-sky-400 underline font-semibold">@BotFather</a>. Send <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">/newbot</code>, give your bot a name, and copy the generated <strong>HTTP API Token</strong>.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <strong className="text-slate-900 dark:text-white">Create a Private Channel & Add Bot as Admin</strong>
                  </div>
                  <p className="pl-7 text-slate-600 dark:text-slate-300">
                    In Telegram, create a New Channel (e.g. &quot;My Cloud Storage&quot;). Go to Channel Settings &rarr; <strong>Administrators</strong> &rarr; <strong>Add Admin</strong> &rarr; search for your bot & grant it permission to post messages. Copy the Channel ID (or public username like <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded">@my_channel</code>).
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                    <strong className="text-slate-900 dark:text-white">Get Free API Credentials from my.telegram.org</strong>
                  </div>
                  <p className="pl-7 text-slate-600 dark:text-slate-300">
                    Log in with your phone number at <a href="https://my.telegram.org" target="_blank" rel="noreferrer" className="text-sky-600 dark:text-sky-400 underline font-semibold">https://my.telegram.org</a>. Click <strong>API development tools</strong>. Enter any app title and short name (e.g. &quot;TeleVault&quot;). Copy your <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded">api_id</code> and <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded">api_hash</code>.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                    <strong className="text-slate-900 dark:text-white">Connect & Enjoy 2 GB Per File Uploads</strong>
                  </div>
                  <p className="pl-7 text-slate-600 dark:text-slate-300">
                    Paste all 4 credentials into the <strong>Configuration</strong> tab and click <strong>Connect & Activate MTProto</strong>. You are now ready to store unlimited files up to 2 GB each!
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setProtocol('mtproto');
                    setActiveTab('config');
                  }}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Go to Configuration & Set Up MTProto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM 2 - BOT API (50 MB / FILE) HELP */}
          {activeTab === 'botapi-help' && (
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              {/* System 2 Intro Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-transparent border border-sky-500/20 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-600 text-white shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    System 2: Standard Telegram Bot API (Simple Mode)
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Uses Telegram&apos;s standard HTTPS HTTP API. It is fast to configure and requires only a Bot Token and Channel ID, with individual file uploads capped at <strong>50 MB per single file</strong>.
                  </p>
                </div>
              </div>

              {/* Clarification Callout */}
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Storage Capacity:</strong> Unlimited total storage in your channel. The 50 MB limit applies strictly per uploaded file (ideal for photos, PDFs, docs, music).
                </span>
              </div>

              {/* Step by Step Guide */}
              <div className="space-y-3">
                <h5 className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[11px]">
                  Step-by-Step Bot API Setup (Takes ~1 Minute)
                </h5>

                {/* Step 1 */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <strong className="text-slate-900 dark:text-white">Create Bot on @BotFather</strong>
                  </div>
                  <p className="pl-7 text-slate-600 dark:text-slate-300">
                    Open Telegram &rarr; search for <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-600 dark:text-sky-400 underline font-semibold">@BotFather</a> &rarr; send <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">/newbot</code> &rarr; copy the HTTP Bot Token.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <strong className="text-slate-900 dark:text-white">Create Channel & Add Bot as Administrator</strong>
                  </div>
                  <p className="pl-7 text-slate-600 dark:text-slate-300">
                    Create a private Telegram channel &rarr; open Channel Info &rarr; Administrators &rarr; add your bot as an admin with &quot;Post Messages&quot; turned ON.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                    <strong className="text-slate-900 dark:text-white">Connect in TeleVault</strong>
                  </div>
                  <p className="pl-7 text-slate-600 dark:text-slate-300">
                    Select <strong>Standard Bot API</strong>, paste your Bot Token and Channel ID, and click Connect. No API ID/Hash required!
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setProtocol('bot_api');
                    setActiveTab('config');
                  }}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Go to Configuration & Set Up Bot API</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ARCHITECTURE COMPARISON */}
          {activeTab === 'comparison' && (
            <div className="space-y-4 text-xs">
              {/* Storage Clarification Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-indigo-500/10 border border-emerald-500/25 flex items-start gap-3">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white block mb-0.5">
                    Storage Quota vs. Upload Limit Clarification
                  </strong>
                  Both systems provide <strong>UNLIMITED total storage</strong> on Telegram. The only difference is the maximum size allowed for each single uploaded file.
                </div>
              </div>

              {/* Comparison Matrix Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800/80 p-3 font-bold text-slate-800 dark:text-slate-200">
                  <span>Capability</span>
                  <span className="text-center text-indigo-600 dark:text-indigo-400">MTProto Client</span>
                  <span className="text-center text-sky-600 dark:text-sky-400">Standard Bot API</span>
                </div>

                <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
                  {/* Row 1: Single file limit */}
                  <div className="grid grid-cols-3 p-3 bg-white dark:bg-slate-900/50 items-center">
                    <span className="font-semibold text-slate-900 dark:text-white">Max Single File Size</span>
                    <span className="text-center font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 py-1 px-2 rounded-lg mx-1">
                      2,048 MB (2 GB)
                    </span>
                    <span className="text-center font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 py-1 px-2 rounded-lg mx-1">
                      50 MB
                    </span>
                  </div>

                  {/* Row 2: Total storage */}
                  <div className="grid grid-cols-3 p-3 bg-slate-50/50 dark:bg-slate-900/20 items-center">
                    <span className="font-semibold text-slate-900 dark:text-white">Total Storage Space</span>
                    <span className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                      Unlimited ($0/mo)
                    </span>
                    <span className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                      Unlimited ($0/mo)
                    </span>
                  </div>

                  {/* Row 3: Protocol */}
                  <div className="grid grid-cols-3 p-3 bg-white dark:bg-slate-900/50 items-center">
                    <span className="font-semibold text-slate-900 dark:text-white">Protocol</span>
                    <span className="text-center text-slate-600 dark:text-slate-300">GramJS MTProto Binary</span>
                    <span className="text-center text-slate-600 dark:text-slate-300">HTTPS REST API</span>
                  </div>

                  {/* Row 4: Chunk streaming */}
                  <div className="grid grid-cols-3 p-3 bg-slate-50/50 dark:bg-slate-900/20 items-center">
                    <span className="font-semibold text-slate-900 dark:text-white">Parallel Chunk Streaming</span>
                    <span className="text-center font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Yes (512KB chunks)
                    </span>
                    <span className="text-center text-slate-400 dark:text-slate-500">
                      No (Single HTTP post)
                    </span>
                  </div>

                  {/* Row 5: Media Streaming */}
                  <div className="grid grid-cols-3 p-3 bg-white dark:bg-slate-900/50 items-center">
                    <span className="font-semibold text-slate-900 dark:text-white">Video & Audio Streaming</span>
                    <span className="text-center font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Yes (Range requests)
                    </span>
                    <span className="text-center font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Yes
                    </span>
                  </div>

                  {/* Row 6: Prerequisites */}
                  <div className="grid grid-cols-3 p-3 bg-slate-50/50 dark:bg-slate-900/20 items-center">
                    <span className="font-semibold text-slate-900 dark:text-white">Required Credentials</span>
                    <span className="text-center text-slate-600 dark:text-slate-300 text-[11px]">
                      Bot Token + Chat ID + api_id/hash
                    </span>
                    <span className="text-center text-slate-600 dark:text-slate-300 text-[11px]">
                      Bot Token + Chat ID
                    </span>
                  </div>

                  {/* Row 7: Recommended for */}
                  <div className="grid grid-cols-3 p-3 bg-white dark:bg-slate-900/50 items-center">
                    <span className="font-semibold text-slate-900 dark:text-white">Best Suited For</span>
                    <span className="text-center text-slate-600 dark:text-slate-300 text-[11px]">
                      HD Videos, 4K Movies, ISOs, Big Archives
                    </span>
                    <span className="text-center text-slate-600 dark:text-slate-300 text-[11px]">
                      Documents, Photos, Audio clips, Code
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">
              {protocol === 'mtproto'
                ? 'Max 2 GB per file upload • Unlimited total storage'
                : 'Max 50 MB per file upload • Unlimited total storage'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
