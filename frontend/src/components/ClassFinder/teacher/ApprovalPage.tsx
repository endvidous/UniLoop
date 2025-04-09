import {
  useApproveBooking,
  useBookings,
  useRejectBooking,
} from "@/src/hooks/api/useClassroom";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const ClassroomBookingApproval = () => {
  const { data: bookings, isLoading, isError, error, refetch } = useBookings();
  const { mutate: approveBooking } = useApproveBooking();
  const { mutate: rejectBooking } = useRejectBooking();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleApprove = (bookingId: string) => {
    Alert.alert(
      "Confirm Approval",
      "Are you sure you want to approve this booking?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: () => approveBooking(bookingId),
        },
      ]
    );
  };

  const handleReject = (bookingId: string) => {
    Alert.alert(
      "Confirm Rejection",
      "Are you sure you want to reject this booking?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => rejectBooking({ bookingId }),
        },
      ]
    );
  };

  const renderBookingItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="meeting-room" size={24} color="#333" />
        <Text style={styles.classroomText}>
          {item.classroom.block}: Room {item.classroom.room_num}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "approved"
                  ? "#4CAF50"
                  : item.status === "rejected"
                  ? "#F44336"
                  : "#FFA726",
            },
          ]}
        >
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.purpose}>Purpose: {item.purpose}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requested By</Text>
        <Text style={styles.detailText}>
          {item.requestedBy.name} ({item.requestedBy.email})
        </Text>
        <Text style={styles.detailText}>
          Batch: {item.requestedByBatch.code}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Details</Text>
        <Text style={styles.detailText}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={styles.detailText}>
          {formatTime(item.startTime)} - {formatTime(item.endTime)}
        </Text>
      </View>

      {item.status === "rejected" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rejection Reason</Text>
          <Text style={[styles.detailText, { color: "#F44336" }]}>
            {item.rejectionReason}
          </Text>
        </View>
      )}

      {item.status === "pending" && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.approveButton]}
            onPress={() => handleApprove(item._id)}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => handleReject(item._id)}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, "0")} ${period}`;
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
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="event-available" size={40} color="#666" />
            <Text style={styles.emptyText}>No pending requests</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  classroomText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  purpose: {
    fontSize: 16,
    color: "#444",
    marginBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  errorText: {
    color: "#F44336",
    fontSize: 16,
    textAlign: "center",
    margin: 20,
  },
  refreshButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#2196F3",
    borderRadius: 6,
  },
  refreshText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ClassroomBookingApproval;
