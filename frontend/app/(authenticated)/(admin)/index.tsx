import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useStore } from "@/context/store";
import { useAuth } from "@/context/AuthContext";

const AdminIndex = () => {
  const user = useStore((state) => state.user);
  const { signOut } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AdminIndex</Text>
      <Text style={styles.text}>{user?.name}</Text>
      <Text style={styles.text}>{user?.role}</Text>
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={{ color: "#ffffff" }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  text: {
    textAlign: "center",
  },
  signOutButton: {
    width: "80%",
    height: 50,
    backgroundColor: "#000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
});

export default AdminIndex;
