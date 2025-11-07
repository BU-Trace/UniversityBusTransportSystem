'use client';

import React from 'react';
import Image from 'next/image';

const LoadingScreen = () => (
  <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center space-y-6">
    <div className="w-24 h-24 relative">
      <Image
        src="/static/logo.png"
        alt="Campus Connect Logo"
        fill
        className="object-contain animate-pulse"
        sizes="96px"
        priority
      />
    </div>
    <h1 className="text-4xl font-extrabold text-red-600 tracking-wider animate-bounce-slow">
      Campus Connect
    </h1>
    <p className="text-xl text-gray-700 mt-4 italic">&quot;Welcome to the next level&quot;</p>
    <div className="h-2 w-32 bg-red-200 rounded-full overflow-hidden mt-8">
      {}
      <div className="h-full bg-red-600 w-1/4 animate-loading-bar"></div>
    </div>
  </div>
);

export default LoadingScreen;
