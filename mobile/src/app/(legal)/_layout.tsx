import { Slot } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";

export default function LegalLayout() {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Slot />
    </View>
  );
}
