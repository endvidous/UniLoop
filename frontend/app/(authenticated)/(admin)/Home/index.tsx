import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/src/context/AuthContext";

const AdminIndex = () => {
  const { signOut } = useAuth();
  return (
    <View style={styles.container}>
      <Link
        style={[styles.dataButton, styles.shadow]}
        href="/Home/timelines"
        asChild
      >
        <TouchableOpacity>
          <Text style={styles.buttontext}>Academic Timeline</Text>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </Link>

      <Link
        style={[styles.dataButton, styles.shadow]}
        href="/Home/departments/"
        asChild
      >
        <TouchableOpacity>
          <Text style={styles.buttontext}>Departments</Text>
          <Ionicons name="enter-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </Link>

      <Link
        style={[styles.dataButton, styles.shadow]}
        href="/Home/courses/"
        asChild
      >
        <TouchableOpacity>
          <Text style={styles.buttontext}>Courses</Text>
          <Ionicons name="book-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </Link>
      <TouchableOpacity
        onPress={signOut}
        style={[styles.dataButton, styles.shadow]}
      >
        <Text style={styles.buttontext}>Log out</Text>
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
  dataButton: {
    flexDirection: "row",
    width: "80%",
    height: 50,
    backgroundColor: "#fcba03",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 20,
  },
  buttontext: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },
});

export default AdminIndex;
