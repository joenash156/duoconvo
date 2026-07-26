import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Image, Linking, ScrollView, Text, View } from "react-native";
import { Header } from "@/components/ui/Header";
import { SettingsRow } from "@/components/ui/SettingsRow";

export default function About() {
  const router = useRouter();
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <Header title="About DuoConvo" showBackButton />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="items-center py-8">
          <Image
            source={require("@/assets/images/icon.png")}
            style={{ width: 80, height: 80, borderRadius: 16 }}
            resizeMode="contain"
          />
          <Text className="mt-4 text-xl font-bold text-foreground dark:text-zinc-50">DuoConvo</Text>
          <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Version {version}</Text>
        </View>

        <Text className="mb-6 text-center text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          DuoConvo is an AI-powered multilingual communication assistant built for Ghanaian
          markets. It helps traders, tourists, restaurant workers, taxi drivers, receptionists,
          and customers communicate despite language barriers, powered by our own fine-tuned AI
          model.
        </Text>

        <View className="overflow-hidden rounded-2xl bg-card dark:bg-zinc-900">
          <SettingsRow
            icon="document-text-outline"
            label="Privacy Policy"
            onPress={() => router.push("/(legal)/privacy-policy")}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Terms of Use"
            onPress={() => router.push("/(legal)/terms-of-use")}
          />
          <SettingsRow
            icon="mail-outline"
            label="Contact Support"
            onPress={() => Linking.openURL("mailto:support@duoconvo.app")}
            isLast
          />
        </View>

        <Text className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Made with care for Ghana 🇬🇭
        </Text>
      </ScrollView>
    </View>
  );
}
