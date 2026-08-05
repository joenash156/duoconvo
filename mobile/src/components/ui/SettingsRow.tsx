import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";
import { IoniconName } from "@/types/icon.types";

type SettingsRowProps = {
  icon: IoniconName;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
};

// const isLastRowStyle = isLast ? "" : "border-b border-zinc-200 dark:border-zinc-800";

export function SettingsRow({ icon, label, value, onPress, isLast }: SettingsRowProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={`flex-row items-center gap-3 px-4 py-4 active:bg-black/5 dark:active:bg-white/5`}
    >
      <Ionicons name={icon} size={20} color={colors.foreground} />
      <Text className="flex-1 text-sm font-medium text-foreground dark:text-zinc-50">{label}</Text>
      {value ? <Text className="text-sm text-zinc-500 dark:text-zinc-400">{value}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.foreground} />
    </Pressable>
  );
}
