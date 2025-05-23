import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";

const { width } = Dimensions.get("window");
const isValidDate = (d: Date) => {
  return d instanceof Date && !isNaN(d.getTime());
};
const clampDate = (date: Date, min?: string, max?: string) => {
  const minDate = min ? new Date(min) : null;
  const maxDate = max ? new Date(max) : null;
  let clamped = new Date(date);

  if (minDate && clamped < minDate) clamped = minDate;
  if (maxDate && clamped > maxDate) clamped = maxDate;

  return clamped;
};

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  initialDate?: string;
  startYear?: number | null;
  endYear?: number | null;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  onDateSelect,
  initialDate,
  startYear,
  endYear,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectionFlow, setSelectionFlow] = useState<"month" | "year" | null>(
    null
  );
  const [tempYear, setTempYear] = useState<number | null>(null);

  // Calculate min and max dates based on startYear and endYear
  const minDate = startYear ? `${startYear}-01-01` : undefined;
  const maxDate = endYear ? `${endYear}-12-31` : undefined;

  useEffect(() => {
    let newDate: Date = new Date();
    try {
      if (initialDate?.trim()) {
        // Handle multiple date formats
        const sanitizedDate = initialDate.includes("T")
          ? initialDate.split("T")[0]
          : initialDate.replace(/\//g, "-");

        const [yearStr, monthStr, dayStr] = sanitizedDate.split("-");
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1; // 0-based
        const day = parseInt(dayStr, 10);

        if (
          !isNaN(year) &&
          !isNaN(month) &&
          month >= 0 &&
          month <= 11 &&
          !isNaN(day) &&
          day >= 1 &&
          day <= 31
        ) {
          newDate = new Date(year, month, day);
        }
      }
    } catch (error) {
      console.warn("Error parsing initial date:", error);
    }

    // Ensure date is within bounds
    setCurrentDate(clampDate(newDate, minDate, maxDate));
  }, [initialDate, minDate, maxDate]);

  const handleYearSelect = (year: number) => {
    if ((!startYear || year >= startYear) && (!endYear || year <= endYear)) {
      setTempYear(year);
      setSelectionFlow("month");
    } else {
      Alert.alert(
        "Invalid Year",
        "Please select a year within the valid range."
      );
    }
  };

  const handleMonthSelect = (month: number) => {
    if (tempYear) {
      const newDate = new Date(tempYear, month - 1, 1);

      // Ensure the selected month is within bounds
      if (
        (!minDate || newDate >= new Date(minDate)) &&
        (!maxDate || newDate <= new Date(maxDate))
      ) {
        setCurrentDate(newDate);
        setSelectionFlow(null);
      } else {
        Alert.alert(
          "Invalid Month",
          "Please select a month within the valid range."
        );
      }
    }
  };

  const handleDaySelect = (day: any) => {
    const formattedDate = day.dateString.replace(/-/g, "/");
    onDateSelect(formattedDate);
    onClose();
  };

  const handleMonthChange = (month: { year: number; month: number }) => {
    const newDate = new Date(month.year, month.month - 1, 1);

    // Ensure the new month is within bounds
    if (
      (!minDate || newDate >= new Date(minDate)) &&
      (!maxDate || newDate <= new Date(maxDate))
    ) {
      setCurrentDate(newDate);
    }
  };

  const CustomHeader = () => {
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            setTempYear(currentDate.getFullYear());
            setSelectionFlow("month");
          }}
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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            { height: selectionFlow ? 400 : undefined },
          ]}
        >
          {selectionFlow === "year" ? (
            <YearPicker
              onSelectYear={handleYearSelect}
              startYear={startYear}
              endYear={endYear}
            />
          ) : selectionFlow === "month" ? (
            <MonthPicker
              onSelectMonth={handleMonthSelect}
              selectedYear={tempYear}
              startYear={startYear}
              endYear={endYear}
            />
          ) : (
            <Calendar
              current={currentDate.toISOString().split("T")[0]}
              minDate={minDate}
              maxDate={maxDate}
              onDayPress={handleDaySelect}
              onMonthChange={handleMonthChange}
              renderHeader={CustomHeader}
            />
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              onClose();
              setSelectionFlow(null);
              setTempYear(null); // Reset tempYear
            }}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const MonthPicker: React.FC<{
  onSelectMonth: (month: number) => void;
  selectedYear?: number | null;
  startYear?: number | null;
  endYear?: number | null;
}> = ({ onSelectMonth, selectedYear, startYear, endYear }) => {
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

const YearPicker: React.FC<{
  onSelectYear: (year: number) => void;
  startYear?: number | null;
  endYear?: number | null;
}> = ({ onSelectYear, startYear, endYear }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    {
      length:
        (endYear || currentYear + 10) - (startYear || currentYear - 10) + 1,
    },
    (_, i) => (startYear || currentYear - 10) + i
  );

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
