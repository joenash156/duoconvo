import { ScrollView, Text, View } from "react-native";
import { Header } from "@/components/ui/Header";
import { LegalSection } from "@/components/ui/LegalSection";

export default function TermsOfUse() {
  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <Header title="Terms of Use" showBackButton />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="mb-6 text-xs text-zinc-700 dark:text-zinc-300">Last updated: July 26, 2026</Text>

        <LegalSection heading="Acceptance of Terms">
          By accessing or using DuoConvo, you agree to be bound by these Terms of Use. If you do
          not agree to these terms, please do not use the application.
        </LegalSection>

        <LegalSection heading="Description of Service">
          DuoConvo is an AI-powered multilingual communication assistant that converts spoken or
          written language into another language using our own trained model, with a large
          language model used as an occasional fallback.
        </LegalSection>

        <LegalSection heading="Acceptable Use">
          You agree to use DuoConvo only for lawful purposes and in a way that does not infringe
          the rights of, or restrict or inhibit the use and enjoyment of the application by, any
          third party.
        </LegalSection>

        <LegalSection heading="AI-Generated Content Disclaimer">
          Translations produced by DuoConvo are generated automatically and may not always be
          fully accurate. Confidence scores are provided as a guide only. DuoConvo should not be
          relied upon for legal, medical, or other situations where a certified human translation
          is required.
        </LegalSection>

        <LegalSection heading="User Responsibilities">
          You are responsible for the content you submit for translation and for ensuring you
          have the right to share that content. You must not use DuoConvo to transmit unlawful,
          abusive, or infringing material.
        </LegalSection>

        <LegalSection heading="Intellectual Property">
          DuoConvo and its original content, features, and functionality are owned by DuoConvo and
          are protected by applicable intellectual property laws.
        </LegalSection>

        <LegalSection heading="Termination">
          We may suspend or terminate your access to DuoConvo at any time if you violate these
          Terms of Use.
        </LegalSection>

        <LegalSection heading="Limitation of Liability">
          DuoConvo is provided &quot;as is&quot; without warranties of any kind. To the fullest extent
          permitted by law, DuoConvo shall not be liable for any indirect, incidental, or
          consequential damages arising from your use of the application.
        </LegalSection>

        <LegalSection heading="Governing Law">
          These Terms of Use are governed by the laws of the Republic of Ghana, without regard to
          its conflict of law provisions.
        </LegalSection>

        <LegalSection heading="Changes to These Terms">
          We may revise these Terms of Use from time to time. Continued use of DuoConvo after
          changes take effect constitutes acceptance of the revised terms.
        </LegalSection>

        <LegalSection heading="Contact Us">
          If you have questions about these Terms of Use, please contact us at
          support@duoconvo.app.
        </LegalSection>
      </ScrollView>
    </View>
  );
}
