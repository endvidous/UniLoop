// SubmissionStats.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TeacherAssignment } from "@/src/services/api/assignmentAPI";

// Define stats interface
interface SubmissionStats {
  totalStudents: number;
  submissionRate: number;
}

interface SubmissionStatsProps {
  assignment: TeacherAssignment;
  submissionStats: SubmissionStats;
}

const SubmissionStats: React.FC<SubmissionStatsProps> = ({
  assignment,
  submissionStats,
}) => {
  return (
    <View style={[styles.card, styles.cardContainer]}>
      <Text style={styles.cardTitle}>Submission Statistics</Text>
      <View style={styles.cardContent}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {submissionStats.totalStudents}
            </Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {assignment.active_submissions || 0}
            </Text>
            <Text style={styles.statLabel}>Submitted</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {assignment.late_submissions || 0}
            </Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {assignment.not_submitted || 0}
            </Text>
            <Text style={styles.statLabel}>Not Submitted</Text>
          </View>
        </View>

        <View style={styles.submissionRateContainer}>
          <Text style={styles.label}>Submission Rate:</Text>
          <Text style={styles.submissionRate}>
            {submissionStats.submissionRate}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardContent: {
    // Layout styles for content if needed
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    minWidth: 70,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  submissionRateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontWeight: "bold",
    marginRight: 8,
    fontSize: 14,
  },
  submissionRate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
});

export default SubmissionStats;
