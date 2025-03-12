import { HeaderBackButton } from "@react-navigation/elements";
import { Stack, useNavigation } from "expo-router";

export default function AnnouncementsLayout() {
  const navigation = useNavigation();
  return (
    <Stack
      screenOptions={() => ({
        headerShown: navigation.canGoBack(),
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
