import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  THEME: "theme",
} as const;

export const appStorage = {
  // Auth token methods
  setToken: (token: string) => {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getToken: (): string | null => {
    return storage.getString(STORAGE_KEYS.AUTH_TOKEN) || null;
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
