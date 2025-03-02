import { useEffect } from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/src/context/AuthContext";
import { AuthHandler } from "@/src/components/auth/AuthHandler";
import SplashScreen from "../src/components/SplashScreen/splashScreen";
import { useStore } from "@/src/context/store";
import { authService } from "@/src/services/api/auth";
import { queryClient } from "@/src/services/api/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/src/context/ThemeProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toasts } from "@backpackapp-io/react-native-toast";

export default function RootLayout() {
  const {
    token,
    user,
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
          const { newToken, user: validatedUser } =
            await authService.validateToken();
          if (newToken) {
            setToken(newToken);
          }
          if (JSON.stringify(user) !== JSON.stringify(validatedUser)) {
            setUser(validatedUser);
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
    // React-query provider to make sure query functions work
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView>
          {/* Authentication provider that lets you use useAuth Inside any nested commponents */}
          <AuthProvider>
            {/* Theme provider that provides themes */}
            <ThemeProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              />
              <Toasts />
              <AuthHandler />
            </ThemeProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
