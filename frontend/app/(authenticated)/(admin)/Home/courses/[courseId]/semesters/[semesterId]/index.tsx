import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import {
  useLocalSearchParams,
  Link,
  useRouter,
  RelativePathString,
} from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import { useGetSemester } from "@/src/hooks/api/useCourses"; // Custom hook for semester papers
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect

// Mapping type definition
interface PaperTeacherMapping {
  paperId: string;
  paperName: string;
  paperCode: string;
  teacherId: string;
  teacherName: string;
  departmentId: string;
  departmentName: string;
}

// MappingTable component from AddPaperPage, slightly modified
const MappingTable = ({
  mappings,
  colors,
  isLoading,
}: {
  mappings: PaperTeacherMapping[];
  colors: { text: string; secondaryBackground: string; background: string };
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <View style={[styles.tableContainer, styles.loadingTableContainer]}>
        <ActivityIndicator size="small" color={colors.secondaryBackground} />
        <Text style={[styles.label, { color: colors.text, marginTop: 10 }]}>
          Loading paper assignments...
        </Text>
      </View>
    );
  }

  if (!mappings || mappings.length === 0) {
    return (
      <View style={styles.tableContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          No paper-teacher mappings found for this semester
        </Text>
      </View>
    );
  }

  // Group mappings by department
  const groupedMappings = mappings.reduce(
    (acc: { [key: string]: PaperTeacherMapping[] }, mapping) => {
      if (!acc[mapping.departmentName]) {
        acc[mapping.departmentName] = [];
      }
      acc[mapping.departmentName].push(mapping);
      return acc;
    },
    {}
  );

  return (
    <View style={styles.tableContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Paper-Teacher Assignments
      </Text>

      {Object.entries(groupedMappings).map(([departmentName, deptMappings]) => (
        <View
          key={departmentName}
          style={[
            styles.departmentCard,
            { backgroundColor: colors.secondaryBackground },
          ]}
        >
          <Text style={[styles.departmentTitle, { color: colors.text }]}>
            {departmentName}
          </Text>

          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableHeaderCell, { color: colors.text }]}>
              Paper
            </Text>
            <Text style={[styles.tableHeaderCell, { color: colors.text }]}>
              Teacher
            </Text>
          </View>

          {/* Table Rows */}
          {deptMappings.map((mapping, index) => (
            <View
              key={`${mapping.paperId}-${mapping.teacherId}`}
              style={[
                styles.tableRow,
                {
                  backgroundColor:
                    index % 2 === 0 ? "rgba(0,0,0,0.03)" : "transparent",
                },
              ]}
            >
              <Text style={[styles.tableCell, { color: colors.text }]}>
                {mapping.paperCode}: {mapping.paperName}
              </Text>
              <Text style={[styles.tableCell, { color: colors.text }]}>
                {mapping.teacherName}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

// Semester Details Card Component
const SemesterDetailsCard = ({
  semesterData,
  colors,
}: {
  semesterData: any;
  colors: any;
}) => {
  // Extract relevant data from semesterData
  const { name, startDate, endDate, academicYear } = semesterData;

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View
      style={[
        styles.detailsCard,
        { backgroundColor: colors.secondaryBackground },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {name || "Semester Details"}
        </Text>
        <Text style={[styles.academicYear, { color: colors.textSecondary }]}>
          {academicYear || "Academic Year"}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.dateRow}>
          <View style={styles.dateColumn}>
            <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
              Start Date
            </Text>
            <Text style={[styles.dateValue, { color: colors.text }]}>
              {startDate ? formatDate(startDate) : "Not set"}
            </Text>
          </View>

          <View style={styles.dateColumn}>
            <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
              End Date
            </Text>
            <Text style={[styles.dateValue, { color: colors.text }]}>
              {endDate ? formatDate(endDate) : "Not set"}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="book-outline" size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {semesterData.papers?.length || 0} Papers
            </Text>
          </View>

          <View style={styles.statItem}>
            <Icon name="people-outline" size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {new Set(semesterData.papers?.map((p: any) => p.teacher._id))
                .size || 0}{" "}
              Teachers
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const SemesterPage = () => {
  const { semesterId, courseId, courseName } = useLocalSearchParams<{
    semesterId: string;
    courseId: string;
    courseName: string;
  }>();

  const router = useRouter();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [mappings, setMappings] = useState<PaperTeacherMapping[]>([]);

  // Use a hook to fetch the semester papers
  const {
    data: semesterData,
    isFetching,
    isError,
    refetch,
  } = useGetSemester(semesterId as string);

  // Add useFocusEffect to refetch data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Refetch data when screen is focused
      refetch();
      return () => {
        // Optional cleanup if needed
      };
    }, [refetch])
  );

  useEffect(() => {
    if (semesterData && !isFetching) {
      // Transform the API response to match the PaperTeacherMapping format
      console.log(semesterData.data);
      const transformedMappings = semesterData.data.papers.map(
        (paperAssignment: any) => ({
          paperId: paperAssignment.paper._id,
          paperName: paperAssignment.paper.name,
          paperCode: paperAssignment.paper.code,
          teacherId: paperAssignment.teacher._id,
          teacherName: paperAssignment.teacher.name,
          // departmentId: paperAssignment.paper.department,
          // departmentName: "Unknown", // Assuming department name is not available in the current data structure
        })
      );

      setMappings(transformedMappings);
      setIsLoading(false);
    }
  }, [semesterData, isFetching]);

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={50} color="red" />
          <Text style={styles.errorText}>
            Error loading semester data. Please try again.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {courseName || "Course"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Semester Details
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Semester Details Card */}
        {isLoading || isFetching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading semester details...
            </Text>
          </View>
        ) : (
          <SemesterDetailsCard
            semesterData={semesterData.data}
            colors={colors}
          />
        )}

        {/* Mappings Table */}
        <MappingTable
          mappings={mappings}
          colors={colors}
          isLoading={isLoading || isFetching}
        />

        {/* Add other semester details or sections here */}
      </ScrollView>

      {/* FAB for adding new mappings */}
      <TouchableOpacity
        style={[styles.button]}
        onPress={() =>
          router.push({
            pathname:
              `/Home/courses/${courseId}/semesters/${semesterId}/addPapers` as RelativePathString,
          })
        }
      >
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tableContainer: {
    marginBottom: 20,
    minHeight: 100,
  },
  loadingTableContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  departmentCard: {
    marginBottom: 15,
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  departmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeader: {
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 14,
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
  },
  detailsCard: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  academicYear: {
    fontSize: 14,
    marginTop: 2,
  },
  cardContent: {
    padding: 15,
  },
  dateRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  dateColumn: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 3,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 15,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  statValue: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default SemesterPage;
