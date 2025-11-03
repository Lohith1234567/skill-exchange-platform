import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const DarkModeContext = createContext(null);

export const DarkModeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved && ['auto', 'light', 'dark'].includes(saved)) {
      return saved;
    }
    return 'auto'; // Default to auto
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

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

    // Apply the dark class to the root html element
    const root = document.documentElement;
    if (shouldBeDark) {
      root.classList.add('dark');
      console.log('Dark mode enabled:', theme);
    } else {
      root.classList.remove('dark');
      console.log('Light mode enabled:', theme);
    }

    // Save to localStorage
    localStorage.setItem('theme', theme);
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
