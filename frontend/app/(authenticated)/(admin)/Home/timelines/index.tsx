import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CreateTimelineModal from "@/src/components/admin/TimelineComponents/CreateTimelineModal";
import TimelineCard from "@/src/components/admin/TimelineComponents/TimelineCard";

interface Timeline {
  academicYear: string;
  oddSemester: { start: string; end: string };
  evenSemester: { start: string; end: string };
}

const TimelinePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [timelines, setTimelines] = useState<Timeline[]>([]);

  const handleSubmit = (newDates: any) => {
    const { academicYear, oddSemStart, oddSemEnd, evenSemStart, evenSemEnd } =
      newDates;

    // Create new timeline (validation is already handled in CreateTimelineModal)
    const newTimeline: Timeline = {
      academicYear,
      oddSemester: { start: oddSemStart, end: oddSemEnd },
      evenSemester: { start: evenSemStart, end: evenSemEnd },
    };

    setTimelines((prev) => [...prev, newTimeline]);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={timelines}
        keyExtractor={(item) => item.academicYear}
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
});

export default TimelinePage;
