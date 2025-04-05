import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { RelativePathString, useRouter } from "expo-router";
//custom hooks
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import {
  useReminders,
  useToggleReminderCompletion,
} from "@/src/hooks/api/useReminders";
import ReminderCard from "@/src/components/Reminders/ReminderCard";
import { Reminder as APIReminder } from "@/src/services/api/reminderAPI";
import UploadReminder from "./UploadReminder";
import { useAuth } from "@/src/context/AuthContext";

interface Reminder extends APIReminder {
  _id: string;
  title: string;
  description: string;
  deadline: Date;
  completed: boolean;
}

const RemindersPage = () => {
  const { colors } = useTheme();
  const { data, isLoading, isError, refetch } = useReminders();
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);
  const [completedReminders, setCompletedReminders] = useState<Reminder[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const toggleCompletionMutation = useToggleReminderCompletion();
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);

  const navigateToUploadPage = () => {
    setShowModal(true);
  };

  const handleReminderCreated = () => {
    setShowModal(false);
    // You might want to add a refetch function here if you're using a hook like useReminders
  };

  const onPress = (id: string) => {
    const basepath =
      `/(authenticated)/(${user?.role})/Reminders/[reminderId]` as RelativePathString;
    router.push({
      pathname: basepath,
      params: { reminderId: id },
    });
  };

  // Screen dimensions to calculate the card height (2/3 of screen)
  const windowHeight = Dimensions.get("window").height;
  const cardsContainerHeight = (windowHeight * 2) / 3;

  useEffect(() => {
    if (data?.reminders) {
      const active = data.reminders.filter(
        (reminder: Reminder) => !reminder.completed
      );
      const completed = data.reminders.filter(
        (reminder: Reminder) => reminder.completed
      );
      setActiveReminders(active);
      setCompletedReminders(completed);
    }
  }, [data]);

  const filteredActiveReminders = activeReminders.filter((reminder) => {
    const matchesSearchQuery =
      reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reminder.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      selectedPriority === null || reminder.priority === selectedPriority;

    return matchesSearchQuery && matchesPriority;
  });

  const handlePriorityFilter = (priority: number | null) => {
    if (selectedPriority === priority) {
      setSelectedPriority(null); // Reset to no filter (toggle off)
    } else {
      setSelectedPriority(priority); // Apply filter for selected priority
    }
  };

  // Function to handle reminder completion toggle
  const handleToggleCompletion = async (reminderId: string) => {
    await toggleCompletionMutation.mutateAsync(reminderId);
    refetch(); // This is correct now
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error loading reminders</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Filter between high low and normal priority and maybe a local search feature */}
      {/* Filter and Search Section */}
      <View
        style={[styles.filterSection, { backgroundColor: colors.background }]}
      >
        {/* Search Bar */}
        <TextInput
          style={[
            styles.searchInput,
            { borderColor: colors.text, color: colors.text },
          ]}
          placeholder="Search Reminders"
          placeholderTextColor={colors.text}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Filter by Priority */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedPriority === 2 && [
                styles.activeFilter,
                { backgroundColor: "#dc2626" },
              ],
            ]}
            onPress={() => handlePriorityFilter(2)}
          >
            <Text style={styles.filterText}>High</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedPriority === 1 && [
                styles.activeFilter,
                { backgroundColor: "#16a34a" },
              ],
            ]}
            onPress={() => handlePriorityFilter(1)}
          >
            <Text style={styles.filterText}>Medium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedPriority === 0 && [
                styles.activeFilter,
                { backgroundColor: "#3b82f6" },
              ],
            ]}
            onPress={() => handlePriorityFilter(0)}
          >
            <Text style={styles.filterText}>Low</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Active Reminders Card Section (2/3 of screen) */}
        <View
          style={[
            styles.cardsContainer,
            {
              backgroundColor: colors.background,
              shadowColor: colors.shadowcolor,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tasks
          </Text>

          <View style={styles.scrollView}>
            {filteredActiveReminders.map((reminder) => (
              <ReminderCard
                key={reminder._id}
                reminder={reminder}
                onToggleCompletion={() => handleToggleCompletion(reminder._id)}
              />
            ))}
          </View>
        </View>

        {/* Completed Tasks Toggle Section */}
        <View style={styles.completedSection}>
          <TouchableOpacity
            style={styles.completedToggle}
            onPress={() => setShowCompleted(!showCompleted)}
          >
            <Text style={[styles.completedToggleText, { color: colors.text }]}>
              Completed ({completedReminders.length})
            </Text>
            <MaterialIcons
              name={showCompleted ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>

          {showCompleted && (
            <View style={styles.completedDropdown}>
              {completedReminders.length === 0 ? (
                <Text style={styles.emptyText}>No completed tasks</Text>
              ) : (
                <View style={styles.completedScrollView}>
                  {completedReminders.map((reminder) => (
                    <ReminderCard
                      key={reminder._id}
                      reminder={reminder}
                      onToggleCompletion={() =>
                        handleToggleCompletion(reminder._id)
                      }
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.addButton, { shadowColor: colors.shadowcolor }]}
        onPress={navigateToUploadPage}
        accessibilityLabel="Create new reminder"
        accessibilityRole="button"
      >
        <Feather name="bell" size={30} color="white" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <UploadReminder onDismiss={handleReminderCreated} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 8,
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    elevation: 5,
  },
  activeFilter: {
    backgroundColor: "#007BFF",
  },
  filterText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  cardsContainer: {
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 16,
    fontStyle: "italic",
  },
  cardWrapper: {
    marginBottom: 2,
  },
  completedSection: {
    marginTop: 3,
    marginBottom: 150,
  },
  completedToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },
  completedToggleText: {
    fontSize: 18,
    fontWeight: "600",
  },
  completedDropdown: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    maxHeight: 300,
  },
  completedScrollView: {
    maxHeight: 250,
  },
  addButton: {
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
    elevation: 5,
  },
});

export default RemindersPage;
