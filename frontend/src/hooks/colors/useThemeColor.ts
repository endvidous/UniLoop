import { useStore } from "@/src/context/store";
import { ColorSchemeName } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const LightTheme = {
  text: "#36393b",
  background: "#ffffff",
  secondaryBackground: "#d0cfcf",
  tint: tintColorLight,
  icon: "#687076",
  tabIconDefault: "#687076",
  tabIconSelected: tintColorLight,
  shadowcolor: "#000",
};
export const DarkTheme = {
  text: "#ECEDEE",
  background: "#151718",
  secondaryBackground: "#1c1d1f",
  tint: tintColorDark,
  icon: "#9BA1A6",
  tabIconDefault: "#9BA1A6",
  tabIconSelected: tintColorDark,
  shadowcolor: "#d0e1e7",
};
export const useTheme = () => {
  const theme = useStore((state) => state.theme);

  const toggleTheme = useStore((state) => state.toggleTheme);

  const colors = theme === "light" ? LightTheme : DarkTheme;

  return { theme, toggleTheme, colors };
};
