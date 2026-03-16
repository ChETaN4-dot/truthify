import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const lightColors = {
  bg: '#e9fff2',
  surface: '#f4fff8',
  elevated: '#ffffff',
  primary: '#1E8A44',
  secondary: '#27A050',
  lightGreen: '#b7e4c7',
  cyan: '#1E8A44',
  border: '#b7e4c7',
  text: '#145C2E',
  textSub: '#2f6f4e',
  textMuted: '#7fbf9a',
  danger: '#e74c3c',
  gradCyan: ['#1E8A44', '#27A050', '#2DB55D'],
  gold: '#F1C40F',
  success: '#2ECC71',
  warning: '#E67E22',
};

const darkColors = {
  bg: '#0A1A10',
  surface: '#11291A',
  elevated: '#1D3B26',
  primary: '#2DB55D',
  secondary: '#33D16B',
  lightGreen: '#3C664C',
  cyan: '#2DB55D',
  border: '#1E5230',
  text: '#E9FFF2',
  textSub: '#9ABFAD',
  textMuted: '#5B866D',
  danger: '#ff4d4d',
  gradCyan: ['#2DB55D', '#33D16B', '#3EF580'],
  gold: '#F39C12',
  success: '#27AE60',
  warning: '#D35400',
};

// Export fallback for static styling that hasn't been migrated
export const C = lightColors;

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem('app_theme');
        if (stored !== null) {
          setIsDark(stored === 'dark');
        } else {
          // Default to system
          const colorScheme = Appearance.getColorScheme();
          setIsDark(colorScheme === 'dark');
        }
      } catch (e) {
        setIsDark(false);
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    await AsyncStorage.setItem('app_theme', nextTheme ? 'dark' : 'light');
  };

  const contextValue = useMemo(() => {
    return {
      isDark,
      toggleTheme,
      C: isDark ? darkColors : lightColors,
    };
  }, [isDark]);

  if (loading) return null;

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
