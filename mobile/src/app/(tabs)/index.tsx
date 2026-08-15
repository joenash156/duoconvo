import { Ionicons } from "@expo/vector-icons";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { MicButton } from "@/components/ui/MicButton";
import { OptionsModal } from "@/components/ui/OptionsModal";
import { TranslationResultCard } from "@/components/ui/TranslationResultCard";
import { TAB_BAR_BOTTOM_MARGIN, TAB_BAR_HEIGHT } from "@/constants/layout";
import { getLanguageLabel, LANGUAGES, LanguageCode } from "@/constants/languages";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslateAudio } from "@/hooks/useTranslate";
import { speak } from "@/services/ttsService";
import { getThemeColors } from "@/themes/colors";
import { TranslationResult } from "@/types/conversation.types";

type ScreenState = "idle" | "recording" | "processing" | "result" | "error";

const PROCESSING_MESSAGES = ["Understanding your sentence...", "Finding the best translation..."];

function formatDuration(durationMillis: number): string {
  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function Translate() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [spokenLanguage, setSpokenLanguage] = useState<LanguageCode>("en");
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>("tw");
  const [activePicker, setActivePicker] = useState<"spoken" | "target" | null>(null);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [processingMessageIndex, setProcessingMessageIndex] = useState(0);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const translateAudioMutation = useTranslateAudio();

  const swapRotation = useSharedValue(0);
  const swapStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swapRotation.value}deg` }],
  }));

  useEffect(() => {
    if (screenState !== "processing") {
      return;
    }

    const interval = setInterval(() => {
      setProcessingMessageIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [screenState]);

  const handleSwap = () => {
    Haptics.selectionAsync();
    swapRotation.value = withSpring(swapRotation.value + 180, { damping: 14, stiffness: 140 });
    setSpokenLanguage(targetLanguage);
    setTargetLanguage(spokenLanguage);
  };

  const startRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();

      if (!granted) {
        Alert.alert(
          "Microphone access needed",
          "Please allow microphone access in your device settings to record a phrase.",
        );
        return;
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setScreenState("recording");
    } catch (error) {
      Alert.alert("Couldn't start recording", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const stopRecordingAndTranslate = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;

      if (!uri) {
        throw new Error("No audio was captured. Please try again.");
      }

      setScreenState("processing");

      const translation = await translateAudioMutation.mutateAsync({
        audioUri: uri,
        spokenLanguage,
        targetLanguage,
      });

      setResult(translation);
      setScreenState("result");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      setScreenState("error");
    }
  };

  const handleMicPress = () => {
    if (screenState === "recording") {
      void stopRecordingAndTranslate();
      return;
    }

    if (screenState !== "idle") return;

    void startRecording();
  };

  const handleCancelRecording = async () => {
    try {
      await recorder.stop();
    } catch {
      // Recorder may already be stopped - nothing to do.
    }
    setScreenState("idle");
  };

  const handleRecordAgain = () => {
    setResult(null);
    setErrorMessage(null);
    setScreenState("idle");
  };

  const handlePlayAudio = async () => {
    if (!result || isSpeaking) return;

    setIsSpeaking(true);
    const outcome = await speak(result.translatedText, targetLanguage, result.audioUrl);
    setIsSpeaking(false);

    if (!outcome.played) {
      Alert.alert("Audio unavailable", outcome.reason);
    }
  };

  const showLanguagePickers = screenState === "idle" || screenState === "recording";

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <Header title="DuoConvo" subtitle="Speak naturally, we'll handle the rest." />

      {showLanguagePickers ? (
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
      ) : null}

      <View className="flex-1 items-center justify-center px-6">
        {screenState === "idle" || screenState === "recording" ? (
          <>
            <MicButton isListening={screenState === "recording"} onPress={handleMicPress} />
            <Text className="mt-6 text-base font-medium text-foreground dark:text-zinc-50">
              {screenState === "recording" ? "Listening..." : "Press the microphone to start speaking."}
            </Text>
            {screenState === "recording" ? (
              <>
                <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDuration(recorderState.durationMillis)}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cancel recording"
                  onPress={() => void handleCancelRecording()}
                  className="mt-4 active:opacity-60"
                >
                  <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Cancel</Text>
                </Pressable>
              </>
            ) : null}
          </>
        ) : null}

        {screenState === "processing" ? (
          <View className="items-center gap-4">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-base font-medium text-foreground dark:text-zinc-50">
              {PROCESSING_MESSAGES[processingMessageIndex]}
            </Text>
          </View>
        ) : null}

        {screenState === "result" && result ? (
          <TranslationResultCard
            result={result}
            isSpeaking={isSpeaking}
            onPlayAudio={() => void handlePlayAudio()}
            onRecordAgain={handleRecordAgain}
          />
        ) : null}

        {screenState === "error" ? (
          <View className="w-full items-center gap-4">
            <Ionicons name="alert-circle-outline" size={40} color={colors.accent} />
            <Text className="text-center text-base font-medium text-foreground dark:text-zinc-50">
              {errorMessage}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Try again"
              onPress={handleRecordAgain}
              className="rounded-2xl bg-primary px-6 py-3 active:bg-primary-dark"
            >
              <Text className="text-base font-semibold text-white">Try Again</Text>
            </Pressable>
          </View>
        ) : null}
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

function LanguageChip({ label, onPress }: Readonly<{ label: string; onPress: () => void }>) {
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
