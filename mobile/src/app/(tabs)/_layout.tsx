import { StyleSheet, Text, View } from 'react-native'
import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
       />
      <Tabs.Screen
        name="settings"
       />
    </Tabs>
  )
}

const styles = StyleSheet.create({})