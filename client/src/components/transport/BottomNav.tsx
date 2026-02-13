'use client';

import { Bus, Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BottomNavProps {
  className?: string;
}

export const BottomNav = ({ className = '' }: BottomNavProps) => {
  const [activeSection, setActiveSection] = useState('schedules');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['schedules', 'routes', 'buses'];
      const scrollPosition = window.scrollY + 200; // Offset for better detection

      // Check sections from bottom to top to prioritize lower sections when scrolling down
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Immediately update active state for better UX
      setActiveSection(sectionId);
    }
  };

  const navItems = [
    { id: 'schedules', icon: Clock, label: 'Time' },
    { id: 'routes', icon: MapPin, label: 'Routes' },
    { id: 'buses', icon: Bus, label: 'Buses' },
  ];

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/40 backdrop-blur-xl shadow-2xl border border-white/10 rounded-full px-6 py-3 flex gap-6 z-50 ${className}`}
    >
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;

        return (
          <div key={item.id} className="flex items-center">
            {index > 0 && <div className="w-px bg-white/10 h-8 -ml-3 mr-3"></div>}
            <button
              onClick={() => scrollToSection(item.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive
                  ? 'text-brick-500 scale-110'
                  : 'text-gray-400 hover:text-gray-200 hover:scale-105'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-brick-500' : ''} />
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-brick-500' : ''}`}
              >
                {item.label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
