import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Meeting } from "@/src/services/api/meetingsAPI";
import { useAuth } from "@/src/context/AuthContext";
import { RelativePathString, useRouter } from "expo-router";

const MeetingCard = ({ meeting }: { meeting: Meeting }) => {
  const router = useRouter();
  const { user } = useAuth();
  const isRequester = meeting.requestedBy._id === user?.id;

  // Navigation
  const onPress = () => {
    const basepath =
      `/(authenticated)/(${user?.role})/Meetings/[meetingId]` as RelativePathString;
    router.push({
      pathname: basepath,
      params: { meetingId: meeting._id },
    });
  };

  const getStatusData = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Pending", color: "#fa7928" };
      case "rejected":
        return { label: "Rejected", color: "#dc2626" };
      case "completed":
        return { label: "Completed", color: "#6fff00" };
      case "approved":
        return { label: "Approved", color: "#16a34a" };
      default:
        return { label: "Normal", color: "#16a34a" };
    }
  };

  const { label, color } = getStatusData(meeting.status);
  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: color, borderWidth: 1 }]}
      onPress={onPress}
    >
      <Text style={styles.withText}>
        With:{" "}
        <Text style={styles.nameText}>
          {isRequester ? meeting.requestedTo.name : meeting.requestedBy.name}
        </Text>
      </Text>
      <Text style={styles.title}>{meeting.purpose}</Text>
      {meeting.timing && (
        <Text style={styles.timingText}>
          Due: {new Date(meeting.timing).toLocaleDateString()}
        </Text>
      )}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color }]}>
          {label.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  withText: {
    fontSize: 14,
    color: "#555",
  },
  nameText: {
    fontWeight: "600",
    color: "#333",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 8,
    color: "#222",
  },
  timingText: {
    fontSize: 14,
    color: "#666",
  },
  statusContainer: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default MeetingCard;
