import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_BAR_BOTTOM_MARGIN, TAB_BAR_HEIGHT } from "@/constants/layout";
import { ThemePreference, useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: IoniconName }[] = [
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
  { value: "system", label: "System", icon: "phone-portrait-outline" },
];

export default function Settings() {
  const insets = useSafeAreaInsets();
  const { theme, themePreference, setThemePreference } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-zinc-950"
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN + insets.bottom,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 pt-4">
        <Text className="text-2xl font-bold text-foreground dark:text-zinc-50">Settings</Text>
      </View>

      <View className="mx-6 mt-6 flex-row items-center gap-4 rounded-2xl bg-card p-4 dark:bg-zinc-900">
        <Ionicons name="person-circle" size={52} color={colors.primary} />
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground dark:text-zinc-50">Guest</Text>
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">
            Log in to sync your settings and history
          </Text>
        </View>
      </View>

      <View className="mx-6 mt-8">
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Appearance
        </Text>
        <View className="flex-row gap-3">
          {THEME_OPTIONS.map((option) => {
            const isActive = themePreference === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityLabel={`Use ${option.label.toLowerCase()} theme`}
                onPress={() => setThemePreference(option.value)}
                className={`flex-1 items-center gap-2 rounded-2xl border py-4 ${
                  isActive
                    ? "border-primary bg-primary/10"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={isActive ? colors.primary : colors.foreground}
                />
                <Text
                  className={`text-xs font-medium ${
                    isActive ? "text-primary" : "text-foreground dark:text-zinc-50"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mx-6 mt-8">
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Preferences
        </Text>
        <View className="overflow-hidden rounded-2xl bg-card dark:bg-zinc-900">
          <SettingsRow icon="globe-outline" label="App language" color={colors.foreground} />
          <SettingsRow icon="notifications-outline" label="Notifications" color={colors.foreground} />
          <SettingsRow
            icon="information-circle-outline"
            label="About DuoConvo"
            color={colors.foreground}
            isLast
          />
        </View>
      </View>
    </ScrollView>
  );
}

function SettingsRow({
  icon,
  label,
  color,
  isLast,
}: {
  icon: IoniconName;
  label: string;
  color: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center gap-3 px-4 py-4 ${
        isLast ? "" : "border-b border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text className="flex-1 text-sm font-medium text-foreground dark:text-zinc-50">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={color} />
    </View>
  );
}
