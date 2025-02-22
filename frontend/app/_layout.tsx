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
import { PaperProvider } from "react-native-paper";

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
      {/* Authentication provider that lets you use useAuth Inside any nested commponents */}
      <AuthProvider>
        {/* Theme provider that provides themes */}
        <ThemeProvider>
          {/* React native paper provider to use certain components inside it  */}
          <PaperProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
            <AuthHandler />
          </PaperProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
