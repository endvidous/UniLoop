import { useEffect } from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { AuthHandler } from "@/components/auth/AuthHandler";
import SplashScreen from "./(splash)/splashScreen";
import { useStore } from "@/context/store";
import { appStorage } from "@/services/storage/secureStorage";
import { authService } from "@/services/api/auth";

export default function RootLayout() {
  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const isLoading = useStore((state) => state.isLoading);
  const initializeState = useStore((state) => state.initializeState);

  useEffect(() => {
    async function initialize() {
      // Only validate token if it's available and valid
      if (token) {
        try {
          // Validate the token with the server
          await authService.validateToken();
        } catch (error) {
          // If token validation fails, clear storage
          appStorage.clearAll();
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
      <Stack screenOptions={{ headerShown: false }} />
      <AuthHandler />
    </AuthProvider>
  );
}
