import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "nativewind";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

interface ThemeContextType {
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");

  const setThemePreference = (preference: ThemePreference) => {
    setThemePreferenceState(preference);
    setColorScheme(preference);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: colorScheme === "dark" ? "dark" : "light",
        themePreference,
        setThemePreference,
        toggleTheme: toggleColorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
