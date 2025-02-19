import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useUserAssociations } from "@/src/hooks/api/useAssociations";
import { Checkbox } from "react-native-paper";
import { useEffect, useState } from "react";

type Department = { _id: string; name: string };
type Course = { _id: string; name: string; code: string };
type Batch = { _id: string; code: string };

export type FilterState = {
  department: string;
  course: string;
  batch: string;
  search: string;
  priority: number[];
  sort: "newest" | "priority" | "urgent";
  visibilityType: "General" | "Department" | "Batch" | "Course" | "";
};

type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
};

const FilterModal = ({
  visible,
  onClose,
  filters,
  setFilters,
}: FilterModalProps) => {
  const { data: associations, isLoading, isError } = useUserAssociations();
  const departments = associations?.departments || [];
  const courses = associations?.courses || [];
  const batches = associations?.batches || [];

  // Add local state to track temporary filter changes
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  // Update temp filters when the modal becomes visible
  useEffect(() => {
    if (visible) {
      setTempFilters(filters);
    }
  }, [visible, filters]);

  const handlePriorityChange = (value: number) => {
    setTempFilters((prev) => ({
      ...prev,
      priority: prev.priority.includes(value)
        ? prev.priority.filter((p) => p !== value)
        : [...prev.priority, value],
    }));
  };

  const handleApply = () => {
    setFilters(tempFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      department: "",
      course: "",
      batch: "",
      search: filters.search, // Preserve search
      priority: [],
      sort: "newest",
      visibilityType: "",
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {isLoading && <ActivityIndicator size="large" />}
              <ScrollView>
                {/* Priority Filter */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Priority</Text>
                  <View style={styles.checkboxContainer}>
                    {[1, 2, 3].map((priority) => (
                      <View key={priority} style={styles.checkboxWrapper}>
                        <Checkbox.Android
                          status={
                            tempFilters.priority.includes(priority)
                              ? "checked"
                              : "unchecked"
                          }
                          onPress={() => handlePriorityChange(priority)}
                          color="#007BFF"
                        />
                        <Text style={styles.checkboxLabel}>
                          {["Low", "Normal", "High"][priority - 1]}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                {/* Sort By */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Sort By</Text>
                  <Picker
                    selectedValue={tempFilters.sort}
                    onValueChange={(value) =>
                      setTempFilters((prev) => ({ ...prev, sort: value }))
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Newest First" value="newest" />
                    <Picker.Item label="Priority" value="priority" />
                    <Picker.Item label="Urgent First" value="urgent" />
                  </Picker>
                </View>
                {/* Visibility Type */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Visibility Type</Text>
                  <Picker
                    selectedValue={tempFilters.visibilityType}
                    onValueChange={(value) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        visibilityType: value,
                      }))
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="General" value="General" />
                    <Picker.Item label="Department" value="Department" />
                    <Picker.Item label="Batch" value="Batch" />
                    <Picker.Item label="Course" value="Course" />
                  </Picker>
                </View>
                {!isLoading && (
                  <>
                    {departments.length > 0 &&
                      tempFilters.visibilityType === "Department" && (
                        <View style={styles.filterGroup}>
                          <Text style={styles.filterLabel}>Department</Text>
                          <Picker
                            selectedValue={tempFilters.department}
                            onValueChange={(value) =>
                              setTempFilters((prev) => ({
                                ...prev,
                                department: value,
                              }))
                            }
                            style={styles.picker}
                          >
                            <Picker.Item label="All Departments" value="" />
                            {departments.map((dept: Department) => (
                              <Picker.Item
                                key={dept._id}
                                label={dept.name}
                                value={dept._id}
                              />
                            ))}
                          </Picker>
                        </View>
                      )}
                    {courses.length > 0 &&
                      tempFilters.visibilityType === "Course" && (
                        <View style={styles.filterGroup}>
                          <Text style={styles.filterLabel}>Course</Text>
                          <Picker
                            selectedValue={tempFilters.course}
                            onValueChange={(value) =>
                              setTempFilters((prev) => ({
                                ...prev,
                                course: value,
                              }))
                            }
                            style={styles.picker}
                          >
                            <Picker.Item label="All Courses" value="" />
                            {courses.map((course: Course) => (
                              <Picker.Item
                                key={course._id}
                                label={course.name}
                                value={course._id}
                              />
                            ))}
                          </Picker>
                        </View>
                      )}
                    {batches.length > 0 &&
                      tempFilters.visibilityType === "Batch" && (
                        <View style={styles.filterGroup}>
                          <Text style={styles.filterLabel}>Batch</Text>
                          <Picker
                            selectedValue={tempFilters.batch}
                            onValueChange={(value) =>
                              setTempFilters((prev) => ({
                                ...prev,
                                batch: value,
                              }))
                            }
                            style={styles.picker}
                          >
                            <Picker.Item label="All Batches" value="" />
                            {batches.map((batch: Batch) => (
                              <Picker.Item
                                key={batch._id}
                                label={`Batch ${batch.code}`}
                                value={batch._id}
                              />
                            ))}
                          </Picker>
                        </View>
                      )}
                  </>
                )}
                {/* Apply/Reset Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleReset}
                  >
                    <Text style={styles.buttonText}>Reset All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={handleApply}
                  >
                    <Text style={styles.buttonText}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      {isError && (
        <Text style={styles.errorText}>Error loading filter options</Text>
      )}
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  picker: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  applyButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  resetButton: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "500",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  searchInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: "#333",
  },
});

export default FilterModal;
