import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CreateTimelineModal from "@/src/components/admin/TimelineComponents/CreateTimelineModal";
import TimelineCard from "@/src/components/admin/TimelineComponents/TimelineCard";
import {
  useAcademicTimelines,
  useCreateAcademicTimeline,
  useUpdateAcademicTimeline,
  useDeleteAcademicTimeline,
} from "@/src/hooks/api/useAcademicTimelines";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

const TimelinePage = () => {
  const [showModal, setShowModal] = React.useState(false);
  const [editingTimeline, setEditingTimeline] = React.useState(null); // State for the timeline being edited
  const [academicYear, setAcademicYear] = React.useState("");
  const [oddSemStart, setOddSemStart] = React.useState("");
  const [oddSemEnd, setOddSemEnd] = React.useState("");
  const [evenSemStart, setEvenSemStart] = React.useState("");
  const [evenSemEnd, setEvenSemEnd] = React.useState("");
  const [refreshing, setRefreshing] = React.useState(false);
  const { data, isLoading, isError, error, refetch } = useAcademicTimelines();
  const createMutation = useCreateAcademicTimeline();
  const { mutate: updateTimeline } = useUpdateAcademicTimeline();
  const { mutate: deleteTimeline } = useDeleteAcademicTimeline();
  const { colors } = useTheme();

  const handleSubmit = async (newDates: any) => {
    try {
      await createMutation.mutateAsync({
        academicYear: newDates.academicYear,
        oddSemester: {
          start: newDates.oddSemStart,
          end: newDates.oddSemEnd,
        },
        evenSemester: {
          start: newDates.evenSemStart,
          end: newDates.evenSemEnd,
        },
      });
      setShowModal(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error.message ||
        "An unexpected error occurred";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleDelete = async (timelineId: string) => {
    try {
      deleteTimeline(timelineId); // Triggering the delete mutation
      Alert.alert("Success", "Timeline deleted successfully!");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error.message ||
        "An error occurred while deleting the timeline";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleUpdate = async () => {
    if (!editingTimeline) return;

    const updatedData = {
      academicYear,
      oddSemester: {
        start: oddSemStart,
        end: oddSemEnd,
      },
      evenSemester: {
        start: evenSemStart,
        end: evenSemEnd,
      },
    };

    try {
      updateTimeline({
        id: editingTimeline._id,
        data: updatedData,
      });
      setEditingTimeline(null); // Close the edit form
      Alert.alert("Success", "Timeline updated successfully!");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error.message ||
        "An error occurred while updating the timeline";
      Alert.alert("Error", errorMessage);
    }
  };

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
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error loading timelines: {error.message}
        </Text>
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
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.noTimelinesText, { color: colors.text }]}>
              No timelines available
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TimelineCard
            academicYear={item.academicYear}
            oddSemester={item.oddSemester}
            evenSemester={item.evenSemester}
            id={item._id}
            onEdit={() => {
              setEditingTimeline(item); // Set the item being edited
              setAcademicYear(item.academicYear);
              setOddSemStart(item.oddSemester.start);
              setOddSemEnd(item.oddSemester.end);
              setEvenSemStart(item.evenSemester.start);
              setEvenSemEnd(item.evenSemester.end);
            }}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Edit Modal/Card */}
      {editingTimeline && (
        <View style={styles.editCard}>
          <Text style={styles.editTitle}>Edit Timeline</Text>

          {/* Academic Year */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Academic Year</Text>
            <TextInput
              style={styles.input}
              placeholder="Academic Year"
              value={academicYear}
              onChangeText={setAcademicYear}
            />
          </View>

          {/* Odd Semester Start */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Odd Semester Start</Text>
            <TextInput
              style={styles.input}
              placeholder="Odd Semester Start"
              value={oddSemStart}
              onChangeText={setOddSemStart}
            />
          </View>

          {/* Odd Semester End */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Odd Semester End</Text>
            <TextInput
              style={styles.input}
              placeholder="Odd Semester End"
              value={oddSemEnd}
              onChangeText={setOddSemEnd}
            />
          </View>

          {/* Even Semester Start */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Even Semester Start</Text>
            <TextInput
              style={styles.input}
              placeholder="Even Semester Start"
              value={evenSemStart}
              onChangeText={setEvenSemStart}
            />
          </View>

          {/* Even Semester End */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Even Semester End</Text>
            <TextInput
              style={styles.input}
              placeholder="Even Semester End"
              value={evenSemEnd}
              onChangeText={setEvenSemEnd}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setEditingTimeline(null)} // Close the edit card
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleUpdate} // Confirm the update
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.fab, { shadowColor: colors.shadowcolor }]}
        onPress={() => setShowModal(true)}
        accessibilityLabel="Create new timeline"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <CreateTimelineModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  noTimelinesText: {
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
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  editCard: {
    position: "absolute",
    top: "10%",
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    marginBottom: 10,
    padding: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  confirmButton: {
    backgroundColor: "#007BFF",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
});

export default TimelinePage;
