import { HeaderBackButton } from "@react-navigation/elements";
import { Stack, useNavigation, usePathname } from "expo-router";

export default function AnnouncementsLayout() {
  const navigation = useNavigation();
  const route = usePathname();
  return (
    <Stack
      screenOptions={() => ({
        headerShown: route !== "/Home",
        headerLeft: (props) =>
          navigation.canGoBack() ? (
            <HeaderBackButton
              {...props}
              onPress={() => navigation.goBack()}
              tintColor="#272727"
              displayMode="minimal"
            />
          ) : null,
      })}
    />
  );
}
