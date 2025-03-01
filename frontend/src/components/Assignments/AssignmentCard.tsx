import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { AssignmentBase } from "@/src/services/api/assignmentAPI";
import { useAuth } from "@/src/context/AuthContext";

const AssignmentCard = ({ assignment }: { assignment: AssignmentBase }) => {
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
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{assignment.title}</Text>
        <Text style={styles.deadline}>
          Due: {new Date(assignment.deadline).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.description}>{assignment.description}</Text>
      {assignment?.late_deadline && (
        <Text style={styles.lateDeadline}>
          Late after: {new Date(assignment.late_deadline).toLocaleDateString()}
        </Text>
      )}
      <View style={styles.footer}>
        <Text style={styles.createdBy}>
          Created by: {assignment.created_by}
        </Text>
        <Text style={styles.postedTo}>
          Posted To: {assignment.posted_to.code} | Semester:{" "}
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
    borderLeftColor: "#4CAF50",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  deadline: {
    fontSize: 12,
    color: "#FF5722",
  },
  lateDeadline: {
    fontSize: 12,
    color: "#FF9800",
    marginBottom: 8,
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
  },
  postedTo: {
    fontSize: 12,
    color: "#999",
  },
});

export default AssignmentCard;
