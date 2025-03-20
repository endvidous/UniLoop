import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import { Divider } from "react-native-paper";
import { Text, View, TouchableOpacity } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import {
  usePathname,
  useSegments,
  useRouter,
  RelativePathString,
} from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

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
  const segments = useSegments();
  const router = useRouter();
  const { user } = useAuth();

  // Define screen names that can be accessed from drawer
  const screenNames = [
    "Home",
    "Announcements",
    "Discussions",
    "Assignments",
    "Meetings",
    "ClassFinder",
    "Settings",
  ];

  // Find the current screen name in segments
  const currentScreen = segments.find((segment) =>
    screenNames.includes(segment)
  );

  // Check if we're on a detail page by looking for dynamic segments
  // This checks if the path has more segments after a known screen name
  const isDetailPage = (() => {
    const screenIndex = segments.findIndex((segment) =>
      screenNames.includes(segment)
    );
    return screenIndex !== -1 && screenIndex < segments.length - 1;
  })();

  // Get the parent screen name for the back button navigation
  const parentScreenName = currentScreen || "Home";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ navigation }) => ({
          drawerActiveTintColor: colors.tabIconSelected,
          drawerInactiveTintColor: colors.tabIconDefault,
          headerShown: true,
          headerLeft: ({ tintColor }) => {
            if (isDetailPage) {
              // Show back button on detail pages
              return (
                <TouchableOpacity
                  onPress={() => {
                    // Navigate back to the parent screen
                    router.push(
                      `/(${user?.role})/${parentScreenName}` as RelativePathString
                    );
                  }}
                  style={{ marginLeft: 15 }}
                >
                  <MaterialIcons
                    name="arrow-back"
                    size={24}
                    color={tintColor}
                  />
                </TouchableOpacity>
              );
            } else {
              // On index pages, show the hamburger menu
              return (
                <TouchableOpacity
                  onPress={() => navigation.openDrawer()}
                  style={{ marginLeft: 15 }}
                >
                  <MaterialIcons name="menu" size={24} color={tintColor} />
                </TouchableOpacity>
              );
            }
          },
        })}
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
