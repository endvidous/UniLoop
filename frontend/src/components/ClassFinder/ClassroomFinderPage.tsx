import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Modal,
  SectionListData,
} from "react-native";
import { useClassrooms } from "@/src/hooks/api/useClassroom";
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import DateTimePicker from "react-native-modal-datetime-picker";
import { useNavigation } from "@react-navigation/native";
import BookingModal from "@/src/components/ClassFinder/classrep/BookingModal";
import { RelativePathString, useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

// Constants outside the component as they do not change
const DISPLAY_TIME_SLOTS = [
  "7:00-7:50",
  "7:55-8:45",
  "9:15-10:05",
  "10:10-11:00",
  "11:05-11:55",
  "12:00-12:50",
  // "12:50-1:50",
  "1:50-2:40",
  "2:45-3:35",
  "3:40-4:30",
  "4:35-5:25",
];
const API_TIME_SLOTS = [
  "07:00-07:50",
  "07:55-08:45",
  "09:15-10:05",
  "10:10-11:00",
  "11:05-11:55",
  "12:00-12:50",
  // "12:50-13:50",
  "13:50-14:40",
  "14:45-15:35",
  "15:40-16:30",
  "16:35-17:25",
];
const BLOCK_NAMES = [
  "PG BLOCK",
  "ARRUPE BLOCK",
  "NEW ADMIN BLOCK",
  "SCIENCE BLOCK",
];

interface Classroom {
  _id: string;
  room_num: string;
  block: string;
}

interface Block {
  block: string;
  classrooms: Classroom[];
}

interface FilterType {
  date?: string | Date;
  time?: string;
  block?: string;
  includeOccupied?: boolean;
}

// Memoized FilterSection component
const FilterSection = memo(
  ({
    filters,
    setFilters,
    selectedTime,
    setSelectedTime,
    scrollViewRef,
    windowWidth,
    slotWidth,
  }: {
    filters: FilterType;
    setFilters: React.Dispatch<React.SetStateAction<FilterType>>;
    selectedTime: string | null;
    setSelectedTime: React.Dispatch<React.SetStateAction<string | null>>;
    scrollViewRef: React.RefObject<ScrollView>;
    windowWidth: number;
    slotWidth: number;
  }) => {
    const [calenderOpen, setCalendarOpen] = useState(false);
    const [blockDropdownOpen, setBlockDropdownOpen] = useState(false);

    const handleTimeSelect = useCallback((time: string) => {
      setSelectedTime((prev) => (prev === time ? null : time));
    }, []);

    const handleBlockSelect = useCallback(
      (block: string) => {
        setFilters((prev) => ({
          ...prev,
          block: prev.block === block ? undefined : block,
        }));
        setBlockDropdownOpen(false);
      },
      [setFilters]
    );

    // Function to manually scroll to selected time slot
    const scrollToSelectedTime = useCallback(() => {
      if (selectedTime && scrollViewRef.current) {
        const index = DISPLAY_TIME_SLOTS.findIndex((t) => t === selectedTime);
        if (index >= 0) {
          const scrollPosition = Math.max(
            0,
            index * slotWidth - windowWidth / 2 + slotWidth / 2
          );
          scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
        }
      }
    }, [selectedTime, windowWidth, slotWidth, scrollViewRef]);

    return (
      <View style={styles.filterSection}>
        {/* Top filters row with Block and Date selectors */}
        <View style={styles.topFiltersRow}>
          {/* Block filter */}
          <View style={styles.filterItem}>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setBlockDropdownOpen(true)}
            >
              <Text style={styles.inputText}>
                {filters.block || "Select Block"}
              </Text>
            </TouchableOpacity>

            {/* Block dropdown */}
            <Modal
              visible={blockDropdownOpen}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setBlockDropdownOpen(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setBlockDropdownOpen(false)}
              >
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      !filters.block && styles.selectedDropdownItem,
                    ]}
                    onPress={() => handleBlockSelect("")}
                  >
                    <Text style={styles.dropdownItemText}>All Blocks</Text>
                  </TouchableOpacity>

                  {BLOCK_NAMES.map((block) => (
                    <TouchableOpacity
                      key={block}
                      style={[
                        styles.dropdownItem,
                        filters.block === block && styles.selectedDropdownItem,
                      ]}
                      onPress={() => handleBlockSelect(block)}
                    >
                      <Text style={styles.dropdownItemText}>{block}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
          </View>

          {/* Date filter */}
          <View style={styles.filterItem}>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setCalendarOpen(true)}
            >
              <Text style={styles.inputText}>
                {filters.date
                  ? new Date(filters.date).toLocaleDateString("en-GB")
                  : "Select Date"}
              </Text>
            </TouchableOpacity>
            <DateTimePicker
              isVisible={calenderOpen}
              date={filters.date ? new Date(filters.date) : new Date()}
              minimumDate={new Date()}
              mode="date"
              onConfirm={(date) => {
                setFilters((prev) => ({ ...prev, date }));
                setCalendarOpen(false);
              }}
              onCancel={() => setCalendarOpen(false)}
            />
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.timeSlotWrapper}>
          <ScrollView
            horizontal
            ref={scrollViewRef}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeSlotContainer}
            onLayout={scrollToSelectedTime} // Scroll when layout is ready
          >
            {DISPLAY_TIME_SLOTS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.selectedTimeSlot,
                ]}
                onPress={() => handleTimeSelect(time)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.selectedTimeSlotText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }
);

