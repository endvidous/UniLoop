// components/NotificationProvider.tsx
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { NavigationService } from "@/src/services/navigation";
import { usePushNotifications } from "@/src/hooks/usePushNotification";

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { expoPushToken, notification } = usePushNotifications();
  useEffect(() => {
    if (user?.role) {
      NavigationService.initialize(router, user.role);
    }
  }, [router, user?.role]);

  return children;
};
