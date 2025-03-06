import { create } from "zustand";
import { appStorage } from "@/src/services/storage/secureStorage";
import { User } from "@/src/utils/interfaces";
import * as Notifications from "expo-notifications";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

interface ThemeState {
  theme: "light" | "dark";
}

interface PushToken {
  pushToken: Notifications.ExpoPushToken | null;
}

interface AppState extends AuthState, ThemeState, PushToken {
  // Auth Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setPushToken: (pushToken: Notifications.ExpoPushToken) => void;
  setLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
  initializeState: () => Promise<void>;

  // Theme Actions
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;

  // Utility
  isAuthenticated: () => boolean;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  theme: "light",
  token: null,
  user: null,
  pushToken: null,
  isLoading: true,

  // Auth Actions
  setUser: (user) => {
    if (user) appStorage.setUser(user);
    else appStorage.removeUser();
    set({ user });
  },

  setToken: (token) => {
    if (token) appStorage.setToken(token);
    else appStorage.removeToken();
    set({ token });
  },

  setPushToken: (pushToken) => {
    if (pushToken) {
      appStorage.setPushToken(pushToken);
    } else {
      appStorage.removePushToken();
    }
    set({ pushToken });
  },

  setLoading: (isLoading) => set({ isLoading }),

  clearAuth: () => {
    appStorage.removeToken();
    appStorage.removeUser();
    set({ token: null, user: null, pushToken: null });
  },

  initializeState: async () => {
    try {
      const [theme, token, user, pushToken] = await Promise.all([
        appStorage.getTheme(),
        appStorage.getToken(),
        appStorage.getUser(),
        appStorage.getPushToken(),
      ]);

      set({
        theme: theme || "light",
        token,
        user,
        pushToken,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to initialize state:", error);
      set({ isLoading: false });
    }
  },

  // Theme Actions
  setTheme: (theme) => {
    appStorage.setTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light";
    appStorage.setTheme(newTheme);
    set({ theme: newTheme });
  },

  // Utility
  isAuthenticated: () => {
    return !!get().token && !!get().user;
  },
}));
