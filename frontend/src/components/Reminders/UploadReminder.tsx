import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { toast } from "@backpackapp-io/react-native-toast";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import { useCreateReminder } from "@/src/hooks/api/useReminders";
import DateTimePicker from "react-native-modal-datetime-picker";
import React from "react";

type ReminderTime = {
  id: string;
  date_time: Date;
};

type FormData = {
  title: string;
  description: string;
  deadline: Date;
  priority: number;
};

type CreateReminderProps = {
  onDismiss: () => void;
};

const CreateReminder = ({ onDismiss }: CreateReminderProps) => {
  const { control, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      deadline: new Date(),
      priority: 2,
    },
  });
  const { colors } = useTheme();
  const { mutateAsync: createReminder } = useCreateReminder();

  const [showDeadlineCalendar, setShowDeadlineCalendar] = useState(false);
  const [showReminderCalendar, setShowReminderCalendar] = useState(false);
  const [reminderTimes, setReminderTimes] = useState<ReminderTime[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentReminderTime, setCurrentReminderTime] = useState<Date | null>(
    null
  );
  const [showReminderTimeInput, setShowReminderTimeInput] = useState(false);

  const addReminderTime = () => {
    if (!currentReminderTime) return;

    // Generate a unique ID for this reminder time
    const newId = Date.now().toString();

    setReminderTimes((prev) => [
      ...prev,
      { id: newId, date_time: currentReminderTime },
    ]);

    setCurrentReminderTime(null);
    setShowReminderTimeInput(false);
  };

  const removeReminderTime = (id: string) => {
    setReminderTimes((prev) => prev.filter((item) => item.id !== id));
  };

  const handleTimeInput = (hours: string, minutes: string) => {
    if (!currentReminderTime) return;

    const updatedTime = new Date(currentReminderTime);
    updatedTime.setHours(parseInt(hours) || 0, parseInt(minutes) || 0);
    setCurrentReminderTime(updatedTime);
  };

  const onSubmit = async (data: FormData) => {
    if (!data.deadline) {
      toast.error("Please select a deadline");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReminder({
        ...data,
        remindAt: reminderTimes.map((rt) => ({ date_time: rt.date_time })),
      });

      toast.success("Reminder created successfully");
      onDismiss();
    } catch (error) {
      console.log(error);
      toast.error("Failed to create reminder");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Create Reminder
        </Text>
        <TouchableOpacity onPress={onDismiss}>
          <MaterialIcons name="close" size={24} color="#464646" />
        </TouchableOpacity>
      </View>

      <Controller
        control={control}
        name="title"
        rules={{ required: "Title is required" }}
        render={({ field, fieldState }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Title</Text>
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
            <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
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
                onPress={() => setShowReminderCalendar(true)}
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
                <MaterialIcons name="calendar-today" size={28} color="#666" />
              </TouchableOpacity>
              <DateTimePicker
                isVisible={showReminderCalendar}
                mode="datetime"
                minimumDate={new Date()}
                onConfirm={(date) => {
                  onChange(date);
                  setShowReminderCalendar(false);
                }}
                onCancel={() => setShowReminderCalendar(false)}
              />
            </View>
          </>
        )}
      />

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Reminder</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  reminderText: {
    flex: 1,
  },
  timeInputContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
  },
  dateText: {
    fontWeight: "400",
    fontSize: 15,
    alignItems: "center",
    marginVertical: "auto",
  },
  timeInputs: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    width: 60,
    textAlign: "center",
  },
  timeSeparator: {
    fontSize: 18,
    marginHorizontal: 8,
  },
  addTimeButton: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
});

export default CreateReminder;
