'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Check if user dismissed recently
      const dismissed = sessionStorage.getItem('akgv_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install on iOS / Safari: Tap the Share button (⎋) in your browser and select "Add to Home Screen" (⊞).');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('akgv_pwa_dismissed', 'true');
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed top-14 left-4 right-4 sm:left-auto sm:right-6 sm:top-16 z-40 max-w-sm rounded-2xl border border-[#C7A35A]/50 bg-[#0B1734]/95 p-3.5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#C7A35A] to-[#9E7E36] text-[#0B1734] font-bold shadow">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-serif text-xs font-bold text-white flex items-center gap-1.5">
              <span>Install AKGV Infra City App</span>
              <Sparkles className="h-3 w-3 text-[#DFC382]" />
            </h4>
            <p className="text-[10px] text-gray-300">
              Offline plot viewer & fast 3D house navigation on your home screen.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="rounded-lg p-1 text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-end gap-2 border-t border-white/10 pt-2 text-xs">
        <button
          onClick={handleDismiss}
          className="px-2.5 py-1 text-gray-400 hover:text-white text-[11px]"
        >
          Not Now
        </button>
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-3 py-1 font-bold text-[#0B1734] shadow hover:brightness-110 text-[11px]"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Install App</span>
        </button>
      </div>
    </div>
  );
}
