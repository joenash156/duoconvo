import LottieView from "lottie-react-native";
import React, { useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EvidenceCard } from "@/components/ui/EvidenceCard";
import { Header } from "@/components/ui/Header";
import { TAB_BAR_BOTTOM_MARGIN, TAB_BAR_HEIGHT } from "@/constants/layout";
import { useTheme } from "@/contexts/ThemeContext";
import { useAiEvidence } from "@/hooks/useAiEvidence";
import { getThemeColors } from "@/themes/colors";
import { TranslationResult } from "@/types/conversation.types";

export default function Metrics() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isRefetching } =
    useAiEvidence();

  const entries = useMemo<TranslationResult[]>(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const bottomPadding = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN + insets.bottom;

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <Header title="Metrics" subtitle="See the AI at work" />

      {isLoading ? (
        <View className="flex-1 items-center justify-center" style={{ paddingBottom: bottomPadding }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-10" style={{ paddingBottom: bottomPadding }}>
          <Text className="text-center text-base font-medium text-foreground dark:text-zinc-50">
            Couldn&apos;t load the AI evidence feed.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry"
            onPress={() => refetch()}
            className="rounded-2xl bg-primary px-6 py-3 active:bg-primary-dark"
          >
            <Text className="text-base font-semibold text-white">Try Again</Text>
          </Pressable>
        </View>
      ) : entries.length === 0 ? (
        <View
          className="flex-1 items-center justify-center gap-2 px-10"
          style={{ paddingBottom: bottomPadding }}
        >
          <LottieView
            source={require("@/assets/icons/animated/metrics.json")}
            autoPlay
            loop
            style={{ width: 220, height: 124 }}
            webStyle={{ width: 220, height: 124 }}
          />
          <Text className="text-center text-lg font-semibold text-foreground dark:text-zinc-50">
            See the AI at work
          </Text>
          <Text className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Every translation here shows how DuoConvo&apos;s own model understood your sentence -
            confidence score, detected intent, and whether the model or LLM fallback answered.
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EvidenceCard entry={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: bottomPadding }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
