import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  position?: 'center' | 'bottom';
}

const PageBanner: React.FC<PageBannerProps> = ({
  title,
  subtitle,
  imageSrc = '/static/loginpagebanner.png',
  position = 'center',
}) => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden shadow-lg bg-gray-900">
      <Image
        src={imageSrc}
        alt={title}
        fill
        priority
        className={`object-cover ${position === 'bottom' ? 'object-bottom' : 'object-center'} opacity-60`}
      />

      <div className="absolute inset-0 bg-linear-to-t from-gray-900/90 via-gray-900/40 to-transparent flex items-center justify-center">
        <div className="text-center px-6 max-w-4xl mx-auto z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-2xl uppercase"
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageBanner;
