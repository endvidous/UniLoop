import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

interface SearchablePickerConfig {
  labelKey?: string;
  valueKey?: string;
  searchKeys?: string[];
}

interface SearchablePickerProps {
  items: any[];
  selectedValue: string | number | null;
  onValueChange: (value: string | number | null) => void;
  placeholder?: string;
  config?: SearchablePickerConfig;
}

const SearchablePicker: React.FC<SearchablePickerProps> = ({
  items,
  selectedValue,
  onValueChange,
  placeholder = "Select an option",
  config = {},
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Destructure config with defaults
  const { labelKey = "label", valueKey = "value", searchKeys } = config;

  // Filter items based on search query.
  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const keysToSearch =
      searchKeys && searchKeys.length ? searchKeys : [labelKey];
    return keysToSearch.some((key) => {
      const fieldValue = item[key];
      return (
        fieldValue &&
        fieldValue.toString().toLowerCase().includes(search.toLowerCase())
      );
    });
  });

  // Get the currently selected item for display.
  const selectedItem = items.find((item) => item[valueKey] === selectedValue);

  const handleSelect = (item: any) => {
    onValueChange(item[valueKey]);
    setOpen(false);
    setSearch("");
  };

  return (
    <View style={styles.container}>
      {/* Selector (always visible) */}
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Text style={styles.selectorText}>
          {selectedItem ? selectedItem[labelKey] : placeholder}
        </Text>
      </TouchableOpacity>

      {/* Dropdown list (absolutely positioned overlay) */}
      {open && (
        <View style={styles.dropdown}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView nestedScrollEnabled={true} style={styles.dropdownList}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item[valueKey]}
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.itemText}>{item[labelKey]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  selector: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    backgroundColor: "#fff",
  },
  selectorText: {
    fontSize: 16,
    color: "#333",
  },
  dropdown: {
    position: "absolute",
    top: 50, // Adjust according to your selector's height
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    zIndex: 1000,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    padding: 8,
    fontSize: 16,
  },
  dropdownList: {
    // You can adjust the maxHeight if needed
    maxHeight: 150,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: {
    fontSize: 16,
  },
});

export default SearchablePicker;
