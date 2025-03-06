// services/notifications.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { toast } from "@backpackapp-io/react-native-toast";
import axiosInstance from "./api/axiosConfig";

type NotificationConfig = {
  shouldShowAlert: boolean;
  shouldPlaySound: boolean;
  shouldSetBadge: boolean;
};

export const configureNotificationHandler = (config: NotificationConfig) => {
  Notifications.setNotificationHandler({
    handleNotification: async () => config,
  });
};

export const registerPushNotifications = async (userId?: string) => {
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return null;
  }

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      toast.error("Notification permission required");
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const token = await Notifications.getExpoPushTokenAsync({ projectId });

    if (!token?.data) {
      console.log("Failed to obtain a valid push token");
      return null;
    }

    if (userId) {
      try {
        await axiosInstance.post("/save-pushtoken", {
          token: token.data,
          platform: Platform.OS,
        });
      } catch (error) {
        console.error("Error saving push token:", error);
      }
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
      });
    }

    return token;
  } catch (error) {
    console.error("Push notification registration failed:", error);
    toast.error("Failed to configure notifications");
    return null;
  }
};
