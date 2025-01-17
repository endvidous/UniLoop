import { create } from "zustand";
import { appStorage } from "@/services/storage/secureStorage";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
interface AppState {
  theme: "light" | "dark";
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  setTheme: (theme: "light" | "dark") => void;
  setToken: (token: string) => void;
  setLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
  initializeState: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  theme: appStorage.getTheme(),
  token: appStorage.getToken(),
  user: appStorage.getUser(),
  isLoading: true,

  setUser: (user) => {
    appStorage.setUser(user);
    set({ user });
  },

  setTheme: (theme) => {
    appStorage.setTheme(theme);
    set({ theme });
  },

  setToken: (token) => {
    appStorage.setToken(token);
    set({ token });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  clearAuth: () => {
    appStorage.clearAll();
    set({ token: null, user: null, theme: "light" }); // Reset all states
  },

  initializeState: () => {
    set({
      theme: appStorage.getTheme(),
      token: appStorage.getToken(),
      user: appStorage.getUser(),
      isLoading: false,
    });
  },
}));
