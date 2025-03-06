// services/navigation.ts
import { RelativePathString, useRouter } from "expo-router";

type NotificationNavigationMap = {
  [key: string]: (
    data: Record<string, any>,
    role?: string
  ) => RelativePathString;
};

export const NOTIFICATION_ROUTES: NotificationNavigationMap = {
  announcement: (data, role) =>
    `/(authenticated)/(${role})/Announcements/${data.id}` as RelativePathString,
  default: (_data, role) =>
    `/(authenticated)/(${role})/Home` as RelativePathString,
};

export class NavigationService {
  private static router: ReturnType<typeof useRouter> | null = null;
  private static currentRole: string | null = null;

  static initialize(router: ReturnType<typeof useRouter>, role: string) {
    this.router = router;
    this.currentRole = role;
  }

  static handleNotificationNavigation(data: Record<string, any>) {
    if (!this.router || !this.currentRole) {
      console.warn("NavigationService not initialized");
      return;
    }

    const handler =
      NOTIFICATION_ROUTES[data.type] || NOTIFICATION_ROUTES.default;
    const path = handler(data, this.currentRole);
    this.router.push(path);
  }
}
