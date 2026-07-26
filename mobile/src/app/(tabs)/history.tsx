import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_BAR_BOTTOM_MARGIN, TAB_BAR_HEIGHT } from "@/constants/layout";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";

export default function History() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <View
      className="flex-1 bg-white dark:bg-zinc-950"
      style={{ paddingTop: insets.top }}
    >
      <View className="px-6 pt-4">
        <Text className="text-2xl font-bold text-foreground dark:text-zinc-50">History</Text>
      </View>

      <View
        className="flex-1 items-center justify-center gap-4 px-10"
        style={{ paddingBottom: TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN + insets.bottom }}
      >
        <View className="h-16 w-16 items-center justify-center rounded-full bg-card dark:bg-zinc-900">
          <Ionicons name="lock-closed-outline" size={28} color={colors.foreground} />
        </View>
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
