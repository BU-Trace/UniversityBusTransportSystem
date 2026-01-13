'use client';

import React from 'react';

interface RouteSelectorProps {
  routes: string[];
  selectedRoute: string;
  onSelect: (route: string) => void;
}

const RouteSelector: React.FC<RouteSelectorProps> = ({ routes, selectedRoute, onSelect }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-10">
      {routes.map((route, index) => (
        <button
          key={route}
          onClick={() => onSelect(route)}
          className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 ${
            selectedRoute === route
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-white text-red-600 border border-red-400 hover:bg-red-50'
          }`}
        >
          Route {index + 1}
        </button>
      ))}
    </div>
  );
};

export default RouteSelector;
