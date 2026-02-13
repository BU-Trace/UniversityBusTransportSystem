'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntro } from '@/context/IntroContext';
import { ArrowRight } from 'lucide-react';

const IntroAnimation: React.FC = () => {
  const router = useRouter();
  const { setIsIntroActive } = useIntro();
  const [showContent, setShowContent] = useState(false);

  const handleProceed = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('campusConnectIntroCompleted', 'true');
    }
    setIsIntroActive(false);
    router.push('/');
  }, [router, setIsIntroActive]);

  useEffect(() => {
    // Show content after a short delay
    const timer = setTimeout(() => setShowContent(true), 500);

    // Auto-proceed after 3.5 seconds (allowing time for animations)
    const autoProceedTimer = setTimeout(() => {
      handleProceed();
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoProceedTimer);
    };
  }, [handleProceed]);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-brick-900 text-white">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brick-600/20 rounded-full blur-[100px] animate-blob-1" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brick-900/40 rounded-full blur-[100px] animate-blob-2" />

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center justify-center px-6 text-center"
          >
            {/* Logo Section */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative w-32 h-32 md:w-40 md:h-40 mb-10"
            >
              <div className="absolute inset-0 bg-brick-500/20 rounded-full blur-2xl animate-pulse" />
              <Image
                src="/static/logo.png"
                alt="BUTRACE Logo"
                fill
                className="object-contain relative z-10"
                sizes="(max-width: 768px) 128px, 160px"
                priority
              />
            </motion.div>

            {/* Title Section */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase"
              >
                BU<span className="text-brick-500">TRACE</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-gray-400 font-bold tracking-[0.3em] text-[10px] md:text-xs uppercase bg-white/5 py-2.5 px-8 rounded-full border border-white/10 backdrop-blur-md inline-block"
              >
                Welcome to the next level
              </motion.p>
            </div>

            {/* Skip/Action Hint */}
            <motion.button
              onClick={handleProceed}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-16 flex items-center gap-2 text-xs font-black uppercase text-brick-400 hover:text-brick-300 transition-colors tracking-widest group"
            >
              Starting Journey{' '}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Auto-proceed Bar */}
            <div className="absolute bottom-[-60px] h-1 w-32 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className="h-full bg-brick-500 shadow-[0_0_10px_rgba(180,77,92,0.6)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes blob1 {
          0%,
          100% {
            transform: translateY(0) translateX(0) scale(1);
          }
          33% {
            transform: translateY(-20px) translateX(20px) scale(1.1);
          }
          66% {
            transform: translateY(20px) translateX(-20px) scale(0.9);
          }
        }
        @keyframes blob2 {
          0%,
          100% {
            transform: translateY(0) translateX(0) scale(1);
          }
          33% {
            transform: translateY(30px) translateX(-30px) scale(0.95);
          }
          66% {
            transform: translateY(-30px) translateX(30px) scale(1.05);
          }
        }
        .animate-blob-1 {
          animation: blob1 12s infinite ease-in-out;
        }
        .animate-blob-2 {
          animation: blob2 15s infinite reverse ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default IntroAnimation;
