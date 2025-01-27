import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import CalendarModal from "@/src/components/calendar/CalendarModal";
import DateButton from "./dateButton";

interface CreateTimelineModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreateTimelineModal: React.FC<CreateTimelineModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const defaultDates = {
    academicYear: "",
    oddSemStart: "",
    oddSemEnd: "",
    evenSemStart: "",
    evenSemEnd: "",
  };
  const [dates, setDates] = useState(defaultDates);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState("");

  useEffect(() => {
    if (visible) {
      setDates(defaultDates);
    }
  }, [visible]);

  const handleDateSelect = (date: string) => {
    setDates((prev) => ({
      ...prev,
      [selectedDateField]: date,
    }));
    setShowCalendar(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeading}>Create Timeline</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Academic Year</Text>
            <TextInput
              style={styles.input}
              value={dates.academicYear}
              onChangeText={(text) =>
                setDates((prev) => ({ ...prev, academicYear: text }))
              }
              placeholder="2024-2025"
            />
          </View>

          <View style={styles.dateButtonWrapper}>
            {["oddSemStart", "oddSemEnd", "evenSemStart", "evenSemEnd"].map(
              (field) => (
                <DateButton
                  key={field}
                  label={field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                  value={dates[field as keyof typeof dates]}
                  onPress={() => {
                    setSelectedDateField(field);
                    setShowCalendar(true);
                  }}
                />
              )
            )}
          </View>

          <CalendarModal
            visible={showCalendar}
            onClose={() => setShowCalendar(false)}
            onDateSelect={handleDateSelect}
            initialDate={dates[selectedDateField as keyof typeof dates]}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => onSubmit(dates)}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  scrollContent: {
    padding: 20,
  },
  noTimelinesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
  },
  card: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#f8f9fa",
  },
  cardText: {
    fontSize: 14,
    marginVertical: 2,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007BFF",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#ccc",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  dateButtonWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    marginBottom: 10,
  },
  dateButtonContainer: {
    width: "48%",
    marginBottom: 15,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
});
export default CreateTimelineModal;
