'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Search, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleRedirectNow = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-brick-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-brick-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-brick-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* 404 Number */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="flex flex-col items-center mb-10"
          >
            <h1 className="text-[140px] md:text-[200px] font-black text-red-600 leading-none select-none drop-shadow-lg">
              404
            </h1>
            <div className="mt-8">
              <Search className="w-16 h-16 md:w-24 md:h-24 text-brick-400 animate-bounce" />
            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Oops! Page Not Found</h2>
            <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been moved. Don&apos;t
              worry, we&apos;ll get you back on track!
            </p>
          </motion.div>

          {/* Auto-redirect Notice */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 shadow-lg"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-brick-400" />
              <p className="text-sm font-medium text-gray-300">Redirecting to home in</p>
            </div>
            <div className="text-5xl font-black text-white mb-2">{countdown}</div>
            <p className="text-xs text-gray-500">seconds</p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={handleRedirectNow}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-brick-600 text-white rounded-xl font-semibold hover:bg-brick-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <Home className="w-5 h-5" />
              Go Home Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all border-2 border-transparent hover:border-white/20"
            >
              Contact Support
            </Link>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <p className="text-sm text-gray-500 mb-4">Quick Links</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/"
                className="text-sm text-brick-400 hover:text-brick-300 font-medium hover:underline"
              >
                Home
              </Link>
              <span className="text-gray-500">•</span>
              <Link
                href="/about"
                className="text-sm text-brick-400 hover:text-brick-300 font-medium hover:underline"
              >
                About
              </Link>
              <span className="text-gray-500">•</span>
              <Link
                href="/contact"
                className="text-sm text-brick-400 hover:text-brick-300 font-medium hover:underline"
              >
                Contact
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
