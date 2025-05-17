import { useState, useEffect } from 'react';
import { Button, Card } from './ui';

export default function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online/offline state
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show prompt if already dismissed or installed
  useEffect(() => {
    // For development, always show the prompt
    if (process.env.NODE_ENV === 'development') {
      setShowInstallPrompt(true);
      return;
    }
    
    if (localStorage.getItem('pwa-prompt-dismissed') === 'true' || isInstalled) {
      setShowInstallPrompt(false);
    }
  }, [isInstalled]);

  return (
    <>
      {/* Offline indicator */}
      {isOffline && (
        <div className="fixed bottom-4 left-4 z-50">
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
              <span className="font-medium">You're offline</span>
            </div>
            <p className="text-sm mt-1 opacity-90">Some features may be limited</p>
          </Card>
        </div>
      )}

      {/* Install prompt */}
      {showInstallPrompt && !isInstalled && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 border-primary-200 dark:border-primary-700 p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
              Install CloneMe App
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
              Install CloneMe for quick access and offline functionality
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
              >
                Install
              </Button>
              <Button
                onClick={dismissPrompt}
                variant="ghost"
              >
                Not Now
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}