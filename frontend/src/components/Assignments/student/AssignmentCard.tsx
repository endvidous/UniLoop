import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { StudentAssignment } from "@/src/services/api/assignmentAPI";
import { useAuth } from "@/src/context/AuthContext";

// Define submission status constants
export const SUBMISSION_STATUS = {
  SUBMITTED: 0,
  LATE: 1,
  NOT_SUBMITTED: 2,
};

export const StudentAssignmentCard = ({
  assignment,
}: {
  assignment: StudentAssignment;
}) => {
  const router = useRouter();
  const { user } = useAuth();

  const onPress = () => {
    const basepath =
      `/(authenticated)/(${user?.role})/Assignments/[assignmentId]` as RelativePathString;
    router.push({
      pathname: basepath,
      params: { assignmentId: assignment._id },
    });
  };

  // Get submission status text and color
  const getSubmissionStatusText = (status: number) => {
    switch (status) {
      case SUBMISSION_STATUS.SUBMITTED:
        return "Submitted";
      case SUBMISSION_STATUS.LATE:
        return "Late";
      case SUBMISSION_STATUS.NOT_SUBMITTED:
        return "Not Submitted";
      default:
        return "Not Submitted";
    }
  };

  const getSubmissionStatusColor = (status: number) => {
    switch (status) {
      case SUBMISSION_STATUS.SUBMITTED:
        return "#4CAF50";
      case SUBMISSION_STATUS.LATE:
        return "#f36721";
      case SUBMISSION_STATUS.NOT_SUBMITTED:
        return "#db2424";
      default:
        return assignment.deadline_status === "CLOSED" ? "#db2424" : "#4CAF50";
    }
  };

  // Calculate time remaining or time overdue
  const now = new Date();
  const deadline = new Date(assignment.final_deadline);
  const isOverdue = now > deadline;
  const timeDiff = Math.abs(deadline.getTime() - now.getTime());
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const timeRemainingText = isOverdue
    ? `${daysDiff} day${daysDiff !== 1 ? "s" : ""} overdue`
    : `${daysDiff} day${daysDiff !== 1 ? "s" : ""} remaining`;

  // Determine border color based on submission status
  const borderColor = getSubmissionStatusColor(assignment.submission_status);

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: borderColor }]}
      onPress={onPress}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{assignment.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {assignment.description}
        </Text>
      </View>

      {/* Deadlines container */}
      <View style={styles.deadlineContainer}>
        <Text style={[styles.deadline, isOverdue && styles.overdueDeadline]}>
          Due: {new Date(assignment.deadline).toLocaleDateString()}
        </Text>
        {assignment?.late_deadline && (
          <Text style={styles.lateDeadline}>
            Late after:{" "}
            {new Date(assignment.late_deadline).toLocaleDateString()}
          </Text>
        )}
        <Text style={[styles.timeRemaining, isOverdue && styles.timeOverdue]}>
          {timeRemainingText}
        </Text>
      </View>

      {/* Student-specific submission status */}
      <View style={styles.submissionStatusContainer}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getSubmissionStatusColor(
                assignment.submission_status
              ),
            },
          ]}
        >
          <Text style={styles.statusText}>
            {getSubmissionStatusText(assignment.submission_status)}
          </Text>
        </View>

        {assignment.student_submission?.submitted_at && (
          <Text style={styles.submittedDate}>
            Submitted:{" "}
            {new Date(
              assignment.student_submission.submitted_at
            ).toLocaleString()}
          </Text>
        )}

        <Text
          style={[
            styles.deadlineStatus,
            {
              color:
                assignment.deadline_status === "CLOSED" ? "#F44336" : "#4CAF50",
            },
          ]}
        >
          {assignment.deadline_status === "CLOSED" ? "Closed" : "Open"}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.createdBy}>
          Created by:{" "}
          {typeof assignment.created_by === "string"
            ? assignment.created_by
            : `${assignment.created_by.name} | ${assignment.created_by.email}`}
        </Text>
        <Text style={styles.postedTo}>
          {assignment.posted_to.code} | Semester:{" "}
          {assignment.posted_to.currentSemester}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 5,
  },
  headerContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  deadlineContainer: {
    marginBottom: 12,
  },
  deadline: {
    fontSize: 12,
    color: "#FF5722",
    fontWeight: "500",
    marginBottom: 2,
  },
  overdueDeadline: {
    color: "#F44336",
    fontWeight: "bold",
  },
  timeRemaining: {
    fontSize: 11,
    color: "#4CAF50",
    marginTop: 2,
  },
  timeOverdue: {
    color: "#F44336",
  },
  lateDeadline: {
    fontSize: 12,
    color: "#FF9800",
    marginBottom: 2,
  },
  submissionStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  submittedDate: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  deadlineStatus: {
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    marginTop: 8,
  },
  createdBy: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  postedTo: {
    fontSize: 12,
    color: "#999",
  },
});

export default StudentAssignmentCard;
