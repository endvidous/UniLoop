// components/NotificationProvider.tsx
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { NavigationService } from "@/src/services/navigation";

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role) {
      NavigationService.initialize(router, user.role);
    }
  }, [router, user?.role]);

  return children;
};
