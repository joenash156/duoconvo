import { ThemeScheme } from "@/types/theme.types";

export const appColors: ThemeScheme = {
  light: {
    primary: "#2563EB",
    secondary: "#10B981",
    background: "#FFFFFF",
    card: "#F4F4F5",
    foreground: "#1E293B",
  },
  dark: {
    primary: "#3B82F6",
    secondary: "#34D399",
    background: "#09090B",
    card: "#18181B",
    foreground: "#F4F4F5",
  },
};

export const getThemeColors = (theme: "light" | "dark") => {
  return appColors[theme];
};
