"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton: React.FC = () => {

  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
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

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-25 right-6 p-3 rounded-full 
        bg-red-600 text-white shadow-xl 
        transition-opacity duration-300 transform hover:scale-110 
        z-50 
        ${isVisible ? "opacity-100 visible" : "opacity-0 invisible"}
      `}
      aria-label="Scroll to top"
      title="Scroll to Top"
    >
      <ArrowUp size={24} />
    </button>
  );
};

export default ScrollToTopButton;