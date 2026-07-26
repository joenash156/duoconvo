import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";

export function TabBarBackground() {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  if (Platform.OS === "ios" && isLiquidGlassAvailable()) {
    return (
      <GlassView
        style={StyleSheet.absoluteFill}
        glassEffectStyle="regular"
        colorScheme={theme}
      />
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        style={StyleSheet.absoluteFill}
        intensity={Platform.OS === "ios" ? 60 : 100}
        tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
        blurMethod="dimezisBlurViewSdk31Plus"
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.card,
            opacity: theme === "dark" ? 0.55 : 0.5,
          },
        ]}
      />
    </View>
  );
}
