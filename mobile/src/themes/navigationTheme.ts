import { DarkTheme, DefaultTheme, Theme } from "expo-router";
import { appColors } from "@/themes/colors";

export const appNavigationTheme: { light: Theme; dark: Theme } = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: appColors.light.primary,
      background: appColors.light.background,
      card: appColors.light.card,
      text: appColors.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: appColors.dark.primary,
      background: appColors.dark.background,
      card: appColors.dark.card,
      text: appColors.dark.foreground,
    },
  },
};
