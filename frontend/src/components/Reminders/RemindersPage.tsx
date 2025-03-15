// import React, { useState } from "react";
// import {
//   Text,
//   TouchableOpacity,
//   View,
//   StyleSheet,
//   ScrollView,
//   Modal,
// } from "react-native";
// import { RelativePathString, useRouter } from "expo-router";
// import { useTheme } from "@/src/hooks/colors/useThemeColor";
// import Icon from "react-native-vector-icons/Ionicons";
// import { useAuth } from "@/src/context/AuthContext";
// import UploadReminder from "./UploadReminder"; // Make sure this component exists

// const ReminderHomePage = () => {
//   const { colors } = useTheme();
//   const router = useRouter();
//   const { user } = useAuth();
//   const [showModal, setShowModal] = useState(false);

//   const navigateToUploadPage = () => {
//     setShowModal(true);
//   };

//   const handleReminderCreated = () => {
//     setShowModal(false);
//     // You might want to add a refetch function here if you're using a hook like useReminders
//   };

//   const onPress = (id: string) => {
//     const basepath =
//       `/(authenticated)/(${user?.role})/Reminders/[reminderId]` as RelativePathString;
//     router.push({
//       pathname: basepath,
//       params: { reminderId: id },
//     });
//   };

//   return (
//     <View
//       style={[
//         styles.container,
//         { backgroundColor: colors.secondaryBackground },
//       ]}
//     >
//       {/* Tasks card*/}
//       <ScrollView
//         style={[
//           styles.card,
//           {
//             backgroundColor: colors.background,
//             shadowColor: colors.shadowcolor,
//           },
//         ]}
//       >
//         <Text style={[styles.cardTitle, { color: colors.text }]}>Tasks</Text>
//         <Text style={[styles.cardContent, { color: colors.text }]}>
//           Here are some tasks that need to be completed...
//         </Text>
//       </ScrollView>

//       {/* Add Button */}
//       <TouchableOpacity
//         style={[styles.addButton, { shadowColor: colors.shadowcolor }]}
//         onPress={navigateToUploadPage}
//         accessibilityLabel="Create new reminder"
//         accessibilityRole="button"
//       >
//         <Icon name="add" size={30} color="white" />
//       </TouchableOpacity>

//       <Modal
//         visible={showModal}
//         animationType="slide"
//         onRequestClose={() => setShowModal(false)}
//       >
//         <UploadReminder onDismiss={handleReminderCreated} />
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     position: "relative",
//   },
//   card: {
//     width: 370,
//     height: 150,
//     borderRadius: 10,
//     shadowOpacity: 0.8,
//     shadowRadius: 2,
//     elevation: 5,
//     padding: 10,
//     margin: 3,
//   },
//   cardTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   cardContent: {
//     fontSize: 16,
//     lineHeight: 24,
//   },
//   addButton: {
//     position: "absolute",
//     bottom: 20,
//     right: 20,
//     backgroundColor: "#007BFF",
//     borderRadius: 50,
//     width: 60,
//     height: 60,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//   },
// });

// export default ReminderHomePage;
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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import {
  useReminders,
  useToggleReminderCompletion,
} from "@/src/hooks/api/useReminders";
import ReminderCard from "@/src/components/Reminders/ReminderCard";
import Icon from "react-native-vector-icons/Ionicons";
import { Reminder as APIReminder } from "@/src/services/api/reminderAPI";
import UploadReminder from "./UploadReminder";
import { RelativePathString, useRouter } from "expo-router";
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
  const { data: reminders, isLoading, isError, refetch } = useReminders();
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);
  const [completedReminders, setCompletedReminders] = useState<Reminder[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const toggleCompletionMutation = useToggleReminderCompletion();
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

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
    if (reminders?.data) {
      const active = reminders.data.filter(
        (reminder: Reminder) => !reminder.completed
      );
      const completed = reminders.data.filter(
        (reminder: Reminder) => reminder.completed
      );

      setActiveReminders(active);
      setCompletedReminders(completed);
    }
  }, [reminders]);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.pageTitle, { color: colors.text }]}>
        My Reminders
      </Text>

      {/* Active Reminders Card Section (2/3 of screen) */}
      <View
        style={[
          styles.cardsContainer,
          {
            height: cardsContainerHeight,
            backgroundColor: colors.background,
            shadowColor: colors.shadowcolor,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tasks</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load reminders</Text>
          </View>
        ) : activeReminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active tasks</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {activeReminders.map((reminder) => (
              <View key={reminder._id} style={styles.cardWrapper}>
                <ReminderCard
                  reminder={{
                    ...reminder,
                    deadline: reminder.deadline.toISOString(),
                  }}
                  onToggleCompletion={() =>
                    handleToggleCompletion(reminder._id)
                  }
                />
              </View>
            ))}
          </ScrollView>
        )}
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
              <ScrollView style={styles.completedScrollView}>
                {completedReminders.map((reminder) => (
                  <View key={reminder._id} style={styles.cardWrapper}>
                    <ReminderCard
                      reminder={{
                        ...reminder,
                        deadline: reminder.deadline.toISOString(),
                      }}
                      onToggleCompletion={() =>
                        handleToggleCompletion(reminder._id)
                      }
                    />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
        <TouchableOpacity
          style={[styles.addButton, { shadowColor: colors.shadowcolor }]}
          onPress={navigateToUploadPage}
          accessibilityLabel="Create new reminder"
          accessibilityRole="button"
        >
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>

        <Modal
          visible={showModal}
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <UploadReminder onDismiss={handleReminderCreated} />
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    marginBottom: 12,
  },
  completedSection: {
    marginTop: 8,
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
