import {
  FlatList,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
} from "react-native";
import DiscussionCard from "./DiscussionCard";
import SearchFilterHeader from "../common/SearchFilter";
import { useDiscussions } from "@/src/hooks/api/useDiscussions";
import { useCallback, useState } from "react";
import type { FilterState } from "../common/FilterModal";

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

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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
});

export default DiscussionsPage;
