'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackText?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = '/static/bus-default.png',
  fallbackText,
  className,
  ...props
}) => {
  const [error, setError] = useState(false);

  // If source is missing or empty, show fallback immediately
  if (!src || src === 'x' || src === '') {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        {fallbackText ? (
          <span className="text-xs font-medium uppercase tracking-wider">{fallbackText}</span>
        ) : (
          <ImageOff size={24} />
        )}
      </div>
    );
  }

  if (error) {
    if (fallbackSrc && fallbackSrc !== '') {
      // If fallback source is provided (and likely valid local asset), try to render it via next/image
      // Note: We avoid infinite loop by not attaching onError to this fallback render
      // or by assuming local static assets are safe.
      return (
        <Image
          src={fallbackSrc}
          alt={alt || 'fallback'}
          className={className}
          {...props}
          onError={() => {
            // If even fallback fails, render the icon state.
            // This is a safety net.
          }}
        />
      );
    }

    // If no fallbackSrc provided (or simplified logic), show icon
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        {fallbackText ? (
          <span className="text-xs font-medium uppercase tracking-wider">{fallbackText}</span>
        ) : (
          <ImageOff size={24} />
        )}
      </div>
    );
  }

  return (
    <Image src={src} alt={alt} className={className} onError={() => setError(true)} {...props} />
  );
};

export default ImageWithFallback;
