import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Switch,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import Animated, {
  Easing,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { theme, colors, toggleTheme } = useTheme();
  const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);
  const dropdownHeight = useSharedValue(0);
  const data = [
    { id: "1", name: "Please send an email to :" },
    { id: "2", name: "henry@gmail.com" },
    { id: "3", name: "medhabv@gmail.com" },
    { id: "4", name: "angela@gmail.com" },
    { id: "5", name: "ananyapkumar@gmail.com" },
  ];

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
    dropdownHeight.value = isDropdownVisible ? 0 : 225;
  };

  const dropdownStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(dropdownHeight.value, {
        duration: 250,
        easing: Easing.ease,
      }),
      opacity: withTiming(dropdownHeight.value > 0 ? 1 : 0, {
        duration: 250,
        easing: Easing.ease,
      }),
    };
  });

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <Text style={[styles.nametitle, { color: colors.text }]}>
        {user?.name}
      </Text>
      <Text style={[styles.mailtitle, { color: colors.text }]}>
        {user?.email}
      </Text>

      <TouchableOpacity
        style={[
          styles.dataButton,
          styles.shadow,
          { shadowColor: colors.shadowcolor },
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.buttontext, { color: colors.text }]}>
          Change Password
        </Text>
        <Ionicons name="key" size={24} color="#687076" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.dataButton,
          styles.shadow,
          { shadowColor: colors.shadowcolor },
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.buttontext, { color: colors.text }]}>
          {theme.charAt(0).toUpperCase() + theme.slice(1)} mode
        </Text>
        <Switch
          value={theme === "dark"}
          onValueChange={toggleTheme}
          thumbColor={colors.icon}
          trackColor={{
            true: colors.tint,
            false: colors.tabIconDefault,
          }}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.dataButton,
          styles.shadow,
          { shadowColor: colors.shadowcolor },
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.buttontext, { color: colors.text }]}>
          Notifications
        </Text>
        <Ionicons name="notifications-outline" size={24} color="#687076" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.dataButton,
          styles.shadow,
          { shadowColor: colors.shadowcolor },
          { backgroundColor: colors.background },
        ]}
        onPress={toggleDropdown}
      >
        <Text style={[styles.buttontext, { color: colors.text }]}>
          Tech Support
        </Text>
        <Ionicons name="call-outline" size={24} color="#687076" />
      </TouchableOpacity>

      <Animated.View style={[styles.dropdownContainer, dropdownStyle]}>
        {isDropdownVisible && (
          <View>
            {data.map((item) => (
              <Text
                key={item.id}
                style={[styles.optionText, { color: colors.text }]}
              >
                {item.name}
              </Text>
            ))}
          </View>
        )}
      </Animated.View>

      <TouchableOpacity
        onPress={signOut}
        style={[
          styles.dataButton,
          styles.shadow,
          { shadowColor: colors.shadowcolor },
          { backgroundColor: colors.background },
          isDropdownVisible && { marginTop: 20 },
        ]}
      >
        <Text style={[styles.buttontext, { color: colors.text }]}>Log out</Text>
        <Ionicons name="log-out-outline" size={24} color="#687076" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  shadow: {
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  nametitle: {
    fontSize: 40,
    fontWeight: "400",
    marginBottom: 10,
  },
  mailtitle: {
    fontSize: 20,
    fontWeight: "300",
    marginBottom: 20,
  },
  dataButton: {
    flexDirection: "row",
    width: "80%",
    height: 60,
    borderRadius: 12,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: 30,
  },
  buttontext: {
    fontSize: 17,
    fontWeight: "600",
    marginRight: 10,
  },
  dropdownContainer: {
    width: "80%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#687076",
    marginTop: 0,
    overflow: "hidden",
  },
  optionText: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 17,
  },
});

export default SettingsPage;
