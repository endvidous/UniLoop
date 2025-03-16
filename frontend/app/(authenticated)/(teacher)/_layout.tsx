import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import { Divider } from "react-native-paper";
import { Text, View } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { usePathname, useSegments } from "expo-router";

// Custom Drawer Content Component
const CustomDrawerContent = (props: any) => {
  const { colors } = useTheme();
  const { state, descriptors, navigation } = props;

  // Filter out the Settings screen to handle it separately
  const mainScreens = state.routes.slice(0, -1);
  const settingsScreen = state.routes[state.routes.length - 1];

  return (
    <DrawerContentScrollView {...props}>
      {/* Header Text */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>
          Navigate to
        </Text>
      </View>

      {/* Divider */}
      <Divider
        style={{
          borderColor: "black",
          borderWidth: 0.6,
          marginBottom: 10,
          marginHorizontal: 10,
        }}
      />

      {/* Render all screens except the last one (Settings) */}
      {mainScreens.map((route: any, i: any) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name;
        const isFocused = state.index === i;

        return (
          <DrawerItem
            key={route.key}
            label={label}
            icon={options.drawerIcon}
            focused={isFocused}
            activeTintColor={colors.tabIconSelected}
            inactiveTintColor={colors.tabIconDefault}
            onPress={() => navigation.navigate(route.name)}
          />
        );
      })}

      {/* Divider */}
      <Divider
        style={{
          borderColor: "black",
          borderWidth: 0.6,
          marginVertical: 5,
          marginHorizontal: 10,
        }}
      />

      {/* Settings screen */}
      {settingsScreen && (
        <DrawerItem
          label={
            descriptors[settingsScreen.key].options.title || settingsScreen.name
          }
          icon={descriptors[settingsScreen.key].options.drawerIcon}
          focused={state.index === state.routes.length - 1}
          activeTintColor={colors.tabIconSelected}
          inactiveTintColor={colors.tabIconDefault}
          onPress={() => navigation.navigate(settingsScreen.name)}
        />
      )}
    </DrawerContentScrollView>
  );
};

const DrawerLayout = () => {
  const { colors } = useTheme();
  const pathname = useSegments();

  // Extract the relative path within this layout
  const pathSegments = pathname.filter(Boolean);

  // Determine if we're on a detail page by checking if there's anything after the screen name
  // For example: /authenticated/teacher/Announcements/123 would be a detail page
  // But /authenticated/teacher/Announcements would be a main page

  // Find the index of the screen name in the path segments
  const screenNames = [
    "Home",
    "Announcements",
    "Discussions",
    "Assignments",
    "Meetings",
    "ClassFinder",
    "Settings",
  ];

  // Get the index of the last segment that matches a screen name
  const lastScreenIndex = pathSegments.findIndex((segment) =>
    screenNames.includes(segment)
  );

  // If there are segments after the screen name, it's a detail page
  const isDetailPage =
    lastScreenIndex !== -1 && lastScreenIndex < pathSegments.length - 1;

  return (
    <GestureHandlerRootView>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerActiveTintColor: colors.tabIconSelected,
          drawerInactiveTintColor: colors.tabIconDefault,
          headerShown: !isDetailPage, // Only show drawer header on main section pages
        }}
      >
        <Drawer.Screen
          name="Home"
          options={{
            title: "Home",
            drawerIcon: ({ color }) => (
              <MaterialIcons size={28} name="home" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Announcements"
          options={{
            title: "Announcements",
            drawerIcon: ({ color }) => (
              <MaterialIcons size={28} name="announcement" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Discussions"
          options={{
            title: "Discussions",
            drawerIcon: ({ color }) => (
              <MaterialIcons size={28} name="chat" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Assignments"
          options={{
            title: "Assignments",
            drawerIcon: ({ color }) => (
              <MaterialIcons size={28} name="assignment" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Meetings"
          options={{
            title: "Meetings",
            drawerIcon: ({ color }) => (
              <MaterialIcons size={28} name="meeting-room" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="ClassFinder"
          options={{
            title: "Classroom Finder",
            drawerIcon: ({ color }) => (
              <MaterialIcons size={28} name="location-pin" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Settings"
          options={{
            title: "Settings",
            drawerIcon: ({ color }) => (
              <FontAwesome size={28} name="cog" color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default DrawerLayout;
