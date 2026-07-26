import { ThemeScheme } from "@/types/theme.types";

export const appColors: ThemeScheme = {
  light: {
    primary: "#0D9488",
    secondary: "#10B981",
    accent: "#F59E0B",
    background: "#FFFFFF",
    card: "#F4F4F5",
    foreground: "#1E293B",
  },
  dark: {
    primary: "#14B8A6",
    secondary: "#34D399",
    accent: "#FBBF24",
    background: "#09090B",
    card: "#18181B",
    foreground: "#F4F4F5",
  },
};

export const getThemeColors = (theme: "light" | "dark") => {
  return appColors[theme];
};
