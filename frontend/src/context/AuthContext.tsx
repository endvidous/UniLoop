import { createContext, useContext, useCallback, useEffect } from "react";
import { useStore } from "./store";
import { User } from "../utils/interfaces";
import { authService } from "@/src/services/api/auth";
import { unregisterPushNotifications } from "../services/notifications";

const enum ROLES {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student",
}

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
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
        const response = await authService.login(email, password);
        const { token, user } = response;
        // Update Zustand store and appStorage
        setToken(token);
        setUser(user);
      } catch (error: any) {
        setLoading(false);
        throw new Error(error?.response?.data?.message || "Login failed");
      }
    },
    [setToken, setUser, setLoading]
  );

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      // Clear Zustand state and appStorage
      if (user) {
        try {
          await unregisterPushNotifications(user.id);
        } catch (error: any) {
          console.log("Error in notifications: " + error.message);
        }
      } else {
        throw new Error("User ID is undefined");
      }
      clearAuth();
      setLoading(false);
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false);
    }
  }, [setLoading, user]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        setLoading(true);
        await authService.changePassword({ currentPassword, newPassword });

        // Optionally force logout after password change
        await signOut();
      } catch (error: any) {
        throw new Error(
          error?.response?.data?.message || "Password change failed"
        );
      } finally {
        setLoading(false);
      }
    },
    [user, setLoading, signOut]
  );

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        changePassword,
        user,
        token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
