import { BlurTargetView } from "expo-blur";
import React from "react";
import { Tabs } from "expo-router/js-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedTabIcon } from "@/components/navigation/AnimatedTabIcon";
import { tabBarBlurTargetRef } from "@/components/navigation/blurTarget";
import { TabBarBackground } from "@/components/navigation/TabBarBackground";
import {
  TAB_BAR_BOTTOM_MARGIN,
  TAB_BAR_HEIGHT,
  TAB_BAR_HORIZONTAL_MARGIN,
} from "@/constants/layout";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";

export default function TabsLayout() {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();

  return (
    <BlurTargetView ref={tabBarBlurTargetRef} style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          animation: "shift",
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12.5,
            fontWeight: "600",
            marginTop: -5,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: theme === "dark" ? "#8B9198" : "#71717A",
          tabBarBackground: () => <TabBarBackground />,
          sceneStyle: { backgroundColor: colors.background },
          tabBarStyle: {
            position: "absolute",
            left: TAB_BAR_HORIZONTAL_MARGIN,
            right: TAB_BAR_HORIZONTAL_MARGIN,
            bottom: insets.bottom + TAB_BAR_BOTTOM_MARGIN,
            height: TAB_BAR_HEIGHT,
            borderRadius: 32,
            borderTopWidth: 0,
            paddingTop: 2,
            marginHorizontal: 15,
            paddingHorizontal: 8,
            overflow: "hidden",
            elevation: 12,
            shadowColor: theme === "dark" ? "#002E30" : "#6fb0b0",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme === "dark" ? 0.45 : 0.15,
            shadowRadius: 20,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Translate",
            tabBarIcon: ({ focused, color, size }) => (
              <AnimatedTabIcon
                focused={focused}
                color={color}
                size={size * 1.05}
                filledName="language"
                outlineName="language-outline"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ focused, color, size }) => (
              <AnimatedTabIcon
                focused={focused}
                color={color}
                size={size * 1.05}
                filledName="time"
                outlineName="time-outline"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="metrics"
          options={{
            title: "Metrics",
            tabBarIcon: ({ focused, color, size }) => (
              <AnimatedTabIcon
                focused={focused}
                color={color}
                size={size * 1.05}
                filledName="stats-chart"
                outlineName="stats-chart-outline"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused, color, size }) => (
              <AnimatedTabIcon
                focused={focused}
                color={color}
                size={size * 1.05}
                filledName="settings"
                outlineName="settings-outline"
              />
            ),
          }}
        />
      </Tabs>
    </BlurTargetView>
  );
}
