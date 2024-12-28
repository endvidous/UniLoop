import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import * as SplashScreen from "expo-splash-screen";

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();
        // Simulate a task (e.g., fetching assets or initializing app state)
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide the splash screen
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!isReady) {
    return null; // Keep showing the splash screen
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Uniloop</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
