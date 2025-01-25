import { Tabs } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const AdminLayout = () => {
  const { user } = useAuth();
  return (
    <Tabs
      screenOptions={{
        headerTitle: user?.role,
        headerBackButtonDisplayMode: "default",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen name="home" options={{ href: null }} />
    </Tabs>
  );
};

export default AdminLayout;
