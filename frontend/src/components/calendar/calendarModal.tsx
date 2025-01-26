import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Calendar } from "react-native-calendars";

const { width } = Dimensions.get("window");

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  initialDate?: string;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  onDateSelect,
  initialDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectionFlow, setSelectionFlow] = useState<"month" | "year" | null>(
    null
  );
  const [tempYear, setTempYear] = useState<number | null>(null);

  useEffect(() => {
    if (initialDate) {
      const [year, month, day] = initialDate.split("/");
      setCurrentDate(
        new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      );
    }
  }, [initialDate]);

  const handleYearSelect = (year: number) => {
    setTempYear(year);
    setSelectionFlow("month");
  };

  const handleMonthSelect = (month: number) => {
    const newDate = new Date();
    if (tempYear) newDate.setFullYear(tempYear);
    newDate.setMonth(month - 1);
    setCurrentDate(newDate);
    setSelectionFlow(null);
  };

  const handleDaySelect = (day: any) => {
    const formattedDate = day.dateString.replace(/-/g, "/");
    onDateSelect(formattedDate);
    onClose();
  };

  const handleMonthChange = (month: { year: number; month: number }) => {
    setCurrentDate(new Date(month.year, month.month - 1));
  };

  const CustomHeader = () => {
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setSelectionFlow("month")}
        >
          <Text style={styles.headerText}>{month}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setSelectionFlow("year")}
        >
          <Text style={styles.headerText}>{year}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const modalHeight = selectionFlow ? 400 : null; // Adjust height dynamically

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { height: modalHeight }]}>
          {selectionFlow === "year" ? (
            <YearPicker onSelectYear={handleYearSelect} />
          ) : selectionFlow === "month" ? (
            <MonthPicker onSelectMonth={handleMonthSelect} />
          ) : (
            <Calendar
              current={currentDate.toISOString().split("T")[0]}
              onDayPress={handleDaySelect}
              onMonthChange={handleMonthChange} // Listen for month changes
              renderHeader={() => <CustomHeader />}
            />
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              onClose();
              setSelectionFlow(null);
            }}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const MonthPicker: React.FC<{ onSelectMonth: (month: number) => void }> = ({
  onSelectMonth,
}) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <ScrollView contentContainerStyle={styles.monthScrollContainer}>
      <View style={styles.monthGrid}>
        {months.map((month, index) => (
          <TouchableOpacity
            key={month}
            style={styles.monthItem}
            onPress={() => onSelectMonth(index + 1)}
          >
            <Text style={styles.monthText}>{month}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const YearPicker: React.FC<{ onSelectYear: (year: number) => void }> = ({
  onSelectYear,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <ScrollView contentContainerStyle={styles.yearScrollContainer}>
      {years.map((year) => (
        <TouchableOpacity
          key={year}
          style={styles.yearItem}
          onPress={() => onSelectYear(year)}
        >
          <Text style={styles.yearText}>{year}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    width: width * 0.8,
    borderRadius: 10,
    overflow: "hidden",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
  },
  headerButton: {
    marginHorizontal: 10,
    padding: 5,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#007BFF",
  },
  monthScrollContainer: {
    padding: 15,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  monthItem: {
    width: "32%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
    padding: 5,
  },
  monthText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  yearScrollContainer: {
    padding: 15,
  },
  yearItem: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
  },
  yearText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  closeButton: {
    marginTop: 14,
    bottom: 10,
    alignSelf: "center",
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CalendarModal;
