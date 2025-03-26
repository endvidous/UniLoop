import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import {
  useBatchStudents,
  useUpdateStudent,
  useDeleteStudent,
} from "@/src/hooks/api/useUser";
import { useLocalSearchParams, Link } from "expo-router";

interface Student {
  _id: string;
  name: string;
  email: string;
  roll_no?: string;
}

const IndexPage = () => {
  const { colors } = useTheme();
  const { batchId, courseId } = useLocalSearchParams<{
    batchId: string;
    courseId: string;
  }>();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch students for the batch
  const {
    data: students,
    isFetching,
    isError,
    refetch,
  } = useBatchStudents(batchId as string);

  // Sort students by roll_no
  const sortedStudents = React.useMemo(() => {
    if (!students?.data) return [];

    return [...students.data].sort((a, b) => {
      const rollA = a.roll_no || ""; // Handle missing roll_no
      const rollB = b.roll_no || ""; // Handle missing roll_no
      return rollA.localeCompare(rollB, undefined, { numeric: true });
    });
  }, [students?.data]);

  // Update student mutation
  const { mutate: updateStudent } = useUpdateStudent();

  // Delete student mutation
  const { mutate: deleteStudent } = useDeleteStudent();

  // Check if a roll number is a duplicate
  const isRollNumberDuplicate = (
    roll_no: string,
    studentId: string
  ): boolean => {
    if (!students?.data) return false;

    return students.data.some(
      (student) => student._id !== studentId && student.roll_no === roll_no
    );
  };

  // Handle updating a student
  const handleUpdateStudent = (
    studentId: string,
    updates: Partial<Student>
  ) => {
    // Check if the roll number is being updated and if it's a duplicate
    if (updates.roll_no && isRollNumberDuplicate(updates.roll_no, studentId)) {
      Alert.alert(
        "Error",
        `A student is already assigned with the roll number: ${updates.roll_no}`
      );
      return;
    }

    // If no duplicate, proceed with the update
    updateStudent(
      { batchId: batchId as string, studentId, updates },
      {
        onSuccess: () => {
          Alert.alert("Success", "Student updated successfully!");
          setSelectedStudent(null); // Close the edit modal
        },
        onError: (error) => {
          Alert.alert("Error", error.message || "Failed to update student.");
        },
      }
    );
  };

  // Handle deleting a student
  const handleDeleteStudent = (studentId: string) => {
    Alert.alert(
      "Delete Student",
      "Are you sure you want to delete this student?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteStudent(
              { batchId: batchId as string, studentId },
              {
                onSuccess: () => {
                  Alert.alert("Success", "Student deleted successfully!");
                },
                onError: (error) => {
                  Alert.alert(
                    "Error",
                    error.message || "Failed to delete student."
                  );
                },
              }
            );
          },
        },
      ]
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
          Error loading students. Please try again.
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Student Management
      </Text>

      {/* Students Table */}
      <ScrollView horizontal>
        <View>
          {/* Table Header */}
          <View
            style={[
              styles.tableHeader,
              { backgroundColor: colors.secondaryBackground },
            ]}
          >
            <Text style={[styles.headerText, { width: 150 }]}>Name</Text>
            <Text style={[styles.headerText, { width: 200 }]}>Email</Text>
            <Text style={[styles.headerText, { width: 100 }]}>Roll No</Text>
            {/* <Text style={[styles.headerText, { width: 150 }]}>Actions</Text> */}
          </View>

          {/* Table Rows */}
          <FlatList
            data={sortedStudents}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.tableRow,
                  { backgroundColor: colors.secondaryBackground },
                ]}
              >
                <Text
                  style={[styles.tableCell, { width: 150, color: colors.text }]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[styles.tableCell, { width: 200, color: colors.text }]}
                >
                  {item.email}
                </Text>
                <Text
                  style={[styles.tableCell, { width: 100, color: colors.text }]}
                >
                  {item.roll_no}
                </Text>
                <View style={[styles.actionsContainer, { width: 150 }]}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: "green" },
                    ]}
                    onPress={() => setSelectedStudent(item)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: "red" },
                    ]}
                    onPress={() => handleDeleteStudent(item._id)}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No students available.
              </Text>
            }
          />
        </View>
      </ScrollView>

      {/* Edit Student Modal */}
      {selectedStudent && (
        <View style={styles.modalContainer}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Edit Student
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.secondaryBackground,
                color: colors.text,
              },
            ]}
            placeholder="Name"
            placeholderTextColor={colors.text}
            value={selectedStudent.name}
            onChangeText={(text) =>
              setSelectedStudent({ ...selectedStudent, name: text })
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.secondaryBackground,
                color: colors.text,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.text}
            value={selectedStudent.email}
            onChangeText={(text) =>
              setSelectedStudent({ ...selectedStudent, email: text })
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.secondaryBackground,
                color: colors.text,
              },
            ]}
            placeholder="Roll No"
            placeholderTextColor={colors.text}
            value={selectedStudent.roll_no}
            onChangeText={(text) =>
              setSelectedStudent({ ...selectedStudent, roll_no: text })
            }
          />
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: colors.secondaryBackground },
            ]}
            onPress={() => {
              if (selectedStudent) {
                handleUpdateStudent(selectedStudent._id, {
                  name: selectedStudent.name,
                  email: selectedStudent.email,
                  roll_no: selectedStudent.roll_no,
                });
              }
            }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              { backgroundColor: colors.secondaryBackground },
            ]}
            onPress={() => setSelectedStudent(null)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Student Button */}
      <Link
        href={`/Home/courses/${courseId}/batches/${batchId}/students/studentUpload`}
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
    textAlign: "center",
  },
  button: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007BFF",
    borderRadius: 100,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tableHeader: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  headerText: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  tableCell: {
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
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
  modalContainer: {
    position: "absolute",
    top: "20%",
    left: "5%",
    right: "5%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default IndexPage;
