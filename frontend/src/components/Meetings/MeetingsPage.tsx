import {
  StyleSheet,
  SectionList,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useMeetings } from "@/src/hooks/api/useMeetings";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import MeetingCard from "./MeetingCard";
import CreateMeetingPage from "./CreateMeetingPage";
import { useAuth } from "@/src/context/AuthContext";
import { Meeting } from "@/src/services/api/meetingsAPI";
const MeetingsList = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);

  //Destructuring data received
  const { data, isLoading, error, isError, refetch } = useMeetings();
  const meetings = data?.meetings || [];
  // Logged in user data
  const { user } = useAuth();
  const userId = user?.id || "";
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleMeetingCreated = () => {
    setShowModal(false);
    refetch();
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
          Error loading meetings: {error.message}
        </Text>
      </ScrollView>
    );
  }

  // Group meetings in one pass using reduce
  const groupMeetings = (meetings: Meeting[], userId: string) => {
    return meetings.reduce(
      (acc: { requestedBy: Meeting[]; requests: Meeting[] }, meeting) => {
        if (meeting.requestedBy._id === userId) {
          acc.requestedBy.push(meeting);
        }
        if (meeting.requestedTo._id === userId) {
          acc.requests.push(meeting);
        }
        return acc;
      },
      { requestedBy: [], requests: [] }
    );
  };

  const { requestedBy, requests } = groupMeetings(meetings, userId);

  return (
    <View style={styles.container}>
      <SectionList
        sections={[
          { title: "Requests", data: requests },
          { title: "Requested by You", data: requestedBy },
        ].filter((section) => section.data.length > 0)}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <MeetingCard meeting={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        ListEmptyComponent={<Text>No meetings found</Text>}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={[styles.fab, { shadowColor: colors.shadowcolor }]}
        onPress={() => setShowModal(true)}
        accessibilityLabel="Create a meeting"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <CreateMeetingPage onDismiss={handleMeetingCreated} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  listContent: { paddingBottom: 16 },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#f4f4f4",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 10,
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
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default MeetingsList;
