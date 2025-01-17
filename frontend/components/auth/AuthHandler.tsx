import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export function AuthHandler() {
  const segments = useSegments();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inProtectedGroup = segments[0] === "(authenticated)";

    if (token && user && inAuthGroup) {
      const role = user?.role as "admin" | "teacher" | "student";
      router.replace(`/(authenticated)/(${role})`);
    } else if (!token && inProtectedGroup) {
      router.replace("/(auth)");
    }
  }, [token, user, isLoading, segments, router]);

  return null;
}
