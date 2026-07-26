import LottieView from "lottie-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { TAB_BAR_BOTTOM_MARGIN, TAB_BAR_HEIGHT } from "@/constants/layout";

export default function Metrics() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <Header title="Metrics" />

      <View
        className="flex-1 items-center justify-center gap-2 px-10"
        style={{ paddingBottom: TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN + insets.bottom }}
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
          Every translation here shows how DuoConvo&apos;s own model understood your sentence
          confidence score, detected intent, and whether the model or LLM fallback answered.
        </Text>
      </View>
    </View>
  );
}
