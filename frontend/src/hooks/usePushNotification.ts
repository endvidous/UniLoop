// hooks/usePushNotifications.ts
import { useState, useEffect, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/store";
import { NavigationService } from "../services/navigation";
import {
  configureNotificationHandler,
  registerPushNotifications,
} from "../services/notifications";

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { pushToken, setPushToken } = useStore();
  const [expoPushToken, setExpoPushToken] =
    useState<Notifications.ExpoPushToken>();
  const [notification, setNotification] =
    useState<Notifications.Notification>();
  const [appState, setAppState] = useState(AppState.currentState);

  // Configure notification handler on mount
  useEffect(() => {
    configureNotificationHandler({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    });
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    setAppState(nextAppState);
  };

  const handleNotification = useCallback(
    (notification: Notifications.Notification) => {
      setNotification(notification);
      NavigationService.handleNotificationNavigation(
        notification.request.content.data
      );
    },
    []
  );

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    if (pushToken) {
      setExpoPushToken(pushToken);
      return;
    }

    const token = await registerPushNotifications(user?.id);
    if (token) {
      setPushToken(token);
      setExpoPushToken(token);
    }
  }, [user?.id, pushToken, setPushToken]);

  // Notification listeners
  useEffect(() => {
    const notificationSubscription =
      Notifications.addNotificationReceivedListener(handleNotification);
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotification(response.notification);
      });

    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, [handleNotification]);

  // Initial setup
  useEffect(() => {
    const initialize = async () => {
      await registerForPushNotifications();
      const initialResponse =
        await Notifications.getLastNotificationResponseAsync();
      if (initialResponse?.notification) {
        handleNotification(initialResponse.notification);
      }
    };

    initialize();
  }, [registerForPushNotifications, handleNotification]);

  return { expoPushToken, notification };
};
