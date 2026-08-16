import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";

setAudioModeAsync({ playsInSilentMode: false });

type MicButtonProps = {
  isListening: boolean;
  onPress: () => void;
  size?: number;
};

export function MicButton({ isListening, onPress, size = 150 }: Readonly<MicButtonProps>) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const startSound = useAudioPlayer(require("@/assets/audio/record-sound.mp3"));
  const stopSound = useAudioPlayer(require("@/assets/audio/stop-sound.mp3"));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const sound = isListening ? stopSound : startSound;
    sound.seekTo(0);
    sound.play();
    onPress();
  };

  const pressScale = useSharedValue(1);
  const ringA = useSharedValue(0);
  const ringB = useSharedValue(0);
  const ringC = useSharedValue(0);

  useEffect(() => {
    const rings = [ringA, ringB, ringC];

    rings.forEach((ring, index) => {
      if (isListening) {
        ring.value = withDelay(
          index * 450,
          withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }), -1, false),
        );
      } else {
        cancelAnimation(ring);
        ring.value = withTiming(0, { duration: 200 });
      }
    });
  }, [isListening, ringA, ringB, ringC]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const ringAStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ringA.value, [0, 1], [0.45, 0]),
    transform: [{ scale: interpolate(ringA.value, [0, 1], [1, 1.9]) }],
  }));
  const ringBStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ringB.value, [0, 1], [0.45, 0]),
    transform: [{ scale: interpolate(ringB.value, [0, 1], [1, 1.9]) }],
  }));
  const ringCStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ringC.value, [0, 1], [0.45, 0]),
    transform: [{ scale: interpolate(ringC.value, [0, 1], [1, 1.9]) }],
  }));

  const ringColor = isListening ? colors.accent : colors.primary;

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
      <Animated.View
        style={[styles.ring, { width: size, height: size, borderRadius: size / 2, backgroundColor: ringColor }, ringAStyle]}
      />
      <Animated.View
        style={[styles.ring, { width: size, height: size, borderRadius: size / 2, backgroundColor: ringColor }, ringBStyle]}
      />
      <Animated.View
        style={[styles.ring, { width: size, height: size, borderRadius: size / 2, backgroundColor: ringColor }, ringCStyle]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isListening ? "Stop listening" : "Start listening"}
        onPress={handlePress}
        onPressIn={() => {
          // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are intentionally mutated via `.value`; the compiler's immutability rule doesn't yet recognize this pattern.
          pressScale.value = withSpring(0.92, { damping: 14, stiffness: 220 });
        }}
        onPressOut={() => {
          // eslint-disable-next-line react-hooks/immutability -- see above
          pressScale.value = withSpring(1, { damping: 14, stiffness: 220 });
        }}
      >
        <Animated.View
          style={[
            styles.button,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: isListening ? colors.accent : colors.primary,
            },
            buttonStyle,
          ]}
        >
          <Ionicons name={isListening ? "stop" : "mic"} size={size * 0.4} color="#FFFFFF" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
});
