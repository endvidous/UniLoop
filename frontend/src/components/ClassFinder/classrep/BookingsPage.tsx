import { useBookings, useDeleteBooking } from "@/src/hooks/api/useClassroom";
import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const BookingsPage = () => {
  const { data: bookings, isLoading, isError, error, refetch } = useBookings();
  const { mutate: deleteBooking } = useDeleteBooking();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (bookingId: string) => {
    Alert.alert(
      "Delete Booking",
      "Are you sure you want to delete this booking?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteBooking(bookingId),
        },
      ]
    );
  };

  const renderBookingItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.classroomText}>
          {item.classroom.block} - Room {item.classroom.room_num}
        </Text>
        <View style={styles.headerRight}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor:
                  item.status === "approved"
                    ? "#4CAF50"
                    : item.status === "rejected"
                    ? "#F44336"
                    : "#FF9800",
              },
            ]}
          />
          <TouchableOpacity
            onPress={() => handleDelete(item._id)}
            style={styles.deleteButton}
          >
            <Icon name="delete" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.purposeText}>{item.purpose}</Text>

      <View style={styles.timeContainer}>
        <Icon name="access-time" size={16} color="#666" />
        <Text style={styles.timeText}>
          {new Date(item.date).toLocaleDateString()} •
          {formatTime(item.startTime)} - {formatTime(item.endTime)}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Icon name="person" size={16} color="#666" />
        <Text style={styles.detailText}>
          {item.requestedBy.name} • {item.requestedByBatch.code}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.statusText,
            {
              color:
                item.status === "approved"
                  ? "#4CAF50"
                  : item.status === "rejected"
                  ? "#F44336"
                  : "#FF9800",
            },
          ]}
        >
          {item.status.toUpperCase()}
        </Text>
      </View>
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
        <Text style={styles.errorText}>
          Error loading bookings: {error.message}
        </Text>
        <Icon
          name="refresh"
          size={30}
          color="#007AFF"
          onPress={onRefresh}
          style={styles.refreshIcon}
        />
      </View>
    );
  }

  return (
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
          <Icon name="event-busy" size={40} color="#666" />
          <Text style={styles.emptyText}>No bookings found</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  classroomText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  purposeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  statusContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#F44336",
    fontSize: 16,
    textAlign: "center",
    margin: 20,
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
  refreshIcon: {
    marginTop: 20,
  },
});

export default BookingsPage;
