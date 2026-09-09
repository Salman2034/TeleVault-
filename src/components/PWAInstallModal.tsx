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
} from 'lucide-react';
import { usePWAInstall, DetectedPlatform } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'pc' | 'android' | 'ios' | 'mac';

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();

  // Set default active tab based on detected platform
  const getInitialTab = (): TabType => {
    if (platform === 'ios') return 'ios';
    if (platform === 'mac') return 'mac';
    if (platform === 'android') return 'android';
    return 'pc';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success'>('idle');

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    setInstallStatus('installing');
    const success = await install();
    if (success) {
      setInstallStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setInstallStatus('idle');
    }
  };

  return (
    <div
      id="pwa-install-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="pwa-install-modal"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header with App Branding & Badges */}
        <div className="relative bg-gradient-to-br from-sky-600 via-sky-500 to-indigo-600 dark:from-sky-700 dark:via-sky-600 dark:to-slate-900 p-5 sm:p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2.5 flex items-center justify-center shadow-lg shadow-black/10 shrink-0">
              <img src="/icon.svg" alt="TeleVault Icon" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Install TeleVault App</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  PWA Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-100 mt-1 leading-relaxed">
                Native standalone speed • Offline caching • Zero browser tab clutter
              </p>
            </div>
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-1.5 gap-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'pc'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>PC & Windows</span>
            {platform === 'windows' && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android</span>
            {platform === 'android' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone / iPad</span>
            {platform === 'ios' && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('mac')}
            className={`flex-1 min-w-[85px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'mac'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Apple className="w-4 h-4" />
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
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-600 text-white shrink-0 mt-0.5">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Direct PC & Desktop Installation
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    TeleVault runs as a dedicated desktop application with its own window, taskbar shortcut, and fast hardware-accelerated previews.
                  </p>
                </div>
              </div>

              {/* Direct Install Button if supported */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">1-Click Direct Install Ready!</p>
                      <p className="text-xs text-sky-100">Click below to add TeleVault to your PC or taskbar</p>
                    </div>
                    <button
                      onClick={handleDirectInstall}
                      disabled={installStatus === 'installing'}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      <Download className="w-4 h-4" />
                      <span>{installStatus === 'installing' ? 'Installing...' : 'Install TeleVault on PC'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Browser Steps */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Alternative Desktop Installation Steps
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 mb-1.5">
                      Chrome / Edge / Brave
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      Look for the <strong>Install TeleVault</strong> (computer/down arrow) icon on the right side of the URL address bar and click <strong>Install</strong>.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mb-1.5">
                      Browser Menu
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      Click the <strong>3 vertical dots (⋮)</strong> menu in your browser &rarr; select <strong>&quot;Save and share&quot;</strong> or <strong>&quot;Install TeleVault...&quot;</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Android Direct Installation
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Installs directly to your app drawer and home screen. Full standalone full-screen experience with no address bar.
                  </p>
                </div>
              </div>

              {/* Direct Install Button if supported */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">1-Click Android App Prompt Ready</p>
                      <p className="text-xs text-emerald-100">Tap below to add TeleVault to your Android phone</p>
                    </div>
                    <button
                      onClick={handleDirectInstall}
                      disabled={installStatus === 'installing'}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      <Download className="w-4 h-4" />
                      <span>{installStatus === 'installing' ? 'Installing...' : 'Install on Android'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step by Step Guide for Android Chrome / Samsung Internet */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Step-by-Step Android Installation
                </h5>
                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                    <span>Tap the <strong>3 vertical dots (⋮)</strong> menu in Chrome or your Android browser.</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                    <span>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                    <span>Confirm by tapping <strong>&quot;Install&quot;</strong>. TeleVault is now in your App Drawer!</span>
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
                    iPhone & iPad Installation Guide (Apple iOS)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Apple iOS requires adding Progressive Web Apps via Safari. Follow the quick visual 3-step guide below:
                  </p>
                </div>
              </div>

              {/* Visual Step Guide for iOS */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Share className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Step 1: Open in Safari & Tap Share
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Tap the <strong>Share</strong> button (the square with an arrow pointing up) at the bottom of Safari.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Step 2: Tap &quot;Add to Home Screen&quot;
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Scroll down through the share sheet options and tap <strong>&quot;Add to Home Screen&quot;</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Step 3: Tap &quot;Add&quot; in the Top Right
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      TeleVault is added as an app icon on your iPhone or iPad home screen with standalone launch!
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
                    On Mac, you can install TeleVault to your <strong>macOS Dock & Launchpad</strong> using either Safari or Chromium browsers.
                  </p>
                </div>
              </div>

              {/* Direct Install if running in Chrome/Edge on Mac */}
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
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      <Download className="w-4 h-4" />
                      <span>{installStatus === 'installing' ? 'Installing...' : 'Install on Mac'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Safari macOS Sonoma+ Guide */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Safari on macOS (Sonoma, Sequoia & newer)
                </h5>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>In the Mac top menu bar, click <strong>File</strong> &rarr; select <strong>&quot;Add to Dock...&quot;</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Or click the <strong>Share</strong> button in Safari toolbar &rarr; choose <strong>&quot;Add to Dock&quot;</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Click <strong>Add</strong>. TeleVault is added to your macOS Dock and Launchpad!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* App Advantages & Value Proposition */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Why Install TeleVault App?
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                <Zap className="w-4 h-4 text-amber-500 mb-1.5" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">Instant Launch</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Opens instantly from your desktop or home screen without loading browser UI.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                <HardDrive className="w-4 h-4 text-sky-500 mb-1.5" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">Offline Cache</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Browse folder hierarchies and view cached media even without internet.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1.5" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">Unmetered Cloud</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct encrypted 2GB MTProto storage connected directly to your Telegram channel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            PWA standard compliant across Windows, Mac, Android & iOS
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
