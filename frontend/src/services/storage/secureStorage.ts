import { MMKV } from "react-native-mmkv";
import { User } from "../../utils/interfaces";
import * as Notifications from "expo-notifications";

const storage = new MMKV();
const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  THEME: "theme",
  USER: "user",
  PUSH_TOKEN: "push_token",
} as const;

export const appStorage = {
  // Auth token methods
  setToken: (token: string) => {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getToken: (): string | null => {
    return storage.getString(STORAGE_KEYS.AUTH_TOKEN) || null;
  },

  removeToken: (): void => {
    storage.delete(STORAGE_KEYS.AUTH_TOKEN);
  },

  setPushToken: (pushToken: Notifications.ExpoPushToken) => {
    storage.set(STORAGE_KEYS.PUSH_TOKEN, JSON.stringify(pushToken));
  },

  getPushToken: (): Notifications.ExpoPushToken | null => {
    try {
      const tokenString = storage.getString(STORAGE_KEYS.PUSH_TOKEN);
      return tokenString
        ? (JSON.parse(tokenString) as Notifications.ExpoPushToken)
        : null;
    } catch (error) {
      console.error("Failed to parse push token:", error);
      return null;
    }
  },

  removePushToken: (): void => {
    storage.delete(STORAGE_KEYS.PUSH_TOKEN);
  },

  setUser: (user: User) => {
    storage.set(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getUser: (): User | null => {
    try {
      const userString = storage.getString(STORAGE_KEYS.USER);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      return null;
    }
  },

  removeUser: (): void => {
    storage.delete(STORAGE_KEYS.USER);
  },

  // Theme methods
  setTheme: (theme: "light" | "dark") => {
    storage.set(STORAGE_KEYS.THEME, theme);
  },

  getTheme: (): "light" | "dark" => {
    return (
      (storage.getString(STORAGE_KEYS.THEME) as "light" | "dark") || "light"
    );
  },

  //Don't use unless the user is logging out
  clearAll: () => {
    storage.clearAll();
  },
};
