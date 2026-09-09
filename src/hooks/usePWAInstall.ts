import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type DetectedPlatform = 'windows' | 'android' | 'ios' | 'mac' | 'other';

// Global reference so the event captured at window level is never lost across re-renders
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((cb) => cb());
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    listeners.forEach((cb) => cb());
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => globalDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  const [platform, setPlatform] = useState<DetectedPlatform>('other');

  useEffect(() => {
    // Detect platform
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setPlatform('ios');
      } else if (/android/.test(ua)) {
        setPlatform('android');
      } else if (/macintosh|mac os x/.test(ua)) {
        setPlatform('mac');
      } else if (/windows|win32|win64|linux|cros/.test(ua)) {
        setPlatform('windows');
      } else {
        setPlatform('other');
      }
    }

    const updateState = () => {
      setDeferredPrompt(globalDeferredPrompt);
      if (typeof window !== 'undefined') {
        const standalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
          document.referrer.includes('android-app://');
        setIsInstalled(standalone);
      }
    };

    listeners.add(updateState);
    updateState();

    return () => {
      listeners.delete(updateState);
    };
  }, []);

  const install = useCallback(async (): Promise<{ success: boolean; outcome?: 'accepted' | 'dismissed' | 'unsupported' }> => {
    if (!globalDeferredPrompt) {
      // Direct prompt not available (could be iOS, Safari, or already handled)
      return { success: false, outcome: 'unsupported' };
    }
    try {
      const promptEvent = globalDeferredPrompt;
      await promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        globalDeferredPrompt = null;
        listeners.forEach((cb) => cb());
        return { success: true, outcome: 'accepted' };
      }
      return { success: false, outcome: 'dismissed' };
    } catch (err) {
      console.warn('PWA installation error:', err);
      return { success: false, outcome: 'unsupported' };
    }
  }, []);

  return {
    isInstallable: !!deferredPrompt || !!globalDeferredPrompt,
    isInstalled,
    platform,
    isIOS: platform === 'ios',
    isMac: platform === 'mac',
    isAndroid: platform === 'android',
    isWindows: platform === 'windows',
    install,
  };
}
