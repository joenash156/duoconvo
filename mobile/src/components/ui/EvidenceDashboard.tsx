import LottieView from "lottie-react-native";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { StatCard } from "@/components/ui/StatCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useEvidenceSummary } from "@/hooks/useEvidenceSummary";
import { getThemeColors } from "@/themes/colors";

function humanizeIntent(intent: string): string {
  return intent
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export function EvidenceDashboard({ bottomPadding }: Readonly<{ bottomPadding: number }>) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { data, isLoading, isError, refetch } = useEvidenceSummary();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ paddingBottom: bottomPadding }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-10" style={{ paddingBottom: bottomPadding }}>
        <Text className="text-center text-base font-medium text-foreground dark:text-zinc-50">
          Couldn&apos;t load the dashboard.
        </Text>
        <Text onPress={() => refetch()} className="text-sm font-semibold text-primary">
          Try Again
        </Text>
      </View>
    );
  }

  if (data.totalTranslations === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-2 px-10" style={{ paddingBottom: bottomPadding }}>
        <LottieView
          source={require("@/assets/icons/animated/metrics.json")}
          autoPlay
          loop
          style={{ width: 220, height: 124 }}
          webStyle={{ width: 220, height: 124 }}
        />
        <Text className="text-center text-lg font-semibold text-foreground dark:text-zinc-50">
          Nothing to summarize yet
        </Text>
        <Text className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Once you make a few translations, this tab will summarize how DuoConvo&apos;s AI has been performing.
        </Text>
      </View>
    );
  }

  const pieData = [
    { value: data.modelSourcedCount, color: colors.primary, text: `${data.modelSourcedCount}` },
    ...(data.llmFallbackCount > 0
      ? [{ value: data.llmFallbackCount, color: colors.accent, text: `${data.llmFallbackCount}` }]
      : []),
  ];

  const barData = data.byIntent.map((row) => ({
    value: row.count,
    label: humanizeIntent(row.intent),
    frontColor: colors.secondary,
  }));

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: bottomPadding, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row gap-3">
        <StatCard
          icon="chatbubbles-outline"
          label="Total Translations"
          value={`${data.totalTranslations}`}
          color={colors.primary}
        />
        <StatCard
          icon="sparkles-outline"
          label="Avg. Confidence"
          value={data.averageSimilarityScore !== null ? `${Math.round(data.averageSimilarityScore * 100)}%` : "—"}
          color={colors.secondary}
        />
      </View>
      <View className="flex-row gap-3">
        <StatCard
          icon="time-outline"
          label="Avg. Response Time"
          value={data.averageResponseTimeMs !== null ? `${Math.round(data.averageResponseTimeMs)}ms` : "—"}
          color={colors.accent}
        />
        <StatCard
          icon="globe-outline"
          label="Languages Used"
          value={`${data.languagesUsed}`}
          color={colors.primary}
        />
      </View>

      <View className="rounded-2xl bg-card p-4 dark:bg-zinc-900">
        <Text className="mb-4 text-base font-semibold text-foreground dark:text-zinc-50">
          Model vs. LLM Fallback
        </Text>
        <View className="flex-row items-center gap-6">
          <PieChart
            data={pieData}
            donut
            radius={70}
            innerRadius={45}
            innerCircleColor={theme === "dark" ? "#18181B" : "#F4F4F5"}
            centerLabelComponent={() => (
              <Text className="text-lg font-bold text-foreground dark:text-zinc-50">
                {Math.round((data.modelSourcedCount / data.totalTranslations) * 100)}%
              </Text>
            )}
          />
          <View className="gap-3">
            <LegendRow color={colors.primary} label="DuoConvo AI" count={data.modelSourcedCount} />
            {data.llmFallbackCount > 0 ? (
              <LegendRow color={colors.accent} label="LLM Fallback" count={data.llmFallbackCount} />
            ) : null}
          </View>
        </View>
      </View>

      <View className="rounded-2xl bg-card p-4 dark:bg-zinc-900">
        <Text className="mb-4 text-base font-semibold text-foreground dark:text-zinc-50">
          Translations by Intent
        </Text>
        <BarChart
          data={barData}
          horizontal
          // gifted-charts swaps width/height under horizontal={true} (its
          // own source: heightFromProps = horizontal ? props.width :
          // props.height) - `width` is what actually controls the vertical
          // space reserved for all the bar rows here, not `height`.
          width={Math.max(barData.length * 34, 120)}
          height={220}
          barWidth={16}
          spacing={22}
          barBorderRadius={4}
          labelWidth={100}
          xAxisLabelTextStyle={{ color: colors.foreground, fontSize: 11 }}
          yAxisTextStyle={{ color: colors.foreground, fontSize: 11 }}
          hideYAxisText={false}
          noOfSections={3}
          xAxisColor="transparent"
          yAxisColor="transparent"
          isAnimated
        />
      </View>
    </ScrollView>
  );
}

function LegendRow({ color, label, count }: Readonly<{ color: string; label: string; count: number }>) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-sm text-foreground dark:text-zinc-50">
        {label} <Text className="text-zinc-400 dark:text-zinc-500">({count})</Text>
      </Text>
    </View>
  );
}
