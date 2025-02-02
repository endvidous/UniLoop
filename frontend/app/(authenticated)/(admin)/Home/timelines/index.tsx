import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CreateTimelineModal from "@/src/components/admin/TimelineComponents/CreateTimelineModal";
import TimelineCard from "@/src/components/admin/TimelineComponents/TimelineCard";

const TimelinePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [timelines, setTimelines] = useState<any[]>([]);

  const handleSubmit = (newDates: any) => {
    const { academicYear, oddSemStart, oddSemEnd, evenSemStart, evenSemEnd } =
      newDates;

    const newTimeline = {
      academicYear,
      oddSemester: { start: oddSemStart, end: oddSemEnd },
      evenSemester: { start: evenSemStart, end: evenSemEnd },
    };

    setTimelines([...timelines, newTimeline]);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {timelines.length === 0 ? (
          <Text style={styles.noTimelinesText}>No timelines available</Text>
        ) : (
          timelines.map((timeline, index) => (
            <TimelineCard
              key={index}
              academicYear={timeline.academicYear}
              oddSemester={timeline.oddSemester}
              evenSemester={timeline.evenSemester}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
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
  scrollContent: {
    padding: 20,
  },
  noTimelinesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
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
