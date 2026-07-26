import { getThemeColors } from '@/themes/colors'
import { useTheme } from '@/contexts/ThemeContext'
import { View, Text } from 'react-native'


export default function Home() {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const colors = getThemeColors(true);

  const {
    bg: bgColor,
    text: textColor
  } = colors

  return (
    <View className={`${bgColor} flex-1 items-center justify-center`}>
      <Text className={`${textColor}`}>Welcome back</Text>
    </View>
  )
}