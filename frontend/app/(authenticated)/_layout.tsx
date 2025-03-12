import { RelativePathString, Slot, router } from "expo-router";
import { NotificationProvider } from "@/src/components/Notifications/NotificationProvider";
import { usePushNotifications } from "@/src/hooks/usePushNotification";
import { useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";

export default function AuthenticatedLayout() {
  const { user } = useAuth();
  useEffect(() => {
    // Force reset to home on initial load
    router.navigate(`/(authenticated)/(${user?.role})` as RelativePathString);
  }, []);

  return (
    <NotificationProvider>
      <Slot screenOptions={{ headerShown: false }} />
    </NotificationProvider>
  );
}
