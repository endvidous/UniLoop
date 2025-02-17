// src/context/ThemeProvider.tsx
import React, { useEffect } from "react";
import { useStore } from "./store";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, setTheme, initializeState } = useStore();
  const systemTheme = useColorScheme();

  // Fallback to system theme if no stored preference
  useEffect(() => {
    if (!theme && systemTheme) {
      setTheme(systemTheme);
    }
  }, [systemTheme]);

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      {children}
    </>
  );
};
