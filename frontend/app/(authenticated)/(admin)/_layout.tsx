// (admin)/_layout.tsx
import { Stack } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerTitle: user?.role,
        headerBackButtonDisplayMode: "default",
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default AdminLayout;
