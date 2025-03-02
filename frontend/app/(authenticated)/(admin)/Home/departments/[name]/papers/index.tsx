import { Stack, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Link } from "expo-router";

const PapersIndexPage = () => {
  const { _id, name } = useLocalSearchParams<{ _id: string; name: string }>();

  // Fetch papers for the department here (you can use a custom hook or API call)

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${name} Papers` }} />
      <Text style={styles.title}>{name} Papers</Text>

      {/* Display papers here
      <FlatList
        data={[]} // Replace with your papers data
        renderItem={({ item }) => (
          <View style={styles.paperCard}>
            <Text style={styles.paperText}>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No papers available</Text>
        }
      /> */}

      <Link href={`/Home/departments/${_id}/papers/paperUpload`} asChild>
        <TouchableOpacity style={styles.button}>
          <Icon name="add" size={40} color="white" />
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  paperCard: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
  },
  paperText: {
    color: "white",
    fontSize: 18,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  button: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007BFF",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PapersIndexPage;
