import { useFocusEffect } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { BottomFadeGradient } from "@/components/ui/BottomFadeGradient";
import { EvidenceCard } from "@/components/ui/EvidenceCard";
import { EvidenceDashboard } from "@/components/ui/EvidenceDashboard";
import { Header } from "@/components/ui/Header";
import { TAB_BAR_BOTTOM_MARGIN, TAB_BAR_HEIGHT } from "@/constants/layout";
import { useTheme } from "@/contexts/ThemeContext";
import { useAiEvidence } from "@/hooks/useAiEvidence";
import { getThemeColors } from "@/themes/colors";
import { TranslationResult } from "@/types/conversation.types";

type MetricsTab = "dashboard" | "history";

function TabSwitcher({ active, onChange }: Readonly<{ active: MetricsTab; onChange: (tab: MetricsTab) => void }>) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <View className="mx-6 mb-2 flex-row rounded-full bg-card p-1 dark:bg-zinc-900">
      {(["dashboard", "history"] as const).map((tab) => {
        const isActive = tab === active;
        return (
          <Pressable
            key={tab}
            accessibilityRole="button"
            accessibilityLabel={tab === "dashboard" ? "Dashboard" : "History"}
            onPress={() => onChange(tab)}
            className="flex-1 items-center rounded-full py-2"
            style={isActive ? { backgroundColor: colors.primary } : undefined}
          >
            <Text
              className={`text-sm font-semibold ${isActive ? "text-white" : "text-zinc-500 dark:text-zinc-400"}`}
            >
              {tab === "dashboard" ? "Dashboard" : "History"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Metrics() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [activeTab, setActiveTab] = useState<MetricsTab>("dashboard");

  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isRefetching } =
    useAiEvidence();

  const entries = useMemo<TranslationResult[]>(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const bottomPadding = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN + insets.bottom;

  // This is a live evidence feed - it should always show current data when
  // you actually look at it, not whatever was cached (possibly empty) the
  // last time this tab happened to be visited. staleTime/refetchOnWindowFocus
  // in queryClient.ts don't cover tab-focus in Expo Router's tab navigator
  // (screens stay mounted, they don't remount on tab switch), so refetch
  // explicitly on focus instead.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <Header title="Metrics" subtitle="See the AI at work" />
      <TabSwitcher active={activeTab} onChange={setActiveTab} />

      {activeTab === "dashboard" ? (
        <EvidenceDashboard bottomPadding={bottomPadding} />
      ) : isLoading ? (
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

      {/* <BottomFadeGradient /> */}
    </View>
  );
}
