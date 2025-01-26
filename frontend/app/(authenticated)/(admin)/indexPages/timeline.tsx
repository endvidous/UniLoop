import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import CalendarModal from "@/src/components/calendar/calendarModal";

interface DateInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onFocus: () => void;
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChangeText,
  placeholder,
  onFocus,
}) => {
  const handleChange = (text: string) => {
    if (text.length === 4 || text.length === 7) {
      text += "/";
    }
    onChangeText(text);
  };

  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={handleChange}
      placeholder={placeholder}
      onFocus={onFocus}
      keyboardType="numeric"
      maxLength={10}
    />
  );
};

const TimelinePage = () => {
  const navigation = useNavigation();
  const [showModal, setshowModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState("");
  const [timelines, setTimelines] = useState<any[]>([]);

  const [dates, setDates] = useState({
    academicYear: "",
    oddSemesterStart: "",
    oddSemesterEnd: "",
    evenSemesterStart: "",
    evenSemesterEnd: "",
  });

  const handleDateSelect = (date: string) => {
    setDates((prev) => ({
      ...prev,
      [selectedDateField]: date,
    }));
  };

  const handleSubmit = () => {
    const newTimeline = {
      academicYear: dates.academicYear,
      oddSemester: {
        start: dates.oddSemesterStart,
        end: dates.oddSemesterEnd,
      },
      evenSemester: {
        start: dates.evenSemesterStart,
        end: dates.evenSemesterEnd,
      },
    };

    setTimelines([...timelines, newTimeline]);
    setDates({
      academicYear: "",
      oddSemesterStart: "",
      oddSemesterEnd: "",
      evenSemesterStart: "",
      evenSemesterEnd: "",
    });
    setshowModal(false);
  };

  const getInitialDate = () => {
    return dates[selectedDateField as keyof typeof dates] || "";
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {timelines.length === 0 ? (
          <Text style={styles.noTimelinesText}>No timelines available</Text>
        ) : (
          timelines.map((timeline, index) => (
            <Card key={index} style={styles.card}>
              <Text style={styles.cardText}>
                Academic Year: {timeline.academicYear}
              </Text>
              <Text style={styles.cardText}>
                Odd Semester: {timeline.oddSemester.start} -{" "}
                {timeline.oddSemester.end}
              </Text>
              <Text style={styles.cardText}>
                Even Semester: {timeline.evenSemester.start} -{" "}
                {timeline.evenSemester.end}
              </Text>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setshowModal(true)}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Create Timeline Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setshowModal(false)}
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

            {[
              "oddSemesterStart",
              "oddSemesterEnd",
              "evenSemesterStart",
              "evenSemesterEnd",
            ].map((field) => (
              <View key={field} style={styles.inputContainer}>
                <Text style={styles.label}>
                  {field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </Text>
                <View style={styles.dateInputContainer}>
                  <DateInput
                    value={dates[field as keyof typeof dates]}
                    onChangeText={(text) =>
                      setDates((prev) => ({ ...prev, [field]: text }))
                    }
                    placeholder="YYYY/MM/DD"
                    onFocus={() => {
                      setSelectedDateField(field);
                      setShowCalendar(true);
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedDateField(field);
                      setShowCalendar(true);
                    }}
                  >
                    <Ionicons name="calendar" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <CalendarModal
              visible={showCalendar}
              onClose={() => setShowCalendar(false)}
              onDateSelect={handleDateSelect}
              initialDate={getInitialDate()}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setshowModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
});
export default TimelinePage;
