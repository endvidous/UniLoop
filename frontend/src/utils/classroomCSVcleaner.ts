import Papa from "papaparse";
import * as FileSystem from "expo-file-system";

// Types for the MongoDB Schema
interface TimeSlot {
  startTime: number;
  endTime: number;
  occupied: boolean;
}

interface DayAvailability {
  weekday: number;
  slots: TimeSlot[];
}

interface Classroom {
  block: string;
  room_num: string;
  availability: DayAvailability[];
}

// Types for CSV parsing
interface CSVRow {
  DAYS: string;
  "BLOCK NAME": string;
  "Room No.": string;
  "Seating Capacity": string;
  [key: string]: string; // For dynamic time slot columns
}

interface TimeRange {
  startMinutes: number;
  endMinutes: number;
}

// Type guard to check if a string is a valid time range header
const isTimeRangeHeader = (header: string): boolean => {
  return /\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/.test(header);
};

// Helper to convert time range to start and end minutes
const parseTimeRange = (timeRange: string): TimeRange | null => {
  if (!timeRange || timeRange.trim() === "") return null;

  try {
    const [start, end] = timeRange.split("-").map((t) => t.trim());
    const startMinutes = convertTimeToMinutes(start);
    const endMinutes = convertTimeToMinutes(end);

    if (isNaN(startMinutes) || isNaN(endMinutes)) {
      throw new Error(`Invalid time range: ${timeRange}`);
    }

    return { startMinutes, endMinutes };
  } catch (error) {
    console.error(`Error parsing time range: ${timeRange}`, error);
    return null;
  }
};

// Convert time like "07:00" or "7:00" to minutes since midnight
const convertTimeToMinutes = (time: string): number => {
  try {
    const [hours, minutes] = time.split(":").map((num) => parseInt(num, 10));
    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error(`Invalid time format: ${time}`);
    }
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error(`Time out of valid range: ${time}`);
    }
    return hours * 60 + minutes;
  } catch (error) {
    console.error(`Error converting time to minutes: ${time}`, error);
    throw error;
  }
};

// Clean and normalize day string
const cleanDayString = (day: string): string => {
  return day
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "") // Remove all whitespace
    .replace(/[^A-Z]/g, ""); // Remove any non-letter characters
};

// Get weekday number (0-6) from day name with better error handling
const getWeekdayNumber = (day: string): number => {
  const days: { [key: string]: number } = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const cleanedDay = cleanDayString(day);
  const weekday = days[cleanedDay];

  if (weekday === undefined) {
    console.error(`Invalid day found: "${day}" (cleaned: "${cleanedDay}")`);
    throw new Error(`Invalid day: ${day}`);
  }

  return weekday;
};

// Check if a row is empty or contains only whitespace
const isEmptyRow = (row: CSVRow): boolean => {
  return Object.values(row).every((value) => !value || value.trim() === "");
};

// Check if a row has the minimum required data
const hasRequiredFields = (row: CSVRow): boolean => {
  return !!(
    row["BLOCK NAME"]?.trim() &&
    row["Room No."]?.trim() &&
    row["DAYS"]?.trim()
  );
};

export const classroomCSVCleaner = async (
  fileUri: string
): Promise<Classroom[]> => {
  try {
    // Read the file content
    const fileContent = await FileSystem.readAsStringAsync(fileUri);

    // Parse CSV using Papa Parse with more flexible options
    const { data, errors } = Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value) => value.trim(), // Trim all values
      transformHeader: (header) => header.trim(), // Trim headers
    });

    if (errors.length > 0) {
      console.error("CSV parsing errors:", errors);
      throw new Error(`CSV parsing errors: ${JSON.stringify(errors)}`);
    }

    // Filter out empty rows and transform valid data
    const transformedData: Classroom[] = data
      .filter((row) => !isEmptyRow(row) && hasRequiredFields(row))
      .map((row: CSVRow) => {
        // Extract basic info
        const classroom: Classroom = {
          block: row["BLOCK NAME"].trim(),
          room_num: row["Room No."].trim(),
          availability: [],
        };

        try {
          // Get the weekday number
          const weekday = getWeekdayNumber(row["DAYS"]);

          // Process time slots
          const timeSlots: TimeSlot[] = [];
          Object.entries(row).forEach(([header, value]) => {
            // Check if the header is a time range
            if (isTimeRangeHeader(header)) {
              const timeRange = parseTimeRange(header);
              if (timeRange) {
                timeSlots.push({
                  startTime: timeRange.startMinutes,
                  endTime: timeRange.endMinutes,
                  occupied: value.trim() !== "", // Empty value means unoccupied
                });
              }
            }
          });

          // Add availability for the day
          classroom.availability.push({
            weekday,
            slots: timeSlots,
          });
        } catch (error) {
          console.error("Error processing row:", row);
          console.error("Error details:", error);
          return null;
        }

        return classroom;
      })
      .filter((classroom): classroom is Classroom => classroom !== null);

    // Remove duplicates and merge availability for same classrooms
    const mergedData = transformedData.reduce<Classroom[]>((acc, curr) => {
      const existing = acc.find(
        (item) =>
          item.block.toLowerCase() === curr.block.toLowerCase() &&
          item.room_num.toLowerCase() === curr.room_num.toLowerCase()
      );

      if (existing) {
        // Merge availability
        existing.availability = [
          ...existing.availability,
          ...curr.availability,
        ].sort((a, b) => a.weekday - b.weekday); // Sort by weekday
      } else {
        acc.push(curr);
      }

      return acc;
    }, []);

    return mergedData;
  } catch (error) {
    console.error("Error processing CSV:", error);
    throw error;
  }
};
