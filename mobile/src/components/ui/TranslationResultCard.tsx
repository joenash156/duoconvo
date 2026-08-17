import { Ionicons } from "@expo/vector-icons";
import React from "react";
import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { getLanguageLabel, LanguageCode } from "@/constants/languages";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";
import { TranslationResult } from "@/types/conversation.types";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

type TranslationResultCardProps = {
  result: TranslationResult;
  isSpeaking: boolean;
  onPlayAudio: () => void;
  onRecordAgain: () => void;
};

const SPRING_CONFIG = { damping: 14, stiffness: 220 };

export function TranslationResultCard({
  result,
  isSpeaking,
  onPlayAudio,
  onRecordAgain,
}: Readonly<TranslationResultCardProps>) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const isModelSourced = result.source === "model";

  return (
    <View className="w-full gap-4">
      <View className="rounded-2xl bg-card p-5 dark:bg-zinc-900">
        <View className="items-center">
          <Text className="text-center text-md font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {getLanguageLabel(result.spokenLanguage as LanguageCode)} {" "}
            <FontAwesome6 name="arrow-right-long" size={15} color={colors.primary} />
            {" "} {getLanguageLabel(result.targetLanguage as LanguageCode)}
          </Text>
          <View
            className={`mt-2 flex-row items-center gap-1 rounded-full px-2.5 py-1 ${
              isModelSourced ? "bg-primary/10" : "bg-accent/10"
            }`}
          >
            <Ionicons
              name={isModelSourced ? "sparkles" : "cloud-outline"}
              size={12}
              color={isModelSourced ? colors.primary : colors.accent}
            />
            <Text className="text-xs font-semibold" style={{ color: isModelSourced ? colors.primary : colors.accent }}>
              {isModelSourced ? "DuoConvo AI" : "LLM Fallback"}
            </Text>
          </View>
        </View>

        {result.sttText ? (
          <Text className="mt-4 text-sm italic text-zinc-500 dark:text-zinc-400">&ldquo;{result.sttText}&rdquo;</Text>
        ) : null}

        <Text className="mt-2 text-2xl font-bold text-foreground dark:text-zinc-50">{result.translatedText}</Text>

        {result.detectedIntent ? (
          <Text className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            Intent: {result.detectedIntent} · Confidence: {Math.round(result.similarityScore * 100)}%
          </Text>
        ) : null}

        <View className="mt-5 flex-row items-center gap-3">
          <PlayButton isSpeaking={isSpeaking} onPress={onPlayAudio} color={colors.secondary} />
          <RecordAgainButton onPress={onRecordAgain} color={colors.primary} />
        </View>
      </View>
    </View>
  );
}

function PlayButton({ isSpeaking, onPress, color }: Readonly<{ isSpeaking: boolean; onPress: () => void; color: string }>) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const size = 56;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isSpeaking ? "Playing audio" : "Play audio"}
      disabled={isSpeaking}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are intentionally mutated via `.value`.
        scale.value = withSpring(0.9, SPRING_CONFIG);
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability -- see above
        scale.value = withSpring(1, SPRING_CONFIG);
      }}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: color,
            opacity: isSpeaking ? 0.6 : 1,
          },
          style,
        ]}
      >
        <Ionicons name={isSpeaking ? "volume-high" : "play"} size={size * 0.42} color="#FFFFFF" />
      </Animated.View>
    </Pressable>
  );
}

function RecordAgainButton({ onPress, color }: Readonly<{ onPress: () => void; color: string }>) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Record again"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are intentionally mutated via `.value`.
        scale.value = withSpring(0.96, SPRING_CONFIG);
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability -- see above
        scale.value = withSpring(1, SPRING_CONFIG);
      }}
      className="flex-1"
    >
      <Animated.View
        style={[style, { borderColor: color }]}
        className="min-h-14 flex-row items-center justify-center gap-2 rounded-2xl border-2 px-4"
      >
        <Ionicons name="mic-outline" size={18} color={color} />
        <Text className="text-base font-semibold" style={{ color }}>
          Record Again
        </Text>
      </Animated.View>
    </Pressable>
  );
}
