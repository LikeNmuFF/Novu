import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ═══════════════════════════════════════════════════════════
// COLOR PALETTES
// ═══════════════════════════════════════════════════════════

export const lightColors = {
  // Brand
  coral: '#FF7E5F',
  coralDark: '#E86548',
  coralLight: '#FFA68F',
  coralGlow: '#FFF0EB',
  teal: '#2EC4B6',
  tealDark: '#219A8F',
  tealLight: '#7DDAD0',
  tealGlow: '#E8F8F6',
  gold: '#FFD93D',
  goldLight: '#FFE680',
  goldGlow: '#FFF8E0',
  green: '#6BCB77',
  greenLight: '#94D99D',
  greenGlow: '#EDF8EF',

  // Semantic
  background: '#FFF8F0',
  surface: '#FFFFFF',
  surfaceAlt: '#FEFCF9',
  text: '#1A535C',
  textMuted: '#4A5568',
  textLight: '#718096',
  border: '#F5E6D5',
  inputBg: '#F8F4EF',
  cardBg: '#FFFFFF',
  navBg: '#FFFFFF',
  navBorder: '#F5E6D5',
  statusBar: 'dark' as 'light' | 'dark',
};

export const darkColors = {
  // Brand (slightly adjusted for dark)
  coral: '#FF8A6E',
  coralDark: '#FF7E5F',
  coralLight: '#FFA68F',
  coralGlow: '#2D1F1B',
  teal: '#3DD4C6',
  tealDark: '#2EC4B6',
  tealLight: '#7DDAD0',
  tealGlow: '#1A2E2C',
  gold: '#FFD93D',
  goldLight: '#FFE680',
  goldGlow: '#2D2A1A',
  green: '#7BD887',
  greenLight: '#94D99D',
  greenGlow: '#1E2D1F',

  // Semantic
  background: '#0F1A1D',
  surface: '#1A2B30',
  surfaceAlt: '#162428',
  text: '#E8F0F2',
  textMuted: '#A0B4B8',
  textLight: '#6B8A90',
  border: '#2A3E44',
  inputBg: '#1E3035',
  cardBg: '#1A2B30',
  navBg: '#1A2B30',
  navBorder: '#2A3E44',
  statusBar: 'dark' as 'light' | 'dark',
};

export type ThemeColors = typeof lightColors;

// ═══════════════════════════════════════════════════════════
// SHADOWS
// ═══════════════════════════════════════════════════════════

export const lightShadows = {
  sm: {
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 40,
    elevation: 8,
  },
};

export const darkShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 8,
  },
};

export type ThemeShadows = typeof lightShadows;

// ═══════════════════════════════════════════════════════════
// THEME TYPE
// ═══════════════════════════════════════════════════════════

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  shadows: ThemeShadows;
}

// ═══════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@learnbasilan_darkmode';

// ═══════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((value) => {
        if (value !== null) {
          setIsDark(value === 'true');
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Save theme preference when changed
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(THEME_STORAGE_KEY, String(isDark));
    }
  }, [isDark, loaded]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const setDarkMode = (value: boolean) => setIsDark(value);

  const theme: Theme = {
    dark: isDark,
    colors: isDark ? darkColors : lightColors,
    shadows: isDark ? darkShadows : lightShadows,
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
