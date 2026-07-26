import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { ColorValue, StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";
import { IoniconName } from "@/types/icon.types";

type AnimatedTabIconProps = {
  focused: boolean;
  color: ColorValue;
  size: number;
  filledName: IoniconName;
  outlineName: IoniconName;
};

export function AnimatedTabIcon({
  focused,
  color,
  size,
  filledName,
  outlineName,
}: AnimatedTabIconProps) {
  const { theme } = useTheme();
  const focusedValue = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    focusedValue.value = withSpring(focused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [focused, focusedValue]);

  const pillStyle = useAnimatedStyle(() => {
    const opacity = focusedValue.value;
    const scale = interpolate(focusedValue.value, [0, 1], [0.84, 1]);
    const translateY = interpolate(focusedValue.value, [0, 1], [2, 0]);

    return {
      opacity,
      transform: [{ scale }, { translateY }],
      backgroundColor: theme === "dark" ? "rgba(20, 184, 166, 0.18)" : "rgba(13, 148, 136, 0.14)",
    };
  });

  const outlineStyle = useAnimatedStyle(() => ({
    opacity: 1 - focusedValue.value,
  }));

  const filledStyle = useAnimatedStyle(() => ({
    opacity: focusedValue.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size * 3.2,
            height: size * 1.9,
            borderRadius: 999,
            top: -size * 0.05,
          },
          pillStyle,
        ]}
      />
      <Animated.View style={[StyleSheet.absoluteFill, styles.iconCentered, outlineStyle]}>
        <Ionicons name={outlineName} size={size} color={color} />
      </Animated.View>
      <Animated.View style={[styles.iconCentered, filledStyle]}>
        <Ionicons name={filledName} size={size} color={color} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    width: 30,
  },
  iconCentered: {
    justifyContent: "center",
    alignItems: "center",
  },
});
