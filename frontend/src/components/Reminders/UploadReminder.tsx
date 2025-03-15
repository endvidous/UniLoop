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
import CalendarModal from "@/src/components/calendar/calendarModal";

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

  const deadline = watch("deadline");

  const handleDeadlineSelect = (dateString: string) => {
    const isoDateStr = dateString.replace(/\//g, "-");
    const [year, month, day] = isoDateStr.split("-").map(Number);
    setValue("deadline", new Date(year, month - 1, day));
    setShowDeadlineCalendar(false);
  };

  const handleReminderTimeSelect = (dateString: string) => {
    const isoDateStr = dateString.replace(/\//g, "-");
    const [year, month, day] = isoDateStr.split("-").map(Number);
    setCurrentReminderTime(new Date(year, month - 1, day));
    setShowReminderCalendar(false);
    setShowReminderTimeInput(true);
  };

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
              <Picker.Item label="High" value={3} />
              <Picker.Item label="Normal" value={2} />
              <Picker.Item label="Low" value={1} />
            </Picker>
          </View>
        )}
      />

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Deadline</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDeadlineCalendar(true)}
        >
          <Text>
            {deadline ? deadline.toLocaleDateString() : "Select deadline date"}
          </Text>
          <MaterialIcons name="calendar-today" size={20} color="#666" />
        </TouchableOpacity>
        <CalendarModal
          visible={showDeadlineCalendar}
          onClose={() => setShowDeadlineCalendar(false)}
          onDateSelect={handleDeadlineSelect}
        />
      </View>

      {/* <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Reminder Times
        </Text>

        {reminderTimes.map((reminder) => (
          <View key={reminder.id} style={styles.reminderItem}>
            <Text style={styles.reminderText}>
              {reminder.date_time.toLocaleString()}
            </Text>
            <TouchableOpacity onPress={() => removeReminderTime(reminder.id)}>
              <MaterialIcons name="close" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        ))}

        {showReminderTimeInput && currentReminderTime && (
          <View style={styles.timeInputContainer}>
            <Text style={styles.dateText}>
              {currentReminderTime.toLocaleDateString()}
            </Text>
            <View style={styles.timeInputs}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH"
                keyboardType="number-pad"
                maxLength={2}
                onChangeText={(text) =>
                  handleTimeInput(
                    text,
                    currentReminderTime.getMinutes().toString()
                  )
                }
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="MM"
                keyboardType="number-pad"
                maxLength={2}
                onChangeText={(text) =>
                  handleTimeInput(
                    currentReminderTime.getHours().toString(),
                    text
                  )
                }
              />
            </View>
            <TouchableOpacity
              style={styles.addTimeButton}
              onPress={addReminderTime}
            >
              <Text style={styles.buttonText}>Add Time</Text>
            </TouchableOpacity>
          </View>
        )}

        {!showReminderTimeInput && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowReminderCalendar(true)}
          >
            <Text style={styles.buttonText}>Add Reminder Time</Text>
          </TouchableOpacity>
        )}

        <CalendarModal
          visible={showReminderCalendar}
          onClose={() => setShowReminderCalendar(false)}
          onDateSelect={handleReminderTimeSelect}
        />
      </View> */}

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
    marginBottom: 10,
    fontWeight: "500",
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
