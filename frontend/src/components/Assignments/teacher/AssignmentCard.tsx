import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { TeacherAssignment } from "@/src/services/api/assignmentAPI";
import { useAuth } from "@/src/context/AuthContext";

export const TeacherAssignmentCard = ({
  assignment,
}: {
  assignment: TeacherAssignment;
}) => {
  const router = useRouter();
  const { user } = useAuth();

  const onPress = () => {
    const basepath =
      `/(authenticated)/(${user?.role})/Assignment/[assignmentId]` as RelativePathString;
    router.push({
      pathname: basepath,
      params: { assignmentId: assignment._id },
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, styles.teacherCard]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{assignment.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {assignment.description}
        </Text>
      </View>

      <View style={styles.deadlineContainer}>
        <Text style={styles.deadline}>
          Due date: {new Date(assignment.deadline).toLocaleDateString()}
        </Text>
        {assignment?.late_deadline && (
          <Text style={styles.lateDeadline}>
            Late after:{" "}
            {new Date(assignment.late_deadline).toLocaleDateString()}
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.postedTo}>
          Posted to: {assignment.posted_to.code} | Semester:{" "}
          {assignment.posted_to.currentSemester}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Cleaned up styles
const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
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
  teacherCard: {
    borderLeftColor: "#2196F3",
  },
  header: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  deadlineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  deadline: {
    fontSize: 12,
    color: "#ff2222",
    fontWeight: "500",
  },
  lateDeadline: {
    fontSize: 12,
    color: "#ff8000",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#c8c8c8",
    paddingTop: 8,
    marginTop: 8,
  },
  postedTo: {
    fontSize: 12,
    color: "#999",
  },
});
