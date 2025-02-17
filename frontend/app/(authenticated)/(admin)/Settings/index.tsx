import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Switch,
  FlatList,
  ScrollView,
} from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";

const SettingsPage = () => {
  const { user, signOut, updatePassword } = useAuth();
  const [currentValue, setCurrentValue] = React.useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);
  const [isResetPasswordVisible, setIsResetPasswordVisible] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [isConfirmDisabled, setIsConfirmDisabled] = React.useState(true);

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

  const handleSignOut = () => {
    setIsDropdownVisible(false);
    signOut();
  };

  const handlePasswordChange = () => {
    if (newPassword === confirmNewPassword) {
      updatePassword(currentPassword, newPassword)
        .then(() => {
          Alert.alert("Password updated successfully");
          setIsResetPasswordVisible(false); // Close the modal after success
        })
        .catch(() => {
          Alert.alert("Error updating password. Please try again.");
        });
    } else {
      Alert.alert("Passwords do not match.");
    }
  };

  const handlePasswordInputChange = () => {
    // Enable the "Confirm" button only if the new password matches the confirm password
    setIsConfirmDisabled(newPassword !== confirmNewPassword);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.nametitle}>{user?.name}</Text> 
      <Text style={styles.mailtitle}>{user?.email}</Text>
      
      <TouchableOpacity style={[styles.dataButton, styles.shadow]} onPress={() => setIsResetPasswordVisible(true)} accessible={true} accessibilityLabel="Change password button">
        <Text style={styles.buttontext}>Change Password</Text>
        <Ionicons name="key" size={24} color="#00100B" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.dataButton, styles.shadow]} accessible={true} accessibilityLabel="Dark mode toggle">
        <Text style={styles.buttontext}>Dark mode</Text>
        <Switch
          value={currentValue}
          onValueChange={(value) => setCurrentValue(value)}
        />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.dataButton, styles.shadow]} accessible={true} accessibilityLabel="Notifications settings">
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
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View>
                <Text style={styles.optionText}>{item.name}</Text>
              </View>
            )}
          />
        </View>
      )}

      <TouchableOpacity onPress={handleSignOut} style={[styles.dataButton, styles.shadow, isDropdownVisible && { marginTop: 20 }]} accessible={true} accessibilityLabel="Log out button">
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

      {/* Reset Password Modal */}
      {isResetPasswordVisible && (
        <View style={styles.resetPasswordCard}>
          <Text style={styles.cardTitle}>Reset Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter current password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            secureTextEntry
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              handlePasswordInputChange();
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            secureTextEntry
            value={confirmNewPassword}
            onChangeText={(text) => {
              setConfirmNewPassword(text);
              handlePasswordInputChange();
            }}
          />
          <TouchableOpacity
            style={[styles.confirmButton, isConfirmDisabled && { backgroundColor: '#ccc' }]}
            onPress={handlePasswordChange}
            disabled={isConfirmDisabled}
          >
            <Text style={styles.buttontext}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsResetPasswordVisible(false)} style={styles.cancelButton}>
            <Text style={styles.buttontext}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
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
  resetPasswordCard: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "#00100B",
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 6,
    paddingLeft: 10,
  },
  confirmButton: {
    backgroundColor: '#00100B',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
});

export default SettingsPage;
