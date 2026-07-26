import { Text, View } from "react-native";

type LegalSectionProps = {
  heading: string;
  children: string;
};

export function LegalSection({ heading, children }: LegalSectionProps) {
  return (
    <View className="mb-6">
      <Text className="mb-2 text-base font-bold text-foreground dark:text-zinc-50">{heading}</Text>
      <Text className=" leading-6 text-zinc-800 dark:text-zinc-200">{children}</Text>
    </View>
  );
}
