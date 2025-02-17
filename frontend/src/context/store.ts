import { create } from "zustand";
import { appStorage } from "@/src/services/storage/secureStorage";
import { User } from "@/src/utils/interfaces";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

interface ThemeState {
  theme: "light" | "dark";
}

interface AppState extends AuthState, ThemeState {
  // Auth Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
  initializeState: () => Promise<void>;

  // Theme Actions
  setTheme: (theme: "light" | "dark") => void;

  // Utility
  isAuthenticated: () => boolean;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  theme: "light",
  token: null,
  user: null,
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

  setLoading: (isLoading) => set({ isLoading }),

  clearAuth: () => {
    appStorage.removeToken();
    appStorage.removeUser();
    set({ token: null, user: null });
  },

  initializeState: async () => {
    try {
      const [theme, token, user] = await Promise.all([
        appStorage.getTheme(),
        appStorage.getToken(),
        appStorage.getUser(),
      ]);

      set({
        theme: theme || "light",
        token,
        user,
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

  // Utility
  isAuthenticated: () => {
    return !!get().token && !!get().user;
  },
}));
