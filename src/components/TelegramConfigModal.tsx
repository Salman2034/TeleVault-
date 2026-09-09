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

export const TelegramConfigModal: React.FC<TelegramConfigModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onConfigSaved,
  onSyncChannel,
  isSyncing = false,
}) => {
  const [protocol, setProtocol] = useState<StorageProtocol>(currentConfig?.protocol || 'mtproto');
  const [botToken, setBotToken] = useState(currentConfig?.botToken || '');
  const [chatId, setChatId] = useState(currentConfig?.chatId || '');
  const [apiId, setApiId] = useState(currentConfig?.apiId || '');
  const [apiHash, setApiHash] = useState(currentConfig?.apiHash || '');
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken.trim() || !chatId.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide both a Telegram Bot Token and Chat ID.' });
      return;
    }

    if (protocol === 'mtproto' && (!apiId.trim() || !apiHash.trim())) {
      setStatusMessage({
        type: 'error',
        text: 'Telegram App API ID and API Hash are required for MTProto 2 GB mode. Obtain them free from https://my.telegram.org.',
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

      const protocolLabel = protocol === 'mtproto' ? 'MTProto (2 GB limit enabled)' : 'Standard Bot API (50 MB limit)';
      setStatusMessage({
        type: 'success',
        text: `Connected successfully via ${protocolLabel}! Bot: @${data.botUsername || 'Bot'} (Target: ${data.chatTitle || chatId})`,
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
        maxFileSizeLabel: protocol === 'mtproto' ? '2 GB (MTProto)' : '50 MB (Bot API)',
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
      const data = await res.json();
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

  return (
    <div id="telegram-config-modal-overlay" className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div id="telegram-config-modal-card" className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Telegram Cloud Settings</h2>
              <p className="text-xs text-slate-500">Configure your Telegram bot & protocol for free file hosting</p>
            </div>
          </div>
          <button
            id="btn-close-config-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Protocol Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Protocol Architecture</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* MTProto Tab */}
              <button
                type="button"
                id="btn-protocol-mtproto"
                onClick={() => setProtocol('mtproto')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  protocol === 'mtproto'
                    ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Zap className={`w-4 h-4 ${protocol === 'mtproto' ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-sm text-slate-900">MTProto Client</span>
                  </div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    2 GB LIMIT
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-normal">
                  Uses GramJS MTProto protocol. Grants standard user account limits up to <strong className="text-slate-900">2,000 MB per file</strong>.
                </p>
              </button>

              {/* Bot API Tab */}
              <button
                type="button"
                id="btn-protocol-botapi"
                onClick={() => setProtocol('bot_api')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  protocol === 'bot_api'
                    ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Layers className={`w-4 h-4 ${protocol === 'bot_api' ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-sm text-slate-900">Standard Bot API</span>
                  </div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                    50 MB LIMIT
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Standard HTTP endpoints. Simple setup, but capped at 50 MB per file by Telegram Bot API.
                </p>
              </button>
            </div>
          </div>

          {/* MTProto Highlight Banner */}
          {protocol === 'mtproto' ? (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 flex items-start gap-3">
              <Zap className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-900">2 GB Uploads via MTProto:</span> By authenticating via Telegram's native MTProto binary protocol, this webapp streams multi-gigabyte files in parallel chunks, completely bypassing the standard 50 MB HTTP Bot API restriction.
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-semibold">50 MB File Size Cap:</span> Files larger than 50 MB cannot be uploaded via the HTTP Bot API. Switch to MTProto to upload up to 2 GB!
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{statusMessage.text}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSaveAndTest} className="space-y-3.5">
            {/* Bot Token */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Telegram Bot Token</label>
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  @BotFather <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                id="input-telegram-bot-token"
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>

            {/* Chat / Channel ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Channel or Chat ID</label>
              <input
                id="input-telegram-chat-id"
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="-1001234567890 or @your_channel_name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Your private storage channel. Add your bot as an <strong className="text-slate-600">Administrator</strong> with post permissions.
              </p>
            </div>

            {/* MTProto Specific Fields */}
            {protocol === 'mtproto' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-sky-600" />
                    MTProto API Credentials (my.telegram.org)
                  </span>
                  <a
                    href="https://my.telegram.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    Get free API credentials <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">App api_id</label>
                    <input
                      id="input-telegram-api-id"
                      type="text"
                      value={apiId}
                      onChange={(e) => setApiId(e.target.value)}
                      placeholder="e.g. 12345678"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">App api_hash</label>
                    <input
                      id="input-telegram-api-hash"
                      type="text"
                      value={apiHash}
                      onChange={(e) => setApiHash(e.target.value)}
                      placeholder="e.g. 0123456789abcdef0123456789abcdef"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Required by Telegram MTProto to authorize client sessions. Free and instant for all Telegram accounts.
                </p>
              </div>
            )}

            {/* Cross-Device Persistence & Channel Manifest Sync Info */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-sky-50 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-emerald-600" />
                  Cross-Device Folder & File Sync
                </span>
                {onSyncChannel && currentConfig?.isConfigured && (
                  <button
                    type="button"
                    onClick={onSyncChannel}
                    disabled={isSyncing}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync From Channel'}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                <strong>Yes, your folders & files persist across devices!</strong> The app stores a secure master manifest (<code className="bg-white/80 px-1 py-0.5 rounded text-emerald-900 border border-emerald-200">tele_storage_manifest.json</code>) directly in your Telegram channel. When switching between PC, phone, or laptop, using the same Telegram credentials will automatically restore your folder tree and files.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                id="btn-verify-telegram"
                type="submit"
                disabled={isTesting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isTesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying {protocol === 'mtproto' ? 'MTProto 2GB Connection...' : 'Bot API...'}</span>
                  </>
                ) : (
                  <>
                    {protocol === 'mtproto' ? <Zap className="w-4 h-4 text-sky-200" /> : <Server className="w-4 h-4" />}
                    <span>Connect & Activate {protocol === 'mtproto' ? 'MTProto (2 GB)' : 'Bot API (50 MB)'}</span>
                  </>
                )}
              </button>

              <button
                id="btn-switch-demo-mode"
                type="button"
                onClick={handleSwitchToDemo}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Use Sandbox</span>
              </button>
            </div>
          </form>

          {/* Toggle Instructions */}
          <div className="border-t border-slate-100 pt-3.5">
            <button
              type="button"
              id="btn-toggle-instructions"
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 w-full justify-between"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                Step-by-step setup guide for 2 GB MTProto
              </span>
              <span className="text-slate-400 text-[11px]">{showInstructions ? 'Hide Guide' : 'View Guide'}</span>
            </button>

            {showInstructions && (
              <div className="mt-3 text-xs text-slate-600 space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <div>
                    <strong className="text-slate-900">Get Bot Token:</strong> Message <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-600 underline font-semibold">@BotFather</a> on Telegram. Type <code className="bg-white px-1 py-0.5 rounded border border-slate-200">/newbot</code> and copy the bot token.
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <div>
                    <strong className="text-slate-900">Create Storage Channel:</strong> In Telegram, create a New Channel (e.g. "Cloud Vault"). In Channel Settings &gt; Administrators, add your bot as an admin.
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <div>
                    <strong className="text-slate-900">Unlock 2 GB MTProto (my.telegram.org):</strong> Log in to <a href="https://my.telegram.org" target="_blank" rel="noreferrer" className="text-sky-600 underline font-semibold">https://my.telegram.org</a>. Click <strong>API development tools</strong>. Enter any app title (e.g. "TeleStorage"). Copy your <code className="bg-white px-1 py-0.5 rounded border border-slate-200">api_id</code> and <code className="bg-white px-1 py-0.5 rounded border border-slate-200">api_hash</code>.
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                  <div>
                    <strong className="text-slate-900">Connect:</strong> Paste the 4 values above and click "Connect & Activate MTProto (2 GB)". Your app is now ready to upload and stream files up to 2 GB for free!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            {protocol === 'mtproto' ? 'Max 2,048 MB (2 GB) per file via MTProto' : 'Max 50 MB per file via Bot API'}
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
