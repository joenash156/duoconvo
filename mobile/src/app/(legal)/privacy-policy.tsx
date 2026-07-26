import { ScrollView, Text, View } from "react-native";
import { Header } from "@/components/ui/Header";
import { LegalSection } from "@/components/ui/LegalSection";

export default function PrivacyPolicy() {
  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <Header title="Privacy Policy" showBackButton />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="mb-6 text-xs text-zinc-700 dark:text-zinc-300">Last updated: July 26, 2026</Text>

        <LegalSection heading="Overview">
          DuoConvo provides an AI-powered multilingual communication
          assistant. This Privacy Policy explains what information we collect, how we use it, and
          the choices you have when you use the DuoConvo mobile application.
        </LegalSection>

        <LegalSection heading="Information We Collect">
          When you use DuoConvo, we may collect the audio you record for translation, the text
          transcribed from that audio, the languages you select, and basic device information
          such as device type and operating system. If you create an account, we also collect the
          information you provide, such as your name and email address.
        </LegalSection>

        <LegalSection heading="How We Use Your Information">
          We use this information to provide and improve translation results, evaluate and
          improve the accuracy of our AI models, maintain your conversation history when you are
          signed in, and diagnose technical issues. We do not sell your personal information.
        </LegalSection>

        <LegalSection heading="Third-Party Services">
          DuoConvo relies on third-party providers for functions such as speech-to-text
          conversion and, in some cases, large language model fallback when our own model is not
          confident enough in a translation. These providers process the minimum data required to
          perform their function and are bound by their own privacy and security obligations.
        </LegalSection>

        <LegalSection heading="Data Retention">
          We retain conversation data for as long as your account is active or as needed to
          provide the service. You may request deletion of your account and associated data at
          any time by contacting us.
        </LegalSection>

        <LegalSection heading="Your Rights">
          Depending on your location, you may have the right to access, correct, export, or
          delete the personal information we hold about you. You can exercise these rights by
          contacting us using the details below.
        </LegalSection>

        <LegalSection heading="Children's Privacy">
          DuoConvo is not directed at children under the age of 13, and we do not knowingly
          collect personal information from children.
        </LegalSection>

        <LegalSection heading="Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of material
          changes by updating the &quot;Last updated&quot; date above.
        </LegalSection>

        <LegalSection heading="Contact Us">
          If you have questions about this Privacy Policy, please contact us at
          support@duoconvo.app.
        </LegalSection>
      </ScrollView>
    </View>
  );
}
