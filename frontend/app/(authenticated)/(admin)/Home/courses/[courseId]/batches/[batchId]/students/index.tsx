import React, { useState, useMemo } from "react";
import {
  SafeAreaView,
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
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import {
  useBatchStudents,
  useUpdateStudent,
  useDeleteStudent,
  useAssignMentor,
  useDepartmentTeachers,
  useRemoveMentor,
} from "@/src/hooks/api/useUser";
import { useLocalSearchParams, Link } from "expo-router";
import { useUserAssociations } from "@/src/hooks/api/useAssociations";
import { useGetBatch } from "@/src/hooks/api/useCourses";
import { Teacher } from "@/src/services/api/userAPI";

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

  // New state for mentor modal and view
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showMentorsModal, setShowMentorsModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  // Fetch students for the batch
  const {
    data: studentsData,
    isFetching,
    isError,
    refetch,
  } = useBatchStudents(batchId as string);
  const { data: batchData } = useGetBatch(batchId);

  // Sort students (by roll_no)
  const sortedStudents = useMemo(() => {
    if (!studentsData?.data) return [];
    return [...studentsData.data].sort((a, b) => {
      const rollA = a.roll_no || "";
      const rollB = b.roll_no || "";
      return rollA.localeCompare(rollB, undefined, { numeric: true });
    });
  }, [studentsData?.data]);

  // Mutations
  const { mutate: updateStudent } = useUpdateStudent();
  const { mutate: deleteStudent } = useDeleteStudent();
  const { mutate: assignMentor } = useAssignMentor();
  const { mutate: removeMentor } = useRemoveMentor();
  const { data: associations } = useUserAssociations();
  const departments = associations?.departments;
  const { data: teachers } = useDepartmentTeachers(selectedDepartment);

  //mentors
  const mentors = (batchData?.data.mentors as Teacher[]) || [];

  const isRollNumberDuplicate = (
    roll_no: string,
    studentId: string
  ): boolean => {
    if (!studentsData?.data) return false;
    return studentsData.data.some(
      (student) => student._id !== studentId && student.roll_no === roll_no
    );
  };

  const handleUpdateStudent = (
    studentId: string,
    updates: Partial<Student>
  ) => {
    if (updates.roll_no && isRollNumberDuplicate(updates.roll_no, studentId)) {
      Alert.alert(
        "Duplicate Roll Number",
        `A student is already assigned with roll no: ${updates.roll_no}`
      );
      return;
    }
    updateStudent(
      { batchId: batchId as string, studentId, updates },
      {
        onSuccess: () => {
          Alert.alert("Success", "Student updated successfully!");
          setSelectedStudent(null);
        },
        onError: (error: any) => {
          Alert.alert(
            "Update Failed",
            error.message || "Failed to update student."
          );
        },
      }
    );
  };

  const handleDeleteStudent = (studentId: string) => {
    Alert.alert(
      "Confirm Deletion",
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
                onError: (error: any) => {
                  Alert.alert(
                    "Deletion Failed",
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

  const handleAssignMentor = () => {
    if (!selectedTeacher) {
      Alert.alert(
        "Missing Selection",
        "Please select a teacher to assign as mentor."
      );
      return;
    }
    assignMentor(
      { teacherId: selectedTeacher, batchId },
      {
        onSuccess: () => {
          Alert.alert("Success", "Mentor assigned successfully!");
          // Reset selections and close modal
          setSelectedDepartment("");
          setSelectedTeacher("");
          setShowMentorModal(false);
        },
        onError: (error: any) => {
          Alert.alert(
            "Assignment Failed",
            error.message || "Failed to assign mentor."
          );
        },
      }
    );
  };

  const handleRemoveMentor = (mentorId: string) => {
    Alert.alert(
      "Confirm Removal",
      "Are you sure you want to remove this mentor?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeMentor(
              { teacherId: mentorId, batchId },
              {
                onSuccess: () => {
                  Alert.alert("Success", "Mentor removed successfully!");
                },
                onError: (error: any) => {
                  Alert.alert(
                    "Removal Failed",
                    error.message || "Failed to remove mentor."
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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading students. Please try again.
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Render each student as a slim, centered card
  const renderStudentCard = ({ item }: { item: Student }) => (
    <View
      style={[styles.card, { backgroundColor: colors.secondaryBackground }]}
    >
      <View style={styles.cardContent}>
        <Text
          style={[styles.cardTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={[styles.cardText, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.email}
        </Text>
        <Text
          style={[styles.cardText, { color: colors.text }]}
          numberOfLines={1}
        >
          Roll No: {item.roll_no || "N/A"}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.cardButton, { backgroundColor: "green" }]}
          onPress={() => setSelectedStudent(item)}
        >
          <Text style={styles.cardButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cardButton, { backgroundColor: "red" }]}
          onPress={() => handleDeleteStudent(item._id)}
        >
          <Text style={styles.cardButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#5aa7ff" }]}
          onPress={() => setShowMentorModal(true)}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            Assign Mentor
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
          onPress={() => setShowMentorsModal(true)}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            View Mentors
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.pageTitle, { color: colors.text }]}>
        Student Management
      </Text>
      <FlatList
        data={sortedStudents}
        keyExtractor={(item) => item._id}
        renderItem={renderStudentCard}
        contentContainerStyle={styles.cardsContainer}
      />

      {/* Edit Student Modal */}
      {selectedStudent && (
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, { backgroundColor: colors.background }]}
          >
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
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "green" }]}
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
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "gray" }]}
                onPress={() => setSelectedStudent(null)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Mentors Modal */}
      {showMentorsModal && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.background,
                maxHeight: "70%",
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Batch Mentors
            </Text>
            {mentors?.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No mentors assigned to this batch.
              </Text>
            ) : (
              <ScrollView>
                {mentors?.map((mentor) => (
                  <View
                    key={mentor.name}
                    style={[
                      styles.mentorCard,
                      { backgroundColor: colors.secondaryBackground },
                    ]}
                  >
                    <View style={styles.mentorInfo}>
                      <Text style={[styles.mentorName, { color: colors.text }]}>
                        {mentor.name}
                      </Text>
                      <Text
                        style={[styles.mentorEmail, { color: colors.text }]}
                      >
                        {mentor.email}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.removeButton, { backgroundColor: "red" }]}
                      onPress={() => {
                        handleRemoveMentor(mentor._id);
                      }}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: "#2e66ff", marginTop: 10 },
              ]}
              onPress={() => setShowMentorsModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Mentor Assignment Modal */}
      {showMentorModal && (
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Assign Mentor
            </Text>
            {/* Department Picker */}
            <Text style={[styles.label, { color: colors.text }]}>
              Select Department
            </Text>
            <Picker
              selectedValue={selectedDepartment}
              onValueChange={(itemValue) => {
                setSelectedDepartment(itemValue);
                setSelectedTeacher(""); // Reset teacher when department changes
              }}
              style={[
                styles.picker,
                { backgroundColor: colors.secondaryBackground },
              ]}
            >
              <Picker.Item label="-- Select Department --" value="" />
              {departments?.map((dept: any) => (
                <Picker.Item
                  key={dept.id || dept._id}
                  label={dept.name}
                  value={dept.id || dept._id}
                />
              ))}
            </Picker>
            {/* Teacher Picker */}
            <Text style={[styles.label, { color: colors.text }]}>
              Select Teacher
            </Text>
            <Picker
              selectedValue={selectedTeacher}
              onValueChange={(itemValue) => {
                setSelectedTeacher(itemValue);
              }}
              style={[
                styles.picker,
                { backgroundColor: colors.secondaryBackground },
              ]}
            >
              <Picker.Item label="-- Select Teacher --" value="" />
              {teachers?.data?.map((teacher: any) => (
                <Picker.Item
                  key={teacher._id}
                  label={teacher.name}
                  value={teacher._id}
                />
              ))}
            </Picker>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "green" }]}
                onPress={handleAssignMentor}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#2e66ff" }]}
                onPress={() => setShowMentorModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Add Student Button */}
      <Link
        href={`/Home/courses/${courseId}/batches/${batchId}/students/studentUpload`}
        asChild
      >
        <TouchableOpacity style={styles.addButton}>
          <Icon name="add" size={40} color="white" />
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  actionButton: {
    width: "40%",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  actionButtonText: {
    fontWeight: "bold",
  },
  mentorCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
  },
  mentorInfo: {
    flex: 1,
    marginRight: 10,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  mentorEmail: {
    fontSize: 14,
    marginTop: 5,
  },
  mentorDepartment: {
    fontSize: 12,
    color: "gray",
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 16,
  },
  assignMentor: {
    backgroundColor: "#5aa7ff",
    width: "80%",
    alignSelf: "center",
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
    borderColor: "gray",
    elevation: 8,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  card: {
    width: "90%",
    alignSelf: "center",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 3,
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardActions: {
    flexDirection: "row",
  },
  cardButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginLeft: 5,
  },
  cardButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
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
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007BFF",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  picker: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
});

export default IndexPage;
