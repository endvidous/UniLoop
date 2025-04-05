import React, { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import {
  useAssignment,
  useSubmitAssignment,
} from "@/src/hooks/api/useAssignments";
import { StudentAssignment } from "@/src/services/api/assignmentAPI";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AttachmentViewer, { Attachment } from "../../common/AttachmentViewer";
import { useDownloadUrl } from "@/src/hooks/api/useFiles";
import { toast } from "@backpackapp-io/react-native-toast";
import { MaterialIcons } from "@expo/vector-icons";
import { formatDate } from "@/src/utils/helperFunctions";

export const SUBMISSION_STATUS = {
  SUBMITTED: 0,
  LATE: 1,
  NOT_SUBMITTED: 2,
};

const StudentAssignmentDetailView = ({ id }: { id: string }) => {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useAssignment(id);
  const { mutateAsync: submitAssignment } = useSubmitAssignment();
  const { mutateAsync: getDownloadUrl } = useDownloadUrl();

  const assignment = data?.data as StudentAssignment;
  const [myAttachments, setMyAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPastDeadline = assignment?.deadline
    ? new Date() > new Date(assignment.deadline)
    : false;
  const isPastLateDeadline = assignment?.late_deadline
    ? new Date() > new Date(assignment.late_deadline)
    : false;
  const canSubmit = !isPastLateDeadline;

  useEffect(() => {
    if (assignment?.student_submission?.attachment) {
      setMyAttachments([assignment.student_submission.attachment]);
    } else {
      setMyAttachments([]);
    }
  }, [assignment]);

  const getSubmissionStatusInfo = () => {
    if (!assignment?.student_submission)
      return { text: "Not Submitted", color: "#dc2626" };

    switch (assignment.student_submission.status) {
      case SUBMISSION_STATUS.SUBMITTED:
        return { text: "Submitted", color: "#16a34a" };
      case SUBMISSION_STATUS.LATE:
        return { text: "Submitted Late", color: "#f59e0b" };
      case SUBMISSION_STATUS.NOT_SUBMITTED:
        return { text: "Not Submitted", color: "#dc2626" };
      default:
        return { text: "Unknown Status", color: "#dc2626" };
    }
  };

  const handleSubmit = async () => {
    // if (myAttachments.length === 0) {
    //   Alert.alert(
    //     "No attachment",
    //     "Please add an attachment before submitting"
    //   );
    //   return;
    // }

    setIsSubmitting(true);
    try {
      await submitAssignment({
        id: id,
        submission: myAttachments[0],
      });
      toast.success("Assignment submitted successfully");
      refetch();
    } catch (err) {
      toast.error("Failed to submit assignment");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusInfo = getSubmissionStatusInfo();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#608bff" />
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Assignment Details */}
      <View style={styles.card}>
        <Text style={styles.title}>{assignment.title}</Text>
        <Text style={styles.description}>{assignment.description}</Text>

        <View style={styles.dateContainer}>
          <Text style={styles.label}>Deadline:</Text>
          <Text style={styles.dateText}>
            {formatDate(new Date(assignment.deadline))}
          </Text>
        </View>

        {assignment.late_deadline && (
          <View style={styles.dateContainer}>
            <Text style={styles.label}>Late Deadline:</Text>
            <Text style={styles.dateText}>
              {formatDate(new Date(assignment.late_deadline))}
            </Text>
          </View>
        )}

        {assignment.attachments && assignment.attachments.length > 0 && (
          <AttachmentViewer
            attachments={assignment.attachments || []}
            editable={false}
          />
        )}
      </View>

      {/* Submission Section */}
      <View style={styles.card}>
        <View style={styles.submissionHeader}>
          <Text style={styles.sectionTitle}>Your Submission</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
          >
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>

        {assignment.student_submission?.submitted_at && (
          <View style={styles.dateContainer}>
            <Text style={styles.label}>Submitted:</Text>
            <Text style={styles.dateText}>
              {formatDate(new Date(assignment.student_submission.submitted_at))}
            </Text>
          </View>
        )}

        <AttachmentViewer
          attachments={myAttachments}
          setAttachments={setMyAttachments}
          editable={canSubmit}
          limit={1}
        />

        {canSubmit && (
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {assignment.student_submission
                  ? "Update Submission"
                  : "Submit Assignment"}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {!canSubmit && (
          <View style={styles.deadlinePassedContainer}>
            <MaterialIcons name="info" size={20} color="#dc2626" />
            <Text style={styles.deadlinePassedText}>
              {isPastLateDeadline
                ? "The late submission deadline has passed. You can no longer submit this assignment."
                : "The deadline has passed. This will be marked as a late submission."}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    color: "#555",
    lineHeight: 22,
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
    color: "#333",
    width: 110,
  },
  dateText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  submissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  deadlinePassedContainer: {
    flexDirection: "row",
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
    alignItems: "center",
  },
  deadlinePassedText: {
    marginLeft: 8,
    color: "#dc2626",
    flex: 1,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
  },
});

export default StudentAssignmentDetailView;
