import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface ThemeToggleProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <button
      onClick={toggleDarkMode}
      className="relative p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transform hover:scale-110 active:scale-95 group overflow-hidden"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon container */}
      <div className="relative z-10 w-6 h-6 flex items-center justify-center">
        <div className={`absolute inset-0 transition-all duration-500 ${darkMode ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0'}`}>
          <SunIcon className="w-6 h-6" />
        </div>
        <div className={`absolute inset-0 transition-all duration-500 ${!darkMode ? 'rotate-0 opacity-100' : '-rotate-180 opacity-0'}`}>
          <MoonIcon className="w-6 h-6" />
        </div>
      </div>

      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-full bg-white/30 transform scale-0 group-active:scale-100 transition-transform duration-200" />
    </button>
  );
};