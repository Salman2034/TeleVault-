import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Apple,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  HardDrive,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Lock,
  Cloud,
  Cpu,
  Check,
  ArrowRight,
  Globe,
  Radio,
} from 'lucide-react';
import { usePWAInstall, DetectedPlatform } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerDirectInstall?: () => void;
}

type TabType = 'pc' | 'android' | 'ios' | 'mac';

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();

  // Set default active tab based on detected platform
  const getInitialTab = (): TabType => {
    if (platform === 'ios') return 'ios';
    if (platform === 'mac') return 'mac';
    if (platform === 'android') return 'android';
    return 'pc';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'dismissed'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    setInstallStatus('installing');
    setFeedbackMsg('Launching native installation prompt...');
    const result = await install();
    if (result.success) {
      setInstallStatus('success');
      setFeedbackMsg('TeleVault successfully installed! Launching app...');
      setTimeout(() => {
        onClose();
      }, 2500);
    } else if (result.outcome === 'dismissed') {
      setInstallStatus('idle');
      setFeedbackMsg('Installation prompt cancelled. You can retry anytime or follow browser steps below.');
    } else {
      // Direct prompt unsupported (e.g. Safari, iOS, or need to use browser menu)
      setInstallStatus('idle');
      setFeedbackMsg(
        platform === 'ios'
          ? 'On iOS: Tap the Share button below, then select "Add to Home Screen".'
          : 'Follow the quick 2-step guide below for your browser to install.'
      );
    }
  };

  return (
    <div
      id="pwa-install-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="pwa-install-modal"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header / Hero Showcase */}
        <div className="relative bg-gradient-to-br from-sky-600 via-sky-500 to-indigo-600 dark:from-sky-800 dark:via-sky-700 dark:to-slate-900 p-5 sm:p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 p-2.5 flex items-center justify-center shadow-xl shadow-black/10 shrink-0">
                <img src="/icon.svg" alt="TeleVault Icon" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">TeleVault App</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20">
                    Official App
                  </span>
                  {isInstalled && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/80 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Installed
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-sky-100 mt-1 leading-relaxed max-w-md">
                  Encrypted, unmetered cloud drive directly on your PC, Android, Mac & iPhone.
                </p>
              </div>
            </div>

            {/* Direct Action in Header if supported */}
            {isInstallable && !isInstalled && (
              <button
                id="btn-modal-hero-direct-install"
                onClick={handleDirectInstall}
                disabled={installStatus === 'installing'}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs sm:text-sm shadow-lg shadow-black/10 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                <Download className="w-4 h-4 text-sky-600" />
                <span>{installStatus === 'installing' ? 'Installing...' : 'Direct Install'}</span>
              </button>
            )}
          </div>

          {/* Feedback banner if message exists */}
          {feedbackMsg && (
            <div className="mt-3 p-2.5 rounded-xl bg-white/15 border border-white/20 text-xs text-white flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* Feature Highlights Grid (Advertising Banner) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Instant Launch</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Zero loading delay</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            <HardDrive className="w-4 h-4 text-sky-500 shrink-0" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">2GB Files</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">MTProto Cloud</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Encrypted</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Private CDN</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            <Radio className="w-4 h-4 text-purple-500 shrink-0" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Offline Cache</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">View stored files</p>
            </div>
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 p-1.5 gap-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 min-w-[105px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'pc'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC & Windows</span>
            {platform === 'windows' && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 min-w-[95px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
            {platform === 'android' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
            {platform === 'ios' && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('mac')}
            className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'mac'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>Mac (macOS)</span>
            {platform === 'mac' && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: PC & WINDOWS */}
          {activeTab === 'pc' && (
            <div className="space-y-4">
              {/* Direct Install Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm">
                      <Sparkles className="w-3 h-3" /> Direct 1-Click Install
                    </span>
                    <h4 className="text-base font-bold">Install TeleVault on your PC</h4>
                    <p className="text-xs text-sky-100 max-w-sm">
                      Adds an official desktop icon, taskbar integration, and runs in a lightweight standalone window.
                    </p>
                  </div>
                  <button
                    onClick={handleDirectInstall}
                    disabled={installStatus === 'installing'}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 shrink-0"
                  >
                    <Download className="w-4 h-4 text-sky-600" />
                    <span>{installStatus === 'installing' ? 'Launching...' : 'Direct Install on PC'}</span>
                  </button>
                </div>
              </div>

              {/* Browser Instructions */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Alternative Desktop Installation
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 mb-1.5">
                      URL Address Bar Icon
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      In Chrome, Edge or Brave, click the <strong>Install TeleVault</strong> (computer/down arrow) icon on the right side of the address bar.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mb-1.5">
                      Browser Menu (⋮)
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      Click the <strong>3 vertical dots</strong> in your browser &rarr; select <strong>&quot;Save and share&quot;</strong> &rarr; click <strong>&quot;Install TeleVault...&quot;</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              {/* Direct Install Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm">
                      <Sparkles className="w-3 h-3" /> Android Direct Install
                    </span>
                    <h4 className="text-base font-bold">Install to Android Home Screen & Drawer</h4>
                    <p className="text-xs text-emerald-100 max-w-sm">
                      Runs in full-screen mode like a native APK without browser borders.
                    </p>
                  </div>
                  <button
                    onClick={handleDirectInstall}
                    disabled={installStatus === 'installing'}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 shrink-0"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>{installStatus === 'installing' ? 'Launching...' : 'Direct Install on Android'}</span>
                  </button>
                </div>
              </div>

              {/* Step by Step Guide */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Android Chrome & Samsung Internet Steps
                </h5>
                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                    <span>Tap the <strong>3 vertical dots (⋮)</strong> at top right of Chrome.</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                    <span>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                    <span>Tap <strong>&quot;Install&quot;</strong>. TeleVault is added to your app drawer with offline capabilities!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IPHONE & IPAD (IOS) */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    iPhone & iPad Installation (Apple Safari)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Apple iOS enables PWAs through Safari&apos;s native share sheet. Follow these 3 easy steps:
                  </p>
                </div>
              </div>

              {/* Step 1-2-3 Visual cards */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      1. Open in Safari & Tap Share
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Tap the <strong>Share</strong> button (square with arrow up) in Safari&apos;s bottom bar.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      2. Select &quot;Add to Home Screen&quot;
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Scroll down in the share sheet and tap <strong>&quot;Add to Home Screen&quot;</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      3. Tap &quot;Add&quot; in Top Right
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      TeleVault will appear as a high-resolution icon on your iOS home screen!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MAC (MACOS) */}
          {activeTab === 'mac' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Mac (macOS) Installation Guide
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Run TeleVault as a standalone Mac application in your <strong>macOS Dock & Launchpad</strong>.
                  </p>
                </div>
              </div>

              {/* Direct Install on Mac if in Chrome/Edge */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-500/20">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">1-Click Install Available for Chrome / Edge on Mac</p>
                      <p className="text-xs text-indigo-100">Click below to install directly to macOS Applications folder</p>
                    </div>
                    <button
                      onClick={handleDirectInstall}
                      disabled={installStatus === 'installing'}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>{installStatus === 'installing' ? 'Installing...' : 'Install on Mac'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Safari macOS Guide */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Safari on macOS (Sonoma, Sequoia & newer)
                </h5>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>In Mac top menu bar, click <strong>File</strong> &rarr; select <strong>&quot;Add to Dock...&quot;</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Or click <strong>Share</strong> in Safari toolbar &rarr; choose <strong>&quot;Add to Dock&quot;</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Click <strong>Add</strong>. TeleVault is placed in your macOS Dock!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Feature Specification Table / Value Proposition */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              App Capabilities Comparison
            </h5>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
              <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800/70 p-2.5 font-bold text-slate-700 dark:text-slate-300">
                <span>Feature</span>
                <span className="text-center">Regular Browser</span>
                <span className="text-center text-sky-600 dark:text-sky-400">TeleVault App</span>
              </div>
              <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
                <div className="grid grid-cols-3 p-2.5 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-slate-200">Window Clutter</span>
                  <span className="text-center">Lost in 50+ tabs</span>
                  <span className="text-center font-semibold text-emerald-600 dark:text-emerald-400">Dedicated Window</span>
                </div>
                <div className="grid grid-cols-3 p-2.5 bg-slate-50/50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-slate-200">Offline Caching</span>
                  <span className="text-center">Limited</span>
                  <span className="text-center font-semibold text-emerald-600 dark:text-emerald-400">ServiceWorker PWA</span>
                </div>
                <div className="grid grid-cols-3 p-2.5 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-slate-200">Launch Speed</span>
                  <span className="text-center">Loads DNS & tabs</span>
                  <span className="text-center font-semibold text-emerald-600 dark:text-emerald-400">Instant Native Cache</span>
                </div>
                <div className="grid grid-cols-3 p-2.5 bg-slate-50/50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-slate-200">Storage Limit</span>
                  <span className="text-center">2GB / Telegram</span>
                  <span className="text-center font-semibold text-emerald-600 dark:text-emerald-400">2GB MTProto Cloud</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Standard PWA compliant across PC, Android, Mac & iPhone
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDirectInstall}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Direct Install</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
