import {
  StyleSheet,
  SectionList,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useMeetings } from "@/src/hooks/api/useMeetings";
import { useState } from "react";
import MeetingCard from "./MeetingCard";
import { useAuth } from "@/src/context/AuthContext";
import { Meeting } from "@/src/services/api/meetingsAPI";
const MeetingsList = () => {
  const [refreshing, setRefreshing] = useState(false);

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
});

export default MeetingsList;
