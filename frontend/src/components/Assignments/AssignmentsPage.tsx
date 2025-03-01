import { useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useAssignments } from "@/src/hooks/api/useAssignments";
import AssignmentCard from "./AssignmentCard";
import { ScrollView } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import CreateAssignment from "./CreateAssignment";
import { useAuth } from "@/src/context/AuthContext";

const AssignmentsPage = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading, error, isError, refetch } = useAssignments();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.container}
      >
        <Text style={styles.errorText}>
          Error loading assignments: {error?.message}
        </Text>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <AssignmentCard assignment={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.noAssignmentText}>No Assignments created</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {user?.role === "teacher" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowModal(true)}
          accessibilityLabel="Create new assignment"
          accessibilityRole="button"
        >
          <MaterialIcons name="assignment-add" size={30} color="white" />
        </TouchableOpacity>
      )}
      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <CreateAssignment onDismiss={() => setShowModal(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  noAssignmentText: {
    fontSize: 16,
    color: "#777",
  },
  fab: {
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
});

export default AssignmentsPage;
