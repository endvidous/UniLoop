import { HeaderBackButton } from "@react-navigation/elements";
import { Stack, useNavigation, usePathname } from "expo-router";

export default function HomeLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
