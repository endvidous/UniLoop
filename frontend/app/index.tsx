import { Stack, Link } from "expo-router";
import React from "react";
import { View, Image, StyleSheet, Text } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Index in App",
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Text
        style={{
          textAlign: "center",
          fontSize: 20,
          fontWeight: "condensedBold",
          marginBottom: 10,
        }}
      >
        Home Screen
      </Text>
      <Link href="/(splash)" style={styles.link}>
        Go to Splash Screen
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 50,
    height: 50,
  },
  link: {
    textAlign: "center",
    padding: 14,
    borderBlockColor: "#000000",
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#4f4d4d",
    color: "#fff",
  },
});
