import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
  };

  const getInitialDate = () => {
    return dates[selectedDateField as keyof typeof dates] || "";
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

      {timelines.map((timeline, index) => (
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
    gap: 10,
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
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#f8f9fa",
  },
  cardText: {
    fontSize: 14,
    marginVertical: 2,
  },
});

export default TimelinePage;
