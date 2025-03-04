import { Stack, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Link } from "expo-router";
import { useDepartmentTeachers } from "@/src/hooks/api/useUser";

interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  mentor_of?: string;
}

const TeachersIndexPage = () => {
  const { departmentId, name } = useLocalSearchParams<{
    departmentId: string;
    name: string;
  }>();

  console.log(departmentId);
  const { data, isFetching, isError, error, refetch } =
    useDepartmentTeachers(departmentId);

  const renderTeacher = ({ item }: { item: Teacher }) => {
    if (!item.name) {
      console.warn("Item is missing the 'name' property:", item);
    }
    if (!item.email) {
      console.warn("Item is missing the 'email' property:", item);
    }
    // if (!item.role) {
    //   console.warn("Item is missing the 'role' property:", item);
    // }
    return (
      <TouchableOpacity style={styles.teacherCard}>
        <Text style={styles.teacherText}>Name: {item.name}</Text>
        <Text style={styles.teacherText}>Email: {item.email}</Text>
        {/* <Text style={styles.teacherText}>Role: {item.role}</Text> */}
        {item.mentor_of && (
          <Text style={styles.teacherText}>Mentor Of: {item.mentor_of}</Text>
        )}
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

  // if (isError) {
  //   return (
  //     <View style={styles.errorContainer}>
  //       <Text style={styles.errorText}>
  //         Error loading teachers. Please try again.
  //       </Text>
  //       <TouchableOpacity onPress={() => refetch()}>
  //         <Text style={styles.retryText}>Retry</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${name} Teachers` }} />
      <Text style={styles.title}>{name} Teachers</Text>

      {isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading teachers: {error?.message || "Unknown error"}
          </Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data?.data || []}
          keyExtractor={(item, index) => item?._id || index.toString()}
          renderItem={renderTeacher}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No teachers available</Text>
          }
          refreshing={isFetching}
          onRefresh={refetch}
        />
      )}

      <Link
        href={`/Home/departments/${departmentId}/teachers/teacherUpload`}
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
  teacherCard: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
  },
  teacherText: {
    color: "white",
    fontSize: 16,
    marginBottom: 4,
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

export default TeachersIndexPage;
