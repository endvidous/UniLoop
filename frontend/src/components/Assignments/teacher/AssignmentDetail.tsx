import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import {
  useAssignment,
  useDeleteAssignment,
  useUpdateAssignment,
} from "@/src/hooks/api/useAssignments";
import {
  TeacherAssignment,
  UpdateAssignmentData,
} from "@/src/services/api/assignmentAPI";
import { useForm } from "react-hook-form";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Linking,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AttachmentViewer, { Attachment } from "../../common/AttachmentViewer";
import { useDownloadUrl } from "@/src/hooks/api/useFiles";
import { toast } from "@backpackapp-io/react-native-toast";
import { Menu } from "react-native-paper";
import SubmissionStatsComponent from "./SubmissionStats";
import SubmissionsListComponent from "./SubmissionList";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { formatDate } from "@/src/utils/helperFunctions";

// Constants for submission status
export const SUBMISSION_STATUS = {
  SUBMITTED: 0,
  LATE: 1,
  NOT_SUBMITTED: 2,
};

const TeacherAssignmentDetailView = ({ id }: { id: string }) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { data, isLoading, isError, error, refetch } = useAssignment(id);
  const { mutate: deleteAssignment } = useDeleteAssignment();
  const { mutate: updateAssignment } = useUpdateAssignment();
  const { mutateAsync: getDownloadUrl } = useDownloadUrl();

  const assignment = data?.data as TeacherAssignment;

  const { control, handleSubmit, reset, getValues } =
    useForm<UpdateAssignmentData>({
      defaultValues: {
        title: "",
        description: "",
      },
    });
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Menu state for assignment actions
  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  // Example action handlers for edit and delete
  const handleEditAssignment = () => {
    closeMenu();
    // TODO: Show your edit form/modal here using updateAssignment hook.
    toast.success("Edit assignment action triggered.");
  };

  const handleDeleteAssignment = () => {
    closeMenu();
    // TODO: Trigger the deleteAssignment mutation here.
    deleteAssignment(assignment._id);
    navigation.goBack();
    toast.success("Assignment deleted.");
  };

  // Load form data when assignment is available
  useEffect(() => {
    if (assignment) {
      reset({
        title: assignment.title,
        description: assignment.description,
        deadline: assignment.deadline,
        late_deadline: assignment.late_deadline || undefined,
      });
      setAttachments(assignment.attachments || []);
    }
  }, [assignment, reset]);

  // Calculate submission statistics
  const submissionStats = useMemo(() => {
    if (!assignment) return null;

    const totalStudents =
      (assignment.active_submissions || 0) +
      (assignment.late_submissions || 0) +
      (assignment.not_submitted || 0);

    const submissionRate =
      totalStudents > 0
        ? Math.round(
            ((assignment.active_submissions || 0) / totalStudents) * 100
          )
        : 0;

    return { totalStudents, submissionRate };
  }, [assignment]);

  // Refresh functionality
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.errorText}>
          Error loading assignment: {error?.message}
        </Text>
      </ScrollView>
    );
  }

  // Ensure submissions is defined
  const submissions = assignment.submissions ?? [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Assignment Base Details */}
      <View style={[styles.card, styles.cardContainer]}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{assignment.title}</Text>
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={24}
                  color="#000"
                />
              </TouchableOpacity>
            }
            style={styles.menu}
          >
            <Menu.Item onPress={handleEditAssignment} title="Edit Assignment" />
            <Menu.Item
              onPress={handleDeleteAssignment}
              title="Delete Assignment"
            />
          </Menu>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.description}>{assignment.description}</Text>

          <View style={styles.dateContainer}>
            <Text style={styles.label}>Deadline:</Text>
            <Text>{formatDate(new Date(assignment.deadline))}</Text>
          </View>

          {assignment.late_deadline && (
            <View style={styles.dateContainer}>
              <Text style={styles.label}>Late Deadline:</Text>
              <Text>{formatDate(new Date(assignment.late_deadline))}</Text>
            </View>
          )}

          <AttachmentViewer attachments={attachments} />
        </View>
      </View>

      {/* Render Submission Stats if available */}
      {submissionStats && (
        <SubmissionStatsComponent
          assignment={assignment}
          submissionStats={submissionStats}
        />
      )}

      {/* Render Submissions List */}
      <SubmissionsListComponent assignmentId={id} submissions={submissions} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
  },
  card: {
    borderRadius: 8,
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 8,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuButton: {
    padding: 4,
  },
  menu: {
    width: 180,
  },
  cardContent: {
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    color: "#555",
  },
  dateContainer: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  label: {
    fontWeight: "bold",
    marginRight: 8,
    fontSize: 14,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default TeacherAssignmentDetailView;