// Updated RoomGrid component with readonly array type
const RoomGrid = memo(
  ({
    data,
    onSelect,
  }: {
    data: readonly Classroom[];
    onSelect: (classroom: Classroom) => void;
  }) => {
    return (
      <View style={styles.roomGridContainer}>
        {data.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={styles.roomCard}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.roomText}>{item.room_num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
);

// Get API time slot corresponding to a display time slot
const getApiTimeSlot = (displaySlot: string) => {
  const index = DISPLAY_TIME_SLOTS.findIndex((slot) => slot === displaySlot);
  return index >= 0 ? API_TIME_SLOTS[index] : null;
};

// Helper to convert "HH:MM" to minutes
const timeToMinutes = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const ClassRoomFinderPage = () => {
  const [filters, setFilters] = useState<FilterType>({ date: new Date() });
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const slotWidth = 128; // Adjusted to account for margin
  const windowWidth = Dimensions.get("window").width;

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useClassrooms(filters);

  // Preselect time based on current time
  useEffect(() => {
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    let preselected: string | null = null;

    // Try to find an exact matching slot first
    for (let i = 0; i < API_TIME_SLOTS.length; i++) {
      const [startStr, endStr] = API_TIME_SLOTS[i].split("-");
      const startMinutes = timeToMinutes(startStr);
      const endMinutes = timeToMinutes(endStr);
      if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
        preselected = DISPLAY_TIME_SLOTS[i];
        break;
      }
    }
    // Otherwise, select the nearest upcoming slot
    if (!preselected) {
      let nearestIndex = 0;
      let minDifference = Infinity;
      for (let i = 0; i < API_TIME_SLOTS.length; i++) {
        const startMinutes = timeToMinutes(API_TIME_SLOTS[i].split("-")[0]);
        const diff = startMinutes - nowMinutes;
        if (diff > 0 && diff < minDifference) {
          minDifference = diff;
          nearestIndex = i;
        }
      }
      preselected = DISPLAY_TIME_SLOTS[nearestIndex];
    }
    setSelectedTime(preselected);
  }, []);

  // Scroll to the selected time slot after component has fully mounted
  useEffect(() => {
    if (selectedTime && scrollViewRef.current) {
      // Use setTimeout to ensure the scroll happens after rendering
      const timer = setTimeout(() => {
        const index = DISPLAY_TIME_SLOTS.findIndex((t) => t === selectedTime);
        if (index >= 0 && scrollViewRef.current) {
          // Calculate position to center the selected item
          const scrollPosition = Math.max(
            0,
            index * slotWidth - windowWidth / 2 + slotWidth / 2
          );
          scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedTime, windowWidth]);

  // Update filter when selectedTime changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      time: selectedTime
        ? getApiTimeSlot(selectedTime) || undefined
        : undefined,
    }));
  }, [selectedTime]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Transform API data safely - memoized to prevent re-computation on every render
  const classrooms = useMemo(() => {
    if (response?.classrooms && Array.isArray(response.classrooms)) {
      return response.classrooms.map((block: Block) => ({
        title: block.block,
        data: block.classrooms || [],
      }));
    }
    return [];
  }, [response]);

  // Memoize the section list renderer functions with correct type annotations
  const renderSectionHeader = useCallback(
    ({ section: { title } }: { section: { title: string } }) => (
      <Text style={styles.sectionHeader}>{title}</Text>
    ),
    []
  );

  // Fixed the type annotation for renderSectionFooter to match SectionList expectations
  const renderSectionFooter = useCallback(
    ({
      section,
    }: {
      section: SectionListData<Classroom, { title: string }>;
    }) => (
      <RoomGrid
        data={section.data}
        onSelect={(classroom) => {
          setSelectedClassroom({
            classroomId: classroom._id,
            classroom: classroom.room_num,
            block: classroom.block,
          });
          setBookingModalVisible(true);
        }}
      />
    ),
    []
  );

  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<{
    classroomId: string;
    classroom: string;
    block: string;
  } | null>(null);

  const keyExtractor = useCallback((item: Classroom) => item._id, []);
  const router = useRouter();
  const { user } = useAuth();
  const isClassrep = !!user?.classrep_of;
  const isTeacher = user?.role === "teacher";
  return (
    <View style={styles.container}>
      {/* Add header button for bookings */}
      {(isClassrep || isTeacher) && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Classroom Finder</Text>
          <TouchableOpacity
            style={styles.bookingsButton}
            onPress={() =>
              router.navigate(`/ClassFinder/bookings` as RelativePathString)
            }
          >
            <Text style={styles.bookingsButtonText}>
              {isClassrep ? `My Bookings` : `Approve bookings`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Memoized Filters section */}
      <FilterSection
        filters={filters}
        setFilters={setFilters}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        scrollViewRef={scrollViewRef}
        windowWidth={windowWidth}
        slotWidth={slotWidth}
      />

      {/* Classrooms list - only this should re-render when filters change */}
      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : isError ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.container}
        >
          <Text style={styles.error}>
            Error loading classrooms: {"Unknown error"}
          </Text>
        </ScrollView>
      ) : (
        <SectionList
          sections={classrooms}
          keyExtractor={keyExtractor}
          renderSectionHeader={renderSectionHeader}
          renderItem={() => null}
          stickySectionHeadersEnabled
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Available Classrooms</Text>
          }
          renderSectionFooter={renderSectionFooter}
        />
      )}
      <BookingModal
        visible={bookingModalVisible && !!user?.classrep_of}
        onClose={() => setBookingModalVisible(false)}
        bookingData={{
          classroomId: selectedClassroom?.classroomId || "",
          classroom: selectedClassroom?.classroom || "",
          block: selectedClassroom?.block || "",
          date: filters.date
            ? new Date(filters.date).toISOString()
            : new Date().toISOString(),
          time: selectedTime || "",
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  filterSection: { marginBottom: 15 },
  topFiltersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  inputText: { fontSize: 16, color: "#333" },
  dateText: { fontSize: 16, color: "#333" },
  timeSlotWrapper: {
    height: 60, // Fixed height for the scrollview container
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  bookingsButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  bookingsButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  timeSlotContainer: {
    paddingVertical: 10,
    height: 60, // Match the wrapper height
  },
  timeSlot: {
    width: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedTimeSlot: { backgroundColor: "#3498db", borderColor: "#2980b9" },
  timeSlotText: { fontSize: 14 },
  selectedTimeSlotText: { color: "white", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdownContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 5,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedDropdownItem: {
    backgroundColor: "#e6f7ff",
  },
  dropdownItemText: {
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#f4f4f4",
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 8,
    borderColor: "#6c6c6c",
    borderWidth: 1,
    borderRadius: 8,
  },
  roomGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
  },
  roomCard: {
    backgroundColor: "#e8f4fc",
    borderRadius: 8,
    padding: 8,
    marginVertical: 10,
    marginHorizontal: 5,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d6eaf8",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  roomText: { fontSize: 16, fontWeight: "500" },
  loader: { marginTop: 20 },
  error: { color: "red", textAlign: "center", marginTop: 20, fontSize: 16 },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
    fontStyle: "italic",
    color: "#999",
  },
});

export default ClassRoomFinderPage;
