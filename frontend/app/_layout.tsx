import { useStore } from "@/context/store";
import { appStorage } from "@/services/storage/secureStorage";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import SplashScreen from "./(splash)/splashScreen";

const PROTECTED_SEGMENTS = ["(authenticated)"];
const AUTH_SEGMENTS = ["(auth)"];

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const token = useStore((state) => state.token);
  const setToken = useStore((state) => state.setToken);

  useEffect(() => {
    async function initializeAuth() {
      try {
        const storedToken = await appStorage.getToken();
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (err) {
        console.error("Failed to inilize auth:", err);
      } finally {
        setIsInitialized(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    }

    initializeAuth();
  }, []);

  useEffect(() => {
    if (isLoading || !isInitialized) return;

    const inProtectedRoute = PROTECTED_SEGMENTS.some(
      (segment) => segments[0] === segment
    );
    const inAuthRoute = AUTH_SEGMENTS.some(
      (segment) => segments[0] === segment
    );

    if (!token && inProtectedRoute) {
      router.replace("/(auth)");
    } else if (token && inAuthRoute) {
      router.replace("/(authenticated)/(student)");
    }
  }, [token, segments, isLoading, isInitialized]);

  if (isLoading || !isInitialized) {
    return <SplashScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
