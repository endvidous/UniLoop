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

// Get weekday number (0-6) from day name
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

  const weekday = days[day.toUpperCase()];
  if (weekday === undefined) {
    throw new Error(`Invalid day: ${day}`);
  }

  return weekday;
};

export const processCSVFile = async (fileUri: string): Promise<Classroom[]> => {
  try {
    // Read the file content
    const fileContent = await FileSystem.readAsStringAsync(fileUri);

    // Parse CSV using Papa Parse
    const { data, errors } = Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      throw new Error(`CSV parsing errors: ${JSON.stringify(errors)}`);
    }

    // Transform data into the schema format
    const transformedData: Classroom[] = data.map((row: CSVRow) => {
      // Validate required fields
      if (!row["BLOCK NAME"] || !row["Room No."] || !row["DAYS"]) {
        throw new Error(
          `Missing required fields in row: ${JSON.stringify(row)}`
        );
      }

      // Extract basic info
      const classroom: Classroom = {
        block: row["BLOCK NAME"],
        room_num: row["Room No."],
        availability: [],
      };

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
              occupied: value.trim() !== "",
            });
          }
        }
      });

      // Add availability for the day
      classroom.availability.push({
        weekday,
        slots: timeSlots,
      });

      return classroom;
    });

    // Remove duplicates and merge availability for same classrooms
    const mergedData = transformedData.reduce<Classroom[]>((acc, curr) => {
      const existing = acc.find(
        (item) => item.block === curr.block && item.room_num === curr.room_num
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
