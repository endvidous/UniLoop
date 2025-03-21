import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Switch,
  ScrollView,
  TextInput,
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
  const { user, signOut, changePassword } = useAuth();
  const { theme, colors, toggleTheme } = useTheme();
  const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] =
    React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

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

  // Validation function to check password criteria
  const validatePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match.");
      return false;
    }

    if (currentPassword.length < 6 || newPassword.length < 6) {
      alert("Passwords must be at least 6 characters long.");
      return false;
    }

    return true;
  };

  const handlePasswordChange = () => {
    // Validate the password change before proceeding
    if (!validatePasswordChange()) return;

    // Call the changePassword function from the context
    changePassword(currentPassword, newPassword)
      .then(() => {
        alert("Password changed successfully.");
        setIsChangePasswordVisible(false); // Close the form after success
      })
      .catch((error: { message: string }) => {
        alert("Error changing password: " + error.message);
      });
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
        { backgroundColor: colors.secondaryBackground },
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
        onPress={() => setIsChangePasswordVisible(true)}
      >
        <Text style={[styles.buttontext, { color: colors.text }]}>
          Change Password
        </Text>
        <Ionicons name="key" size={24} color="#687076" />
      </TouchableOpacity>

      {/* Password change form */}
      {isChangePasswordVisible && (
        <View
          style={[
            styles.passwordChangeCard,
            { backgroundColor: colors.background },
          ]}
        >
          <Text
            style={{
              color: "red",
              marginBottom: 10,
              fontSize: 16,
              fontWeight: "bold",
              fontStyle: "italic",
            }}
          >
            Alert! You will be logged out after changing the password.
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.secondaryBackground,
                borderColor: colors.secondaryBackground,
              },
            ]}
            placeholder="Current Password"
            placeholderTextColor={colors.text}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.secondaryBackground,
                borderColor: colors.secondaryBackground,
              },
            ]}
            placeholder="New Password"
            placeholderTextColor={colors.text}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.secondaryBackground,
                borderColor: colors.secondaryBackground,
              },
            ]}
            placeholder="Confirm New Password"
            placeholderTextColor={colors.text}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <View style={styles.passwordButtons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#007BFF" }]}
              onPress={() => setIsChangePasswordVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#16a34a" }]}
              onPress={handlePasswordChange}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
  passwordChangeCard: {
    width: "80%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginTop: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 15,
  },
  passwordButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    width: "48%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
});

export default SettingsPage;
