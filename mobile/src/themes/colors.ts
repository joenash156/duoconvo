import { ThemeScheme, ThemeColors } from "@/types/theme.types";

export const appColors: ThemeScheme = {
  light: {
    bg: "bg-white",
    text: "text-zinc-950",
  },
  dark: {
    bg: "bg-zinc-950",
    text: "text-white",
  },
};

export const getThemeColors = (isDarkMode: boolean): ThemeColors => {
  return isDarkMode ? appColors.dark : appColors.light;
};
