'use client';

import React from 'react';
import Image from 'next/image';

type HeaderProps = {
  title?: React.ReactNode;
  subtitle?: string;
  imageSrc?: string;
  primaryText?: string;
  primaryHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
};

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  imageSrc = '/static/loginpagebanner.png',
  primaryText = 'Get Started',
  primaryHref = '#features',
  secondaryText = 'Contact Sales',
  secondaryHref = '#contact',
}) => {
  return (
    <header className="w-full relative h-80 sm:h-[380px] md:h-[420px] lg:h-[480px]">
      <Image
        width={1600}
        height={600}
        src={imageSrc}
        alt="Hero banner"
        className="w-full h-full object-cover"
        priority
      />

      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/35 flex items-center justify-center px-6">
        <div className="text-center max-w-3xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tight mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6">{subtitle}</p>
          )}
          <div className="flex items-center justify-center gap-3">
            <a
              href={primaryHref}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-full font-semibold shadow-lg"
            >
              {primaryText}
            </a>
            <a
              href={secondaryHref}
              className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-red-600 px-4 py-2 rounded-full font-medium"
            >
              {secondaryText}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
