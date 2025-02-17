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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CreateTimelineModal from "@/src/components/admin/TimelineComponents/CreateTimelineModal";
import TimelineCard from "@/src/components/admin/TimelineComponents/TimelineCard";
import {
  useAcademicTimelines,
  useCreateAcademicTimeline,
} from "@/src/hooks/api/useAcademicTimelines";

const TimelinePage = () => {
  const [showModal, setShowModal] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const { data, isLoading, isError, error, refetch } = useAcademicTimelines();
  const createMutation = useCreateAcademicTimeline();

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
    <View style={styles.container}>
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.noTimelinesText}>No timelines available</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TimelineCard
            academicYear={item.academicYear}
            oddSemester={item.oddSemester}
            evenSemester={item.evenSemester}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
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
    backgroundColor: "#f4f4f4",
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
});

export default TimelinePage;
