import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";

type HeaderProps = {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: ReactNode;
};

export function Header({ title, subtitle, showBackButton, onBackPress, rightElement }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <View style={{ paddingTop: insets.top }} className="bg-white dark:bg-zinc-950">
      <View className="flex-row items-center gap-3 px-6 pb-3 pt-3">
        {showBackButton ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBackPress ?? (() => router.back())}
            hitSlop={8}
            className="h-12 w-12 items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
          >
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text className="text-3xl font-bold text-foreground dark:text-zinc-50">{title}</Text>
          {subtitle ? (
            <Text className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</Text>
          ) : null}
        </View>
        {rightElement}
      </View>
    </View>
  );
}
