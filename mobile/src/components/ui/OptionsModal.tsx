import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeColors } from "@/themes/colors";
import { IoniconName } from "@/types/icon.types";

export type OptionItem<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: IoniconName;
};

type OptionsModalProps<T extends string> = {
  visible: boolean;
  title: string;
  options: OptionItem<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

export function OptionsModal<T extends string>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: OptionsModalProps<T>) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          className="absolute inset-0 bg-black/40"
        />
        <View
          className="rounded-t-3xl bg-white px-4 pt-3 dark:bg-zinc-900"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="mb-3 h-1 w-10 self-center rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <Text className="mb-2 px-2 text-lg text-center font-bold text-foreground dark:text-zinc-50">
            {title}
          </Text>
          {options.map((option) => {
            const isSelected = option.value === selectedValue;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                className="flex-row items-center gap-3 rounded-2xl px-3 py-3.5 active:bg-card dark:active:bg-zinc-800"
              >
                {option.icon ? (
                  <Ionicons name={option.icon} size={20} color={isSelected ? colors.primary : colors.foreground} />
                ) : null}
                <View className="flex-1">
                  <Text
                    className={
                      isSelected
                        ? "text-base font-semibold text-primary"
                        : "text-base font-medium text-foreground dark:text-zinc-50"
                    }
                  >
                    {option.label}
                  </Text>
                  {option.description ? (
                    <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {option.description}
                    </Text>
                  ) : null}
                </View>
                {isSelected ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
