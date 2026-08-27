import React, { useEffect, useState } from 'react';
import { DownloadCloud, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isRunningStandalone);

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt && !isIOS) return null;

  return (
    <div
      id="pwa-install-banner"
      style={{
        position: 'fixed',
        top: 'calc(10px + env(safe-area-inset-top))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        border: '1.5px solid var(--blue)',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(100, 149, 237, 0.25)',
        padding: '12px 14px',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--blueSoft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {isIOS ? (
            <Smartphone size={20} color="#3D5FBF" strokeWidth={2.2} />
          ) : (
            <DownloadCloud size={20} color="#3D5FBF" strokeWidth={2.2} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#2B2B33' }}>
            アプリをインストール
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#6B6B76' }}>
            {isIOS
              ? '共有ボタンから「ホーム画面に追加」で利用可能'
              : 'ホーム画面に追加して快適に使えます'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {deferredPrompt && (
          <button
            id="pwa-install-action-btn"
            onClick={handleInstallClick}
            style={{
              background: 'var(--blue)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
              padding: '7px 12px',
              borderRadius: '999px'
            }}
          >
            追加
          </button>
        )}
        <button
          id="pwa-dismiss-banner-btn"
          onClick={() => setShowPrompt(false)}
          style={{ color: '#B5B5C0', padding: 4 }}
          aria-label="閉じる"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};
