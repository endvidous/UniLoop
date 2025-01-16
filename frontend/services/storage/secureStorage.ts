import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  THEME: "theme",
  USER: "user",
} as const;

export const appStorage = {
  // Auth token methods
  setToken: (token: string) => {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getToken: (): string | null => {
    return storage.getString(STORAGE_KEYS.AUTH_TOKEN) || null;
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
