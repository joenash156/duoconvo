import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { getLanguageLabel, LanguageCode } from "@/constants/languages";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";
import { TranslationResult } from "@/types/conversation.types";

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EvidenceCard({ entry }: { entry: TranslationResult }) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const isModelSourced = entry.source === "model";

  return (
    <View className="mb-3 rounded-2xl bg-card p-4 dark:bg-zinc-900">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-zinc-500 dark:text-zinc-400">{formatTimestamp(entry.timestamp)}</Text>
        <View
          className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 ${
            isModelSourced ? "bg-primary/10" : "bg-accent/10"
          }`}
        >
          <Ionicons
            name={isModelSourced ? "sparkles" : "cloud-outline"}
            size={11}
            color={isModelSourced ? colors.primary : colors.accent}
          />
          <Text className="text-xs font-semibold" style={{ color: isModelSourced ? colors.primary : colors.accent }}>
            {isModelSourced ? "DuoConvo AI" : "LLM Fallback"}
          </Text>
        </View>
      </View>

      <Text className="mt-2 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {getLanguageLabel(entry.spokenLanguage as LanguageCode)} → {getLanguageLabel(entry.targetLanguage as LanguageCode)}
      </Text>

      <Text className="mt-1 text-sm text-foreground dark:text-zinc-50">{entry.originalText}</Text>
      {entry.sttText && entry.sttText !== entry.originalText ? (
        <Text className="mt-0.5 text-xs italic text-zinc-500 dark:text-zinc-400">STT: &ldquo;{entry.sttText}&rdquo;</Text>
      ) : null}

      <Text className="mt-2 text-base font-semibold text-foreground dark:text-zinc-50">→ {entry.translatedText}</Text>

      <View className="mt-2 flex-row items-center gap-4">
        <Text className="text-xs text-zinc-400 dark:text-zinc-500">
          Confidence: {Math.round(entry.similarityScore * 100)}%
        </Text>
        {entry.detectedIntent ? (
          <Text className="text-xs text-zinc-400 dark:text-zinc-500">Intent: {entry.detectedIntent}</Text>
        ) : null}
      </View>
    </View>
  );
}
