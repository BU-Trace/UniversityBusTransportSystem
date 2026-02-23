'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';
import Image from 'next/image';

/**
 * Captures the browser's `beforeinstallprompt` event and shows a
 * branded banner inviting the user to install BU Trace as an app.
 * Also registers the service-worker on first mount.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISSED_KEY = 'bu-trace-pwa-dismissed';
const DISMISS_DAYS = 7; // Don't re-show for 7 days after user dismisses

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  /* ── Register service worker ── */
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  /* ── Detect if already installed ── */
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  /* ── Check dismiss cooldown ── */
  const wasDismissedRecently = useCallback(() => {
    try {
      const raw = localStorage.getItem(DISMISSED_KEY);
      if (!raw) return false;
      const ts = parseInt(raw, 10);
      return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  }, []);

  /* ── Listen for beforeinstallprompt (Chrome / Edge / Samsung / etc.) ── */
  useEffect(() => {
    if (isInstalled) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!wasDismissedRecently()) {
        // small delay so the page renders first
        setTimeout(() => setShowBanner(true), 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isInstalled, wasDismissedRecently]);

  /* ── iOS Safari: no beforeinstallprompt, show manual instructions ── */
  useEffect(() => {
    if (isInstalled) return;
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !('beforeInstallPromptEvent' in window);
    if (ios && !wasDismissedRecently()) {
      setIsIOS(true);
      setTimeout(() => setShowBanner(true), 2500);
    }
  }, [isInstalled, wasDismissedRecently]);

  /* ── Install handler ── */
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  /* ── Dismiss handler ── */
  const handleDismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  if (isInstalled || !showBanner) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          style={{ zIndex: 99998 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm"
        >
          <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-5 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brick-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-4 relative z-10">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
                <Image
                  src="/static/BUTracelogo.png"
                  alt="BU Trace"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-white leading-tight">
                  Install BU Trace
                </h3>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  {isIOS
                    ? 'Tap the Share button, then "Add to Home Screen" to install this app.'
                    : 'Add BU Trace to your home screen for quick access to live bus tracking & schedules.'}
                </p>

                {!isIOS && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleInstall}
                      className="flex items-center gap-1.5 bg-brick-600 hover:bg-brick-700 text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-brick-600/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Install App
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="text-[11px] font-bold text-gray-500 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
                    >
                      Not now
                    </button>
                  </div>
                )}

                {isIOS && (
                  <div className="flex items-center gap-2 mt-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <Smartphone className="w-4 h-4 text-brick-400 shrink-0" />
                    <p className="text-[10px] font-bold text-gray-300">
                      Share → Add to Home Screen
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
