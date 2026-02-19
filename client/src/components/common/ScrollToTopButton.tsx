'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-40 right-8 w-12 h-12 rounded-full
        bg-gradient-to-br from-[#9b111e] to-[#b91c1c] text-white shadow-xl flex items-center justify-center
        transition-opacity duration-300 transform hover:scale-110
        z-50
        ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
      aria-label="Scroll to top"
      title="Scroll to Top"
    >
      <ArrowUp size={24} />
    </button>
  );
};

export default ScrollToTopButton;
