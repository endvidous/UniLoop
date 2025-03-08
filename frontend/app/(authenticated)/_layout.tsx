import { Stack } from "expo-router";
import { NotificationProvider } from "@/src/components/Notifications/NotificationProvider";
import { usePushNotifications } from "@/src/hooks/usePushNotification";
export default function AuthenticatedLayout() {
  const { expoPushToken, notification } = usePushNotifications();
  return (
    <NotificationProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </NotificationProvider>
  );
}
