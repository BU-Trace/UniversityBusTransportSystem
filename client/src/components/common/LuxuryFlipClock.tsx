'use client';

import React, { useState, useEffect, useMemo } from 'react';
import FlipDigit from './FlipDigit';

const LuxuryFlipClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { hh, mm, ss, ampm } = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Dhaka',
    };

    const formatted = new Intl.DateTimeFormat('en-US', options).format(time);
    // Format is "hh:mm:ss AM/PM"
    const [timeStr, ampmStr] = formatted.split(' ');
    const [hours, minutes, seconds] = timeStr.split(':');

    return {
      hh: hours,
      mm: minutes,
      ss: seconds,
      ampm: ampmStr,
    };
  }, [time]);

  return (
    <div className="w-full py-16 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border-y border-white/5 overflow-hidden">
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-6 lg:gap-10 w-full max-w-7xl px-4">
        {/* Hours */}
        <div className="flex gap-1 md:gap-3">
          <FlipDigit
            value={hh[0]}
            className="text-[10vw] md:text-[12vw] lg:text-9xl font-black text-white"
          />
          <FlipDigit
            value={hh[1]}
            className="text-[10vw] md:text-[12vw] lg:text-9xl font-black text-white"
          />
        </div>

        {/* Separator */}
        <div className="flex flex-col gap-3 md:gap-6 mb-[1.5vw] lg:mb-4">
          <div className="w-1.5 h-1.5 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-brick-500 rounded-full shadow-[0_0_15px_#ef4444]" />
          <div className="w-1.5 h-1.5 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-brick-500 rounded-full shadow-[0_0_15px_#ef4444]" />
        </div>

        {/* Minutes */}
        <div className="flex gap-1 md:gap-3">
          <FlipDigit
            value={mm[0]}
            className="text-[10vw] md:text-[12vw] lg:text-9xl font-black text-white"
          />
          <FlipDigit
            value={mm[1]}
            className="text-[10vw] md:text-[12vw] lg:text-9xl font-black text-white"
          />
        </div>

        {/* Separator */}
        <div className="flex flex-col gap-3 md:gap-6 mb-[1.5vw] lg:mb-4">
          <div className="w-1.5 h-1.5 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-brick-500 rounded-full shadow-[0_0_15px_#ef4444]" />
          <div className="w-1.5 h-1.5 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-brick-500 rounded-full shadow-[0_0_15px_#ef4444]" />
        </div>

        {/* Seconds & AM/PM */}
        <div className="flex flex-row items-center gap-2 md:gap-4 lg:gap-6">
          <div className="flex gap-1 md:gap-2 opacity-80">
            <FlipDigit
              value={ss[0]}
              className="text-[8vw] md:text-[8vw] lg:text-8xl font-black text-brick-400"
              speed={0.4}
            />
            <FlipDigit
              value={ss[1]}
              className="text-[8vw] md:text-[8vw] lg:text-8xl font-black text-brick-400"
              speed={0.4}
            />
          </div>
          <div className="text-lg md:text-3xl lg:text-5xl font-black text-brick-500 bg-brick-500/10 px-3 md:px-5 py-2 md:py-3 lg:py-4 rounded-xl md:rounded-2xl border border-brick-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center min-w-[3em]">
            {ampm}
          </div>
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
