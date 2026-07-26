import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { queryClient } from "@/services/queryClient";
import "../../global.css";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
