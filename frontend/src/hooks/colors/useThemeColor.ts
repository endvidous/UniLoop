import { useStore } from "@/src/context/store";
import { ColorSchemeName } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

const LightTheme = {
  text: "#11181C",
  background: "#fff",
  tint: tintColorLight,
  icon: "#687076",
  tabIconDefault: "#687076",
  tabIconSelected: tintColorLight,
};
const DarkTheme = {
  text: "#ECEDEE",
  background: "#151718",
  tint: tintColorDark,
  icon: "#9BA1A6",
  tabIconDefault: "#9BA1A6",
  tabIconSelected: tintColorDark,
};
export const useTheme = () => {
  const { theme, setTheme } = useStore((state) => ({
    theme: state.theme,
    setTheme: state.setTheme,
  }));
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  const colors = theme === "light" ? LightTheme : DarkTheme;

  return { theme, setTheme, toggleTheme, colors };
};
