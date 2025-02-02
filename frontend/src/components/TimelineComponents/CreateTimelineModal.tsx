import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import CalendarModal from "@/src/components/calendar/calendarModal";
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
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);

  const isFormValid = () => {
    return (
      dates.academicYear.trim() !== "" &&
      dates.oddSemStart.trim() !== "" &&
      dates.oddSemEnd.trim() !== "" &&
      dates.evenSemStart.trim() !== "" &&
      dates.evenSemEnd.trim() !== ""
    );
  };

  useEffect(() => {
    if (visible) {
      setDates(defaultDates);
      setStartYear(null);
      setEndYear(null);
    }
  }, [visible]);

  useEffect(() => {
    if (
      dates.academicYear.length === 9 &&
      /^\d{4}-\d{4}$/.test(dates.academicYear)
    ) {
      const [start, end] = dates.academicYear.split("-").map(Number);
      if (end === start + 1) {
        setStartYear(start);
        setEndYear(end);
        setDates((prev) => ({
          ...prev,
          oddSemStart: `${start}-01-01`, // Auto-fill odd semester start date
          evenSemEnd: `${end}-12-31`, // Auto-fill even semester end date
        }));
      } else {
        Alert.alert(
          "Invalid Academic Year",
          "The end year must be one year after the start year."
        );
      }
    }
  }, [dates.academicYear]);

  useEffect(() => {
    if (visible) {
      setDates(defaultDates);
      setStartYear(null);
      setEndYear(null);
    }
  }, [visible]);

  const handleDateSelect = (date: string) => {
    setDates((prev) => ({
      ...prev,
      [selectedDateField]: date,
    }));
    setShowCalendar(false);
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      Alert.alert(
        "Validation Error",
        "Please fill all fields before submitting."
      );
      return;
    }

    const { academicYear, oddSemStart, oddSemEnd, evenSemStart, evenSemEnd } =
      dates;

    // Validate academic year format
    if (!/^\d{4}-\d{4}$/.test(academicYear)) {
      Alert.alert(
        "Invalid Academic Year",
        "Please enter a valid academic year in the format 'YYYY-YYYY'."
      );
      return;
    }

    // Validate odd semester dates
    if (new Date(oddSemStart) >= new Date(oddSemEnd)) {
      Alert.alert(
        "Invalid Odd Semester Dates",
        "Odd semester start date must be before the end date."
      );
      return;
    }

    // Validate even semester dates
    if (new Date(evenSemStart) >= new Date(evenSemEnd)) {
      Alert.alert(
        "Invalid Even Semester Dates",
        "Even semester start date must be before the end date."
      );
      return;
    }

    // Validate odd semester start year matches academic start year
    const oddStartYear = new Date(oddSemStart).getFullYear();
    if (oddStartYear !== startYear) {
      Alert.alert(
        "Invalid Odd Semester Start Year",
        "Odd semester start year must match the academic start year."
      );
      return;
    }

    // Validate even semester end year matches academic end year
    const evenEndYear = new Date(evenSemEnd).getFullYear();
    if (evenEndYear !== endYear) {
      Alert.alert(
        "Invalid Even Semester End Year",
        "Even semester end year must match the academic end year."
      );
      return;
    }

    onSubmit(dates);
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
              keyboardType="number-pad"
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
            startYear={startYear}
            endYear={endYear}
          />

          <TouchableOpacity
            style={[styles.button, !isFormValid() && styles.disabledButton]}
            onPress={() => onSubmit(dates)}
            disabled={!isFormValid()}
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
  disabledButton: {
    backgroundColor: "#ccc",
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
