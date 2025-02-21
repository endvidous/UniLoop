// src/components/common/SearchFilterHeader.tsx
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { debounce } from "lodash";
import FilterModal from "./FilterModal";
import type { FilterState } from "./FilterModal";
import { useCallback, useEffect, useState } from "react";

type SearchFilterHeaderProps = {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  placeholder?: string;
  configType: string;
};

const SearchFilterHeader = ({
  filters,
  setFilters,
  placeholder = "Search...",
  configType,
}: SearchFilterHeaderProps) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search);

  // Create a memoized debounced search function
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setFilters((prev) => ({ ...prev, search: text }));
    }, 1000),
    [] // Empty dependency array since we don't want to recreate this function
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Update local state immediately and trigger debounced search
  const handleTextChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  // Update local search query when filters change externally
  useEffect(() => {
    setSearchQuery(filters.search);
  }, [filters.search]);

  const DiscussionConfig = {
    includePriority: false, // Hide priority for discussions
    sortOptions: [
      { label: "Newest", value: "newest" },
      { label: "Popular", value: "popular" },
      { label: "Controversial", value: "controversial" },
    ],
  };

  const AnnouncementConfig = {
    includePriority: true,
    sortOptions: [
      { label: "Newest", value: "newest" },
      { label: "Priority", value: "priority" },
      { label: "Urgent", value: "urgent" },
    ],
  };

  const config =
    "Announcements" === configType ? AnnouncementConfig : DiscussionConfig;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        onChangeText={handleTextChange}
        value={searchQuery}
        right={<Ionicons name="search-circle-outline" />}
      />

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
      >
        <Ionicons name="filter" size={24} color="#007BFF" />
      </TouchableOpacity>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        config={config}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    flex: 1,
    marginRight: 16,
    backgroundColor: "#fff",
    height: 40,
  },
  filterButton: {
    padding: 8,
  },
});

export default SearchFilterHeader;
