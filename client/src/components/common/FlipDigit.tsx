'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlipDigitProps {
  value: string | number;
  className?: string;
  speed?: number;
}

const FlipDigit: React.FC<FlipDigitProps> = ({ value, className = '', speed = 0.6 }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [nextValue, setNextValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== currentValue) {
      setNextValue(value);
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setCurrentValue(value);
        setIsFlipping(false);
      }, speed * 1000);
      return () => clearTimeout(timer);
    }
  }, [value, currentValue, speed]);

  return (
    <div
      className={`relative perspective-1000 ${className}`}
      style={{ width: '1em', height: '1.5em' }}
    >
      {/* Upper Half - Next Value (Static Background) */}
      <div className="absolute inset-0 flex flex-col">
        <div className="h-1/2 overflow-hidden bg-[#1a1a1a] rounded-t-lg border-b border-black/20 flex items-end justify-center">
          <span className="leading-0 transform translate-y-1/2">{nextValue}</span>
        </div>
        <div className="h-1/2 overflow-hidden bg-[#1a1a1a] rounded-b-lg flex items-start justify-center">
          <span className="leading-0 transform -translate-y-1/2">{currentValue}</span>
        </div>
      </div>

      {/* Flipping Top (Current) */}
      <AnimatePresence>
        {isFlipping && (
          <motion.div
            key={`top-${currentValue}`}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -180 }}
            transition={{ duration: speed, ease: 'easeInOut' }}
            className="absolute inset-0 h-1/2 z-20 origin-bottom"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="h-full overflow-hidden bg-[#1a1a1a] rounded-t-lg border-b border-black/20 flex items-end justify-center">
              <span className="leading-0 transform translate-y-1/2">{currentValue}</span>
            </div>
            {/* Backside of the flipping panel (Next value bottom) */}
            <div
              className="absolute inset-0 h-full overflow-hidden bg-[#1a1a1a] rounded-b-lg flex items-start justify-center"
              style={{ transform: 'rotateX(180deg)', backfaceVisibility: 'hidden' }}
            >
              <span className="leading-0 transform -translate-y-1/2">{nextValue}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Middle Hinge Line */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-black/40 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
    </div>
  );
};

export default FlipDigit;
