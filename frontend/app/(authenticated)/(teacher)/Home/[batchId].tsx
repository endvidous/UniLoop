import { useGetBatch } from "@/src/hooks/api/useCourses";
import { Batch } from "@/src/services/api/courseAPI";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useState, useEffect } from "react";
import {
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import CreateAnnouncement from "@/src/components/Announcements/CreateAnnouncement";
import CreateDiscussion from "@/src/components/Discussions/CreateDiscussion";
import CreateAssignment from "@/src/components/Assignments/CreateAssignment";
import { Student } from "@/src/services/api/userAPI";
import LocalSearchFilterComponent from "@/src/components/common/LocalSearchFilter";
import { FlatList } from "react-native-gesture-handler";
import CreateMeetingPage from "@/src/components/Meetings/CreateMeetingPage";
import { useAssignClassRep } from "@/src/hooks/api/useUser";
import { toast } from "@backpackapp-io/react-native-toast";

const BatchPage = () => {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const navigation = useNavigation();
  const { data: response, error, isLoading, refetch } = useGetBatch(batchId);
  const batch = response?.data as Batch & { students: Student[] };
  const [refreshing, setRefreshing] = useState(false);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showMeetingModal, setMeetingModal] = useState(false);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [showClassRepsModal, setShowClassRepsModal] = useState(false);

  // State to keep track of selected class reps (by their ID)
  const [selectedClassReps, setSelectedClassReps] = useState<string[]>([]);
  // State for filtered students in the class rep picker
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: batch?.code || "Batch Details",
    });
  }, [navigation, batch]);

  // Update filtered students when batch.students changes
  useEffect(() => {
    console.log(batch);
    if (batch?.students) {
      setFilteredStudents(batch.students);
    }
    if (batch?.classReps && batch.classReps.length > 0) {
      setSelectedClassReps(
        batch.classReps.map((rep) => (typeof rep === "string" ? rep : rep._id))
      );
    }
  }, [batch?.students, batch?.classReps]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={{ fontSize: 16, margin: 16 }}>
          Error loading data. Pull down to refresh.
        </Text>
      </ScrollView>
    );
  }

  // Toggle a student's selection (max 6 allowed)
  const toggleStudent = (studentId: string) => {
    if (selectedClassReps.includes(studentId)) {
      setSelectedClassReps(selectedClassReps.filter((id) => id !== studentId));
    } else {
      if (selectedClassReps.length < 6) {
        setSelectedClassReps([...selectedClassReps, studentId]);
      } else {
        alert("You can select only 6 students.");
      }
    }
  };

  // Remove all selected class reps
  const removeAllClassReps = () => {
    setSelectedClassReps([]);
    // Optionally, call your API to remove assigned class reps
    alert("All class reps removed.");
  };

  const { mutate: assignClassRep } = useAssignClassRep();

  const handleConfirmClassReps = () => {
    console.log("Assigned Class Reps:", selectedClassReps);
    selectedClassReps.forEach((studentId) => {
      assignClassRep(
        { studentId, batchId },
        {
          onSuccess: (data) => {
            console.log(
              `Successfully assigned class rep for student: ${studentId}`,
              data
            );
          },
          onError: (error) => {
            console.error(
              `Error assigning class rep for student: ${studentId}`,
              error
            );
          },
        }
      );
    });
    toast.success("All classreps assigned");
    setShowClassRepsModal(false);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>
        What do you want to do?
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: "#007BFF",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 10,
        }}
        onPress={() => setShowAssignmentModal(true)}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Create an Assignment
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: "#007BFF",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 10,
        }}
        onPress={() => setMeetingModal(true)}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Create a Meeting
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: "#007BFF",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 10,
        }}
        onPress={() => setShowAnnouncementModal(true)}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Create an Announcement
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: "#007BFF",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 10,
        }}
        onPress={() => setShowDiscussionModal(true)}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Create a Discussion
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: "#007BFF",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 10,
        }}
        onPress={() => setShowClassRepsModal(true)}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Assign Class Reps to {batch.code}
        </Text>
      </TouchableOpacity>

      {/* Modals for the options */}

      {/* Assignment modal */}
      <Modal
        visible={showAssignmentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAssignmentModal(false)}
      >
        <CreateAssignment
          onDismiss={() => setShowAssignmentModal(false)}
          batchId={batchId}
        />
      </Modal>

      {/* Meeting modal */}
      <Modal
        visible={showMeetingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMeetingModal(false)}
      >
        <CreateMeetingPage onDismiss={() => setMeetingModal(false)} />
      </Modal>

      {/* Announcement modal */}
      <Modal
        visible={showAnnouncementModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAnnouncementModal(false)}
      >
        <CreateAnnouncement
          onDismiss={() => setShowAnnouncementModal(false)}
          batchId={batchId}
        />
      </Modal>

      {/* Discussion modal */}
      <Modal
        visible={showDiscussionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDiscussionModal(false)}
      >
        <CreateDiscussion
          onDismiss={() => setShowDiscussionModal(false)}
          batchId={batchId}
        />
      </Modal>

      {/* Class Reps Assignment Modal */}
      <Modal
        visible={showClassRepsModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowClassRepsModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "90%",
              maxHeight: "80%",
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Assign Class Reps
            </Text>

            {/* Search Filter Component */}
            <LocalSearchFilterComponent
              data={batch.students}
              searchKeys={["name", "roll_no"]}
              setFilteredData={setFilteredStudents}
              placeholder="Search students..."
            />

            <FlatList
              style={{ marginVertical: 20 }}
              data={filteredStudents}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => {
                const isSelected = selectedClassReps.includes(item._id);
                return (
                  <TouchableOpacity onPress={() => toggleStudent(item._id)}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 10,
                        backgroundColor: isSelected ? "#d0f0c0" : "#f0f0f0",
                        borderRadius: 5,
                        marginBottom: 5,
                      }}
                    >
                      <Text>
                        {item.roll_no} - {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "red",
                  padding: 10,
                  borderRadius: 5,
                }}
                onPress={removeAllClassReps}
              >
                <Text style={{ color: "white" }}>Remove All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#007BFF",
                  padding: 10,
                  borderRadius: 5,
                }}
                onPress={handleConfirmClassReps}
              >
                <Text style={{ color: "white" }}>Confirm</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{ marginTop: 10, alignSelf: "center" }}
              onPress={() => setShowClassRepsModal(false)}
            >
              <Text style={{ color: "#007BFF" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BatchPage;
