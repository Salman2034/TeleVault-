import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type DetectedPlatform = 'windows' | 'android' | 'ios' | 'mac' | 'other';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<DetectedPlatform>('other');

  useEffect(() => {
    // Check if running in standalone mode (installed PWA)
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://'));

    setIsInstalled(isStandalone);

    // Detect user platform
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

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent default mini-infobar or auto prompt
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('PWA installation prompt failed:', err);
      return false;
    }
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    platform,
    isIOS: platform === 'ios',
    isMac: platform === 'mac',
    isAndroid: platform === 'android',
    isWindows: platform === 'windows',
    install,
  };
}
