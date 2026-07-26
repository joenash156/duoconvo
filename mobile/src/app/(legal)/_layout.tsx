import { Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";

export default function LegalLayout() {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "ios_from_right",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms-of-use" />
    </Stack>
  );
}
