import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  themesList: { id: ThemeMode; name: string; accentColor: string; bgPreview: string }[];
}

const THEMES_LIST: { id: ThemeMode; name: string; accentColor: string; bgPreview: string }[] = [
  { id: 'oled', name: 'OLED Pure Black', accentColor: '#22c55e', bgPreview: '#000000' },
  { id: 'dark', name: 'Deep Space Dark', accentColor: '#3b82f6', bgPreview: '#090d16' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', accentColor: '#06b6d4', bgPreview: '#080314' },
  { id: 'emerald', name: 'Emerald Forest', accentColor: '#10b981', bgPreview: '#021a12' },
  { id: 'sunset', name: 'Crimson Sunset', accentColor: '#f97316', bgPreview: '#18090d' },
  { id: 'retro', name: 'Retro Amber', accentColor: '#eab308', bgPreview: '#12140a' },
  { id: 'synthwave', name: 'Synthwave Glow', accentColor: '#ec4899', bgPreview: '#0f051d' },
  { id: 'light', name: 'Clean Light', accentColor: '#16a34a', bgPreview: '#f8fafc' },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialTheme?: ThemeMode }> = ({
  children,
  initialTheme = 'oled',
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('orbit_theme') as ThemeMode) || initialTheme;
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('orbit_theme', newTheme);
  };

  useEffect(() => {
    // Remove old theme classes
    document.body.classList.remove(
      'theme-oled',
      'theme-dark',
      'theme-cyberpunk',
      'theme-emerald',
      'theme-sunset',
      'theme-retro',
      'theme-synthwave',
      'theme-light',
      'dark'
    );

    document.body.classList.add(`theme-${theme}`);
    if (theme !== 'light') {
      document.body.classList.add('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themesList: THEMES_LIST }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
