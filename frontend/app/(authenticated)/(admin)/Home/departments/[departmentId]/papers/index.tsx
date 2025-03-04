import { Stack, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Link } from "expo-router";
import { useDepartmentPapers } from "@/src/hooks/api/useDepartments";

interface Paper {
  _id: string;
  name: string;
  code: string;
  semester: number;
}

const PapersIndexPage = () => {
  const { departmentId, name } = useLocalSearchParams<{
    departmentId: string;
    name: string;
  }>();

  const { data, isFetching, isError, refetch } =
    useDepartmentPapers(departmentId);

  const renderPaper = ({ item }: { item: Paper }) => {
    if (!item.name) {
      console.warn("Item is missing the 'name' property:", item);
    }
    if (!item.code) {
      console.warn("Item is missing the 'code' property:", item);
    }
    if (!item.semester) {
      console.warn("Item is missing the 'semester' property:", item);
    }
    return (
      <TouchableOpacity style={styles.paperCard}>
        <Text style={styles.paperText}>{item.name}</Text>
        <Text style={styles.paperText}>{item.code}</Text>
        <Text style={styles.paperText}>{item.semester}</Text>
      </TouchableOpacity>
    );
  };
  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading papers. Please try again.
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${name} Papers` }} />
      <Text style={styles.title}>{name} Papers</Text>

      <FlatList
        data={data?.data} // Use the extracted array
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderPaper}
        refreshing={isFetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No papers available</Text>
        }
      />

      <Link
      href={`/Home/departments/${departmentId}/papers/paperUpload`}
        asChild
      >
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryText: {
    color: "#007BFF",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default PapersIndexPage;
