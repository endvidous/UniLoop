import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Link } from "expo-router";
import {
  useDepartmentTeachers,
  useDeleteTeacher,
} from "@/src/hooks/api/useUser";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import { Swipeable } from "react-native-gesture-handler";
import { useUpdateTeacher } from "@/src/hooks/api/useUser"; // Import the update hook

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
  const { colors } = useTheme();
  const { data, isFetching, isError, error, refetch } =
    useDepartmentTeachers(departmentId);

  // Use the update hook
  const { mutate: updateTeacher } = useUpdateTeacher();

  // Use the delete hook
  const { mutate: deleteTeacher } = useDeleteTeacher();

  // State to handle teacher editing
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const [editedEmail, setEditedEmail] = useState<string>("");
  const [editedRole, setEditedRole] = useState<string>("teacher");
  const [loading, setLoading] = useState(false);

  // State for confirmation dialog
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // Helper function to generate random colors for card borders
  const getRandomColor = () => {
    const colors = [
      "#FF6B6B", // Red
      "#4ECDC4", // Teal
      "#FFD166", // Yellow
      "#45B7D5", // Blue
      "#A78BFA", // Purple
      "#F4A261", // Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const renderTeacher = ({ item }: { item: Teacher }) => {
    const renderRightActions = () => (
      <View style={styles.swipeActionsContainer}>
        <TouchableOpacity
          style={[styles.swipeButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Icon name="pencil" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Icon name="trash" size={30} color="white" />
        </TouchableOpacity>
      </View>
    );

    const handleEdit = (teacher: Teacher) => {
      setEditingTeacher(teacher);
      setEditedName(teacher.name);
      setEditedEmail(teacher.email);
      setEditedRole(teacher.role);
    };

    const handleConfirmEdit = () => {
      // updateTeacher({})
    };

    const handleDelete = (teacher: Teacher) => {
      setTeacherToDelete(teacher); // Set the teacher to be deleted
      setShowDeleteConfirmation(true); // Show the confirmation dialog
    };

    const handleCancelDelete = () => {
      setShowDeleteConfirmation(false); // Close the confirmation dialog
      setTeacherToDelete(null); // Reset the teacher to delete
    };

    const handleConfirmDelete = async () => {
      if (teacherToDelete) {
        // Call the deleteTeacher mutation
        deleteTeacher({ departmentId, teacherId: teacherToDelete._id });
        setShowDeleteConfirmation(false); // Close the confirmation dialog
        setTeacherToDelete(null); // Reset the teacher to delete
        refetch(); // Refetch the teacher list
      }
    };

    return (
      <View style={styles.teacherCardContainer}>
        {/* Confirmation dialog */}
        {showDeleteConfirmation && teacherToDelete?._id === item._id && (
          <View style={styles.confirmationOverlay}>
            <View style={styles.confirmationCard}>
              <Text style={styles.confirmationTitle}>
                Are you sure you want to delete {item.name}?
              </Text>
              <View style={styles.confirmationButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelDelete}
                >
                  <Text style={styles.confirmationButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.deleteButton]}
                  onPress={handleConfirmDelete}
                  disabled={loading}
                >
                  <Text style={styles.confirmationButtonText}>
                    {loading ? "Deleting..." : "Delete"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Edit form */}
        {editingTeacher?._id === item._id && (
          <View style={styles.editFormOverlay}>
            <View style={styles.editFormCard}>
              <Text style={styles.editFormTitle}>Edit Teacher</Text>
              <TextInput
                style={styles.input}
                placeholder="Edit Name"
                value={editedName}
                onChangeText={setEditedName}
              />
              <TextInput
                style={styles.input}
                placeholder="Edit Email"
                value={editedEmail}
                onChangeText={setEditedEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Edit Role"
                value={editedRole}
                onChangeText={setEditedRole}
              />
              <View style={styles.editFormButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelDelete}
                >
                  <Text style={styles.confirmationButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleConfirmEdit}
                  disabled={loading}
                >
                  <Text style={styles.confirmationButtonText}>
                    {loading ? "Updating..." : "Confirm"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Teacher card */}
        <Swipeable renderRightActions={renderRightActions}>
          <View style={[styles.teacherCard, { borderColor: getRandomColor() }]}>
            <Text style={styles.teacherName}>{item.name}</Text>
            <Text style={styles.teacherDetail}>Code: {item._id}</Text>
            <Text style={styles.teacherDetail}>Email: {item.email}</Text>
            {item.mentor_of && (
              <Text style={styles.teacherDetail}>
                Mentor Of: {item.mentor_of}
              </Text>
            )}
          </View>
        </Swipeable>
      </View>
    );
  };

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.secondaryBackground },
      ]}
    >
      <Stack.Screen options={{ title: `${name} Teachers` }} />
      <Text style={[styles.title, { color: colors.text }]}>
        {name} Teachers
      </Text>

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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  teacherCardContainer: {
    marginVertical: 8,
  },
  teacherCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  teacherDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
  },
  editFormOverlay: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  editFormCard: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    width: "100%",
    marginTop: 30,
    marginBottom: -400,
    alignItems: "center",
  },
  editFormTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  editFormButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: "#007BFF",
    padding: 7,
    borderRadius: 5,
    marginRight: -130,
    marginBottom: 5,
  },
  confirmButton: {
    backgroundColor: "#F44336",
    padding: 7,
    borderRadius: 5,
    marginBottom: 5,
  },
  confirmationButtonText: {
    fontSize: 16,
    color: "white",
  },
  disabledButton: {
    backgroundColor: "#ddd", // Grey out the button when disabled
  },
  swipeActionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 20,
  },
  swipeButton: {
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  editButton: {
    backgroundColor: "green",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  confirmationOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  confirmationCard: {
    backgroundColor: "white",
    padding: 4,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
});

export default TeachersIndexPage;
