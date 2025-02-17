import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Switch,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { theme, colors, toggleTheme } = useTheme();
  const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);
  const data = [
    { id: "1", name: "Please send an email to :" },
    { id: "2", name: "henry@gmail.com" },
    { id: "3", name: "medhabv@gmail.com" },
    { id: "4", name: "angela@gmail.com" },
    { id: "5", name: "ananyapkumar@gmail.com" },
  ];
  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.nametitle}>{user?.name}</Text>
      <Text style={styles.mailtitle}>{user?.email}</Text>
      <TouchableOpacity style={[styles.dataButton, styles.shadow]}>
        <Text style={styles.buttontext}>change Password</Text>
        <Ionicons name="key" size={24} color="#00100B" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.dataButton, styles.shadow]}>
        <Text style={styles.buttontext}>Dark mode</Text>
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

      <TouchableOpacity style={[styles.dataButton, styles.shadow]}>
        <Text style={styles.buttontext}>Notifications</Text>
        <Ionicons name="notifications-outline" size={24} color="#00100B" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.dataButton, styles.shadow]}
        onPress={toggleDropdown}
      >
        <Text style={styles.buttontext}>Tech support</Text>
        <Ionicons name="call-outline" size={24} color="#00100B" />
      </TouchableOpacity>

      {isDropdownVisible && (
        <View style={styles.dropdownContainer}>
          {data.map((item) => (
            <Text key={item.id} style={styles.optionText}>
              {item.name}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        onPress={signOut}
        style={[
          styles.dataButton,
          styles.shadow,
          isDropdownVisible && { marginTop: 20 },
        ]}
      >
        <Text style={styles.buttontext}>Log out</Text>
        <Ionicons name="log-out-outline" size={24} color="#00100B" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  shadow: {
    shadowColor: "#000",
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
    color: "#00100B",
    marginBottom: 10,
  },
  mailtitle: {
    fontSize: 20,
    fontWeight: "300",
    color: "#00100B",
    marginBottom: 20,
  },
  dataButton: {
    flexDirection: "row",
    width: "80%",
    height: 60,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: 30,
  },
  buttontext: {
    color: "#00100B",
    fontSize: 17,
    fontWeight: "600",
    marginRight: 10,
  },
  dropdownContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 0,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  optionText: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 17,
  },
});

export default SettingsPage;
