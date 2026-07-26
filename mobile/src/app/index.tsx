import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}
      // className="font-bold"
    >
      <Text className="text-red-600 font-bold">Edit src/app/index.tsx to edit this screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
