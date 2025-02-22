import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { MaterialIcons } from "@expo/vector-icons";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0003a0",
        tabBarHideOnKeyboard: true,
        // headerBackButtonDisplayMode: "default",
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="home" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Announcements"
        options={{
          title: "Announcements",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="announcement" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Discussions"
        options={{
          title: "Discussions",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="chat" color={color} />
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
