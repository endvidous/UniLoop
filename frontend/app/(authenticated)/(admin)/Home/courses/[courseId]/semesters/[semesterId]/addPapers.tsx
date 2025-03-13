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
  RelativePathString,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Ionicons";
import { useDepartments } from "@/src/hooks/api/useDepartments";
import { useDepartmentPapers } from "@/src/hooks/api/useDepartments";
import { useDepartmentTeachers } from "@/src/hooks/api/useUser";
import { useUpdateSemester } from "@/src/hooks/api/useCourses";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

// Types
interface Paper {
  _id: string;
  name: string;
  code: string;
  semester: number; // Add semester property
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
}

interface Department {
  _id: string;
  name: string;
}

interface PaperTeacherMapping {
  paperId: string;
  paperName: string;
  paperCode: string;
  teacherId: string;
  teacherName: string;
  departmentId: string;
  departmentName: string;
}

// Components
const DepartmentSelector = ({
  departments,
  selectedDepartment,
  onSelectDepartment,
  colors,
}: {
  departments: Department[];
  selectedDepartment: string;
  onSelectDepartment: (departmentId: string) => void;
  colors: { text: string; secondaryBackground: string };
}) => {
  if (!departments || departments.length === 0) {
    return (
      <View style={styles.pickerContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          No departments available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.pickerContainer}>
      <Text style={[styles.label, { color: colors.text }]}>
        Select Department
      </Text>
      <View
        style={[styles.picker, { backgroundColor: colors.secondaryBackground }]}
      >
        <Picker
          selectedValue={selectedDepartment}
          onValueChange={(itemValue) => onSelectDepartment(itemValue)}
          style={{ color: colors.text }}
          dropdownIconColor={colors.text}
        >
          <Picker.Item label="Select a department" value="" />
          {departments.map((dept) => (
            <Picker.Item key={dept._id} label={dept.name} value={dept._id} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const PapersList = ({
  papers,
  selectedPaper,
  onSelectPaper,
  colors,
  assignedPaperIds,
}: {
  papers: Paper[];
  selectedPaper: string;
  onSelectPaper: (paper: Paper) => void;
  colors: { text: string; secondaryBackground: string; primary: string };
  assignedPaperIds: string[];
}) => {
  if (!papers || papers.length === 0) {
    return (
      <View style={styles.listContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          No papers available for this department and semester
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <Text style={[styles.label, { color: colors.text }]}>Select Paper</Text>
      <ScrollView style={styles.listScroll}>
        {papers.map((paper) => {
          const isAssigned = assignedPaperIds.includes(paper._id);
          return (
            <TouchableOpacity
              key={paper._id}
              style={[
                styles.listItem,
                {
                  backgroundColor:
                    selectedPaper === paper._id
                      ? colors.primary
                      : colors.secondaryBackground,
                  opacity: isAssigned ? 0.5 : 1,
                },
              ]}
              onPress={() => !isAssigned && onSelectPaper(paper)}
              disabled={isAssigned}
            >
              <Text
                style={[
                  styles.listItemText,
                  {
                    color: selectedPaper === paper._id ? "white" : colors.text,
                  },
                ]}
              >
                {paper.code}: {paper.name}
              </Text>
              {isAssigned && (
                <Text style={[styles.assignedText, { color: colors.text }]}>
                  (Already assigned)
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const TeachersList = ({
  teachers,
  selectedTeacher,
  onSelectTeacher,
  colors,
}: {
  teachers: Teacher[];
  selectedTeacher: string;
  onSelectTeacher: (teacher: Teacher) => void;
  colors: {
    text: string;
    secondaryBackground: string;
    primary: string;
    textSecondary: string;
  };
}) => {
  if (!teachers || teachers.length === 0) {
    return (
      <View style={styles.listContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          No teachers available for this department
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <Text style={[styles.label, { color: colors.text }]}>Select Teacher</Text>
      <ScrollView style={styles.listScroll}>
        {teachers.map((teacher) => (
          <TouchableOpacity
            key={teacher._id}
            style={[
              styles.listItem,
              {
                backgroundColor:
                  selectedTeacher === teacher._id
                    ? colors.primary
                    : colors.secondaryBackground,
              },
            ]}
            onPress={() => onSelectTeacher(teacher)}
          >
            <Text
              style={[
                styles.listItemText,
                {
                  color:
                    selectedTeacher === teacher._id ? "white" : colors.text,
                },
              ]}
            >
              {teacher.name}
            </Text>
            <Text
              style={[
                styles.listItemSubtext,
                {
                  color:
                    selectedTeacher === teacher._id
                      ? "rgba(255,255,255,0.8)"
                      : colors.textSecondary,
                },
              ]}
            >
              {teacher.email}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Main Component
const AddPaperPage = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { courseId, courseName, semesterId, semesterNumber } =
    useLocalSearchParams();

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [paperTeacherMappings, setPaperTeacherMappings] = useState<
    PaperTeacherMapping[]
  >([]);
  const [selectedPaperId, setSelectedPaperId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get semester number from params (convert to number)
  const currentSemester = parseInt(semesterNumber as string, 10) || 1;

  // Fetch departments
  const {
    data: departmentsData,
    isFetching: isDepartmentsFetching,
    isError: isDepartmentsError,
  } = useDepartments();

  // Fetch papers for selected department
  const {
    data: papersData,
    isFetching: isPapersFetching,
    isError: isPapersError,
  } = useDepartmentPapers(selectedDepartment);

  // Fetch teachers for selected department
  const {
    data: teachersData,
    isFetching: isTeachersFetching,
    isError: isTeachersError,
  } = useDepartmentTeachers(selectedDepartment);

  // Filter papers by semester number
  const filteredPapers = React.useMemo(() => {
    if (!papersData?.data) return [];
    return papersData.data.filter(
      (paper) => paper.semester === currentSemester
    );
  }, [papersData?.data, currentSemester]);

  // Get array of already assigned paper IDs
  const assignedPaperIds = React.useMemo(() => {
    return paperTeacherMappings.map((mapping) => mapping.paperId);
  }, [paperTeacherMappings]);

  // Initialize the mutation hook
  const updateSemesterMutation = useUpdateSemester();

  // Reset selections when department changes
  useEffect(() => {
    setSelectedPaper(null);
    setSelectedTeacher(null);
    setSelectedPaperId("");
    setSelectedTeacherId("");
  }, [selectedDepartment]);

  // Department selection handler
  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
  };

  // Paper selection handler
  const handlePaperSelect = (paper: Paper) => {
    setSelectedPaper(paper);
    setSelectedPaperId(paper._id);
  };

  // Teacher selection handler
  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setSelectedTeacherId(teacher._id);
  };

  // Add mapping handler
  const handleAddMapping = () => {
    if (!selectedPaper || !selectedTeacher || !selectedDepartment) {
      Alert.alert(
        "Selection Required",
        "Please select both a paper and a teacher before adding a mapping."
      );
      return;
    }

    // Check if paper is already mapped (one teacher per paper)
    const paperAlreadyMapped = paperTeacherMappings.some(
      (mapping) => mapping.paperId === selectedPaper._id
    );

    if (paperAlreadyMapped) {
      Alert.alert(
        "Paper Already Assigned",
        "This paper has already been assigned to a teacher."
      );
      return;
    }

    // Find department name
    const selectedDeptName =
      departmentsData?.data.find((dept) => dept._id === selectedDepartment)
        ?.name || "Unknown Department";

    // Create new mapping
    const newMapping: PaperTeacherMapping = {
      paperId: selectedPaper._id,
      paperName: selectedPaper.name,
      paperCode: selectedPaper.code,
      teacherId: selectedTeacher._id,
      teacherName: selectedTeacher.name,
      departmentId: selectedDepartment,
      departmentName: selectedDeptName,
    };

    setPaperTeacherMappings([...paperTeacherMappings, newMapping]);

    // Reset selections
    setSelectedPaper(null);
    setSelectedTeacher(null);
    setSelectedPaperId("");
    setSelectedTeacherId("");

    // Provide feedback to user that mapping was added
    Alert.alert(
      "Mapping Added",
      `Added ${newMapping.paperCode}: ${newMapping.paperName} with ${newMapping.teacherName}`
    );
  };

  // Save all mappings handler
  const handleSaveAllMappings = () => {
    if (paperTeacherMappings.length === 0) {
      Alert.alert(
        "No Mappings",
        "Please add at least one paper-teacher mapping before saving."
      );
      return;
    }

    setIsSubmitting(true);

    // Convert paperTeacherMappings to the format expected by the API
    const formattedPapers = paperTeacherMappings.map((mapping) => ({
      Paper: { _id: mapping.paperId },
      Teacher: { _id: mapping.teacherId },
    }));
    console.log("Formatted data: ", formattedPapers);
    // Use the update semester mutation
    console.log(
        semesterId
    );
    updateSemesterMutation.mutate(
      {
        semesterId: semesterId as string,
        papers: formattedPapers,
      },
      {
        onSuccess: () => {
          Alert.alert(
            "Success",
            "Paper-teacher assignments have been saved successfully.",
            [{ text: "OK", onPress: () => router.back() }]
          );
        },
        onError: (error) => {
          console.error("Failed to save paper assignments:", error);
          Alert.alert(
            "Error",
            "Failed to save paper-teacher assignments. Please try again.",
            [{ text: "OK", onPress: () => setIsSubmitting(false) }]
          );
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  if (isDepartmentsFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading departments...
        </Text>
      </View>
    );
  }

  if (isDepartmentsError) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={50} color="red" />
        <Text style={styles.errorText}>
          Error loading departments. Please try again.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() =>
            router.replace(
              `/courses/${courseId}/semesters/${semesterId}/addPapers` as RelativePathString
            )
          }
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            {courseName}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Assign Papers & Teachers (Semester {currentSemester})
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Department Selector */}
        <DepartmentSelector
          departments={departmentsData?.data || []}
          selectedDepartment={selectedDepartment}
          onSelectDepartment={handleDepartmentChange}
          colors={colors}
        />

        {selectedDepartment && (
          <View style={styles.selectionContainer}>
            {/* Papers List */}
            <View style={styles.selectionColumn}>
              {isPapersFetching ? (
                <View style={styles.columnLoadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.text }]}>
                    Loading papers...
                  </Text>
                </View>
              ) : isPapersError ? (
                <Text style={[styles.errorTextSmall, { color: "red" }]}>
                  Error loading papers
                </Text>
              ) : (
                <PapersList
                  papers={filteredPapers}
                  selectedPaper={selectedPaperId}
                  onSelectPaper={handlePaperSelect}
                  colors={colors}
                  assignedPaperIds={assignedPaperIds}
                />
              )}
            </View>

            {/* Teachers List */}
            <View style={styles.selectionColumn}>
              {isTeachersFetching ? (
                <View style={styles.columnLoadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.text }]}>
                    Loading teachers...
                  </Text>
                </View>
              ) : isTeachersError ? (
                <Text style={[styles.errorTextSmall, { color: "red" }]}>
                  Error loading teachers
                </Text>
              ) : (
                <TeachersList
                  teachers={teachersData?.data || []}
                  selectedTeacher={selectedTeacherId}
                  onSelectTeacher={handleTeacherSelect}
                  colors={colors}
                />
              )}
            </View>
          </View>
        )}

        {/* Add Mapping Button */}
        {selectedPaper && selectedTeacher && (
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: colors.primary },
              isSubmitting && styles.disabledButton,
            ]}
            onPress={handleAddMapping}
            disabled={isSubmitting}
          >
            <Icon name="add-circle-outline" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Mapping</Text>
          </TouchableOpacity>
        )}

        {/* Counter for added mappings */}
        {paperTeacherMappings.length > 0 && (
          <View style={styles.mappingCountContainer}>
            <Text style={[styles.mappingCountText, { color: colors.text }]}>
              {paperTeacherMappings.length} paper-teacher{" "}
              {paperTeacherMappings.length === 1 ? "mapping" : "mappings"} added
            </Text>
          </View>
        )}

        {/* Save Button */}
        {paperTeacherMappings.length > 0 && (
          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.disabledButton]}
            onPress={handleSaveAllMappings}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.saveButtonText}>Saving...</Text>
              </>
            ) : (
              <>
                <Icon name="save-outline" size={20} color="white" />
                <Text style={styles.saveButtonText}>
                  Save Paper Assignments
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 26,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  picker: {
    borderRadius: 8,
    marginBottom: 10,
  },
  selectionContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  selectionColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  listContainer: {
    marginBottom: 10,
    minHeight: 100,
  },
  listScroll: {
    maxHeight: 200,
  },
  listItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listItemSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "gray",
  },
  addButtonText: {
    color: "black",
    fontWeight: "bold",
    marginLeft: 8,
  },
  mappingCountContainer: {
    marginBottom: 15,
    padding: 10,
    alignItems: "center",
  },
  mappingCountText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#007BFF",
  },
  saveButtonText: {
    color: "black",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  columnLoadingContainer: {
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
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
  errorTextSmall: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 10,
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
  disabledButton: {
    opacity: 0.6,
  },
  assignedText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default AddPaperPage;
