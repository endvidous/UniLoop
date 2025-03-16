// services/navigation.ts
import { RelativePathString, useRouter, useSegments } from "expo-router";

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
  private static isDeepLink: boolean = false;

  static initialize(router: ReturnType<typeof useRouter>, role: string) {
    this.router = router;
    this.currentRole = role;
  }

  static setIsDeepLink(value: boolean) {
    this.isDeepLink = value;
  }

  static handleNotificationNavigation(data: Record<string, any>) {
    if (!this.router || !this.currentRole) {
      console.warn("NavigationService not initialized");
      return;
    }

    const handler =
      NOTIFICATION_ROUTES[data.type] || NOTIFICATION_ROUTES.default;
    const path = handler(data, this.currentRole);

    if (this.isDeepLink) {
      this.setIsDeepLink(false); // Reset the flag
      this.router.replace(path);
    } else {
      this.router.replace(path);
    }
  }

  static handleDeepLinkCheck(segments: string[] | undefined) {
    if (!this.router) {
      console.warn("NavigationService not initialized");
      return;
    }

    if (segments && segments.includes("[announcementId]")) {
      this.setIsDeepLink(true);
    }
  }
}
