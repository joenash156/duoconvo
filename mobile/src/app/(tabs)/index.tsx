import { useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MicButton } from "@/components/ui/MicButton";
import { TAB_BAR_BOTTOM_MARGIN, TAB_BAR_HEIGHT } from "@/constants/layout";

export default function Translate() {
  const insets = useSafeAreaInsets();
  const [isListening, setIsListening] = useState(false);

  return (
    <View
      className="flex-1 bg-white dark:bg-zinc-950"
      style={{ paddingTop: insets.top }}
    >
      <View className="px-6 pt-4">
        <Text className="text-2xl font-bold text-foreground dark:text-zinc-50">DuoConvo</Text>
        <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Speak naturally, we&apos;ll handle the rest.
        </Text>
      </View>

      <View className="flex-1 items-center justify-center gap-6 px-6">
        <MicButton isListening={isListening} onPress={() => setIsListening((prev) => !prev)} />
        <Text className="text-base font-medium text-foreground dark:text-zinc-50">
          {isListening ? "Listening..." : "Tap to speak"}
        </Text>
      </View>

      <View style={{ height: TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN + insets.bottom }} />
    </View>
  );
}
