import { useEffect } from "react";
import { RelativePathString, useRouter, useSegments } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

export function AuthHandler() {
  const segments = useSegments();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    const inProtectedGroup = segments[0] === "(authenticated)";

    if (token && user && inAuthGroup) {
      router.replace(
        `/(authenticated)/(${user.role})/Home` as RelativePathString
      );
    } else if (!token && inProtectedGroup) {
      router.replace("/(auth)");
    }
  }, [token, user, isLoading, segments, router]);

  return null;
}
