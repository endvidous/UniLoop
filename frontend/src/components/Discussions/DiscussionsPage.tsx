import {
  FlatList,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from "react-native";
import DiscussionCard from "./DiscussionCard";
import SearchFilterHeader from "../common/SearchFilter";
import { useDiscussions } from "@/src/hooks/api/useDiscussions";
import { useCallback, useState } from "react";
import type { FilterState } from "../common/FilterModal";
import { Ionicons } from "@expo/vector-icons";
import CreateDiscussion from "./CreateDiscussion";

const DiscussionsPage = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    department: "",
    course: "",
    batch: "",
    priority: [],
    sort: "newest",
    visibilityType: "",
  });

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
  } = useDiscussions(filters);

  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDiscussionCreated = () => {
    setShowModal(false);
    refetch(); // Refresh the announcements list
  };

  const discussions = data?.pages.flatMap((page) => page.discussions) || [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage]);

  if (isLoading && !data) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (isError) {
    return (
      <Text style={styles.error}>
        Error loading discussions {error.message}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <SearchFilterHeader
        filters={filters}
        setFilters={setFilters}
        configType="Discussions"
      />

      <FlatList
        data={discussions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <DiscussionCard discussion={item} />}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <Text style={styles.empty}>No discussions found</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator size="small" /> : null
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

      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <CreateDiscussion onDismiss={handleDiscussionCreated} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loader: {
    marginTop: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  listContent: {
    padding: 16,
  },
  empty: {
    textAlign: "center",
    color: "#666",
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

export default DiscussionsPage;
