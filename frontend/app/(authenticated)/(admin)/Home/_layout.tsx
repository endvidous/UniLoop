import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation, Stack } from "expo-router";
export default function ManageLayout() {
  const navigation = useNavigation();
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerTitle: ((base) =>
          base === "index"
            ? "Home"
            : base.replace(/^./, (c) => c.toUpperCase()))(
          route.name?.split("/")?.[0] || ""
        ),
        headerLeft: (props) =>
          navigation.canGoBack() ? (
            <HeaderBackButton
              {...props}
              onPress={() => navigation.goBack()}
              tintColor="#0003a0"
              displayMode="minimal"
            />
          ) : null,
      })}
    />
  );
}
