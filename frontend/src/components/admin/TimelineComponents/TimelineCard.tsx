import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useDeleteAcademicTimeline } from "@/src/hooks/api/useAcademicTimelines"; // Import the hook

interface TimelineCardProps {
  academicYear: string;
  oddSemester: { start: string; end: string };
  evenSemester: { start: string; end: string };
  id: string; // Add an ID to identify the timeline
  onEdit: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const TimelineCard: React.FC<TimelineCardProps> = ({
  academicYear,
  oddSemester,
  evenSemester,
  id, // Get the ID of the timeline
  onEdit,
}) => {
  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [isDeleting, setIsDeleting] = useState(false); // State to manage deletion in progress
  const [deletionError, setDeletionError] = useState<string | null>(null); // State for deletion error message

  const { mutate: deleteTimeline } = useDeleteAcademicTimeline(); // Use delete hook

  // Function to handle delete action confirmation
  const handleConfirmDelete = () => {
    setIsDeleting(true); // Set deleting state to true to show loading indicator

    deleteTimeline(id, {
      onSuccess: () => {
        setIsDeleting(false); // Reset deleting state
        setModalVisible(false); // Close the modal
      },
      onError: (error) => {
        setIsDeleting(false); // Reset deleting state
        setDeletionError(error?.message || "An error occurred while deleting.");
        setModalVisible(false); // Close the modal
      },
    });
  };

  return (
    <View>
      <Card style={styles.card}>
        <Text style={styles.text}>Academic Year: {academicYear}</Text>
        <Text style={styles.text}>
          Odd Semester: {formatDate(oddSemester.start)} -{" "}
          {formatDate(oddSemester.end)}
        </Text>
        <Text style={styles.text}>
          Even Semester: {formatDate(evenSemester.start)} -{" "}
          {formatDate(evenSemester.end)}
        </Text>

        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Ionicons name="pencil" size={24} color="blue" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setModalVisible(true)} // Open modal when delete button is pressed
        >
          <Ionicons name="trash" size={24} color="red" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </Card>

      {/* Modal for confirmation */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Are you sure you want to delete?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)} // Close the modal without doing anything
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => deleteTimeline(id)} // Confirm deletion
                disabled={isDeleting} // Disable the button while deletion is in progress
              >
                <Text style={styles.modalButtonText}>
                  {isDeleting ? "Deleting..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Optional: Show error or success message */}
      {deletionError && !isDeleting && (
        <Text style={styles.errorText}>{deletionError}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#f8f9fa",
  },
  text: {
    fontSize: 16,
    marginVertical: 2,
    fontWeight: "400",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#89CFF0",
    borderRadius: 5,
    justifyContent: "center",
  },
  editButtonText: {
    fontSize: 16,
    color: "blue",
    marginLeft: 5,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f8d7da",
    borderRadius: 5,
    justifyContent: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    color: "red",
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Transparent overlay
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    padding: 10,
    backgroundColor: "#007BFF", // Blue background for buttons
    borderRadius: 5,
    width: "40%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
  successText: {
    color: "green",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
});

export default TimelineCard;
