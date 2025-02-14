import { useEffect } from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/src/context/AuthContext";
import { AuthHandler } from "@/src/components/auth/AuthHandler";
import SplashScreen from "../src/components/SplashScreen/splashScreen";
import { useStore } from "@/src/context/store";
import { authService } from "@/src/services/api/auth";
import { StatusBar } from "react-native";

export default function RootLayout() {
  const {
    token,
    isLoading,
    setLoading,
    initializeState,
    clearAuth,
    setToken,
    setUser,
  } = useStore();

  // Single source of truth for initial state
  useEffect(() => {
    const initAuthState = async () => {
      setLoading(true);
      try {
        await initializeState();

        if (token) {
          // Handle token validation and potential refresh
          const { newToken, user } = await authService.validateToken();

          if (newToken) {
            setToken(newToken);
            setUser(user);
          }
        }
      } catch (error) {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuthState();
  }, []);

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
