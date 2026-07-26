import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

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
  const deviceTheme = useColorScheme();
  const [themePreference, setThemePreference] =
    useState<ThemePreference>("system");

  const resolvedTheme: Theme =
    themePreference === "system"
      ? deviceTheme === "dark"
        ? "dark"
        : "light"
      : themePreference;

  const toggleTheme = () => {
    setThemePreference(resolvedTheme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        themePreference,
        setThemePreference,
        toggleTheme,
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
