import {
  RefreshControl,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAnnouncements } from "@/src/hooks/api/useAnnouncements";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AnnouncementCard from "./AnnouncementCard";
import { FilterState } from "../common/FilterModal";
import SearchFilterHeader from "../common/SearchFilter";

const AnnouncementsPage = () => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    department: "",
    course: "",
    batch: "",
    search: "",
    priority: [],
    sort: "newest",
    visibilityType: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, isError, error, refetch } =
    useAnnouncements(filters);

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
          Error loading announcements: {error.message}
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <SearchFilterHeader
        filters={filters}
        setFilters={setFilters}
        placeholder="Search announcements..."
      />
      <FlatList
        data={data?.announcements || []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.noTimelinesText}>No Announcements Made</Text>
          </View>
        }
        renderItem={({ item }) => <AnnouncementCard announcement={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
        accessibilityLabel="Create new announcement"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
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
  filterButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
});

export default AnnouncementsPage;
