import { createContext, useContext, useCallback, useEffect } from "react";
import { useStore } from "./store";
import { User } from "../utils/interfaces";
import { authService } from "@/src/services/api/auth";

const enum ROLES {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student",
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
  const { user, token, isLoading, setUser, setToken, setLoading, clearAuth } =
    useStore();

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        const response = await authService.login(email, password);
        const { token, user } = response;
        // Update Zustand store and appStorage
        setToken(token);
        setUser(user);
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        throw new Error(error.message || "Login failed");
      }
    },
    [setToken, setUser, setLoading]
  );

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      // Clear Zustand state and appStorage
      clearAuth();
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
