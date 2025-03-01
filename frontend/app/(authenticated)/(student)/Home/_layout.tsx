import { useAuth } from "@/src/context/AuthContext";
import { HeaderBackButton } from "@react-navigation/elements";
import { Stack, useNavigation } from "expo-router";

export default function AnnouncementsLayout() {
  const navigation = useNavigation();
  const { user } = useAuth();
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerTitle: ((base) =>
          base === "index"
            ? `Hey, ${user?.name}.`
            : base.replace(/^./, (c) => c.toUpperCase()))(
          route.name?.split("/")?.[0] || ""
        ),
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
