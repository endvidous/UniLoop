import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
} from "react-native";
import { Link, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { useDepartments } from "@/src/hooks/api/useDepartments";

interface Department {
  _id: string;
  name: string;
}

const HomeScreen = () => {
  const router = useRouter();
  const { data: departments, isFetching, isError, refetch } = useDepartments();

  const renderDepartment: ListRenderItem<Department> = ({ item }) => {
    if (!item.name) {
      console.warn("Item is missing the 'name' property:", item);
    }
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push(`/Home/departments/${item.name}`)
        }
      >
        <Text style={styles.cardText}>{item.name}</Text>
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
          Error loading departments. Please try again.
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList<Department>
        data={departments?.data} // Use the extracted array
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderDepartment}
        refreshing={isFetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No departments available</Text>
        }
      />

      <Link href="/Home/departments/departmentUpload" asChild>
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
  card: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
  },
  cardText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
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
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});

export default HomeScreen;
