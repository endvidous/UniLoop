import { Tabs } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const tabBarIconOptions = { color: "#ffffff" };
const TabLayout = () => {
  const { user } = useAuth();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0003a0",
        // headerBackButtonDisplayMode: "default",
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
