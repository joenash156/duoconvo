import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, ThemeProvider as NavigationThemeProvider } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { View } from "react-native";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { queryClient } from "@/services/queryClient";
import { getThemeColors } from "@/themes/colors";
import { appNavigationTheme } from "@/themes/navigationTheme";
import "../../global.css";

function RootStack() {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  // Keep the native window behind native-stack screens in sync with the app.
  // Without this, Android can briefly expose its default white window surface
  // while returning from a nested route.
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  return (
    <NavigationThemeProvider value={appNavigationTheme[theme]}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "ios_from_right",
            animationDuration: 220,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(legal)" />
          <Stack.Screen name="about" />
        </Stack>
      </View>
    </NavigationThemeProvider>
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
