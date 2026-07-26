import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { queryClient } from "@/services/queryClient";
import { getThemeColors } from "@/themes/colors";
import "../../global.css";

function RootStack() {
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
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(legal)" />
      <Stack.Screen name="about" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RootStack />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
