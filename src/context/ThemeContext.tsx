import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';

export type ThemeMode = 'dark' | 'light';

export interface Theme {
  background: string;
  backgroundSecondary: string;
  headerBg: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  secondary: string;
  secondaryLight: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
  shadow: string;
  white: string;
}

export interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const PRIMARY_COLOR = 'rgb(139, 92, 246)';
export const PRIMARY_COLOR_TRANSPARENT = 'rgba(139, 92, 246, .5)';
export const PRIMARY_COLOR_HEX = '#8B5CF6';
export const SECONDARY_COLOR = 'rgb(0, 172, 223)';
export const SECONDARY_COLOR_HEX = '#00ACD5';
export const DANGER_COLOR = 'rgb(239, 68, 68)';
export const BOX_SHADOW = '0px 0px 1px 0px ' + PRIMARY_COLOR_TRANSPARENT;

const darkTheme: Theme = {
  headerBg: '#2d2d2d',
  background: '#0a0a0a',
  backgroundSecondary: '#141414',
  card: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  textTertiary: '#666666',
  accent: PRIMARY_COLOR_HEX,
  accentLight: 'rgba(139, 92, 246, 0.2)',
  accentDark: '#7c3aed',
  secondary: SECONDARY_COLOR_HEX,
  secondaryLight: 'rgba(0, 172, 223, 0.2)',
  border: '#333333',
  borderLight: '#2a2a2a',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  shadow: 'rgba(0, 0, 0, 0.5)',
  white: '#ffffff',
};

const lightTheme: Theme = {
  headerBg: '#e0e0e0',
  background: '#f8fafc',
  backgroundSecondary: '#ffffff',
  card: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  accent: PRIMARY_COLOR_HEX,
  accentLight: 'rgba(139, 92, 246, 0.1)',
  accentDark: '#7c3aed',
  secondary: SECONDARY_COLOR_HEX,
  secondaryLight: 'rgba(0, 172, 223, 0.1)',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  shadow: 'rgba(0, 0, 0, 0.1)',
  white: '#ffffff',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'aifreetvapp_theme_mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await storage.getItem(STORAGE_KEY);
        if (savedMode === 'dark' || savedMode === 'light') {
          setThemeModeState(savedMode);
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const saveThemeMode = async (mode: ThemeMode) => {
    try {
      await storage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeModeState(newMode);
    await saveThemeMode(newMode);
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await saveThemeMode(mode);
  };

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
