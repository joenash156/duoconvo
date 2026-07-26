import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  //interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
type TabIconName = "call" | "archive" | "heart" | "person";

const OUTLINE_ICON_NAME: Record<TabIconName, IoniconName> = {
  call: "call-outline",
  archive: "archive-outline",
  heart: "heart-outline",
  person: "person-outline",
};

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

type TabIconProps = TabBarIconProps & {
  name: TabIconName;
  isDarkMode: boolean;
};

// Tab Icon Component with smooth overlay animation
const TabIcon = ({
  name,
  focused,
  color,
  size,
  isDarkMode,
}: TabIconProps) => {
  const focusedValue = useSharedValue(focused ? 1 : 0);

  // Update focused value without triggering render reads
  useEffect(() => {
    focusedValue.value = withSpring(focused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [focused, focusedValue]);

  // Background pill animation
  const animatedPillStyle = useAnimatedStyle(() => {
    const opacity = focusedValue.value;
    const scale = interpolate(focusedValue.value, [0, 1], [0.84, 1]);
    const translateY = interpolate(focusedValue.value, [0, 1], [1, 0]);
    const backgroundColor = isDarkMode
      ? "rgba(255, 160, 82, 0.2)"
      : "rgba(255, 176, 111, 0.27)";

    return {
      opacity,
      transform: [{ scale }, { translateY }],
      backgroundColor,
    };
  });

  // Outline icon opacity (fades out when focused)
  const outlineIconStyle = useAnimatedStyle(() => ({
    opacity: 1 - focusedValue.value,
  }));

  // Filled icon opacity (fades in when focused)
  const filledIconStyle = useAnimatedStyle(() => ({
    opacity: focusedValue.value,
  }));

  return (
    <View style={styles.container}>
      {/* Background Pill */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size * 3.5,
            height: size * 2,
            borderRadius: 70,
            top: -2,
          },
          animatedPillStyle,
        ]}
      />

      {/* Outline Icon (Visible when NOT focused) */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.iconCentered, outlineIconStyle]}
      >
        <Ionicons name={OUTLINE_ICON_NAME[name]} size={size} color={color} />
      </Animated.View>

      {/* Filled Icon (Fades in when focused) */}
      <Animated.View style={[styles.iconCentered, filledIconStyle]}>
        <Ionicons name={name} size={size} color={color} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconCentered: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function TabsLayout() {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Protect this route: Only authenticated users can access tabs
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("[TabsLayout] User not authenticated, redirecting to login");
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Don't render tabs if user is not authenticated
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  const tabBarHeight = 53;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        animation: "shift",
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: -2,
        },
        tabBarStyle: {
          height: tabBarHeight,
          backgroundColor: isDarkMode ? "#14151acc" : "#ebebebd9",
          borderTopWidth: 0,
          paddingBottom: 5,

          position: "absolute",
          bottom: 12,
          left: 0,
          right: 0,
          borderRadius: 30,
          elevation: 8,
          shadowColor: isDarkMode ? "#47484de3" : "#00000038",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkMode ? 0.4 : 0.6,
          shadowRadius: isDarkMode ? 8 : 6,
          marginHorizontal: 8,
        },
        tabBarActiveTintColor: "#EA580C",
        tabBarInactiveTintColor: isDarkMode ? "#cfcfcf" : "#393d45",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Call",
          tabBarIcon: (props: TabBarIconProps) => (
            <TabIcon name="call" {...props} size={21} isDarkMode={isDarkMode} />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: "History",
          tabBarIcon: (props: TabBarIconProps) => (
            <TabIcon
              name="archive"
              {...props}
              size={21}
              isDarkMode={isDarkMode}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="interests"
        options={{
          title: "Interests",
          tabBarIcon: (props: TabBarIconProps) => (
            <TabIcon
              name="heart"
              {...props}
              size={22}
              isDarkMode={isDarkMode}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: (props: TabBarIconProps) => (
            <TabIcon
              name="person"
              {...props}
              size={21}
              isDarkMode={isDarkMode}
            />
          ),
        }}
      />
    </Tabs>
  );
}
