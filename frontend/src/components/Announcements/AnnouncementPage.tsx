import {
  RefreshControl,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useAnnouncements } from "@/src/hooks/api/useAnnouncements";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AnnouncementCard from "./AnnouncementCard";
import CreateAnnouncement from "./CreateAnnouncement";
import { FilterState } from "../common/FilterModal";
import SearchFilterHeader from "../common/SearchFilter";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import type { RelativePathString } from "expo-router";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
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

  const handleAnnouncementCreated = () => {
    setShowModal(false);
    refetch(); // Refresh the announcements list
  };

  const onPress = (id: string) => {
    const basepath =
      `/(authenticated)/(${user?.role})/Announcements/[announcementId]` as RelativePathString;
    router.push({
      pathname: basepath,
      params: { announcementId: id },
    });
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
          Error loading announcements: {error.message}
        </Text>
      </ScrollView>
    );
  }
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.secondaryBackground },
      ]}
    >
      <SearchFilterHeader
        filters={filters}
        setFilters={setFilters}
        placeholder="Search announcements..."
        configType="Announcements"
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
        renderItem={({ item }) => (
          <AnnouncementCard announcement={item} onPress={onPress} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {(user?.role === "teacher" ||
        user?.role === "admin" ||
        user?.classrep_of) && (
        <TouchableOpacity
          style={[styles.fab, { shadowColor: colors.shadowcolor }]}
          onPress={() => setShowModal(true)}
          accessibilityLabel="Create new announcement"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="account-voice"
            size={30}
            color="white"
          />
        </TouchableOpacity>
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <CreateAnnouncement onDismiss={handleAnnouncementCreated} />
      </Modal>
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
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
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
