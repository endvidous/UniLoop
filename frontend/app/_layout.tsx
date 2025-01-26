import { useEffect } from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/src/context/AuthContext";
import { AuthHandler } from "@/src/components/auth/AuthHandler";
import SplashScreen from "../src/components/SplashScreen/splashScreen";
import { useStore } from "@/src/context/store";
import { authService } from "@/src/services/api/auth";
import { StatusBar } from "react-native";

export default function RootLayout() {
  const token = useStore((state) => state.token);
  const isLoading = useStore((state) => state.isLoading);
  const initializeState = useStore((state) => state.initializeState);
  const clearAuth = useStore((state) => state.clearAuth);

  useEffect(() => {
    async function initialize() {
      if (token) {
        try {
          // Validate the token with the server
          await authService.validateToken();
        } catch (error) {
          // If token validation fails, clear storage
          clearAuth();
        }
      }

      // Initialize Zustand state
      initializeState();
    }

    initialize();
  }, [token, initializeState]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <AuthProvider>
      <StatusBar translucent={false} />
      <Stack screenOptions={{ headerShown: false }} />
      <AuthHandler />
    </AuthProvider>
  );
}
