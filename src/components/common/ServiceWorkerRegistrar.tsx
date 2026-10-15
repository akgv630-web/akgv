'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Listen for new updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.info('[AKGV PWA] New version available. Refresh to update.');
              }
            });
          }
        });

        // Periodically check for updates (every 1 hour)
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);
      } catch (err) {
        console.warn('[AKGV PWA] Service worker registration notice:', err);
      }
    };

    if (document.readyState === 'complete') {
      registerWorker();
    } else {
      window.addEventListener('load', registerWorker);
      return () => window.removeEventListener('load', registerWorker);
    }
  }, []);

  return null;
}
