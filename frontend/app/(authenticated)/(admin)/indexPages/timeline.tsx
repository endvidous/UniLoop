import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

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
    // Automatically add "/" after the year and month
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
      maxLength={10} // Format: YYYY/MM/DD
    />
  );
};

const TimelinePage = () => {
  const navigation = useNavigation();

  const [academicYear, setAcademicYear] = useState("");
  const [oddSemesterStart, setOddSemesterStart] = useState("");
  const [oddSemesterEnd, setOddSemesterEnd] = useState("");
  const [evenSemesterStart, setEvenSemesterStart] = useState("");
  const [evenSemesterEnd, setEvenSemesterEnd] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState("");
  interface Timeline {
    academicYear: string;
    oddSemester: { start: string; end: string };
    evenSemester: { start: string; end: string };
  }

  const [timelines, setTimelines] = useState<Timeline[]>([]);

  const handleDateSelect = (day: any) => {
    const formattedDate = day.dateString.replace(/-/g, "/");
    if (selectedDateField === "oddStart") setOddSemesterStart(formattedDate);
    if (selectedDateField === "oddEnd") setOddSemesterEnd(formattedDate);
    if (selectedDateField === "evenStart") setEvenSemesterStart(formattedDate);
    if (selectedDateField === "evenEnd") setEvenSemesterEnd(formattedDate);
    setShowCalendar(false);
  };

  const handleSubmit = () => {
    const newTimeline = {
      academicYear,
      oddSemester: { start: oddSemesterStart, end: oddSemesterEnd },
      evenSemester: { start: evenSemesterStart, end: evenSemesterEnd },
    };
    setTimelines([...timelines, newTimeline]);

    setAcademicYear("");
    setOddSemesterStart("");
    setOddSemesterEnd("");
    setEvenSemesterStart("");
    setEvenSemesterEnd("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.heading}>Create Timeline</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Academic Year</Text>
        <TextInput
          style={styles.input}
          value={academicYear}
          onChangeText={setAcademicYear}
          placeholder="2024-2025"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Odd Semester Start</Text>
        <View style={styles.dateInputContainer}>
          <DateInput
            value={oddSemesterStart}
            onChangeText={setOddSemesterStart}
            placeholder="YYYY/MM/DD"
            onFocus={() => {
              setShowCalendar(true);
              setSelectedDateField("oddStart");
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setShowCalendar(true);
              setSelectedDateField("oddStart");
            }}
          >
            <Ionicons name="calendar" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Odd Semester End</Text>
        <View style={styles.dateInputContainer}>
          <DateInput
            value={oddSemesterEnd}
            onChangeText={setOddSemesterEnd}
            placeholder="YYYY/MM/DD"
            onFocus={() => {
              setShowCalendar(true);
              setSelectedDateField("oddEnd");
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setShowCalendar(true);
              setSelectedDateField("oddEnd");
            }}
          >
            <Ionicons name="calendar" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Even Semester Start</Text>
        <View style={styles.dateInputContainer}>
          <DateInput
            value={evenSemesterStart}
            onChangeText={setEvenSemesterStart}
            placeholder="YYYY/MM/DD"
            onFocus={() => {
              setShowCalendar(true);
              setSelectedDateField("evenStart");
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setShowCalendar(true);
              setSelectedDateField("evenStart");
            }}
          >
            <Ionicons name="calendar" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Even Semester End</Text>
        <View style={styles.dateInputContainer}>
          <DateInput
            value={evenSemesterEnd}
            onChangeText={setEvenSemesterEnd}
            placeholder="YYYY/MM/DD"
            onFocus={() => {
              setShowCalendar(true);
              setSelectedDateField("evenEnd");
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setShowCalendar(true);
              setSelectedDateField("evenEnd");
            }}
          >
            <Ionicons name="calendar" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Calendar onDayPress={handleDateSelect} />
            <Button title="Close" onPress={() => setShowCalendar(false)} />
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>View Timelines</Text>
      </TouchableOpacity>

      {timelines.map((timeline, index) => (
        <Card key={index} style={styles.card}>
          <Text>Academic Year: {timeline.academicYear}</Text>
          <Text>
            Odd Semester: {timeline.oddSemester.start} -{" "}
            {timeline.oddSemester.end}
          </Text>
          <Text>
            Even Semester: {timeline.evenSemester.start} -{" "}
            {timeline.evenSemester.end}
          </Text>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
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
  card: {
    padding: 20,
    marginVertical: 10,
  },
});

export default TimelinePage;
