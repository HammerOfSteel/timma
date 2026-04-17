'use client';

import { createContext, useContext } from 'react';

export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export interface ThemeData {
  id: string;
  name: string;
  colors: ThemeColors;
  isDark: boolean;
  sensoryMode: 'LOW_STIMULATION' | 'HIGH_ENGAGEMENT';
}

const ThemeContext = createContext<ThemeData | null>(null);

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({
  theme,
  children,
}: {
  theme: ThemeData | null;
  children: React.ReactNode;
}) {
  const colors = theme?.colors;
  const style = colors
    ? ({
        '--theme-primary': colors.primaryColor,
        '--theme-secondary': colors.secondaryColor,
        '--theme-bg': colors.backgroundColor,
        '--theme-text': colors.textColor,
        '--theme-accent': colors.accentColor,
      } as React.CSSProperties)
    : undefined;

  return (
    <ThemeContext.Provider value={theme}>
      <div
        className="flex min-h-full flex-1 flex-col"
        style={{
          ...style,
          backgroundColor: colors?.backgroundColor,
          color: colors?.textColor,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
