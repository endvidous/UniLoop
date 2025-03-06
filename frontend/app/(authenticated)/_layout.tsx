import { Stack } from "expo-router";
import { NotificationProvider } from "@/src/components/Notifications/NotificationProvider";

export default function AuthenticatedLayout() {
  return (
    <NotificationProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </NotificationProvider>
  );
}
