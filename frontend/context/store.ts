import { create } from "zustand";
import { appStorage } from "@/services/storage/secureStorage";

interface AppState {
  theme: "light" | "dark";
  token: string | null;
  setTheme: (theme: "light" | "dark") => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  theme: appStorage.getTheme(),
  token: appStorage.getToken(),

  setTheme: (theme) => {
    appStorage.setTheme(theme);
    set({ theme });
  },

  setToken: (token) => {
    appStorage.setToken(token);
    set({ token });
  },

  clearAuth: () => {
    appStorage.clearAll();
    set({ token: null });
  },
}));
