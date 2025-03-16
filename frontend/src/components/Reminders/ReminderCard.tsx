import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import { Picker } from "@react-native-picker/picker";
import { useForm, Controller } from "react-hook-form";
import {
  useUpdateReminder,
  useDeleteReminder,
} from "@/src/hooks/api/useReminders";
import { toast } from "@backpackapp-io/react-native-toast";
import { Reminder } from "@/src/services/api/reminderAPI";
import DateTimePicker from "react-native-modal-datetime-picker";

interface ReminderCardProps {
  reminder: Reminder;
  onToggleCompletion?: () => void;
}

type FormData = {
  title: string;
  description: string;
  deadline: Date;
  priority: number;
};

const ReminderCard = ({ reminder, onToggleCompletion }: ReminderCardProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [completed, setCompleted] = useState(reminder.completed || false);
  const { colors } = useTheme();
  const { mutateAsync: updateReminder } = useUpdateReminder();

  const getPriorityData = (priority: number) => {
    switch (priority) {
      case 2:
        return { label: "High", color: "#dc2626" }; // red
      case 1:
        return { label: "Normal", color: "#16a34a" }; // green
      case 0:
        return { label: "Low", color: "#3b82f6" }; // blue
      default:
        return { label: "Normal", color: "#16a34a" };
    }
  };

  const { label, color } = getPriorityData(reminder.priority);

  const toggleCompletion = async () => {
    try {
      const newCompletedStatus = !completed;
      setCompleted(newCompletedStatus);

      if (onToggleCompletion) {
        onToggleCompletion();
      } else {
        await updateReminder({
          reminderId: reminder._id,
          updates: { completed: newCompletedStatus },
        });
      }
    } catch (error) {
      setCompleted(completed); // revert on error
      toast.error("Failed to update reminder status");
    }
  };

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.background,
          shadowColor: colors.shadowcolor,
          borderColor: "lightgray",
        },
      ]}
    >
      <View style={styles.cardContent}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={toggleCompletion}
        >
          <View style={[styles.checkbox, completed && styles.checkboxChecked]}>
            {completed && <MaterialIcons name="check" size={16} color="#fff" />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoContainer}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: colors.text },
                completed && styles.completedText,
              ]}
            >
              {reminder.title}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: color }]}>
              <Text style={styles.priorityText}>{label}</Text>
            </View>
          </View>

          <Text style={styles.date}>
            Due: {new Date(reminder.deadline).toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      </View>

      <UpdateReminderModal
        visible={modalVisible}
        reminder={reminder}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const UpdateReminderModal = ({
  visible,
  reminder,
  onClose,
}: {
  visible: boolean;
  reminder: Reminder;
  onClose: () => void;
}) => {
  const { colors } = useTheme();
  const { mutateAsync: updateReminder } = useUpdateReminder();
  const { mutateAsync: deleteReminder } = useDeleteReminder();
  const [showDeadlineCalendar, setShowDeadlineCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const { control, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      title: reminder.title,
      description: reminder.description,
      deadline: new Date(reminder.deadline),
      priority: reminder.priority,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!data.deadline) {
      toast.error("Please select a deadline");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateReminder({
        reminderId: reminder._id,
        updates: data,
      });

      toast.success("Reminder updated successfully");
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update reminder");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReminder = async () => {
    setIsSubmitting(true);
    try {
      await deleteReminder(reminder._id);
      toast.success("Reminder deleted successfully");
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete reminder");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Update Reminder
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#464646" />
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field, fieldState }) => (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Title
                  </Text>
                  <TextInput
                    style={[styles.input, { color: "#464646" }]}
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder="Enter title"
                  />
                  {fieldState.error && (
                    <Text style={styles.error}>{fieldState.error.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Description
                  </Text>
                  <TextInput
                    style={[styles.input, styles.multiline]}
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder="Enter description"
                    multiline
                    numberOfLines={4}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Priority
                  </Text>
                  <Picker
                    selectedValue={field.value}
                    onValueChange={field.onChange}
                    style={styles.picker}
                  >
                    <Picker.Item label="High" value={2} />
                    <Picker.Item label="Normal" value={1} />
                    <Picker.Item label="Low" value={0} />
                  </Picker>
                </View>
              )}
            />
            <Controller
              control={control}
              name="deadline"
              render={({ field: { onChange, value } }) => (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Deadline</Text>
                    <TouchableOpacity
                      style={[
                        styles.input,
                        {
                          flexDirection: "row",
                          justifyContent: "space-between",
                        },
                      ]}
                      onPress={() => setShowDeadlineCalendar(true)}
                    >
                      <Text style={styles.dateText}>
                        {value
                          ? new Date(value).toLocaleString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour12: true,
                            })
                          : "Select Timing"}
                      </Text>
                      <MaterialIcons
                        name="calendar-today"
                        size={28}
                        color="#666"
                      />
                    </TouchableOpacity>
                    <DateTimePicker
                      isVisible={showDeadlineCalendar}
                      mode="datetime"
                      minimumDate={new Date()}
                      onConfirm={(date: Date) => {
                        onChange(date);
                        setShowDeadlineCalendar(false);
                      }}
                      onCancel={() => setShowDeadlineCalendar(false)}
                    />
                  </View>
                </>
              )}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitting && styles.buttonDisabled,
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Update Reminder</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setShowDeleteConfirmation(true)}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteConfirmation}
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <View style={styles.confirmationModalContainer}>
          <View
            style={[
              styles.confirmationModal,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.confirmationTitle, { color: colors.text }]}>
              Delete Reminder
            </Text>
            <Text style={[styles.confirmationText, { color: colors.text }]}>
              Are you sure you want to delete this reminder?
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteConfirmation(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleDeleteReminder}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8, // Android shadow
  },
  cardContent: {
    padding: 10,
    flexDirection: "row",
    // alignItems: "center",
  },
  checkboxContainer: {
    marginRight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#007BFF",
  },
  infoContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  priorityBadge: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
    width: "20%",
  },
  priorityText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 12,
    textAlign: "center",
  },
  date: {
    fontSize: 14,
    color: "#6b7280",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    margin: 20,
    borderRadius: 8,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: "90%",
    top: 100,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  multiline: {
    height: 100,
    textAlignVertical: "top",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontWeight: "400",
    fontSize: 15,
    alignItems: "center",
    marginVertical: "auto",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  submitButton: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    width: 100,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  confirmationModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  confirmationModal: {
    width: "80%",
    borderRadius: 8,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  confirmationText: {
    fontSize: 16,
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: 10,
    marginRight: 12,
  },
  cancelButtonText: {
    color: "#6b7280",
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "#dc3545",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    width: 80,
  },
});

export default ReminderCard;
