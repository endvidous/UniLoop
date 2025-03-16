import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

interface LocalSearchFilterComponentProps {
  data: any[];
  searchKeys: string[];
  checkboxFilters?: { [key: string]: string[] };
  setFilteredData: (data: any[]) => void;
  placeholder?: string;
}

const LocalSearchFilterComponent: React.FC<LocalSearchFilterComponentProps> = ({
  data,
  searchKeys,
  checkboxFilters = {},
  setFilteredData,
  placeholder = "Search...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    [key: string]: { [value: string]: boolean };
  }>({});

  // Initialize checkbox filters on mount
  useEffect(() => {
    const initialFilters: { [key: string]: { [value: string]: boolean } } = {};

    Object.keys(checkboxFilters).forEach((key) => {
      initialFilters[key] = {};
      checkboxFilters[key].forEach((value) => {
        initialFilters[key][value] = false;
      });
    });

    setActiveFilters(initialFilters);
  }, []);

  // Apply filtering
  useEffect(() => {
    // Skip if data isn't valid
    if (!data || !Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    let results = [...data];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter((item) => {
        if (!item) return false;

        return searchKeys.some((key) => {
          const value = item[key];
          return (
            value &&
            typeof value === "string" &&
            value.toLowerCase().includes(term)
          );
        });
      });
    }

    // Apply checkbox filters
    Object.keys(activeFilters).forEach((filterKey) => {
      const selectedValues = Object.keys(activeFilters[filterKey] || {}).filter(
        (value) => activeFilters[filterKey][value]
      );

      if (selectedValues.length > 0) {
        results = results.filter((item) => {
          if (!item || typeof item !== "object") return false; // Ensure item is valid

          // If none of the selected fields exist in the item, exclude it
          return selectedValues.some((fieldName) => {
            // Field must exist and have a non-empty value
            return Object.hasOwn(item, fieldName) && item[fieldName] !== "";
          });
        });
      }
    });

    setFilteredData(results);
  }, [data, searchTerm, JSON.stringify(activeFilters), setFilteredData]);

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
  };

  // Toggle a checkbox filter
  const toggleFilter = (filterKey: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterKey]: {
        ...(prev[filterKey] || {}),
        [value]: !(prev[filterKey]?.[value] || false),
      },
    }));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={searchTerm}
        onChangeText={handleSearchChange}
      />

      {Object.keys(checkboxFilters).map((filterKey) => (
        <View key={filterKey} style={styles.filterGroup}>
          <Text style={styles.filterTitle}>{filterKey}</Text>
          <View style={styles.checkboxContainer}>
            {checkboxFilters[filterKey].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.checkbox,
                  activeFilters[filterKey]?.[value] && styles.checkboxActive,
                ]}
                onPress={() => toggleFilter(filterKey, value)}
              >
                <Text>{value === "mentor_of" ? "Is Mentor" : value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderBottomColor: "black", borderBottomWidth: 0.7 },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  filterGroup: {
    marginBottom: 10,
  },
  filterTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  checkboxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  checkbox: {
    padding: 8,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    marginRight: 8,
    marginBottom: 5,
  },
  checkboxActive: {
    backgroundColor: "lightblue",
  },
});

export default LocalSearchFilterComponent;
