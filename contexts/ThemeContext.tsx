"use client";

import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';

type Theme = "light" | "dark" | "ocean";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const localTheme = localStorage.getItem('theme') as Theme | null;
    if (localTheme) {
      setThemeState(localTheme);
      document.documentElement.setAttribute('data-theme', localTheme);
    } else {
      // Устанавливаем тему по умолчанию, если в localStorage ничего нет
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
