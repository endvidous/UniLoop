import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { pickCSVDocument } from "@/src/services/utils/documentPicker";

const AdminIndex = () => {
  const { user, signOut } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AdminIndex</Text>
      <Text style={styles.text}>{user?.name}</Text>
      <Text style={styles.text}>{user?.role}</Text>
      <TouchableOpacity
        style={[styles.signOutButton, styles.shadow]}
        onPress={signOut}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
    fontSize: 18,
    color: "#333",
    marginBottom: 8,
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
  signOutButton: {
    flexDirection: "row",
    width: "80%",
    height: 50,
    backgroundColor: "#000000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 20,
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },
});

export default AdminIndex;
