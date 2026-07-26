import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { MicButton } from "@/components/ui/MicButton";
import { OptionsModal } from "@/components/ui/OptionsModal";
import { TAB_BAR_BOTTOM_MARGIN, TAB_BAR_HEIGHT } from "@/constants/layout";
import { getLanguageLabel, LANGUAGES, LanguageCode } from "@/constants/languages";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";

export default function Translate() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const [isListening, setIsListening] = useState(false);
  const [spokenLanguage, setSpokenLanguage] = useState<LanguageCode>("en");
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>("tw");
  const [activePicker, setActivePicker] = useState<"spoken" | "target" | null>(null);

  const swapRotation = useSharedValue(0);
  const swapStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swapRotation.value}deg` }],
  }));

  const handleSwap = () => {
    Haptics.selectionAsync();
    swapRotation.value = withSpring(swapRotation.value + 180, { damping: 14, stiffness: 140 });
    setSpokenLanguage(targetLanguage);
    setTargetLanguage(spokenLanguage);
  };

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <Header title="DuoConvo" subtitle="Speak naturally, we'll handle the rest." />

      <View className="flex-row items-center gap-2 px-6 pt-2">
        <LanguageChip label={getLanguageLabel(spokenLanguage)} onPress={() => setActivePicker("spoken")} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Swap languages"
          onPress={handleSwap}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center active:opacity-60"
        >
          <Animated.View style={swapStyle}>
            <Ionicons name="swap-horizontal" size={22} color={colors.primary} />
          </Animated.View>
        </Pressable>
        <LanguageChip label={getLanguageLabel(targetLanguage)} onPress={() => setActivePicker("target")} />
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <MicButton isListening={isListening} onPress={() => setIsListening((prev) => !prev)} />
        <Text className="mt-6 text-base font-medium text-foreground dark:text-zinc-50">
          {isListening ? "Listening..." : "Tap to speak"}
        </Text>
      </View>

      <View style={{ height: TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN + insets.bottom }} />

      <OptionsModal
        visible={activePicker === "spoken"}
        title="I'm speaking"
        options={LANGUAGES.map((language) => ({ value: language.code, label: language.label }))}
        selectedValue={spokenLanguage}
        onSelect={setSpokenLanguage}
        onClose={() => setActivePicker(null)}
      />
      <OptionsModal
        visible={activePicker === "target"}
        title="Translate to"
        options={LANGUAGES.map((language) => ({ value: language.code, label: language.label }))}
        selectedValue={targetLanguage}
        onSelect={setTargetLanguage}
        onClose={() => setActivePicker(null)}
      />
    </View>
  );
}

function LanguageChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Selected language ${label}`}
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl bg-card px-3 py-3 active:opacity-70 dark:bg-zinc-900"
    >
      <Text className="text-sm font-semibold text-foreground dark:text-zinc-50" numberOfLines={1}>
        {label}
      </Text>
      <Ionicons name="chevron-down" size={16} color="#71717A" />
    </Pressable>
  );
}
