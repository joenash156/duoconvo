import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
};

export function StatCard({ icon, label, value, color }: Readonly<StatCardProps>) {
  return (
    <View className="flex-1 gap-2 rounded-2xl bg-card p-4 dark:bg-zinc-900">
      <View
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}1A` }}
      >
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <Text className="text-2xl font-bold text-foreground dark:text-zinc-50">{value}</Text>
      <Text className="text-xs text-zinc-500 dark:text-zinc-400">{label}</Text>
    </View>
  );
}
