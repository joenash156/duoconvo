import LottieView from "lottie-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { TAB_BAR_BOTTOM_MARGIN, TAB_BAR_HEIGHT } from "@/constants/layout";

export default function History() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <Header title="History" />

      <View
        className="flex-1 items-center justify-center gap-2 px-10"
        style={{ paddingBottom: TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN + insets.bottom }}
      >
        <LottieView
          source={require("@/assets/icons/animated/history.json")}
          autoPlay
          loop
          style={{ width: 140, height: 140 }}
          webStyle={{ width: 140, height: 140 }}
        />
        <Text className="text-center text-lg font-semibold text-foreground dark:text-zinc-50">
          Keep your conversations
        </Text>
        <Text className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Log in to keep your translation history and pick up where you left off.
        </Text>
      </View>
    </View>
  );
}
