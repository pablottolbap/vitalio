import { createContext, useContext, useState, useEffect } from 'react';

/* eslint-disable react-refresh/only-export-components */

// Simple theme system (light/dark) based on a color object.
// The app uses inline styles, so colors are distributed via context,
// analogous to the translation system in i18n.jsx.

export const themes = {
  light: {
    name: 'light',
    pageBg: '#ffffff',
    text: '#333333',
    muted: '#666666',
    faint: '#999999',
    heading: '#555555',
    border: '#dddddd',
    borderStrong: '#cccccc',
    panel: '#f5f5f5',
    sidebar: '#f9f9f9',
    card: '#ffffff',
    badgeBg: '#f0f0f0',
    accent: '#6f42c1',
    link: '#007bff',
  },
  dark: {
    name: 'dark',
    pageBg: '#161616',
    text: '#e6e6e6',
    muted: '#a8a8a8',
    faint: '#777777',
    heading: '#bdbdbd',
    border: '#3a3a3a',
    borderStrong: '#555555',
    panel: '#222222',
    sidebar: '#1e1e1e',
    card: '#2a2a2a',
    badgeBg: '#333333',
    accent: '#a684ff',
    link: '#5aa9ff',
  },
};

const STORAGE_KEY = 'vitalio-theme';

const ThemeContext = createContext({ theme: themes.light, isDark: false, toggleTheme: () => {} });

/**
 * Provides theme context (light/dark) to the entire app.
 * Reads user preference from localStorage or system settings on first load.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} - Provider element wrapping children
 */
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch {
      // localStorage/matchMedia unavailable — use light theme as fallback
    }
    return 'light';
  });

  const theme = themes[mode];

  const toggleTheme = () => {
    setMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Silently ignore write errors (localStorage may be full or unavailable)
      }
      return next;
    });
  };

  useEffect(() => {
    document.body.style.backgroundColor = theme.pageBg;
    document.body.style.color = theme.text;
    document.body.style.transition = 'background-color 0.2s, color 0.2s';
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark: mode === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context.
 * @returns {Object} Theme context object
 * @returns {Object} .theme - Current theme color object (light or dark)
 * @returns {boolean} .isDark - Whether dark mode is active
 * @returns {Function} .toggleTheme - Function to toggle between light/dark modes
 */
export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Style overrides for react-select component, matched to current theme.
 * @param {Object} theme - Theme color object from useTheme
 * @returns {Object} Style overrides for react-select (control, menu, option, etc.)
 */
export function selectStyles(theme) {
  return {
    control: (base, state) => ({
      ...base,
      backgroundColor: theme.card,
      borderColor: state.isFocused ? theme.accent : theme.borderStrong,
      boxShadow: state.isFocused ? `0 0 0 1px ${theme.accent}` : 'none',
      '&:hover': { borderColor: theme.accent },
    }),
    menu: (base) => ({ ...base, backgroundColor: theme.card, zIndex: 20 }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? theme.accent : state.isFocused ? theme.panel : theme.card,
      color: state.isSelected ? '#fff' : theme.text,
      cursor: 'pointer',
    }),
    singleValue: (base) => ({ ...base, color: theme.text }),
    input: (base) => ({ ...base, color: theme.text }),
    placeholder: (base) => ({ ...base, color: theme.muted }),
    dropdownIndicator: (base) => ({ ...base, color: theme.muted }),
    clearIndicator: (base) => ({ ...base, color: theme.muted }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: theme.border }),
  };
}
