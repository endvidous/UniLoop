// src/context/ThemeProvider.tsx
import React, { useEffect } from "react";
import { useStore } from "./store";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  DefaultTheme,
  MD3DarkTheme as PaperDark,
  PaperProvider,
} from "react-native-paper";
import {
  LightTheme as CustomLight,
  DarkTheme as CustomDark,
} from "../hooks/colors/useThemeColor";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, setTheme } = useStore();
  const systemTheme = useColorScheme();

  // Fallback to system theme if no stored preference
  useEffect(() => {
    if (!theme) {
      setTheme(systemTheme || "light");
    }
  }, []);

  const isDarkMode = theme === "dark";
  const customColors = theme === "light" ? CustomLight : CustomDark;

  // Create Paper theme
  const paperTheme = {
    ...(isDarkMode ? PaperDark : DefaultTheme),
    dark: isDarkMode, // Force dark mode flag
    mode: "exact" as const, // Disable system adaptation
    colors: {
      ...(isDarkMode ? PaperDark.colors : DefaultTheme.colors),
      primary: isDarkMode ? CustomDark.tint : CustomLight.tint,
      background: isDarkMode ? CustomDark.background : CustomLight.background,
      surface: isDarkMode ? CustomDark.background : CustomLight.background,
      text: isDarkMode ? CustomDark.text : CustomLight.text,
      onSurface: isDarkMode ? CustomDark.text : CustomLight.text,
      elevation: {
        level2: isDarkMode ? CustomDark.background : CustomLight.background,
      },
    },
  };

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </>
  );
};
