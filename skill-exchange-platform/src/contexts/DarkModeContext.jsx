import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const DarkModeContext = createContext(null);

export const DarkModeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first with error handling
    try {
      const saved = localStorage.getItem('theme');
      if (saved && ['auto', 'light', 'dark'].includes(saved)) {
        return saved;
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
    }
    return 'auto'; // Default to auto
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize dark mode immediately to prevent flash
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        return true;
      } else if (saved === 'light') {
        return false;
      }
      // auto mode - check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      console.warn('Failed to initialize dark mode:', error);
      return false;
    }
  });

  // Listen to system preference changes
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };

    // Set initial value
    setIsDarkMode(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply dark class based on theme setting
  useEffect(() => {
    let shouldBeDark = false;

    if (theme === 'dark') {
      shouldBeDark = true;
    } else if (theme === 'light') {
      shouldBeDark = false;
    } else {
      // auto mode - use system preference
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDarkMode(shouldBeDark);

    // Apply the dark class to both html and body elements
    const root = document.documentElement;
    const body = document.body;
    
    // Define gradient backgrounds
    const lightGradient = 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 50%, #f5f3ff 100%)';
    const darkGradient = 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1729 100%)';
    
    if (shouldBeDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      // FORCE background with inline style
      body.style.background = darkGradient;
      body.style.backgroundAttachment = 'fixed';
      root.style.background = darkGradient;
      root.style.backgroundAttachment = 'fixed';
      console.log('Dark mode enabled:', theme, '- Background set to dark gradient');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      // FORCE background with inline style
      body.style.background = lightGradient;
      body.style.backgroundAttachment = 'fixed';
      root.style.background = lightGradient;
      root.style.backgroundAttachment = 'fixed';
      console.log('Light mode enabled:', theme, '- Background set to light gradient');
    }

    // Save to localStorage
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [theme]);

  const setThemeMode = (newTheme) => {
    if (['auto', 'light', 'dark'].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  const toggleDarkMode = () => {
    // Cycle through: light -> dark -> auto -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('auto');
    } else {
      setTheme('light');
    }
  };

  const value = {
    theme,
    isDarkMode,
    setTheme: setThemeMode,
    toggleDarkMode,
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
};

DarkModeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};
