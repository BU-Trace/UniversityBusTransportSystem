'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useIntro } from '@/context/IntroContext';

const IntroAnimation: React.FC = () => {
  const router = useRouter();
  const { setIsIntroActive } = useIntro();
  const [showContent, setShowContent] = useState(false);
  const [canClick, setCanClick] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    const enableClickTimer = setTimeout(() => setCanClick(true), 2000);
    return () => {
      clearTimeout(timer);
      clearTimeout(enableClickTimer);
    };
  }, []);

  const handleStartJourney = () => {
    if (canClick) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('campusConnectIntroCompleted', 'true');
      }
      setIsIntroActive(false);
      router.push('/home');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-black via-red-900 to-black text-white">
      {}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/static/waves.svg')] bg-repeat-x bg-bottom opacity-25 animate-[waveMove_8s_linear_infinite]" />
        <div className="absolute inset-0 bg-linear-to-b from-red-800/40 to-black/60" />
        <div className="absolute inset-0 animate-[pulseGlow_3s_ease-in-out_infinite] bg-red-700/10 blur-3xl" />
      </div>

      {}
      <motion.div
        className="absolute top-1/4 left-1/3 w-48 h-48 bg-red-500 rounded-full blur-3xl opacity-20"
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -20, 20, 0],
        }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-red-400 rounded-full blur-3xl opacity-20"
        animate={{
          x: [0, -30, 30, 0],
          y: [0, 20, -20, 0],
        }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
      />

      {}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: showContent ? 1 : 0,
          scale: showContent ? 1 : 0.9,
        }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center justify-center"
      >
        {}
        <motion.button
          onClick={handleStartJourney}
          disabled={!canClick}
          whileHover={{
            scale: canClick ? 1.01 : 1,
            rotate: canClick ? [0, 1, -1, 0] : 0,
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 18, -18, 0],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`relative w-36 h-36 md:w-48 md:h-48 rounded-full bg-linear-to-br from-red-600 via-red-700 to-red-900 shadow-[0_0_40px_rgba(255,0,0,0.6)] flex items-center justify-center overflow-hidden transition-all ${
            canClick ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_70%)] animate-[waveDistort_3s_ease-in-out_infinite]" />
          <Image
            src="/static/logo2.png"
            alt="Campus Connect Logo"
            fill
            className="object-contain p-4 md:p-6"
            sizes="(max-width: 768px) 144px, 192px"
            priority
          />
        </motion.button>

        {}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: showContent ? 1 : 0,
            y: showContent ? 0 : 20,
          }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-4xl md:text-6xl font-extrabold text-center mt-10 tracking-wide"
        >
          Welcome to{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-red-400 to-red-600 drop-shadow-lg">
            Campus Connect
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: showContent ? 1 : 0,
            y: showContent ? 0 : 10,
          }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-lg md:text-xl text-red-100 text-center mt-4"
        >
          Let’s begin your journey through innovation.
        </motion.p>
      </motion.div>

      {}
      <style jsx>{`
        @keyframes waveMove {
          from {
            background-position-x: 0;
          }
          to {
            background-position-x: 1000px;
          }
        }
        @keyframes waveDistort {
          0% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.05) rotate(1deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default IntroAnimation;
