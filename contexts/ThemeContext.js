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
  
  // Function to update theme
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    if (newTheme !== THEMES.SYSTEM) {
      localStorage.setItem('theme', newTheme);
    } else {
      localStorage.removeItem('theme');
    }
  };

  // Effect to initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Effect to apply theme classes to document
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    
    // Remove existing theme class
    root.classList.remove('dark');

    // Check if should use dark mode based on theme selection
    let shouldUseDarkMode = false;
    
    if (theme === THEMES.DARK) {
      shouldUseDarkMode = true;
    } else if (theme === THEMES.SYSTEM) {
      // Check system preference
      shouldUseDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Listen for changes in system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        setIsDarkMode(e.matches);
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    // Apply appropriate class for dark mode
    if (shouldUseDarkMode) {
      root.classList.add('dark');
    }
    
    setIsDarkMode(shouldUseDarkMode);
  }, [theme]);

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