import { createContext, useContext, useCallback, useEffect } from "react";
import { useStore } from "./store";
import { authService } from "@/services/api/auth";
import { appStorage } from "@/services/storage/secureStorage";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return auth;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Using Zustand store for user, token, and loading state

  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const isLoading = useStore((state) => state.isLoading);
  const setUser = useStore((state) => state.setUser);
  const setToken = useStore((state) => state.setToken);
  const setLoading = useStore((state) => state.setLoading);
  const initializeState = useStore((state) => state.initializeState);

  useEffect(() => {
    // Initialize Zustand state when the component is mounted
    initializeState();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        const response = await authService.login(email, password);
        const { token, user } = response;

        // Update Zustand store and appStorage
        setToken(token);
        setUser(user);

        // Update local storage (appStorage)
        appStorage.setToken(token);
        appStorage.setUser(user);

        setLoading(false);
      } catch (error) {
        console.error("Error signing in:", error);
        setLoading(false);
      }
    },
    [setToken, setUser, setLoading]
  );

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      // Clear Zustand state and appStorage
      appStorage.clearAll();
      setLoading(false);
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false);
    }
  }, [setLoading]);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        user,
        token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
