import { RelativePathString, Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

const TabLayout = () => {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.background,
        tabBarActiveBackgroundColor: colors.icon,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
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
          href: "/(authenticated)/(admin)/Announcements",
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
        name="Reminders"
        options={{
          //href: "/(authenticated)/(admin)/Reminders/index",
          title: "Reminders",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="alarm" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Classroom"
        options={{
          title: "Classroom",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="home" color={color} />
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
