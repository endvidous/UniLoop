import { Stack } from "expo-router";
import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "expo-router";
export default function ManageLayout() {
  const navigation = useNavigation();
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerTitle:
          route.name.split("/")[0] === "index"
            ? "Home"
            : route.name.split("/")[0].toUpperCase(),
        headerLeft: (props) =>
          navigation.canGoBack() ? (
            <HeaderBackButton
              {...props}
              onPress={() => navigation.goBack()}
              tintColor="#0003a0"
            />
          ) : null,
      })}
    />
  );
}
