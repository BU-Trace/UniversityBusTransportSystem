'use client';

import React, { useState, useEffect, useMemo } from 'react';
import FlipDigit from './FlipDigit';

const LuxuryFlipClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { hh, mm, ss } = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Dhaka',
    };

    const formatted = new Intl.DateTimeFormat('en-GB', options).format(time);
    const [hours, minutes, seconds] = formatted.split(':');

    return {
      hh: hours,
      mm: minutes,
      ss: seconds,
    };
  }, [time]);

  return (
    <div className="w-full py-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border-y border-white/5 overflow-hidden">
      <div className="flex items-center justify-center gap-4 md:gap-8 lg:gap-12 w-full max-w-none px-4">
        {/* Hours */}
        <div className="flex gap-1 md:gap-3">
          <FlipDigit value={hh[0]} className="text-[12vw] md:text-[15vw] font-black text-white" />
          <FlipDigit value={hh[1]} className="text-[12vw] md:text-[15vw] font-black text-white" />
        </div>

        {/* Separator */}
        <div className="flex flex-col gap-4 md:gap-8 mb-[2vw]">
          <div className="w-2 h-2 md:w-4 md:h-4 bg-brick-500 rounded-full shadow-[0_0_15px_#ef4444]" />
          <div className="w-2 h-2 md:w-4 md:h-4 bg-brick-500 rounded-full shadow-[0_0_15px_#ef4444]" />
        </div>

        {/* Minutes */}
        <div className="flex gap-1 md:gap-3">
          <FlipDigit value={mm[0]} className="text-[12vw] md:text-[15vw] font-black text-white" />
          <FlipDigit value={mm[1]} className="text-[12vw] md:text-[15vw] font-black text-white" />
        </div>

        {/* Separator */}
        <div className="flex flex-col gap-4 md:gap-8 mb-[2vw]">
          <div className="w-2 h-2 md:w-4 md:h-4 bg-brick-500 rounded-full shadow-[0_0_15px_#ef4444]" />
          <div className="w-2 h-2 md:w-4 md:h-4 bg-brick-500 rounded-full shadow-[0_0_15px_#ef4444]" />
        </div>

        {/* Seconds */}
        <div className="flex gap-1 md:gap-2 opacity-80">
          <FlipDigit
            value={ss[0]}
            className="text-[10vw] md:text-[12vw] font-black text-brick-400"
            speed={0.4}
          />
          <FlipDigit
            value={ss[1]}
            className="text-[10vw] md:text-[12vw] font-black text-brick-400"
            speed={0.4}
          />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <span className="text-[10px] md:text-sm font-black text-gray-500 uppercase tracking-[0.5em] animate-pulse">
          Precision Synchronized
        </span>
      </div>
    </div>
  );
};

export default LuxuryFlipClock;
