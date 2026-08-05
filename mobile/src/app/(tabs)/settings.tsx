import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { OptionsModal } from "@/components/ui/OptionsModal";
import { SettingsRow } from "@/components/ui/SettingsRow";
import { TAB_BAR_BOTTOM_MARGIN, TAB_BAR_HEIGHT } from "@/constants/layout";
import { ThemePreference, useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";

const THEME_LABELS: Record<ThemePreference, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, themePreference, setThemePreference } = useTheme();
  const colors = getThemeColors(theme);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <Header title="Settings" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-6 flex-row items-center gap-4 rounded-2xl bg-card p-4 dark:bg-zinc-900">
          <Ionicons name="person-circle" size={52} color={colors.primary} />
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground dark:text-zinc-50">Guest</Text>
            <Text className="text-sm text-zinc-500 dark:text-zinc-400">
              Log in to sync your settings and history
            </Text>
          </View>
        </View>

        <SectionLabel>Preferences</SectionLabel>
        <View className="mx-6 overflow-hidden rounded-2xl bg-card dark:bg-zinc-900">
          <SettingsRow
            icon="color-palette-outline"
            label="Appearance"
            value={THEME_LABELS[themePreference]}
            onPress={() => setThemeModalVisible(true)}
          />
          <SettingsRow icon="globe-outline" label="App language" />
          <SettingsRow icon="notifications-outline" label="Notifications" />
          <SettingsRow
            icon="information-circle-outline"
            label="About DuoConvo"
            onPress={() => router.push("/about")}
            isLast
          />
        </View>

        <SectionLabel>Legal</SectionLabel>
        <View className="mx-6 overflow-hidden rounded-2xl bg-card dark:bg-zinc-900">
          <SettingsRow
            icon="document-text-outline"
            label="Privacy Policy"
            onPress={() => router.push("/(legal)/privacy-policy")}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Terms of Use"
            onPress={() => router.push("/(legal)/terms-of-use")}
            isLast
          />
        </View>

        <SectionLabel>Account</SectionLabel>
        <View className="mx-6 overflow-hidden rounded-2xl bg-card dark:bg-zinc-900">
          <SettingsRow icon="person-outline" label="Sign In / Register" />
          {/* <SettingsRow icon="person-outline" label="Register" isLast /> */}
        </View>
      </ScrollView>

      <OptionsModal
        visible={isThemeModalVisible}
        title="Appearance"
        options={[
          { value: "light", label: "Light", icon: "sunny-outline" },
          { value: "dark", label: "Dark", icon: "moon-outline" },
          { value: "system", label: "System", icon: "phone-portrait-outline" },
        ]}
        selectedValue={themePreference}
        onSelect={setThemePreference}
        onClose={() => setThemeModalVisible(false)}
      />
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="mb-3 ml-6 mt-8 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
      {children}
    </Text>
  );
}
