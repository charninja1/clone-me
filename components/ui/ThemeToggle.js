import React from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, isDarkMode, updateTheme } = useTheme();

  const toggleTheme = () => {
    // If currently dark (either system or manual), switch to light
    // If currently light (either system or manual), switch to dark
    // This provides a simple toggle between dark and light modes
    updateTheme(isDarkMode ? THEMES.LIGHT : THEMES.DARK);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg transition-all duration-300 hover:bg-surface-100 dark:hover:bg-surface-800 hover:scale-110 transform ${className}`}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon - visible in dark mode */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`absolute inset-0 m-auto transition-all duration-300 ${
          isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'
        }`}
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>

      {/* Moon icon - visible in light mode */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`absolute inset-0 m-auto transition-all duration-300 ${
          isDarkMode ? 'opacity-0 -rotate-180' : 'opacity-100 rotate-0'
        }`}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}