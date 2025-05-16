import React, { createContext, useContext, useEffect, useState } from 'react';

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Create the context
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize theme from localStorage if available, otherwise default to system
  const [theme, setTheme] = useState(THEMES.SYSTEM);
  // Track if we're using dark mode (regardless of whether it's from system or manual selection)
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Keep track of system preference separately
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  
  // Function to update theme
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    if (newTheme !== THEMES.SYSTEM) {
      localStorage.setItem('theme', newTheme);
    } else {
      localStorage.removeItem('theme');
    }
  };

  // Effect to initialize system preference detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initial check of system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);
    
    // Set up listener for system preference changes
    const handleChange = (e) => {
      setSystemPrefersDark(e.matches);
    };
    
    // Use the appropriate event listener based on browser support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Effect to initialize theme from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Try to get saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      setTheme(savedTheme);
    } else {
      // If no saved preference, default to system
      setTheme(THEMES.SYSTEM);
    }
  }, []);

  // Effect to apply theme classes to document based on current settings
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    
    // Determine if we should use dark mode
    let shouldUseDarkMode = false;
    
    if (theme === THEMES.DARK) {
      // User explicitly selected dark theme
      shouldUseDarkMode = true;
    } else if (theme === THEMES.LIGHT) {
      // User explicitly selected light theme
      shouldUseDarkMode = false;
    } else if (theme === THEMES.SYSTEM) {
      // Use system preference
      shouldUseDarkMode = systemPrefersDark;
    }
    
    // Apply or remove dark class as needed
    if (shouldUseDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Update state
    setIsDarkMode(shouldUseDarkMode);
  }, [theme, systemPrefersDark]);

  const value = {
    theme,
    isDarkMode,
    updateTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}