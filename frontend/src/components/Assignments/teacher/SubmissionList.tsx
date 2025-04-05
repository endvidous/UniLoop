// SubmissionsList.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Divider } from "react-native-paper";
import { toast } from "@backpackapp-io/react-native-toast";
import { SUBMISSION_STATUS } from "./AssignmentDetail";
import { assignmentsService } from "@/src/services/api/assignmentAPI";
import { useDownloadUrl } from "@/src/hooks/api/useFiles";
import { formatDate } from "@/src/utils/helperFunctions";
import * as Sharing from "expo-sharing";

// Define a Submission type based on your data shape
interface Submission {
  _id: string;
  status: number;
  submitted_at: Date;
  attachment?: {
    name: string;
    key: string;
    type: string;
  };
  student: {
    _id: string;
    name: string;
    email: string;
    roll_no: string;
  };
}

interface SubmissionsListProps {
  submissions: Submission[];
  assignmentId: string;
}

const SubmissionsList: React.FC<SubmissionsListProps> = ({
  submissions,
  assignmentId,
}) => {
  // Check if there's at least one submission with status not equal to NOT_SUBMITTED
  const hasSubmissions =
    submissions.filter((s) => s.status !== SUBMISSION_STATUS.NOT_SUBMITTED)
      .length > 0;

  //Hooks for download of assignment
  const { mutateAsync: getDownloadUrl } = useDownloadUrl();

  // State for bulk download loading
  const [bulkLoading, setBulkLoading] = useState(false);

  // Helper functions for status color and label
  const getStatusColor = (status: number) => {
    switch (status) {
      case SUBMISSION_STATUS.SUBMITTED:
        return "#4CAF50"; // Green
      case SUBMISSION_STATUS.LATE:
        return "#FFC107"; // Yellow/Orange
      case SUBMISSION_STATUS.NOT_SUBMITTED:
      default:
        return "#F44336"; // Red
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case SUBMISSION_STATUS.SUBMITTED:
        return "Submitted";
      case SUBMISSION_STATUS.LATE:
        return "Late";
      case SUBMISSION_STATUS.NOT_SUBMITTED:
      default:
        return "Not Submitted";
    }
  };

  // Bulk download function (calls your bulk download endpoint)
  const handleBulkDownload = async () => {
    setBulkLoading(true);
    try {
      const uri = await assignmentsService.downloadBulkAssignment(assignmentId);

      // Check if sharing is available and open the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Download Complete", `File saved at: ${uri}`);
      }
    } catch (error) {
      console.error("Error downloading ZIP file:", error);
      Alert.alert("Download Failed", "Unable to download the ZIP file.");
    } finally {
      setBulkLoading(false);
    }
  };

  // Helper function to convert Blob to Base64
  const blobToBase64 = async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve(result.split(",")[1]); // Extract base64 data safely
        } else {
          reject(new Error("Failed to convert blob to base64"));
        }
      };

      reader.onerror = () => reject(new Error("Error reading blob"));
      reader.readAsDataURL(blob);
    });
  };

  const handleDownload = async (key: string) => {
    try {
      const downloadUrl = await getDownloadUrl(key);
      if (!downloadUrl) {
        throw new Error("Couldn't fetch download url");
      }
      await Linking.openURL(downloadUrl);
    } catch (error: any) {
      toast.error(
        error.message || "Could not download the file. Please try again."
      );
    }
  };

  return (
    <View style={[styles.card, styles.cardContainer]}>
      <Text style={styles.cardTitle}>Student Submissions</Text>
      {submissions.length > 0 && hasSubmissions && (
        <TouchableOpacity
          onPress={handleBulkDownload}
          style={styles.bulkDownloadButton}
        >
          {bulkLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.bulkDownloadButtonText}>
              Download All Submissions
            </Text>
          )}
        </TouchableOpacity>
      )}
      <View style={styles.cardContent}>
        {!hasSubmissions ? (
          <Text style={styles.noSubmissions}>No submissions available</Text>
        ) : (
          submissions.map((submission) => (
            <View key={submission._id} style={styles.submissionItem}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>
                  {submission.student.name}
                </Text>
                <Text style={styles.studentEmail}>
                  {submission.student.email}
                </Text>
                <Text style={styles.studentRoll}>
                  {submission.student.roll_no}
                </Text>
              </View>

              <View style={styles.submissionDetails}>
                <Text
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(submission.status) },
                  ]}
                >
                  {getStatusLabel(submission.status)}
                </Text>

                {submission.submitted_at && (
                  <Text style={styles.submissionDate}>
                    {formatDate(new Date(submission.submitted_at))}
                  </Text>
                )}

                {submission.status === SUBMISSION_STATUS.SUBMITTED ||
                submission.status === SUBMISSION_STATUS.LATE ? (
                  submission.attachment ? (
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => {
                        if (submission.attachment?.key) {
                          handleDownload(submission.attachment.key);
                        } else {
                          toast.error("No attachment available to download.");
                        }
                      }}
                    >
                      <Text style={styles.downloadButtonText}>Download</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.noAttachment}>No attachment</Text>
                  )
                ) : null}
              </View>
              <Divider style={styles.divider} />
            </View>
          ))
        )}
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
    // Layout styles for card content if needed
  },
  noSubmissions: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    padding: 16,
  },
  submissionItem: {
    marginBottom: 16,
  },
  studentInfo: {
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  studentEmail: {
    fontSize: 14,
    color: "#666",
  },
  studentRoll: {
    fontSize: 14,
    fontWeight: "500",
  },
  submissionDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 8,
  },
  statusChip: {
    color: "white",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  submissionDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  downloadButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  downloadButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  noAttachment: {
    color: "#999",
    fontStyle: "italic",
  },
  divider: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginTop: 16,
  },
  bulkDownloadButton: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  bulkDownloadButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default SubmissionsList;
