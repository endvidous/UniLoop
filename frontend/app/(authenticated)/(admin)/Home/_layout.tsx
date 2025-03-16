import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation, Stack } from "expo-router";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
export default function ManageLayout() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
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
